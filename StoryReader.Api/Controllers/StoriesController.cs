using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkiaSharp;
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
        [FromQuery] int page = 1, [FromQuery] int pageSize = 100, [FromQuery] string? sortBy = null)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);
        var result = await _stories.SearchAsync(keyword, genreId, page, pageSize, sortBy);
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

    [HttpPost("upload-cover")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UploadCover(IFormFile? file, [FromServices] IWebHostEnvironment env)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Vui lòng chọn tệp hình ảnh để tải lên." });

        if (file.Length > 10 * 1024 * 1024)
            return BadRequest(new { message = "Dung lượng ảnh vượt quá giới hạn cho phép (tối đa 10MB)." });

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(ext))
            return BadRequest(new { message = "Định dạng file không hỗ trợ. Vui lòng chọn .jpg, .jpeg, .png, .webp hoặc .gif." });

        await using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream);
        memoryStream.Position = 0;

        // Xác thực nội dung thực sự của file ảnh bằng SkiaSharp (chống giả mạo đuôi file)
        using (var codec = SKCodec.Create(memoryStream))
        {
            if (codec == null || codec.Info.Width <= 0 || codec.Info.Height <= 0 || codec.Info.Width > 8000 || codec.Info.Height > 8000)
            {
                return BadRequest(new { message = "Tệp tải lên không phải là hình ảnh hợp lệ hoặc kích thước ảnh không được hỗ trợ." });
            }
        }

        var webRoot = env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var folder = Path.Combine(webRoot, "uploads", "covers");
        Directory.CreateDirectory(folder);

        var fileName = $"{Guid.NewGuid():N}{ext}";
        var filePath = Path.Combine(folder, fileName);

        await System.IO.File.WriteAllBytesAsync(filePath, memoryStream.ToArray());

        var url = $"/uploads/covers/{fileName}";
        return Ok(new { url });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateStoryDto dto)
    {
        await _stories.UpdateAsync(id, dto);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _stories.DeleteAsync(id);
        return NoContent();
    }

    [HttpPost("{id:guid}/chapters")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddChapter(Guid id, [FromBody] CreateChapterDto dto)
    {
        await _stories.AddChapterAsync(id, dto);
        return NoContent();
    }

    [HttpPut("{id:guid}/chapters/{chapterId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateChapter(Guid id, Guid chapterId, [FromBody] UpdateChapterDto dto)
    {
        await _stories.UpdateChapterAsync(id, chapterId, dto);
        return NoContent();
    }

    [HttpDelete("{id:guid}/chapters/{chapterId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteChapter(Guid id, Guid chapterId)
    {
        await _stories.DeleteChapterAsync(id, chapterId);
        return NoContent();
    }

    [HttpPost("{id:guid}/follow")]
    [Authorize]
    public async Task<IActionResult> ToggleFollow(Guid id)
    {
        if (CurrentUserId is not Guid userId)
            return Unauthorized();

        var isFollowing = await _stories.ToggleFollowAsync(userId, id);
        return Ok(new { isFollowing, message = isFollowing ? "Đã theo dõi truyện thành công." : "Đã hủy theo dõi truyện." });
    }

    [HttpGet("{id:guid}/is-following")]
    [AllowAnonymous]
    public async Task<IActionResult> GetIsFollowing(Guid id)
    {
        if (CurrentUserId is not Guid userId)
            return Ok(new { isFollowing = false });

        var isFollowing = await _stories.IsFollowingAsync(userId, id);
        return Ok(new { isFollowing });
    }
}
