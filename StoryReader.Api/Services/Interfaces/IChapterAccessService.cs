namespace StoryReader.Api.Services.Interfaces;

public interface IChapterAccessService
{
    /// <summary>
    /// Quyết định một user (có thể null nếu chưa đăng nhập) có được đọc một chương hay không.
    /// Thứ tự kiểm tra: truyện Free -> chương nằm trong FreeChapterCount -> đã mua truyện -> có gói tháng còn hiệu lực.
    /// </summary>
    Task<bool> CanReadChapterAsync(Guid? userId, Guid chapterId);
}
