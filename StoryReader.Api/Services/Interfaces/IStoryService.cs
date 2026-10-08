using StoryReader.Api.Models.Dtos;

namespace StoryReader.Api.Services.Interfaces;

public interface IStoryService
{
    Task<IEnumerable<StoryListItemDto>> SearchAsync(string? keyword, Guid? genreId, int page, int pageSize);
    Task<StoryDetailDto?> GetDetailAsync(Guid storyId, Guid? currentUserId);
    Task<Guid> CreateAsync(CreateStoryDto dto);
    Task AddChapterAsync(Guid storyId, CreateChapterDto dto);
}
