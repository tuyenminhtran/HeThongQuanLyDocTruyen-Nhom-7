using StoryReader.Api.Models.Entities;

namespace StoryReader.Api.Models.Dtos;

public record StoryListItemDto(Guid Id, string Title, string CoverImageUrl, string Author,
    ReleaseStatus Status, AccessPolicy AccessPolicy, int ViewCount);

public record StoryDetailDto(Guid Id, string Title, string CoverImageUrl, string Description,
    string Author, ReleaseStatus Status, AccessPolicy AccessPolicy, decimal? Price,
    int FreeChapterCount, IEnumerable<string> Genres, IEnumerable<ChapterListItemDto> Chapters);

public record ChapterListItemDto(Guid Id, int ChapterNumber, string Title, bool RequiresAccess);

public record ChapterContentDto(Guid Id, int ChapterNumber, string Title, string Content);

public record CreateStoryDto(string Title, string CoverImageUrl, string Description, string Author,
    AccessPolicy AccessPolicy, decimal? Price, int FreeChapterCount, List<Guid> GenreIds);

public record CreateChapterDto(int ChapterNumber, string Title, string Content, DateTime? PublishAt);
