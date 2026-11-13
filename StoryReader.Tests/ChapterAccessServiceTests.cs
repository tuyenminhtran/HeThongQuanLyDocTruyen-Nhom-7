using Microsoft.Extensions.DependencyInjection;
using StoryReader.Api.Data;
using StoryReader.Api.Models.Entities;
using StoryReader.Api.Services;
using StoryReader.Tests.Helpers;
using Xunit;

namespace StoryReader.Tests;

public class ChapterAccessServiceTests
{
    [Fact]
    public async Task AnonymousReader_CanReadFreeChapters_BlockedFromPaidChapters()
    {
        using var sp = TestDbFactory.BuildServiceProvider();
        using var scope = sp.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var story = new Story
        {
            Title = "Truyện Hỗn Hợp",
            AccessPolicy = AccessPolicy.Mixed,
            Price = 50000,
            FreeChapterCount = 2
        };
        var freeChapter = new Chapter { Story = story, ChapterNumber = 2, Title = "Chương 2" };
        var paidChapter = new Chapter { Story = story, ChapterNumber = 3, Title = "Chương 3" };
        db.Stories.Add(story);
        db.Chapters.AddRange(freeChapter, paidChapter);
        await db.SaveChangesAsync();

        var sut = new ChapterAccessService(db);

        Assert.True(await sut.CanReadChapterAsync(null, freeChapter.Id));
        Assert.False(await sut.CanReadChapterAsync(null, paidChapter.Id));
    }

    [Fact]
    public async Task RestrictedUser_IsBlockedEvenWithActiveVipAndPurchase()
    {
        using var sp = TestDbFactory.BuildServiceProvider();
        using var scope = sp.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var (user, _) = await TestDbFactory.SeedUserAsync(db, "banned@test.local", isRestricted: true);
        var plan = new SubscriptionPlan { Name = "VIP", Price = 49000, DurationDays = 30 };
        var story = new Story { Title = "Truyện Trả Phí", AccessPolicy = AccessPolicy.Paid, Price = 30000, FreeChapterCount = 0 };
        var chapter = new Chapter { Story = story, ChapterNumber = 1, Title = "Chương 1" };

        db.SubscriptionPlans.Add(plan);
        db.Stories.Add(story);
        db.Chapters.Add(chapter);
        db.Purchases.Add(new Purchase { UserId = user.Id, StoryId = story.Id, PricePaid = 30000, TransactionId = Guid.NewGuid() });
        db.UserSubscriptions.Add(new UserSubscription
        {
            UserId = user.Id,
            PlanId = plan.Id,
            StartAt = DateTime.UtcNow.AddDays(-1),
            EndAt = DateTime.UtcNow.AddDays(29),
            TransactionId = Guid.NewGuid()
        });
        await db.SaveChangesAsync();

        var sut = new ChapterAccessService(db);
        var state = await sut.GetStoryAccessStateAsync(user.Id, story.Id);

        Assert.True(state.IsRestricted);
        Assert.False(state.HasFullAccess);
        Assert.False(await sut.CanReadChapterAsync(user.Id, chapter.Id));
    }

    [Fact]
    public async Task ScheduledFutureChapter_BlockedForVipSubscriber_AllowedForAdmin()
    {
        using var sp = TestDbFactory.BuildServiceProvider();
        using var scope = sp.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var (vipUser, _) = await TestDbFactory.SeedUserAsync(db, "vip@test.local", "Member");
        var (adminUser, _) = await TestDbFactory.SeedUserAsync(db, "admin@test.local", "Admin");

        var plan = new SubscriptionPlan { Name = "VIP", Price = 49000, DurationDays = 30 };
        var story = new Story { Title = "Truyện Mới", AccessPolicy = AccessPolicy.Paid, Price = 25000 };
        var futureChapter = new Chapter
        {
            Story = story,
            ChapterNumber = 10,
            Title = "Chương Hẹn Giờ",
            PublishAt = DateTime.UtcNow.AddHours(3)
        };

        db.SubscriptionPlans.Add(plan);
        db.Stories.Add(story);
        db.Chapters.Add(futureChapter);
        db.UserSubscriptions.Add(new UserSubscription
        {
            UserId = vipUser.Id,
            PlanId = plan.Id,
            StartAt = DateTime.UtcNow.AddDays(-1),
            EndAt = DateTime.UtcNow.AddDays(29),
            TransactionId = Guid.NewGuid()
        });
        await db.SaveChangesAsync();

        var sut = new ChapterAccessService(db);

        Assert.False(await sut.CanReadChapterAsync(vipUser.Id, futureChapter.Id));
        Assert.True(await sut.CanReadChapterAsync(adminUser.Id, futureChapter.Id));
    }

    [Fact]
    public async Task ExpiredSubscription_DoesNotGrantPaidChapterAccess()
    {
        using var sp = TestDbFactory.BuildServiceProvider();
        using var scope = sp.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var (user, _) = await TestDbFactory.SeedUserAsync(db, "expired@test.local", "Member");
        var plan = new SubscriptionPlan { Name = "VIP", Price = 49000, DurationDays = 30 };
        var story = new Story { Title = "Truyện VIP", AccessPolicy = AccessPolicy.Paid, Price = 40000 };
        var chapter = new Chapter { Story = story, ChapterNumber = 1, Title = "Chương 1" };

        db.SubscriptionPlans.Add(plan);
        db.Stories.Add(story);
        db.Chapters.Add(chapter);
        db.UserSubscriptions.Add(new UserSubscription
        {
            UserId = user.Id,
            PlanId = plan.Id,
            StartAt = DateTime.UtcNow.AddDays(-35),
            EndAt = DateTime.UtcNow.AddDays(-5),
            TransactionId = Guid.NewGuid()
        });
        await db.SaveChangesAsync();

        var sut = new ChapterAccessService(db);

        Assert.False(await sut.CanReadChapterAsync(user.Id, chapter.Id));
    }
}
