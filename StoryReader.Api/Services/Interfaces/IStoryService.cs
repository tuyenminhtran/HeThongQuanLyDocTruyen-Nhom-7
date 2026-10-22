using StoryReader.Api.Models.Dtos;

namespace StoryReader.Api.Services.Interfaces;

public interface IStoryService
{
    Task<IEnumerable<StoryListItemDto>> SearchAsync(string? keyword, Guid? genreId, int page, int pageSize);
    Task<StoryDetailDto?> GetDetailAsync(Guid storyId, Guid? currentUserId);
    Task<Guid> CreateAsync(CreateStoryDto dto);
    Task UpdateAsync(Guid storyId, UpdateStoryDto dto);
    Task DeleteAsync(Guid storyId);
    Task AddChapterAsync(Guid storyId, CreateChapterDto dto);
    Task UpdateChapterAsync(Guid storyId, Guid chapterId, UpdateChapterDto dto);
    Task DeleteChapterAsync(Guid storyId, Guid chapterId);
}
