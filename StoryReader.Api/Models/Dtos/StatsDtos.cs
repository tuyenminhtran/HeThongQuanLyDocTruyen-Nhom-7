namespace StoryReader.Api.Models.Dtos;

public record OverviewStatsDto(int TotalStories, int TotalMembers, int TotalChapterViews, decimal TotalRevenue);

public record RevenueByDayDto(DateOnly Date, decimal Amount);

public record TopStoryDto(Guid StoryId, string Title, int ViewCount);

public record AdminDashboardOverviewDto(
    decimal TodayRevenue,
    decimal YesterdayRevenue,
    double RevenueGrowthPercent,
    int TotalUsers,
    int NewUsersThisWeek,
    int TotalFollows,
    int TotalChapterViews,
    int TotalStories
);

public record RecentTransactionDto(
    Guid Id,
    Guid UserId,
    string UserEmail,
    string UserName,
    decimal Amount,
    string Type,
    string Status,
    string Provider,
    DateTime CreatedAt,
    DateTime? CompletedAt
);

public record RecentActivityDto(
    string Id,
    string Type, // "chapter_added" | "story_created" | "user_registered" | "subscription_created"
    string Title,
    string Description,
    DateTime Timestamp
);
