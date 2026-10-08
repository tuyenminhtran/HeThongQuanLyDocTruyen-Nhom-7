using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoryReader.Api.Data;
using StoryReader.Api.Models.Dtos;
using StoryReader.Api.Models.Entities;

namespace StoryReader.Api.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly AppDbContext _db;

    public ProfileController(UserManager<AppUser> userManager, AppDbContext db)
    {
        _userManager = userManager;
        _db = db;
    }

    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    [HttpGet("me")]
    public async Task<IActionResult> GetProfile()
    {
        var user = await _userManager.FindByIdAsync(CurrentUserId.ToString());
        if (user == null)
            return NotFound(new { message = "Không tìm thấy thông tin tài khoản." });

        var roles = await _userManager.GetRolesAsync(user);
        string role = roles.FirstOrDefault() ?? "Member";

        var now = DateTime.UtcNow;
        var activeSub = await _db.UserSubscriptions
            .AsNoTracking()
            .Include(s => s.Plan)
            .Where(s => s.UserId == user.Id && s.EndAt > now)
            .OrderByDescending(s => s.EndAt)
            .FirstOrDefaultAsync();

        if (role != "Admin" && activeSub != null)
        {
            role = "VIP";
        }
        else if (role == "Member")
        {
            role = "User";
        }

        var profile = new UserProfileDto(
            user.Id,
            user.Email ?? string.Empty,
            string.IsNullOrWhiteSpace(user.DisplayName) ? (user.Email ?? "Thành viên") : user.DisplayName,
            role,
            user.IsRestricted,
            user.CreatedAt,
            activeSub?.Plan?.Name,
            activeSub?.EndAt
        );

        return Ok(profile);
    }

    [HttpPut]
    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.DisplayName))
            return BadRequest(new { message = "Tên hiển thị không được để trống." });

        var trimmedName = dto.DisplayName.Trim();
        if (trimmedName.Length > 50)
            return BadRequest(new { message = "Tên hiển thị không được vượt quá 50 ký tự." });

        var user = await _userManager.FindByIdAsync(CurrentUserId.ToString());
        if (user == null)
            return NotFound(new { message = "Không tìm thấy tài khoản." });

        user.DisplayName = trimmedName;
        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
            return BadRequest(new { message = string.Join("; ", result.Errors.Select(e => e.Description)) });

        return Ok(new
        {
            message = "Cập nhật hồ sơ thành công.",
            displayName = user.DisplayName
        });
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.CurrentPassword))
            return BadRequest(new { message = "Vui lòng nhập mật khẩu hiện tại." });

        if (string.IsNullOrWhiteSpace(dto.NewPassword))
            return BadRequest(new { message = "Vui lòng nhập mật khẩu mới." });

        if (dto.NewPassword.Length < 6)
            return BadRequest(new { message = "Mật khẩu mới phải có độ dài ít nhất 6 ký tự." });

        if (dto.CurrentPassword == dto.NewPassword)
            return BadRequest(new { message = "Mật khẩu mới không được trùng với mật khẩu hiện tại." });

        var user = await _userManager.FindByIdAsync(CurrentUserId.ToString());
        if (user == null)
            return NotFound(new { message = "Không tìm thấy tài khoản." });

        var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);

        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e =>
            {
                if (e.Code == "PasswordMismatch")
                    return "Mật khẩu hiện tại không chính xác.";
                return e.Description;
            });

            return BadRequest(new { message = string.Join("; ", errors) });
        }

        return Ok(new { message = "Đổi mật khẩu thành công." });
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetReadingHistory()
    {
        var stories = await _db.ReadingProgresses
            .AsNoTracking()
            .Include(r => r.Story)
            .Where(r => r.UserId == CurrentUserId)
            .OrderByDescending(r => r.UpdatedAt)
            .Select(r => new StoryListItemDto(
                r.Story.Id,
                r.Story.Title,
                r.Story.CoverImageUrl,
                r.Story.Author,
                r.Story.Status,
                r.Story.AccessPolicy,
                r.Story.ViewCount
            ))
            .ToListAsync();

        return Ok(stories);
    }

    [HttpGet("bookmarks")]
    public async Task<IActionResult> GetBookmarks()
    {
        var stories = await _db.StoryFollows
            .AsNoTracking()
            .Include(f => f.Story)
            .Where(f => f.UserId == CurrentUserId)
            .OrderByDescending(f => f.FollowedAt)
            .Select(f => new StoryListItemDto(
                f.Story.Id,
                f.Story.Title,
                f.Story.CoverImageUrl,
                f.Story.Author,
                f.Story.Status,
                f.Story.AccessPolicy,
                f.Story.ViewCount
            ))
            .ToListAsync();

        return Ok(stories);
    }

    [HttpGet("purchased")]
    public async Task<IActionResult> GetPurchasedStories()
    {
        var stories = await _db.Purchases
            .AsNoTracking()
            .Include(p => p.Story)
            .Where(p => p.UserId == CurrentUserId)
            .OrderByDescending(p => p.PurchasedAt)
            .Select(p => new StoryListItemDto(
                p.Story.Id,
                p.Story.Title,
                p.Story.CoverImageUrl,
                p.Story.Author,
                p.Story.Status,
                p.Story.AccessPolicy,
                p.Story.ViewCount
            ))
            .ToListAsync();

        return Ok(stories);
    }
}
