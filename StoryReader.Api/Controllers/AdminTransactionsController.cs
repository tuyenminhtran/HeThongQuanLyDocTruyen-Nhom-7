using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoryReader.Api.Data;
using StoryReader.Api.Models.Entities;
using StoryReader.Api.Services.Interfaces;

namespace StoryReader.Api.Controllers;

[ApiController]
[Route("api/admin/transactions")]
[Authorize(Roles = "Admin")]
public class AdminTransactionsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IPaymentService _payments;

    public AdminTransactionsController(AppDbContext db, IPaymentService payments)
    {
        _db = db;
        _payments = payments;
    }

    [HttpGet]
    public async Task<IActionResult> GetTransactions(
        [FromQuery] TransactionStatus? status,
        [FromQuery] string? keyword,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _db.Transactions
            .AsNoTracking()
            .Include(t => t.User)
            .AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(t => t.Status == status.Value);
        }

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var lower = keyword.Trim().ToLower();
            query = query.Where(t =>
                (t.User != null && t.User.Email != null && t.User.Email.ToLower().Contains(lower)) ||
                (t.User != null && t.User.DisplayName != null && t.User.DisplayName.ToLower().Contains(lower)) ||
                t.ProviderTransactionRef.ToLower().Contains(lower));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new
            {
                t.Id,
                t.UserId,
                UserEmail = t.User.Email,
                UserDisplayName = t.User.DisplayName,
                Type = t.Type == TransactionType.Subscription ? "Subscription" : "StoryPurchase",
                Status = t.Status.ToString(),
                t.TargetId,
                t.Amount,
                t.Provider,
                t.ProviderTransactionRef,
                t.CreatedAt,
                t.CompletedAt
            })
            .ToListAsync();

        return Ok(new { total, page, pageSize, items });
    }

    /// <summary>
    /// PB28: Kiểm tra & xử lý giao dịch lỗi - Admin cấp bù quyền truy cập cho người dùng
    /// </summary>
    [HttpPost("{id:guid}/force-activate")]
    public async Task<IActionResult> ForceActivate(Guid id)
    {
        try
        {
            await _payments.ForceActivateTransactionAsync(id);
            return Ok(new { message = "Đã cấp quyền truy cập và hoàn tất giao dịch thành công." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/mark-failed")]
    public async Task<IActionResult> MarkFailed(Guid id)
    {
        var tx = await _db.Transactions.FindAsync(id);
        if (tx is null) return NotFound(new { message = "Không tìm thấy giao dịch." });

        tx.Status = TransactionStatus.Failed;
        tx.CompletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đã đánh dấu giao dịch thất bại." });
    }
}
