using Microsoft.EntityFrameworkCore;
using StoryReader.Api.Data;
using StoryReader.Api.Models.Dtos;
using StoryReader.Api.Models.Entities;
using StoryReader.Api.Services.Interfaces;

namespace StoryReader.Api.Services;

public class StatsService : IStatsService
{
    private readonly AppDbContext _db;

    public StatsService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<OverviewStatsDto> GetOverviewAsync()
    {
        var totalStories = await _db.Stories.CountAsync();
        var totalMembers = await _db.Users.CountAsync();
        var totalViews = await _db.Chapters.SumAsync(c => c.ViewCount);
        var totalRevenue = await _db.Transactions
            .Where(t => t.Status == TransactionStatus.Success)
            .SumAsync(t => (decimal?)t.Amount) ?? 0;

        return new OverviewStatsDto(totalStories, totalMembers, totalViews, totalRevenue);
    }

    public async Task<IEnumerable<RevenueByDayDto>> GetRevenueByDayAsync(DateTime from, DateTime to)
    {
        var raw = await _db.Transactions
            .Where(t => t.Status == TransactionStatus.Success && t.CompletedAt >= from && t.CompletedAt <= to)
            .ToListAsync();

        return raw
            .GroupBy(t => DateOnly.FromDateTime(t.CompletedAt!.Value))
            .OrderBy(g => g.Key)
            .Select(g => new RevenueByDayDto(g.Key, g.Sum(t => t.Amount)));
    }

    public async Task<IEnumerable<TopStoryDto>> GetTopStoriesAsync(int count)
    {
        return await _db.Stories.AsNoTracking()
            .OrderByDescending(s => s.ViewCount)
            .Take(count)
            .Select(s => new TopStoryDto(s.Id, s.Title, s.ViewCount))
            .ToListAsync();
    }
}
