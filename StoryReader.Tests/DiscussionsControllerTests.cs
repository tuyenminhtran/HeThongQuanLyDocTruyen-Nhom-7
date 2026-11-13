using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using StoryReader.Api.Controllers;
using StoryReader.Api.Data;
using StoryReader.Api.Models.Entities;
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
        var cache = scope.ServiceProvider.GetRequiredService<IMemoryCache>();

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
    }
}
