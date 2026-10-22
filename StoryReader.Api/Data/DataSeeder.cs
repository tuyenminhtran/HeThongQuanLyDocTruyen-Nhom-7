using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using StoryReader.Api.Data;
using StoryReader.Api.Models.Entities;

namespace StoryReader.Api.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var db = services.GetRequiredService<AppDbContext>();
        var userManager = services.GetRequiredService<UserManager<AppUser>>();

        if (!db.SubscriptionPlans.Any())
        {
            db.SubscriptionPlans.AddRange(
                new SubscriptionPlan { Name = "Gói 1 tháng", Price = 49000, DurationDays = 30, Scope = "all" },
                new SubscriptionPlan { Name = "Gói 3 tháng", Price = 129000, DurationDays = 90, Scope = "all" },
                new SubscriptionPlan { Name = "Gói 12 tháng", Price = 399000, DurationDays = 365, Scope = "all" }
            );
            await db.SaveChangesAsync();
        }

        const string adminEmail = "admin@storynest.local";
        var admin = await userManager.FindByEmailAsync(adminEmail);
        if (admin is null)
        {
            admin = new AppUser { UserName = adminEmail, Email = adminEmail, DisplayName = "Administrator" };
            var result = await userManager.CreateAsync(admin, "Admin@123456");
            if (result.Succeeded)
                await userManager.AddToRoleAsync(admin, "Admin");
        }

        // Đảm bảo có độc giả mẫu nếu chưa có và sửa tên tiếng Việt
        const string readerEmail = "reader@storyreader.vn";
        var reader = await userManager.FindByEmailAsync(readerEmail);
        if (reader is null)
        {
            reader = new AppUser { UserName = readerEmail, Email = readerEmail, DisplayName = "Độc Giả Mẫu" };
            var rRes = await userManager.CreateAsync(reader, "Reader@123456");
            if (rRes.Succeeded)
                await userManager.AddToRoleAsync(reader, "Member");
        }
        else if (reader.DisplayName.Contains('?'))
        {
            reader.DisplayName = "Độc Giả Mẫu";
            await userManager.UpdateAsync(reader);
        }

        // Tự động sửa tên thể loại nếu bị lỗi font ?
        var genreFixes = new Dictionary<Guid, string>
        {
            [Guid.Parse("a1000000-0000-0000-0000-000000000001")] = "Tiên Hiệp",
            [Guid.Parse("a1000000-0000-0000-0000-000000000002")] = "Kiếm Hiệp",
            [Guid.Parse("a1000000-0000-0000-0000-000000000003")] = "Huyền Huyễn",
            [Guid.Parse("a1000000-0000-0000-0000-000000000004")] = "Đô Thị",
            [Guid.Parse("a1000000-0000-0000-0000-000000000005")] = "Khoa Huyễn",
            [Guid.Parse("a1000000-0000-0000-0000-000000000006")] = "Ngôn Tình",
            [Guid.Parse("a1000000-0000-0000-0000-000000000007")] = "Xuyên Không",
            [Guid.Parse("a1000000-0000-0000-0000-000000000008")] = "Võng Du",
            [Guid.Parse("a1000000-0000-0000-0000-000000000009")] = "Dị Năng",
            [Guid.Parse("a1000000-0000-0000-0000-000000000010")] = "Trinh Thám",
        };
        foreach (var (gId, gName) in genreFixes)
        {
            var g = await db.Genres.FindAsync(gId);
            if (g != null && (g.Name.Contains('?') || g.Name != gName))
            {
                g.Name = gName;
            }
        }
        await db.SaveChangesAsync();

        // Cập nhật lượt xem thực tế cho các chapter & story nếu đang bằng 0
        var chaptersWithZeroViews = await db.Chapters.Where(c => c.ViewCount == 0).ToListAsync();
        if (chaptersWithZeroViews.Any())
        {
            var random = new Random(42);
            foreach (var chap in chaptersWithZeroViews)
            {
                chap.ViewCount = random.Next(1200, 8500);
            }
            await db.SaveChangesAsync();
        }

        var stories = await db.Stories.Include(s => s.Chapters).ToListAsync();
        foreach (var story in stories)
        {
            var totalViews = story.Chapters.Sum(c => c.ViewCount);
            if (totalViews > 0 && story.ViewCount != totalViews)
            {
                story.ViewCount = totalViews;
            }
        }
        await db.SaveChangesAsync();

        // Seed truyện tranh mẫu nếu chưa có truyện tranh nào
        if (!await db.Stories.AnyAsync(s => s.Type == StoryType.Comic))
        {
            var genre = await db.Genres.FirstOrDefaultAsync(g => g.Name == "Huyền Huyễn") ?? await db.Genres.FirstOrDefaultAsync();
            var comic = new Story
            {
                Title = "Võ Thần Tái Thế (Truyện Tranh)",
                Type = StoryType.Comic,
                Author = "Hàn Băng Thần",
                CoverImageUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80",
                Description = "Sau ngàn năm phong ấn, Võ Thần thức tỉnh trong thân xác một thiếu niên phế vật. Hành trình chinh phục lại đỉnh cao thiên hạ dưới dạng truyện tranh màu đặc sắc.",
                Status = ReleaseStatus.Ongoing,
                AccessPolicy = AccessPolicy.Free,
                FreeChapterCount = 2,
                ViewCount = 12500
            };

            if (genre != null)
                comic.StoryGenres.Add(new StoryGenre { GenreId = genre.Id });

            comic.Chapters.Add(new Chapter
            {
                ChapterNumber = 1,
                Title = "Chương 1: Thức tỉnh trong hoang tàn",
                Content = string.Join("\n", new[]
                {
                    "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1000&q=80",
                    "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1000&q=80",
                    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&q=80"
                }),
                ViewCount = 6500
            });

            comic.Chapters.Add(new Chapter
            {
                ChapterNumber = 2,
                Title = "Chương 2: Quyết đấu lôi đài",
                Content = string.Join("\n", new[]
                {
                    "https://images.unsplash.com/photo-1563089145-599997674d42?w=1000&q=80",
                    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1000&q=80"
                }),
                ViewCount = 6000
            });

            db.Stories.Add(comic);
            await db.SaveChangesAsync();
        }

        // Seed StoryFollows nếu chưa có
        if (!await db.StoryFollows.AnyAsync() && stories.Any() && reader != null)
        {
            foreach (var s in stories.Take(3))
            {
                db.StoryFollows.Add(new StoryFollow
                {
                    UserId = reader.Id,
                    StoryId = s.Id,
                    FollowedAt = DateTime.UtcNow.AddDays(-2)
                });
            }
            if (admin != null)
            {
                foreach (var s in stories.Skip(1).Take(2))
                {
                    db.StoryFollows.Add(new StoryFollow
                    {
                        UserId = admin.Id,
                        StoryId = s.Id,
                        FollowedAt = DateTime.UtcNow.AddDays(-1)
                    });
                }
            }
            await db.SaveChangesAsync();
        }

        // Seed Transactions nếu chưa có
        if (!await db.Transactions.AnyAsync() && reader != null)
        {
            var now = DateTime.UtcNow;
            var plans = await db.SubscriptionPlans.ToListAsync();
            var plan1m = plans.FirstOrDefault(p => p.DurationDays == 30) ?? plans.FirstOrDefault();
            var plan3m = plans.FirstOrDefault(p => p.DurationDays == 90);

            if (plan1m != null)
            {
                // Giao dịch hôm nay
                db.Transactions.Add(new Transaction
                {
                    UserId = reader.Id,
                    Type = TransactionType.Subscription,
                    TargetId = plan1m.Id,
                    Amount = plan1m.Price,
                    Provider = "VNPay",
                    ProviderTransactionRef = "VNP" + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                    Status = TransactionStatus.Success,
                    CreatedAt = now.AddHours(-2),
                    CompletedAt = now.AddHours(-2).AddMinutes(1)
                });

                // Thêm UserSubscription tương ứng
                db.UserSubscriptions.Add(new UserSubscription
                {
                    UserId = reader.Id,
                    PlanId = plan1m.Id,
                    StartAt = now.AddHours(-2),
                    EndAt = now.AddDays(30),
                    Transaction = db.Transactions.Local.Last()
                });
            }

            if (plan3m != null)
            {
                // Giao dịch hôm qua
                db.Transactions.Add(new Transaction
                {
                    UserId = reader.Id,
                    Type = TransactionType.Subscription,
                    TargetId = plan3m.Id,
                    Amount = plan3m.Price,
                    Provider = "Momo",
                    ProviderTransactionRef = "MOM" + (DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() - 86400000),
                    Status = TransactionStatus.Success,
                    CreatedAt = now.AddDays(-1).AddHours(3),
                    CompletedAt = now.AddDays(-1).AddHours(3).AddMinutes(2)
                });
            }

            if (stories.Any())
            {
                // Giao dịch mua truyện
                var paidStory = stories.FirstOrDefault(s => s.Price > 0) ?? stories.First();
                db.Transactions.Add(new Transaction
                {
                    UserId = reader.Id,
                    Type = TransactionType.StoryPurchase,
                    TargetId = paidStory.Id,
                    Amount = paidStory.Price ?? 29000,
                    Provider = "VNPay",
                    ProviderTransactionRef = "VNP_STORY_" + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                    Status = TransactionStatus.Success,
                    CreatedAt = now.AddHours(-5),
                    CompletedAt = now.AddHours(-5).AddMinutes(1)
                });
            }

            await db.SaveChangesAsync();
        }
    }
}
