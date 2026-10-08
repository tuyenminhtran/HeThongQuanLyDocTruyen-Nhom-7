using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoryReader.Api.Data;
using StoryReader.Api.Models.Entities;

namespace StoryReader.Api.Controllers;

public record CreateDiscussionDto(string Content);

[ApiController]
[Route("api/chapters/{chapterId:guid}/discussions")]
public class DiscussionsController : ControllerBase
{
    private readonly AppDbContext _db;

    public DiscussionsController(AppDbContext db)
    {
        _db = db;
    }

    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetForChapter(Guid chapterId)
    {
        var items = await _db.Discussions.AsNoTracking()
            .Include(d => d.User)
            .Where(d => d.ChapterId == chapterId && d.Status == DiscussionStatus.Visible)
            .OrderBy(d => d.CreatedAt)
            .Select(d => new { d.Id, d.Content, d.CreatedAt, User = d.User.DisplayName })
            .ToListAsync();
        return Ok(items);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Post(Guid chapterId, CreateDiscussionDto dto)
    {
        _db.Discussions.Add(new Discussion { ChapterId = chapterId, UserId = CurrentUserId, Content = dto.Content });
        await _db.SaveChangesAsync();
        return NoContent();
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
