using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using StoryReader.Api.Data;
using StoryReader.Api.Models.Dtos;
using StoryReader.Api.Models.Entities;
using StoryReader.Api.Services;
using StoryReader.Tests.Helpers;
using Xunit;

namespace StoryReader.Tests;

public class ScheduledPublisherAndStoryServiceTests
{
    [Fact]
    public async Task Worker_PublishesDueScheduledChaptersOnceAndNotifiesFollowers()
    {
        using var sp = TestDbFactory.BuildServiceProvider();
        Guid followerId;
        Guid storyId;
        Guid dueChapterId;
        Guid futureChapterId;
        var initialStoryUpdatedAt = DateTime.UtcNow.AddDays(-5);

        using (var scope = sp.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var (follower, _) = await TestDbFactory.SeedUserAsync(db, "follower@test.local");
            followerId = follower.Id;

            var story = new Story
            {
                Title = "Hành Trình Bầu Trời",
                UpdatedAt = initialStoryUpdatedAt
            };
            storyId = story.Id;

            var dueChapter = new Chapter
            {
                Story = story,
                ChapterNumber = 5,
                Title = "Chương Tới Hạn",
                Content = "Nội dung",
                PublishAt = DateTime.UtcNow.AddMinutes(-2),
                CreatedAt = DateTime.UtcNow.AddHours(-1),
                UpdatedAt = DateTime.UtcNow.AddHours(-1)
            };
            dueChapterId = dueChapter.Id;

            var futureChapter = new Chapter
            {
                Story = story,
                ChapterNumber = 6,
                Title = "Chương Tương Lai",
                Content = "Nội dung",
                PublishAt = DateTime.UtcNow.AddHours(4),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            futureChapterId = futureChapter.Id;

            db.Stories.Add(story);
            db.Chapters.AddRange(dueChapter, futureChapter);
            db.StoryFollows.Add(new StoryFollow { StoryId = story.Id, UserId = follower.Id });
            await db.SaveChangesAsync();
        }

        var worker = new ScheduledChapterPublisherWorker(
            sp.GetRequiredService<IServiceScopeFactory>(),
            NullLogger<ScheduledChapterPublisherWorker>.Instance);

        var firstPassCount = await worker.ProcessDueChaptersAsync();
        var secondPassCount = await worker.ProcessDueChaptersAsync();

        Assert.Equal(1, firstPassCount);
        Assert.Equal(0, secondPassCount);

        using var verifyScope = sp.CreateScope();
        var verifyDb = verifyScope.ServiceProvider.GetRequiredService<AppDbContext>();
        var updatedStory = await verifyDb.Stories.FindAsync(storyId);
        var updatedDue = await verifyDb.Chapters.FindAsync(dueChapterId);
        var untouchedFuture = await verifyDb.Chapters.FindAsync(futureChapterId);
        var notifications = await verifyDb.Notifications.Where(n => n.UserId == followerId).ToListAsync();

        Assert.True(updatedStory!.UpdatedAt > initialStoryUpdatedAt);
        Assert.True(updatedDue!.UpdatedAt >= updatedDue.PublishAt);
        Assert.True(untouchedFuture!.UpdatedAt < untouchedFuture.PublishAt);
        Assert.Single(notifications);
        Assert.Equal($"/chapters/{dueChapterId}", notifications[0].LinkUrl);
    }

    [Fact]
    public async Task StoryService_AddAndSearch_ExcludesUnpublishedChaptersFromPublicCounts()
    {
        using var sp = TestDbFactory.BuildServiceProvider();
        using var scope = sp.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var (follower, _) = await TestDbFactory.SeedUserAsync(db, "reader@test.local");
        var originalStoryUpdated = DateTime.UtcNow.AddDays(-2);
        var story = new Story { Title = "Kiếm Khách", CreatedAt = originalStoryUpdated, UpdatedAt = originalStoryUpdated };
        db.Stories.Add(story);
        db.StoryFollows.Add(new StoryFollow { Story = story, UserId = follower.Id });
        await db.SaveChangesAsync();

        var sut = new StoryService(db, new ChapterAccessService(db), new NoOpTextToImageService());

        await sut.AddChapterAsync(story.Id, new CreateChapterDto(1, "Mở Đầu", "Text 1", null, RenderAsImages: false));
        await sut.AddChapterAsync(story.Id, new CreateChapterDto(2, "Hẹn Giờ", "Text 2", DateTime.UtcNow.AddDays(1), RenderAsImages: false));

        var results = (await sut.SearchAsync("Kiếm Khách", null, 1, 20, null)).ToList();
        Assert.Single(results);
        Assert.Equal(1, results[0].TotalChapters);
        Assert.Equal(1, results[0].LatestChapterNumber);

        var notifications = await db.Notifications.ToListAsync();
        Assert.Single(notifications);
        Assert.Contains("Mở Đầu", notifications[0].Message);
    }

    [Fact]
    public async Task StoryService_UpdateChapter_PromotingScheduledChapterNotifiesFollowers()
    {
        using var sp = TestDbFactory.BuildServiceProvider();
        using var scope = sp.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var (follower, _) = await TestDbFactory.SeedUserAsync(db, "sub@test.local");
        var story = new Story { Title = "Truyện Ngắn" };
        var chapter = new Chapter
        {
            Story = story,
            ChapterNumber = 1,
            Title = "Bản Nháp",
            Content = "Nội dung",
            PublishAt = DateTime.UtcNow.AddHours(6)
        };
        db.Stories.Add(story);
        db.Chapters.Add(chapter);
        db.StoryFollows.Add(new StoryFollow { Story = story, UserId = follower.Id });
        await db.SaveChangesAsync();

        var sut = new StoryService(db, new ChapterAccessService(db), new NoOpTextToImageService());
        await sut.UpdateChapterAsync(
            story.Id,
            chapter.Id,
            new UpdateChapterDto(1, "Đã Công Bố", "Nội dung mới", null, RenderAsImages: false));

        var notifications = await db.Notifications.Where(n => n.UserId == follower.Id).ToListAsync();
        Assert.Single(notifications);
        Assert.Equal($"/chapters/{chapter.Id}", notifications[0].LinkUrl);
    }

    [Fact]
    public void NormalizeUtc_ConvertsLocalAndUnspecifiedToUtc()
    {
        var unspecified = new DateTime(2026, 11, 14, 12, 0, 0, DateTimeKind.Unspecified);
        var normalized = ChapterPublicationHelper.NormalizeUtc(unspecified);

        Assert.NotNull(normalized);
        Assert.Equal(DateTimeKind.Utc, normalized!.Value.Kind);
        Assert.Equal(unspecified, normalized.Value);
        Assert.Null(ChapterPublicationHelper.NormalizeUtc(null));
    }
}
