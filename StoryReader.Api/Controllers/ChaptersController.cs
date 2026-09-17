using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoryReader.Api.Data;
using StoryReader.Api.Models.Dtos;
using StoryReader.Api.Models.Entities;
using StoryReader.Api.Services.Interfaces;

namespace StoryReader.Api.Controllers;

[ApiController]
[Route("api/chapters")]
public class ChaptersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IChapterAccessService _access;

    public ChaptersController(AppDbContext db, IChapterAccessService access)
    {
        _db = db;
        _access = access;
    }

    private Guid? CurrentUserId =>
        Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetContent(Guid id)
    {
        var canRead = await _access.CanReadChapterAsync(CurrentUserId, id);
        if (!canRead)
            return Forbid();

        var chapter = await _db.Chapters.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
        if (chapter is null || !chapter.IsPublished) return NotFound();

        chapter.ViewCount++;
        await _db.SaveChangesAsync();

        if (CurrentUserId is Guid userId)
        {
            var progress = await _db.ReadingProgresses
                .FirstOrDefaultAsync(p => p.UserId == userId && p.StoryId == chapter.StoryId);

            if (progress is null)
                _db.ReadingProgresses.Add(new ReadingProgress
                {
                    UserId = userId,
                    StoryId = chapter.StoryId,
                    LastChapterId = chapter.Id
                });
            else
            {
                progress.LastChapterId = chapter.Id;
                progress.UpdatedAt = DateTime.UtcNow;
            }
            await _db.SaveChangesAsync();
        }

        return Ok(new ChapterContentDto(chapter.Id, chapter.ChapterNumber, chapter.Title, chapter.Content));
    }
}
