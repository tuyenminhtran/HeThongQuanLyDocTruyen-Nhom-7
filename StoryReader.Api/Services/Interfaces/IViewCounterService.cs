namespace StoryReader.Api.Services.Interfaces;

/// <summary>Ghi nhận lượt xem chống spam (dedupe) và gom cập nhật batch vào CSDL.</summary>
public interface IViewCounterService
{
    Task<bool> RecordChapterViewAsync(Guid chapterId, Guid storyId, string viewerKey, CancellationToken ct = default);
    Task FlushPendingViewsAsync(CancellationToken ct = default);
}
