using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using StoryReader.Api.Data;
using StoryReader.Api.Models.Entities;
using StoryReader.Api.Services;
using StoryReader.Tests.Helpers;
using Xunit;

namespace StoryReader.Tests;

public class PaymentServiceTests
{
    [Fact]
    public async Task InitiateStoryPurchase_ValidPaidStory_CreatesPendingTransaction()
    {
        using var sp = TestDbFactory.BuildServiceProvider();
        using var scope = sp.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var (reader, _) = await TestDbFactory.SeedUserAsync(db, "buyer@test.local");
        var story = new Story { Title = "Truyện Trả Phí", AccessPolicy = AccessPolicy.Paid, Price = 45000 };
        db.Stories.Add(story);
        await db.SaveChangesAsync();

        var sut = new PaymentService(db);
        var (txId, url) = await sut.InitiateStoryPurchaseAsync(reader.Id, story.Id);

        var tx = await db.Transactions.FindAsync(txId);
        Assert.NotNull(tx);
        Assert.Equal(TransactionStatus.Pending, tx!.Status);
        Assert.Equal(45000m, tx.Amount);
        Assert.Contains(tx.ProviderTransactionRef, url);
    }

    [Fact]
    public async Task InitiateStoryPurchase_RejectsAdminOrVipSubscriberOrDuplicateOwner()
    {
        using var sp = TestDbFactory.BuildServiceProvider();
        using var scope = sp.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var (admin, _) = await TestDbFactory.SeedUserAsync(db, "admin@test.local", "Admin");
        var (vip, _) = await TestDbFactory.SeedUserAsync(db, "vip@test.local");
        var (owner, _) = await TestDbFactory.SeedUserAsync(db, "owner@test.local");
        var plan = new SubscriptionPlan { Name = "VIP", Price = 49000, DurationDays = 30 };
        var story = new Story { Title = "Truyện VIP", AccessPolicy = AccessPolicy.Paid, Price = 30000 };

        db.SubscriptionPlans.Add(plan);
        db.Stories.Add(story);
        db.UserSubscriptions.Add(new UserSubscription
        {
            UserId = vip.Id,
            PlanId = plan.Id,
            StartAt = DateTime.UtcNow.AddDays(-1),
            EndAt = DateTime.UtcNow.AddDays(10),
            TransactionId = Guid.NewGuid()
        });
        db.Purchases.Add(new Purchase
        {
            UserId = owner.Id,
            StoryId = story.Id,
            PricePaid = 30000,
            TransactionId = Guid.NewGuid()
        });
        await db.SaveChangesAsync();

        var sut = new PaymentService(db);

        await Assert.ThrowsAsync<InvalidOperationException>(() => sut.InitiateStoryPurchaseAsync(admin.Id, story.Id));
        await Assert.ThrowsAsync<InvalidOperationException>(() => sut.InitiateStoryPurchaseAsync(vip.Id, story.Id));
        await Assert.ThrowsAsync<InvalidOperationException>(() => sut.InitiateStoryPurchaseAsync(owner.Id, story.Id));
    }

    [Fact]
    public async Task HandleGatewayCallback_IsIdempotent_AndStacksVipSubscriptionDuration()
    {
        using var sp = TestDbFactory.BuildServiceProvider();
        using var scope = sp.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var (reader, _) = await TestDbFactory.SeedUserAsync(db, "vipstack@test.local");
        var plan = new SubscriptionPlan { Name = "VIP 1 Tháng", Price = 49000, DurationDays = 30 };
        var initialEnd = DateTime.UtcNow.AddDays(10);

        db.SubscriptionPlans.Add(plan);
        db.UserSubscriptions.Add(new UserSubscription
        {
            UserId = reader.Id,
            PlanId = plan.Id,
            StartAt = DateTime.UtcNow.AddDays(-20),
            EndAt = initialEnd,
            TransactionId = Guid.NewGuid()
        });
        await db.SaveChangesAsync();

        var sut = new PaymentService(db);
        var (txId, _) = await sut.InitiateSubscriptionAsync(reader.Id, plan.Id);
        var tx = await db.Transactions.FindAsync(txId);

        await sut.HandleGatewayCallbackAsync(tx!.ProviderTransactionRef, true);
        await sut.HandleGatewayCallbackAsync(tx.ProviderTransactionRef, true); // duplicate callback

        var subs = await db.UserSubscriptions.Where(s => s.TransactionId == txId).ToListAsync();
        Assert.Single(subs);
        Assert.Equal(initialEnd, subs[0].StartAt);
        Assert.Equal(initialEnd.AddDays(30), subs[0].EndAt);
    }

    [Fact]
    public async Task ForceActivateTransaction_GrantsPurchaseOnceAndRejectsRepeatCall()
    {
        using var sp = TestDbFactory.BuildServiceProvider();
        using var scope = sp.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var (reader, _) = await TestDbFactory.SeedUserAsync(db, "force@test.local");
        var story = new Story { Title = "Truyện Lẻ", AccessPolicy = AccessPolicy.Paid, Price = 29000 };
        db.Stories.Add(story);
        await db.SaveChangesAsync();

        var sut = new PaymentService(db);
        var (txId, _) = await sut.InitiateStoryPurchaseAsync(reader.Id, story.Id);

        await sut.ForceActivateTransactionAsync(txId);

        Assert.True(await db.Purchases.AnyAsync(p => p.UserId == reader.Id && p.StoryId == story.Id));
        await Assert.ThrowsAsync<InvalidOperationException>(() => sut.ForceActivateTransactionAsync(txId));
    }
}
