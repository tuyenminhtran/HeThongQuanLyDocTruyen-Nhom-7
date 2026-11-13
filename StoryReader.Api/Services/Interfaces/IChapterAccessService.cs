namespace StoryReader.Api.Services.Interfaces;

public record StoryAccessState(bool HasPurchased, bool HasActiveSubscription, bool IsAdmin, bool IsRestricted)
{
    public bool HasFullAccess => !IsRestricted && (IsAdmin || HasPurchased || HasActiveSubscription);
}

public interface IChapterAccessService
{
    /// <summary>
    /// Lấy toàn bộ trạng thái quyền đọc của user đối với một truyện trong 1 lượt kiểm tra.
    /// </summary>
    Task<StoryAccessState> GetStoryAccessStateAsync(Guid? userId, Guid storyId);

    /// <summary>
    /// Quyết định một user (có thể null nếu chưa đăng nhập) có được đọc một chương hay không.
    /// Thứ tự kiểm tra: truyện Free -> chương nằm trong FreeChapterCount -> Admin / đã mua truyện / có gói tháng còn hiệu lực.
    /// </summary>
    Task<bool> CanReadChapterAsync(Guid? userId, Guid chapterId);
}
