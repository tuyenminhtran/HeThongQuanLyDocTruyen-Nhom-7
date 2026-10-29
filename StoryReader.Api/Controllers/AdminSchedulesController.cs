using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoryReader.Api.Data;
using StoryReader.Api.Models.Entities;

namespace StoryReader.Api.Controllers;

public record RescheduleDto(DateTime? PublishAt);

[ApiController]
[Route("api/admin/schedules")]
[Authorize(Roles = "Admin")]
public class AdminSchedulesController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminSchedulesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetScheduledChapters(
        [FromQuery] Guid? storyId = null,
        [FromQuery] string? status = null, // "pending", "published", "all"
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var now = DateTime.UtcNow;
        var query = _db.Chapters
            .Include(c => c.Story)
            .AsNoTracking();

        // Mặc định lọc các chương có PublishAt hoặc lọc theo status
        if (!string.Equals(status, "all", StringComparison.OrdinalIgnoreCase))
        {
            if (string.Equals(status, "published", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(c => c.PublishAt != null && c.PublishAt <= now);
            }
            else // "pending" là mặc định nếu không truyền hoặc truyền "pending"
            {
                query = query.Where(c => c.PublishAt != null && c.PublishAt > now);
            }
        }
        else
        {
            query = query.Where(c => c.PublishAt != null);
        }

        if (storyId.HasValue && storyId.Value != Guid.Empty)
        {
            query = query.Where(c => c.StoryId == storyId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(c => c.Title.ToLower().Contains(s) || c.Story.Title.ToLower().Contains(s));
        }

        var totalCount = await query.CountAsync();

        // Lấy thống kê tổng quan
        var pendingCount = await _db.Chapters.CountAsync(c => c.PublishAt != null && c.PublishAt > now);
        var todayStart = new DateTime(now.Year, now.Month, now.Day, 0, 0, 0, DateTimeKind.Utc);
        var publishedTodayCount = await _db.Chapters.CountAsync(c => c.PublishAt != null && c.PublishAt >= todayStart && c.PublishAt <= now);
        var storiesCount = await _db.Chapters.Where(c => c.PublishAt != null).Select(c => c.StoryId).Distinct().CountAsync();

        var items = await query
            .OrderBy(c => c.PublishAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new
            {
                c.Id,
                c.StoryId,
                StoryTitle = c.Story.Title,
                StoryCoverImageUrl = c.Story.CoverImageUrl,
                StoryType = c.Story.Type,
                c.ChapterNumber,
                c.Title,
                c.PublishAt,
                IsPublished = c.PublishAt == null || c.PublishAt <= now,
                c.CreatedAt,
                c.ViewCount
            })
            .ToListAsync();

        return Ok(new
        {
            items,
            totalCount,
            page,
            pageSize,
            stats = new
            {
                pendingCount,
                publishedTodayCount,
                storiesCount,
                serverTimeUtc = now
            }
        });
    }

    /// <summary>Xuất bản ngay lập tức một chương đang hẹn giờ.</summary>
    [HttpPost("{chapterId:guid}/publish-now")]
    public async Task<IActionResult> PublishNow(Guid chapterId)
    {
        var chapter = await _db.Chapters.FindAsync(chapterId);
        if (chapter is null) return NotFound(new { message = "Không tìm thấy chương truyện" });

        chapter.PublishAt = DateTime.UtcNow;
        chapter.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đã xuất bản chương truyện thành công!", chapterId, publishAt = chapter.PublishAt });
    }

    /// <summary>Đổi ngày giờ xuất bản cho chương truyện.</summary>
    [HttpPut("{chapterId:guid}/reschedule")]
    public async Task<IActionResult> Reschedule(Guid chapterId, [FromBody] RescheduleDto dto)
    {
        var chapter = await _db.Chapters.FindAsync(chapterId);
        if (chapter is null) return NotFound(new { message = "Không tìm thấy chương truyện" });

        chapter.PublishAt = dto.PublishAt;
        chapter.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đã cập nhật lịch đăng chương thành công!", chapterId, publishAt = chapter.PublishAt });
    }

    /// <summary>Hủy lịch hẹn (đặt về xuất bản ngay hoặc xóa chương).</summary>
    [HttpDelete("{chapterId:guid}")]
    public async Task<IActionResult> CancelSchedule(Guid chapterId, [FromQuery] bool deleteChapter = false)
    {
        var chapter = await _db.Chapters.FindAsync(chapterId);
        if (chapter is null) return NotFound(new { message = "Không tìm thấy chương truyện" });

        if (deleteChapter)
        {
            _db.Chapters.Remove(chapter);
        }
        else
        {
            chapter.PublishAt = null; // Xuất bản công khai luôn
            chapter.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = deleteChapter ? "Đã xóa chương truyện" : "Đã hủy lịch hẹn và xuất bản chương ngay" });
    }
}
