using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoryReader.Api.Data;

namespace StoryReader.Api.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _db;

    public NotificationsController(AppDbContext db)
    {
        _db = db;
    }

    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetNotifications([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var items = await _db.Notifications
            .AsNoTracking()
            .Where(n => n.UserId == CurrentUserId)
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new
            {
                n.Id,
                n.Title,
                n.Message,
                n.LinkUrl,
                n.IsRead,
                n.CreatedAt
            })
            .ToListAsync();

        var unreadCount = await _db.Notifications.CountAsync(n => n.UserId == CurrentUserId && !n.IsRead);

        return Ok(new { unreadCount, items });
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var count = await _db.Notifications.CountAsync(n => n.UserId == CurrentUserId && !n.IsRead);
        return Ok(new { unreadCount = count });
    }

    [HttpPut("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var item = await _db.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == CurrentUserId);

        if (item is null) return NotFound(new { message = "Không tìm thấy thông báo." });

        item.IsRead = true;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đã đánh dấu đã đọc." });
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var unreadItems = await _db.Notifications
            .Where(n => n.UserId == CurrentUserId && !n.IsRead)
            .ToListAsync();

        foreach (var item in unreadItems)
        {
            item.IsRead = true;
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Đã đánh dấu tất cả thông báo là đã đọc." });
    }
}
