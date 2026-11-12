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
        // Hiển thị cả bình luận đang chờ kiểm duyệt (Reported) để tránh 1 người bấm report làm ẩn ngay bình luận hợp lệ;
        // bình luận chỉ bị ẩn khi Admin duyệt ẩn (Hidden) hoặc bị báo cáo vượt ngưỡng tự động.
        var items = await _db.Discussions.AsNoTracking()
            .Include(d => d.User)
            .Where(d => d.ChapterId == chapterId && d.Status != DiscussionStatus.Hidden)
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

        var trimmedContent = dto?.Content?.Trim();
        if (string.IsNullOrWhiteSpace(trimmedContent))
            return BadRequest(new { message = "Nội dung bình luận không được để trống." });

        if (trimmedContent.Length > 1000)
            return BadRequest(new { message = "Bình luận không được vượt quá 1000 ký tự." });

        var user = await _db.Users.FindAsync(CurrentUserId.Value);
        if (user is null || user.IsRestricted)
            return Forbid();

        var chapterExists = await _db.Chapters.AnyAsync(c => c.Id == chapterId && (c.PublishAt == null || c.PublishAt <= DateTime.UtcNow));
        if (!chapterExists)
            return NotFound(new { message = "Không tìm thấy chương truyện." });

        _db.Discussions.Add(new Discussion
        {
            ChapterId = chapterId,
            UserId = CurrentUserId.Value,
            Content = trimmedContent
        });
        await _db.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>Người dùng đã đăng nhập báo cáo một bình luận vi phạm.</summary>
    [HttpPost("{discussionId:guid}/report")]
    [Authorize]
    public async Task<IActionResult> Report(Guid chapterId, Guid discussionId, [FromBody] ReportDiscussionDto? dto)
    {
        if (CurrentUserId is null) return Unauthorized();
        var user = await _db.Users.FindAsync(CurrentUserId.Value);
        if (user is null || user.IsRestricted)
            return Forbid();

        var d = await _db.Discussions.FirstOrDefaultAsync(x => x.Id == discussionId && x.ChapterId == chapterId);
        if (d is null) return NotFound(new { message = "Không tìm thấy bình luận." });

        if (d.UserId == CurrentUserId.Value)
            return BadRequest(new { message = "Bạn không thể tự báo cáo bình luận của chính mình." });

        var reason = dto?.Reason?.Trim();
        if (!string.IsNullOrEmpty(reason) && reason.Length > 300)
        {
            reason = reason[..300];
        }

        d.ReportCount++;
        if (d.Status == DiscussionStatus.Visible)
        {
            d.Status = DiscussionStatus.Reported;
        }

        // Tự động tạm ẩn nếu bị báo cáo từ 5 lần trở lên trước khi Admin xử lý
        if (d.ReportCount >= 5)
        {
            d.Status = DiscussionStatus.Hidden;
        }

        if (!string.IsNullOrWhiteSpace(reason))
        {
            d.ReportReason = string.IsNullOrWhiteSpace(d.ReportReason)
                ? reason
                : (d.ReportReason.Contains(reason, StringComparison.OrdinalIgnoreCase)
                    ? d.ReportReason
                    : $"{d.ReportReason}; {reason}"[..Math.Min(500, $"{d.ReportReason}; {reason}".Length)]);
        }
        else if (string.IsNullOrWhiteSpace(d.ReportReason))
        {
            d.ReportReason = "Bị độc giả báo cáo vi phạm";
        }

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
