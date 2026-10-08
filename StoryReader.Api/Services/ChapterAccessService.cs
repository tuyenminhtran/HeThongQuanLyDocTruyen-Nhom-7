using Microsoft.EntityFrameworkCore;
using StoryReader.Api.Data;
using StoryReader.Api.Models.Entities;
using StoryReader.Api.Services.Interfaces;

namespace StoryReader.Api.Services;

public class ChapterAccessService : IChapterAccessService
{
    private readonly AppDbContext _db;

    public ChapterAccessService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<bool> CanReadChapterAsync(Guid? userId, Guid chapterId)
    {
        var chapter = await _db.Chapters
            .Include(c => c.Story)
            .FirstOrDefaultAsync(c => c.Id == chapterId);

        if (chapter is null || !chapter.IsPublished)
            return false;

        var story = chapter.Story;

        // 1. Truyện hoàn toàn miễn phí.
        if (story.AccessPolicy == AccessPolicy.Free)
            return true;

        // 2. Chương nằm trong số chương đầu được mở miễn phí (giới thiệu).
        if (chapter.ChapterNumber <= story.FreeChapterCount)
            return true;

        // Từ đây trở đi chương yêu cầu quyền đọc -> phải có user đăng nhập.
        if (userId is null)
            return false;

        // 3. Đã mua riêng truyện này.
        var hasPurchased = await _db.Purchases
            .AnyAsync(p => p.UserId == userId && p.StoryId == story.Id);
        if (hasPurchased)
            return true;

        // 4. Đang có gói đọc theo tháng còn hiệu lực.
        // Đơn giản hoá: một gói còn hiệu lực (EndAt > now) cho phép đọc mọi truyện Paid/Mixed.
        // Nếu sau này có gói giới hạn phạm vi, kiểm tra thêm Plan.Scope tại đây.
        var hasActiveSubscription = await _db.UserSubscriptions
            .AnyAsync(s => s.UserId == userId && s.EndAt > DateTime.UtcNow);

        return hasActiveSubscription;
    }
}
