using Microsoft.EntityFrameworkCore;
using StoryReader.Api.Data;
using StoryReader.Api.Models.Dtos;
using StoryReader.Api.Models.Entities;
using StoryReader.Api.Services.Interfaces;

namespace StoryReader.Api.Services;

public class StoryService : IStoryService
{
    private readonly AppDbContext _db;
    private readonly IChapterAccessService _access;
    private readonly ITextToImageService _textToImageService;

    public StoryService(AppDbContext db, IChapterAccessService access, ITextToImageService textToImageService)
    {
        _db = db;
        _access = access;
        _textToImageService = textToImageService;
    }

    public async Task<IEnumerable<StoryListItemDto>> SearchAsync(string? keyword, Guid? genreId, int page, int pageSize, string? sortBy = null)
    {
        var query = _db.Stories.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(keyword))
            query = query.Where(s => s.Title.Contains(keyword) || s.Author.Contains(keyword));

        if (genreId is not null)
            query = query.Where(s => s.StoryGenres.Any(g => g.GenreId == genreId));

        query = sortBy?.ToLowerInvariant() switch
        {
            "top" or "views" or "popular" => query.OrderByDescending(s => s.ViewCount),
            "newest" or "recent" => query.OrderByDescending(s => s.CreatedAt),
            "title" or "az" => query.OrderBy(s => s.Title),
            _ => query.OrderByDescending(s => s.UpdatedAt)
        };

