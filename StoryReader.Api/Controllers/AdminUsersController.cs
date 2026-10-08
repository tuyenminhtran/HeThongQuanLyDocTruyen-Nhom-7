using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoryReader.Api.Data;
using StoryReader.Api.Models.Dtos;
using StoryReader.Api.Models.Entities;

namespace StoryReader.Api.Controllers;

[ApiController]
[Route("api/admin/users")]
public class AdminUsersController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly AppDbContext _db;

    public AdminUsersController(UserManager<AppUser> userManager, AppDbContext db)
    {
        _userManager = userManager;
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers([FromQuery] string? keyword)
    {
        var query = _userManager.Users.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var lower = keyword.Trim().ToLower();
            query = query.Where(u =>
                (u.Email != null && u.Email.ToLower().Contains(lower)) ||
                (u.DisplayName != null && u.DisplayName.ToLower().Contains(lower)));
        }

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();

        var result = new List<MemberListItemDto>();

        var now = DateTime.UtcNow;
        var activeSubUserIds = await _db.UserSubscriptions
            .Where(s => s.EndAt > now)
            .Select(s => s.UserId)
            .Distinct()
            .ToListAsync();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            string role = roles.FirstOrDefault() ?? "Member";

            // Nếu không phải Admin nhưng có gói subscription còn hạn thì đánh dấu VIP
            if (role != "Admin" && activeSubUserIds.Contains(user.Id))
            {
                role = "VIP";
            }
            else if (role == "Member")
            {
                role = "User";
            }

            result.Add(new MemberListItemDto(
                user.Id,
                user.Email ?? string.Empty,
                string.IsNullOrWhiteSpace(user.DisplayName) ? (user.Email ?? "Thành viên") : user.DisplayName,
                role,
                user.IsRestricted,
                user.CreatedAt
            ));
        }

        return Ok(result);
    }

    [HttpPut("{id:guid}/toggle-restriction")]
    public async Task<IActionResult> ToggleRestriction(Guid id)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user is null)
            return NotFound(new { message = "Không tìm thấy người dùng." });

        user.IsRestricted = !user.IsRestricted;
        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
            return BadRequest(new { message = string.Join("; ", result.Errors.Select(e => e.Description)) });

        return Ok(new
        {
            id = user.Id,
            isRestricted = user.IsRestricted,
            message = user.IsRestricted ? "Đã khóa tài khoản thành công." : "Đã mở khóa tài khoản thành công."
        });
    }
}
