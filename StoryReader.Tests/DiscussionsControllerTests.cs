using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using StoryReader.Api.Controllers;
using StoryReader.Api.Data;
using StoryReader.Api.Models.Entities;
using StoryReader.Api.Services.Interfaces;
using StoryReader.Tests.Helpers;
using Xunit;

namespace StoryReader.Tests;

public class DiscussionsControllerTests
{
    [Fact]
    public async Task Report_BlocksSelfReportAndDuplicateReport_AllowsDifferentUsers()
    {
        using var sp = TestDbFactory.BuildServiceProvider();
        using var scope = sp.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var cache = scope.ServiceProvider.GetRequiredService<StoryReader.Api.Services.Interfaces.IAppCacheService>();

        var (author, _) = await TestDbFactory.SeedUserAsync(db, "author@test.local");
        var (reporter1, _) = await TestDbFactory.SeedUserAsync(db, "rep1@test.local");
        var (reporter2, _) = await TestDbFactory.SeedUserAsync(db, "rep2@test.local");

        var story = new Story { Title = "Truyện Test" };
        var chapter = new Chapter { Story = story, ChapterNumber = 1, Title = "C1" };
        var discussion = new Discussion
        {
            Chapter = chapter,
            UserId = author.Id,
            Content = "Bình luận thử nghiệm"
        };
        db.Stories.Add(story);
        db.Chapters.Add(chapter);
        db.Discussions.Add(discussion);
        await db.SaveChangesAsync();

        var controller = new DiscussionsController(db, cache);

        // 1. Tự báo cáo bình luận của chính mình -> BadRequest
        controller.ControllerContext = TestDbFactory.CreateUserContext(author.Id);
        var selfResult = await controller.Report(chapter.Id, discussion.Id, new ReportDiscussionDto("test"));
        Assert.IsType<BadRequestObjectResult>(selfResult);

        // 2. Người dùng khác báo cáo lần 1 -> Ok (200)
        controller.ControllerContext = TestDbFactory.CreateUserContext(reporter1.Id);
        var firstResult = await controller.Report(chapter.Id, discussion.Id, new ReportDiscussionDto("Spam"));
        Assert.IsType<OkObjectResult>(firstResult);

        // 3. Cùng người dùng đó bấm báo cáo lần 2 -> BadRequest (400)
        var duplicateResult = await controller.Report(chapter.Id, discussion.Id, new ReportDiscussionDto("Spam again"));
        Assert.IsType<BadRequestObjectResult>(duplicateResult);

        // 4. Người dùng thứ hai báo cáo hợp lệ -> Ok (200) và ReportCount tăng lên 2
        controller.ControllerContext = TestDbFactory.CreateUserContext(reporter2.Id);
        var secondUserResult = await controller.Report(chapter.Id, discussion.Id, new ReportDiscussionDto("Quảng cáo"));
        Assert.IsType<OkObjectResult>(secondUserResult);

        var updated = await db.Discussions.FindAsync(discussion.Id);
        Assert.Equal(2, updated!.ReportCount);
        Assert.Equal(DiscussionStatus.Reported, updated.Status);

        var persistedReports = await db.DiscussionReports
            .Where(r => r.DiscussionId == discussion.Id)
            .ToListAsync();
        Assert.Equal(2, persistedReports.Count);
    }

    [Fact]
    public async Task Report_PersistsAcrossFreshCache_AndAdminApproveClearsReports()
    {
        var dbName = Guid.NewGuid().ToString();
        using var sp1 = TestDbFactory.BuildIdentityServiceProvider(dbName);
        using var scope1 = sp1.CreateScope();
        var db1 = scope1.ServiceProvider.GetRequiredService<AppDbContext>();
        var cache1 = scope1.ServiceProvider.GetRequiredService<IAppCacheService>();

        var (author, _) = await TestDbFactory.SeedUserAsync(db1, "author2@test.local");
        var (reporter, _) = await TestDbFactory.SeedUserAsync(db1, "reporter@test.local");

        var story = new Story { Title = "Truyện bền vững" };
        var chapter = new Chapter { StoryId = story.Id, ChapterNumber = 1, Title = "Chương 1", Content = "Nội dung" };
        var discussion = new Discussion { ChapterId = chapter.Id, UserId = author.Id, Content = "Bình luận bị báo cáo" };
        db1.Stories.Add(story);
        db1.Chapters.Add(chapter);
        db1.Discussions.Add(discussion);
        await db1.SaveChangesAsync();

        var controller1 = new DiscussionsController(db1, cache1)
        {
            ControllerContext = TestDbFactory.CreateUserContext(reporter.Id)
        };
        Assert.IsType<OkObjectResult>(await controller1.Report(chapter.Id, discussion.Id, new ReportDiscussionDto("Spam")));

        // Giả lập cache trống sau khi restart -> DB DiscussionReports vẫn chặn báo cáo trùng
        using var sp2 = TestDbFactory.BuildIdentityServiceProvider(dbName);
        using var scope2 = sp2.CreateScope();
        var db2 = scope2.ServiceProvider.GetRequiredService<AppDbContext>();
        var cache2 = scope2.ServiceProvider.GetRequiredService<IAppCacheService>();
        var userManager = scope2.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
        var auth = scope2.ServiceProvider.GetRequiredService<IAuthService>();

        var controller2 = new DiscussionsController(db2, cache2)
        {
            ControllerContext = TestDbFactory.CreateUserContext(reporter.Id)
        };
        Assert.IsType<BadRequestObjectResult>(await controller2.Report(chapter.Id, discussion.Id, new ReportDiscussionDto("Spam nữa")));

        // Admin duyệt lại bình luận -> xóa DiscussionReports & reset ReportCount
        var adminCtrl = new AdminReportedCommentsController(db2, userManager, cache2, auth);
        Assert.IsType<OkObjectResult>(await adminCtrl.Approve(discussion.Id));

        var cleaned = await db2.Discussions.FindAsync(discussion.Id);
        Assert.Equal(DiscussionStatus.Visible, cleaned!.Status);
        Assert.Equal(0, cleaned.ReportCount);
        Assert.Empty(await db2.DiscussionReports.Where(r => r.DiscussionId == discussion.Id).ToListAsync());
    }
}
