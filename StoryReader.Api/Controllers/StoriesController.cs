using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StoryReader.Api.Models.Dtos;
using StoryReader.Api.Services.Interfaces;

namespace StoryReader.Api.Controllers;

[ApiController]
[Route("api/stories")]
public class StoriesController : ControllerBase
{
    private readonly IStoryService _stories;

    public StoriesController(IStoryService stories)
    {
        _stories = stories;
    }

    private Guid? CurrentUserId =>
        Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> Search([FromQuery] string? keyword, [FromQuery] Guid? genreId,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _stories.SearchAsync(keyword, genreId, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetDetail(Guid id)
    {
        var story = await _stories.GetDetailAsync(id, CurrentUserId);
        return story is null ? NotFound() : Ok(story);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateStoryDto dto)
    {
        var id = await _stories.CreateAsync(dto);
        return CreatedAtAction(nameof(GetDetail), new { id }, new { id });
    }

    [HttpPost("{id:guid}/chapters")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddChapter(Guid id, [FromBody] CreateChapterDto dto)
    {
        await _stories.AddChapterAsync(id, dto);
        return NoContent();
    }
}
