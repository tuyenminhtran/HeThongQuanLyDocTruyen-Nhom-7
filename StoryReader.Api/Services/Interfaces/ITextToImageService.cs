namespace StoryReader.Api.Services.Interfaces;

public interface ITextToImageService
{
    Task<List<string>> RenderTextToImagesAsync(string text, Guid chapterId);
}