        var now = DateTime.UtcNow;
        return await query

            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new StoryListItemDto(
                s.Id,
                s.Title,
                s.CoverImageUrl,
                s.Author,
                s.Status,
                s.AccessPolicy,
                s.ViewCount,
                s.Type,
                s.Chapters.Count(c => c.PublishAt == null || c.PublishAt <= now),
                s.Chapters
                    .Where(c => c.PublishAt == null || c.PublishAt <= now)
                    .OrderByDescending(c => c.ChapterNumber)
                    .Select(c => (int?)c.ChapterNumber)
                    .FirstOrDefault()))
            .ToListAsync();
    }

    public async Task<StoryDetailDto?> GetDetailAsync(Guid storyId, Guid? currentUserId)
    {
        var story = await _db.Stories
            .Include(s => s.Chapters)
            .Include(s => s.StoryGenres).ThenInclude(sg => sg.Genre)
            .FirstOrDefaultAsync(s => s.Id == storyId);

        if (story is null) return null;

        var accessState = await _access.GetStoryAccessStateAsync(currentUserId, storyId);
        var chapterDtos = story.Chapters
            .Where(c => c.IsPublished || accessState.IsAdmin)
            .OrderBy(c => c.ChapterNumber)
            .Select(c =>
            {
                var canRead = ChapterAccessService.CanReadStoryChapter(story, c.ChapterNumber, accessState);
                return new ChapterListItemDto(c.Id, c.ChapterNumber, c.Title, RequiresAccess: !canRead, c.PartName);
            })
            .ToList();

        return new StoryDetailDto(story.Id, story.Title, story.CoverImageUrl, story.Description,
            story.Author, story.Status, story.AccessPolicy, story.Price, story.FreeChapterCount,
            story.StoryGenres.Select(sg => sg.Genre.Name), chapterDtos, story.Type,
            HasPurchased: accessState.HasPurchased,
            HasActiveVip: accessState.HasActiveSubscription,
            HasFullAccess: accessState.HasFullAccess);
    }

    public async Task<Guid> CreateAsync(CreateStoryDto dto)
    {
        var normalizedPrice = dto.AccessPolicy == AccessPolicy.Free ? null : dto.Price;
        var normalizedFreeCount = dto.AccessPolicy == AccessPolicy.Free ? 0 : Math.Max(0, dto.FreeChapterCount);
        if (dto.AccessPolicy != AccessPolicy.Free && (!normalizedPrice.HasValue || normalizedPrice.Value <= 0))
            throw new InvalidOperationException("Truyện trả phí hoặc hỗn hợp phải có giá lớn hơn 0 VNĐ.");

        var story = new Story
        {
            Title = dto.Title,
            Type = dto.Type,
            CoverImageUrl = dto.CoverImageUrl,
            Description = dto.Description,
            Author = dto.Author,
            AccessPolicy = dto.AccessPolicy,
            Price = normalizedPrice,
            FreeChapterCount = normalizedFreeCount
        };

        if (dto.GenreIds?.Any() == true)
        {
            var validGenreIds = await _db.Genres
                .Where(g => dto.GenreIds.Contains(g.Id))
                .Select(g => g.Id)
                .ToListAsync();

            foreach (var genreId in validGenreIds)
                story.StoryGenres.Add(new StoryGenre { GenreId = genreId });
        }

        _db.Stories.Add(story);
        await _db.SaveChangesAsync();
        return story.Id;
    }

    public async Task UpdateAsync(Guid storyId, UpdateStoryDto dto)
    {
        var story = await _db.Stories
            .Include(s => s.StoryGenres)
            .FirstOrDefaultAsync(s => s.Id == storyId)
            ?? throw new InvalidOperationException("Không tìm thấy truyện.");

        var normalizedPrice = dto.AccessPolicy == AccessPolicy.Free ? null : dto.Price;
        var normalizedFreeCount = dto.AccessPolicy == AccessPolicy.Free ? 0 : Math.Max(0, dto.FreeChapterCount);
        if (dto.AccessPolicy != AccessPolicy.Free && (!normalizedPrice.HasValue || normalizedPrice.Value <= 0))
            throw new InvalidOperationException("Truyện trả phí hoặc hỗn hợp phải có giá lớn hơn 0 VNĐ.");

        story.Title = dto.Title;
        story.Type = dto.Type;
        story.CoverImageUrl = dto.CoverImageUrl;
        story.Description = dto.Description;
        story.Author = dto.Author;
        story.Status = dto.Status;
        story.AccessPolicy = dto.AccessPolicy;
        story.Price = normalizedPrice;
        story.FreeChapterCount = normalizedFreeCount;
        story.UpdatedAt = DateTime.UtcNow;

        story.StoryGenres.Clear();
        if (dto.GenreIds?.Any() == true)
        {
            var validGenreIds = await _db.Genres
                .Where(g => dto.GenreIds.Contains(g.Id))
                .Select(g => g.Id)
                .ToListAsync();

            foreach (var genreId in validGenreIds)
                story.StoryGenres.Add(new StoryGenre { StoryId = storyId, GenreId = genreId });
        }

        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid storyId)
    {
        var story = await _db.Stories
            .Include(s => s.Chapters)
            .Include(s => s.StoryGenres)
            .Include(s => s.Followers)
            .Include(s => s.Purchases)
            .FirstOrDefaultAsync(s => s.Id == storyId)
            ?? throw new InvalidOperationException("Không tìm thấy truyện.");

        var chapterIds = story.Chapters.Select(c => c.Id).ToList();
        var discussions = await _db.Discussions.Where(d => chapterIds.Contains(d.ChapterId)).ToListAsync();
        _db.Discussions.RemoveRange(discussions);

        var progresses = await _db.ReadingProgresses.Where(p => p.StoryId == storyId).ToListAsync();
        _db.ReadingProgresses.RemoveRange(progresses);

        _db.Chapters.RemoveRange(story.Chapters);
        _db.StoryGenres.RemoveRange(story.StoryGenres);
        _db.StoryFollows.RemoveRange(story.Followers);
        _db.Purchases.RemoveRange(story.Purchases);

        _db.Stories.Remove(story);
        await _db.SaveChangesAsync();
    }

    private static bool IsAlreadyImageUrlList(string content)
    {
        if (string.IsNullOrWhiteSpace(content)) return false;
        var lines = content.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
        return lines.Length > 0 && lines.All(line =>
            line.Trim().StartsWith("/uploads/", StringComparison.OrdinalIgnoreCase) ||
            line.Trim().StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
            line.Trim().StartsWith("https://", StringComparison.OrdinalIgnoreCase));
    }

    public async Task AddChapterAsync(Guid storyId, CreateChapterDto dto)
    {
        var story = await _db.Stories.FindAsync(storyId)
            ?? throw new InvalidOperationException("Không tìm thấy truyện.");

        var chapterId = Guid.NewGuid();
        var content = dto.Content;

        if (story.Type != StoryType.Comic && dto.RenderAsImages && !string.IsNullOrWhiteSpace(dto.Content) && !IsAlreadyImageUrlList(dto.Content))
        {
            var imageUrls = await _textToImageService.RenderTextToImagesAsync(dto.Content, chapterId);
            if (imageUrls.Count > 0)
            {
                content = string.Join("\n", imageUrls);
            }
        }

        var publishAtUtc = ChapterPublicationHelper.NormalizeUtc(dto.PublishAt);
        var isPublishedNow = publishAtUtc is null || publishAtUtc <= DateTime.UtcNow;

        var chapter = new Chapter
        {
            Id = chapterId,
            StoryId = storyId,
            ChapterNumber = dto.ChapterNumber,
            Title = dto.Title,
            Content = content,
            PartName = dto.PartName,
            PublishAt = publishAtUtc
        };
        _db.Chapters.Add(chapter);
        if (isPublishedNow)
        {
            story.UpdatedAt = DateTime.UtcNow;
        }
        await _db.SaveChangesAsync();

        // Kích hoạt thông báo cho các độc giả đang theo dõi truyện này (chỉ gửi khi chương đã xuất bản)
        var followerUserIds = isPublishedNow
            ? await _db.StoryFollows
                .Where(f => f.StoryId == storyId)
                .Select(f => f.UserId)
                .ToListAsync()
            : new List<Guid>();

        if (followerUserIds.Count > 0)
        {
            var notifications = followerUserIds.Select(uid => new Notification
            {
                UserId = uid,
                Title = $"Chương mới: {story.Title}",
                Message = $"Chương {dto.ChapterNumber}: {dto.Title} vừa được công bố!",
                LinkUrl = $"/chapters/{chapter.Id}",
                CreatedAt = DateTime.UtcNow
            });
            _db.Notifications.AddRange(notifications);
            await _db.SaveChangesAsync();
        }
    }

    public async Task UpdateChapterAsync(Guid storyId, Guid chapterId, UpdateChapterDto dto)
    {
        var chapter = await _db.Chapters.FirstOrDefaultAsync(c => c.Id == chapterId && c.StoryId == storyId)
            ?? throw new InvalidOperationException("Không tìm thấy chương truyện.");

        var story = await _db.Stories.FindAsync(storyId);

        var content = dto.Content;
        if (story?.Type != StoryType.Comic && dto.RenderAsImages && !string.IsNullOrWhiteSpace(dto.Content) && !IsAlreadyImageUrlList(dto.Content))
        {
            var imageUrls = await _textToImageService.RenderTextToImagesAsync(dto.Content, chapterId);
            if (imageUrls.Count > 0)
            {
                content = string.Join("\n", imageUrls);
            }
        }

        chapter.PartName = dto.PartName;
        chapter.ChapterNumber = dto.ChapterNumber;
        chapter.Title = dto.Title;
        chapter.Content = content;
        chapter.PublishAt = ChapterPublicationHelper.NormalizeUtc(dto.PublishAt);
        chapter.UpdatedAt = DateTime.UtcNow;

        if (story != null) story.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
    }

    public async Task DeleteChapterAsync(Guid storyId, Guid chapterId)
    {
        var chapter = await _db.Chapters.FirstOrDefaultAsync(c => c.Id == chapterId && c.StoryId == storyId)
            ?? throw new InvalidOperationException("Không tìm thấy chương truyện.");

        var discussions = await _db.Discussions.Where(d => d.ChapterId == chapterId).ToListAsync();
        _db.Discussions.RemoveRange(discussions);

        var progresses = await _db.ReadingProgresses.Where(p => p.LastChapterId == chapterId).ToListAsync();
        foreach (var p in progresses)
        {
            var fallback = await _db.Chapters
                .Where(c => c.StoryId == storyId && c.Id != chapterId)
                .OrderByDescending(c => c.ChapterNumber)
                .FirstOrDefaultAsync();
            if (fallback != null)
                p.LastChapterId = fallback.Id;
            else
                _db.ReadingProgresses.Remove(p);
        }

        _db.Chapters.Remove(chapter);
        await _db.SaveChangesAsync();
    }

    public async Task<bool> ToggleFollowAsync(Guid userId, Guid storyId)
    {
        var existing = await _db.StoryFollows
            .FirstOrDefaultAsync(f => f.UserId == userId && f.StoryId == storyId);

        if (existing is not null)
        {
            _db.StoryFollows.Remove(existing);
            await _db.SaveChangesAsync();
            return false;
        }

        _db.StoryFollows.Add(new StoryFollow
        {
            UserId = userId,
            StoryId = storyId,
            FollowedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> IsFollowingAsync(Guid userId, Guid storyId)
    {
        return await _db.StoryFollows
            .AnyAsync(f => f.UserId == userId && f.StoryId == storyId);
    }
}