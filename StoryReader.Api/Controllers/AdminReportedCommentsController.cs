using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoryReader.Api.Data;
using StoryReader.Api.Models.Entities;

namespace StoryReader.Api.Controllers;

[ApiController]
[Route("api/admin/reported-comments")]
[Authorize(Roles = "Admin")]
public class AdminReportedCommentsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminReportedCommentsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetReportedComments(
        [FromQuery] string? status = null, // "reported", "hidden", "visible", "all"
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _db.Discussions
            .Include(d => d.User)
            .Include(d => d.Chapter)
                .ThenInclude(c => c.Story)
            .AsNoTracking();

        if (!string.Equals(status, "all", StringComparison.OrdinalIgnoreCase))
        {
            if (string.Equals(status, "hidden", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(d => d.Status == DiscussionStatus.Hidden);
            }
            else if (string.Equals(status, "visible", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(d => d.Status == DiscussionStatus.Visible);
            }
            else // Mặc định là "reported"
            {
                query = query.Where(d => d.Status == DiscussionStatus.Reported);
            }
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(d => 
                d.Content.ToLower().Contains(s) || 
                (d.ReportReason != null && d.ReportReason.ToLower().Contains(s)) ||
                d.User.DisplayName.ToLower().Contains(s) ||
                (d.User.Email != null && d.User.Email.ToLower().Contains(s)) ||
                d.Chapter.Story.Title.ToLower().Contains(s));
        }

        var totalCount = await query.CountAsync();

        // Thống kê tổng quan
        var reportedCount = await _db.Discussions.CountAsync(d => d.Status == DiscussionStatus.Reported);
        var hiddenCount = await _db.Discussions.CountAsync(d => d.Status == DiscussionStatus.Hidden);
        var visibleCount = await _db.Discussions.CountAsync(d => d.Status == DiscussionStatus.Visible);
        var restrictedUsersCount = await _db.Users.CountAsync(u => u.IsRestricted);

        var items = await query
            .OrderByDescending(d => d.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(d => new
            {
                d.Id,
                d.Content,
                Status = (int)d.Status,
                StatusName = d.Status.ToString(),
                d.ReportReason,
                d.ReportCount,
                d.CreatedAt,
                UserId = d.User.Id,
                UserName = d.User.DisplayName,
                UserEmail = d.User.Email,
                IsUserRestricted = d.User.IsRestricted,
                ChapterId = d.Chapter.Id,
                ChapterNumber = d.Chapter.ChapterNumber,
                ChapterTitle = d.Chapter.Title,
                StoryId = d.Chapter.Story.Id,
                StoryTitle = d.Chapter.Story.Title,
                StoryCoverImageUrl = d.Chapter.Story.CoverImageUrl,
                StoryType = d.Chapter.Story.Type
            })
            .ToListAsync();

        return Ok(new
        {
            items,
            totalCount,
            page,
            pageSize,
            stats = new
            {
                reportedCount,
                hiddenCount,
                visibleCount,
                restrictedUsersCount
            }
        });
    }

    /// <summary>Duyệt bình luận (đánh dấu hợp lệ, gỡ cờ báo cáo).</summary>
    [HttpPut("{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id)
    {
        var d = await _db.Discussions.FindAsync(id);
        if (d is null) return NotFound(new { message = "Không tìm thấy bình luận" });

        d.Status = DiscussionStatus.Visible;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đã duyệt bình luận hợp lệ!", id });
    }

    /// <summary>Ẩn bình luận vi phạm.</summary>
    [HttpPut("{id:guid}/hide")]
    public async Task<IActionResult> Hide(Guid id)
    {
        var d = await _db.Discussions.FindAsync(id);
        if (d is null) return NotFound(new { message = "Không tìm thấy bình luận" });

        d.Status = DiscussionStatus.Hidden;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đã ẩn bình luận vi phạm!", id });
    }

    /// <summary>Xóa vĩnh viễn bình luận.</summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var d = await _db.Discussions.FindAsync(id);
        if (d is null) return NotFound(new { message = "Không tìm thấy bình luận" });

        _db.Discussions.Remove(d);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đã xóa bình luận thành công!" });
    }

    /// <summary>Khóa quyền bình luận của người dùng vi phạm.</summary>
    [HttpPost("{id:guid}/restrict-user")]
    public async Task<IActionResult> RestrictUser(Guid id)
    {
        var d = await _db.Discussions.Include(x => x.User).FirstOrDefaultAsync(x => x.Id == id);
        if (d is null || d.User is null) return NotFound(new { message = "Không tìm thấy bình luận hoặc người dùng" });

        d.User.IsRestricted = true;
        d.Status = DiscussionStatus.Hidden; // Ẩn luôn bình luận vi phạm
        await _db.SaveChangesAsync();

        return Ok(new { message = $"Đã khóa quyền của người dùng '{d.User.DisplayName}'!", userId = d.User.Id });
    }
}
