using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoryReader.Api.Data;
using StoryReader.Api.Models.Entities;

namespace StoryReader.Api.Controllers;

public record CreateDiscussionDto(string Content);
public record ReportDiscussionDto(string? Reason);

[ApiController]
[Route("api/chapters/{chapterId:guid}/discussions")]
public class DiscussionsController : ControllerBase
{
    private readonly AppDbContext _db;

    public DiscussionsController(AppDbContext db)
    {
        _db = db;
    }

    private Guid? CurrentUserId =>
        Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetForChapter(Guid chapterId)
    {
        var items = await _db.Discussions.AsNoTracking()
            .Include(d => d.User)
            .Where(d => d.ChapterId == chapterId && d.Status == DiscussionStatus.Visible)
            .OrderBy(d => d.CreatedAt)
            .Select(d => new 
            { 
                d.Id, 
                d.Content, 
                d.CreatedAt, 
                User = d.User.DisplayName,
                UserId = d.UserId
            })
            .ToListAsync();
        return Ok(items);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Post(Guid chapterId, CreateDiscussionDto dto)
    {
        if (CurrentUserId is null) return Unauthorized();
        var user = await _db.Users.FindAsync(CurrentUserId.Value);
        if (user is null || user.IsRestricted)
            return Forbid();

        _db.Discussions.Add(new Discussion 
        { 
            ChapterId = chapterId, 
            UserId = CurrentUserId.Value, 
            Content = dto.Content 
        });
        await _db.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>Người dùng báo cáo một bình luận vi phạm.</summary>
    [HttpPost("{discussionId:guid}/report")]
    [AllowAnonymous]
    public async Task<IActionResult> Report(Guid chapterId, Guid discussionId, [FromBody] ReportDiscussionDto? dto)
    {
        var d = await _db.Discussions.FirstOrDefaultAsync(x => x.Id == discussionId && x.ChapterId == chapterId);
        if (d is null) return NotFound();

        d.Status = DiscussionStatus.Reported;
        d.ReportReason = !string.IsNullOrWhiteSpace(dto?.Reason) 
            ? dto.Reason.Trim() 
            : (d.ReportReason ?? "Bị độc giả báo cáo vi phạm");
        d.ReportCount++;

        await _db.SaveChangesAsync();
        return Ok(new { message = "Báo cáo bình luận thành công. Ban quản trị sẽ kiểm duyệt sớm nhất!" });
    }

    /// <summary>Admin ẩn một bình luận vi phạm/spam.</summary>
    [HttpPut("{discussionId:guid}/hide")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Hide(Guid discussionId)
    {
        var d = await _db.Discussions.FindAsync(discussionId);
        if (d is null) return NotFound();
        d.Status = DiscussionStatus.Hidden;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
