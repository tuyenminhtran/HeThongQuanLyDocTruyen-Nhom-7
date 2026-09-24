namespace StoryReader.Api.Models.Dtos;

public record OverviewStatsDto(int TotalStories, int TotalMembers, int TotalChapterViews, decimal TotalRevenue);

public record RevenueByDayDto(DateOnly Date, decimal Amount);

public record TopStoryDto(Guid StoryId, string Title, int ViewCount);
