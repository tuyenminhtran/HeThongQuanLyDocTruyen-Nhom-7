using Microsoft.EntityFrameworkCore;
using StoryReader.Api.Data;
using StoryReader.Api.Models.Entities;

namespace StoryReader.Api.Services;

public static class ChapterPublicationHelper
{
    public static DateTime? NormalizeUtc(DateTime? dt)
    {
        if (dt is null) return null;
        return dt.Value.Kind switch
        {
            DateTimeKind.Utc => dt.Value,
            DateTimeKind.Local => dt.Value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(dt.Value, DateTimeKind.Utc)
        };
    }

    public static async Task NotifyFollowersAsync(AppDbContext db, Story story, Chapter chapter, CancellationToken ct = default)
    {
        var followerUserIds = await db.StoryFollows
            .Where(f => f.StoryId == story.Id)
            .Select(f => f.UserId)
            .ToListAsync(ct);

        if (!followerUserIds.Any()) return;

        var linkUrl = $"/chapters/{chapter.Id}";
        var alreadyNotifiedUserIds = await db.Notifications
            .Where(n => n.LinkUrl == linkUrl && followerUserIds.Contains(n.UserId))
            .Select(n => n.UserId)
            .ToListAsync(ct);

        var targetUserIds = followerUserIds.Except(alreadyNotifiedUserIds).ToList();
        if (!targetUserIds.Any()) return;

        var notifications = targetUserIds.Select(uid => new Notification
        {
            UserId = uid,
            Title = $"Chương mới: {story.Title}",
            Message = $"{story.Title} vừa cập nhật Chương {chapter.ChapterNumber}: {chapter.Title}",
            LinkUrl = linkUrl,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        });

        await db.Notifications.AddRangeAsync(notifications, ct);
        await db.SaveChangesAsync(ct);
    }
}
