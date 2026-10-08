using StoryReader.Api.Models.Dtos;

namespace StoryReader.Api.Services.Interfaces;

public interface IStatsService
{
    Task<OverviewStatsDto> GetOverviewAsync();
    Task<IEnumerable<RevenueByDayDto>> GetRevenueByDayAsync(DateTime from, DateTime to);
    Task<IEnumerable<TopStoryDto>> GetTopStoriesAsync(int count);
}
