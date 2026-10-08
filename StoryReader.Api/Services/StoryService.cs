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

    public StoryService(AppDbContext db, IChapterAccessService access)
    {
        _db = db;
        _access = access;
    }

    public async Task<IEnumerable<StoryListItemDto>> SearchAsync(string? keyword, Guid? genreId, int page, int pageSize)
    {
        var query = _db.Stories.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(keyword))
            query = query.Where(s => s.Title.Contains(keyword) || s.Author.Contains(keyword));

        if (genreId is not null)
            query = query.Where(s => s.StoryGenres.Any(g => g.GenreId == genreId));

        return await query
            .OrderByDescending(s => s.UpdatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new StoryListItemDto(s.Id, s.Title, s.CoverImageUrl, s.Author, s.Status, s.AccessPolicy, s.ViewCount))
            .ToListAsync();
    }

    public async Task<StoryDetailDto?> GetDetailAsync(Guid storyId, Guid? currentUserId)
    {
        var story = await _db.Stories
            .Include(s => s.Chapters)
            .Include(s => s.StoryGenres).ThenInclude(sg => sg.Genre)
            .FirstOrDefaultAsync(s => s.Id == storyId);

        if (story is null) return null;

        var chapterDtos = new List<ChapterListItemDto>();
        foreach (var c in story.Chapters.Where(c => c.IsPublished).OrderBy(c => c.ChapterNumber))
        {
            var canRead = await _access.CanReadChapterAsync(currentUserId, c.Id);
            chapterDtos.Add(new ChapterListItemDto(c.Id, c.ChapterNumber, c.Title, RequiresAccess: !canRead));
        }

        return new StoryDetailDto(story.Id, story.Title, story.CoverImageUrl, story.Description,
            story.Author, story.Status, story.AccessPolicy, story.Price, story.FreeChapterCount,
            story.StoryGenres.Select(sg => sg.Genre.Name), chapterDtos);
    }

    public async Task<Guid> CreateAsync(CreateStoryDto dto)
    {
        var story = new Story
        {
            Title = dto.Title,
            CoverImageUrl = dto.CoverImageUrl,
            Description = dto.Description,
            Author = dto.Author,
            AccessPolicy = dto.AccessPolicy,
            Price = dto.Price,
            FreeChapterCount = dto.FreeChapterCount
        };

        foreach (var genreId in dto.GenreIds)
            story.StoryGenres.Add(new StoryGenre { GenreId = genreId });

        _db.Stories.Add(story);
        await _db.SaveChangesAsync();
        return story.Id;
    }

    public async Task AddChapterAsync(Guid storyId, CreateChapterDto dto)
    {
        var story = await _db.Stories.FindAsync(storyId)
            ?? throw new InvalidOperationException("Story not found");

        _db.Chapters.Add(new Chapter
        {
            StoryId = storyId,
            ChapterNumber = dto.ChapterNumber,
            Title = dto.Title,
            Content = dto.Content,
            PublishAt = dto.PublishAt
        });
        story.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }
}
