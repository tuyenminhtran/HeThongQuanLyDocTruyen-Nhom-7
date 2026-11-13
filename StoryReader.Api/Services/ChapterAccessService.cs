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

    public async Task<StoryAccessState> GetStoryAccessStateAsync(Guid? userId, Guid storyId)
    {
        if (userId is null)
            return new StoryAccessState(false, false, false, false);

        var userStatus = await _db.Users
            .AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => new { u.IsRestricted })
            .FirstOrDefaultAsync();

        if (userStatus is null || userStatus.IsRestricted)
            return new StoryAccessState(false, false, false, true);

        var isAdmin = await _db.UserRoles
            .AsNoTracking()
            .AnyAsync(ur => ur.UserId == userId &&
                _db.Roles.Any(r => r.Id == ur.RoleId && r.Name == "Admin"));

        var hasPurchased = await _db.Purchases
            .AsNoTracking()
            .AnyAsync(p => p.UserId == userId && p.StoryId == storyId);

        var hasActiveSubscription = await _db.UserSubscriptions
            .AsNoTracking()
            .AnyAsync(s => s.UserId == userId && s.EndAt > DateTime.UtcNow);

        return new StoryAccessState(hasPurchased, hasActiveSubscription, isAdmin, false);
    }

    /// <summary>
    /// Kiểm tra quyền đọc một chương đã xuất bản dựa trên StoryAccessState (dùng lại cho danh sách chương không gây N+1 SQL).
    /// </summary>
    public static bool CanReadStoryChapter(Story story, int chapterNumber, StoryAccessState state)
    {
        if (story.AccessPolicy == AccessPolicy.Free)
            return true;

        if (chapterNumber <= story.FreeChapterCount)
            return true;

        return state.HasFullAccess;
    }

    public async Task<bool> CanReadChapterAsync(Guid? userId, Guid chapterId)
    {
        var chapter = await _db.Chapters
            .AsNoTracking()
            .Include(c => c.Story)
            .FirstOrDefaultAsync(c => c.Id == chapterId);

        if (chapter is null)
            return false;

        var state = await GetStoryAccessStateAsync(userId, chapter.StoryId);
        if (!chapter.IsPublished && !state.IsAdmin)
            return false;

        return CanReadStoryChapter(chapter.Story, chapter.ChapterNumber, state);
    }
}
