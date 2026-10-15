using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoryReader.Api.Data;
using StoryReader.Api.Models.Dtos;
using StoryReader.Api.Models.Entities;

namespace StoryReader.Api.Controllers;

[ApiController]
[Route("api/admin/stats")]
[Authorize(Roles = "Admin")]
public class AdminStatsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly UserManager<AppUser> _userManager;

    public AdminStatsController(AppDbContext db, UserManager<AppUser> userManager)
    {
        _db = db;
        _userManager = userManager;
    }

    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview()
    {
        var now = DateTime.UtcNow;
        var todayStart = new DateTime(now.Year, now.Month, now.Day, 0, 0, 0, DateTimeKind.Utc);
        var yesterdayStart = todayStart.AddDays(-1);
        var oneWeekAgo = now.AddDays(-7);

        var todayRevenue = await _db.Transactions
            .Where(t => t.Status == TransactionStatus.Success && t.CompletedAt >= todayStart)
            .SumAsync(t => (decimal?)t.Amount) ?? 0;

        var yesterdayRevenue = await _db.Transactions
            .Where(t => t.Status == TransactionStatus.Success && t.CompletedAt >= yesterdayStart && t.CompletedAt < todayStart)
            .SumAsync(t => (decimal?)t.Amount) ?? 0;

        double growthPercent = 0;
        if (yesterdayRevenue > 0)
        {
            growthPercent = Math.Round((double)((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100, 1);
        }
        else if (todayRevenue > 0)
        {
            growthPercent = 100.0;
        }

        var totalUsers = await _userManager.Users.CountAsync();
        var newUsersThisWeek = await _userManager.Users.CountAsync(u => u.CreatedAt >= oneWeekAgo);
        var totalFollows = await _db.StoryFollows.CountAsync();
        var totalViews = await _db.Chapters.SumAsync(c => (int?)c.ViewCount) ?? 0;
        var totalStories = await _db.Stories.CountAsync();

        var dto = new AdminDashboardOverviewDto(
            TodayRevenue: todayRevenue,
            YesterdayRevenue: yesterdayRevenue,
            RevenueGrowthPercent: growthPercent,
            TotalUsers: totalUsers,
            NewUsersThisWeek: newUsersThisWeek,
            TotalFollows: totalFollows,
            TotalChapterViews: totalViews,
            TotalStories: totalStories
        );

        return Ok(dto);
    }

    [HttpGet("recent-transactions")]
    public async Task<IActionResult> GetRecentTransactions([FromQuery] int limit = 10)
    {
        var raw = await _db.Transactions
            .AsNoTracking()
            .Include(t => t.User)
            .OrderByDescending(t => t.CreatedAt)
            .Take(limit)
            .ToListAsync();

        var result = raw.Select(t => new RecentTransactionDto(
            t.Id,
            t.UserId,
            t.User?.Email ?? string.Empty,
            string.IsNullOrWhiteSpace(t.User?.DisplayName) ? (t.User?.Email ?? "Khách") : t.User.DisplayName,
            t.Amount,
            t.Type == TransactionType.Subscription ? "VIP Subscription" : "Mua Truyện",
            t.Status.ToString(),
            t.Provider,
            t.CreatedAt,
            t.CompletedAt
        )).ToList();

        return Ok(result);
    }

    [HttpGet("recent-activities")]
    public async Task<IActionResult> GetRecentActivities([FromQuery] int limit = 10)
    {
        var activities = new List<RecentActivityDto>();

        // 1. Recent chapters added
        var recentChapters = await _db.Chapters
            .AsNoTracking()
            .Include(c => c.Story)
            .OrderByDescending(c => c.CreatedAt)
            .Take(limit)
            .ToListAsync();

        foreach (var chap in recentChapters)
        {
            activities.Add(new RecentActivityDto(
                Id: $"chap_{chap.Id}",
                Type: "chapter_added",
                Title: $"Truyện \"{chap.Story?.Title ?? "N/A"}\" vừa cập nhật chương {chap.ChapterNumber}",
                Description: string.IsNullOrWhiteSpace(chap.Title) ? $"Chương {chap.ChapterNumber}" : chap.Title,
                Timestamp: chap.CreatedAt
            ));
        }

        // 2. Recent users registered
        var recentUsers = await _userManager.Users
            .AsNoTracking()
            .OrderByDescending(u => u.CreatedAt)
            .Take(limit)
            .ToListAsync();

        foreach (var u in recentUsers)
        {
            var name = string.IsNullOrWhiteSpace(u.DisplayName) ? u.Email ?? "Thành viên" : u.DisplayName;
            activities.Add(new RecentActivityDto(
                Id: $"user_{u.Id}",
                Type: "user_registered",
                Title: $"Thành viên mới gia nhập StoryReader",
                Description: $"{name} ({u.Email}) đã tạo tài khoản",
                Timestamp: u.CreatedAt
            ));
        }

        // 3. Recent successful transactions
        var recentTx = await _db.Transactions
            .AsNoTracking()
            .Include(t => t.User)
            .Where(t => t.Status == TransactionStatus.Success)
            .OrderByDescending(t => t.CompletedAt ?? t.CreatedAt)
            .Take(limit)
            .ToListAsync();

        foreach (var tx in recentTx)
        {
            var name = string.IsNullOrWhiteSpace(tx.User?.DisplayName) ? tx.User?.Email ?? "Người dùng" : tx.User.DisplayName;
            activities.Add(new RecentActivityDto(
                Id: $"tx_{tx.Id}",
                Type: "subscription_created",
                Title: $"Giao dịch thành công {tx.Amount:N0}đ",
                Description: $"{name} thanh toán { (tx.Type == TransactionType.Subscription ? "gói đọc VIP" : "truyện") } qua {tx.Provider}",
                Timestamp: tx.CompletedAt ?? tx.CreatedAt
            ));
        }

        var sorted = activities
            .OrderByDescending(a => a.Timestamp)
            .Take(limit)
            .ToList();

        return Ok(sorted);
    }
}
