using System.ComponentModel.DataAnnotations;
using StoryReader.Api.Models.Entities;

namespace StoryReader.Api.Models.Dtos;

public record StoryListItemDto(Guid Id, string Title, string CoverImageUrl, string Author,
    ReleaseStatus Status, AccessPolicy AccessPolicy, int ViewCount, StoryType Type = StoryType.Novel,
    int TotalChapters = 0, int? LatestChapterNumber = null);

public record StoryDetailDto(Guid Id, string Title, string CoverImageUrl, string Description,
    string Author, ReleaseStatus Status, AccessPolicy AccessPolicy, decimal? Price,
    int FreeChapterCount, IEnumerable<string> Genres, IEnumerable<ChapterListItemDto> Chapters,
    StoryType Type = StoryType.Novel,
    bool HasPurchased = false, bool HasActiveVip = false, bool HasFullAccess = false);

public record ChapterListItemDto(Guid Id, int ChapterNumber, string Title, bool RequiresAccess, string? PartName = null);

public record ChapterContentDto(Guid Id, int ChapterNumber, string Title, string Content,
    StoryType StoryType = StoryType.Novel, List<string>? ImageUrls = null, string? PartName = null);

public record CreateStoryDto(
    [Required(ErrorMessage = "Tiêu đề truyện không được để trống")]
    [MaxLength(250, ErrorMessage = "Tiêu đề truyện tối đa 250 ký tự")]
    string Title,

    [Required(ErrorMessage = "Ảnh bìa truyện không được để trống")]
    [MaxLength(1000)]
    string CoverImageUrl,

    [MaxLength(5000, ErrorMessage = "Mô tả truyện tối đa 5000 ký tự")]
    string Description,

    [Required(ErrorMessage = "Tên tác giả không được để trống")]
    [MaxLength(150, ErrorMessage = "Tên tác giả tối đa 150 ký tự")]
    string Author,

    AccessPolicy AccessPolicy,

    [Range(0, 50000000, ErrorMessage = "Giá truyện phải từ 0 đến 50.000.000 VNĐ")]
    decimal? Price,

    [Range(0, 10000, ErrorMessage = "Số chương miễn phí phải từ 0 đến 10.000")]
    int FreeChapterCount,

    List<Guid> GenreIds,
    StoryType Type = StoryType.Novel) : IValidatableObject
{
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        => StoryValidationHelper.ValidateAccessPricing(AccessPolicy, Price);
}

public record UpdateStoryDto(
    [Required(ErrorMessage = "Tiêu đề truyện không được để trống")]
    [MaxLength(250, ErrorMessage = "Tiêu đề truyện tối đa 250 ký tự")]
    string Title,

    [Required(ErrorMessage = "Ảnh bìa truyện không được để trống")]
    [MaxLength(1000)]
    string CoverImageUrl,

    [MaxLength(5000, ErrorMessage = "Mô tả truyện tối đa 5000 ký tự")]
    string Description,

    [Required(ErrorMessage = "Tên tác giả không được để trống")]
    [MaxLength(150, ErrorMessage = "Tên tác giả tối đa 150 ký tự")]
    string Author,

    ReleaseStatus Status,
    AccessPolicy AccessPolicy,

    [Range(0, 50000000, ErrorMessage = "Giá truyện phải từ 0 đến 50.000.000 VNĐ")]
    decimal? Price,

    [Range(0, 10000, ErrorMessage = "Số chương miễn phí phải từ 0 đến 10.000")]
    int FreeChapterCount,

    List<Guid> GenreIds,
    StoryType Type = StoryType.Novel) : IValidatableObject
{
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        => StoryValidationHelper.ValidateAccessPricing(AccessPolicy, Price);
}

internal static class StoryValidationHelper
{
    public static IEnumerable<ValidationResult> ValidateAccessPricing(AccessPolicy accessPolicy, decimal? price)
    {
        if (accessPolicy != AccessPolicy.Free && (!price.HasValue || price.Value <= 0))
        {
            yield return new ValidationResult(
                "Truyện trả phí hoặc hỗn hợp phải có giá lớn hơn 0 VNĐ.",
                new[] { nameof(CreateStoryDto.Price) });
        }
    }
}

public record CreateChapterDto(
    [Range(1, 100000, ErrorMessage = "Số thứ tự chương phải từ 1 đến 100.000")]
    int ChapterNumber,

    [Required(ErrorMessage = "Tiêu đề chương không được để trống")]
    [MaxLength(250, ErrorMessage = "Tiêu đề chương tối đa 250 ký tự")]
    string Title,

    [Required(ErrorMessage = "Nội dung chương không được để trống")]
    [MaxLength(500000, ErrorMessage = "Nội dung chương tối đa 500.000 ký tự")]
    string Content,

    DateTime? PublishAt,
    bool RenderAsImages = true,

    [MaxLength(100, ErrorMessage = "Tên tập/hồi tối đa 100 ký tự")]
    string? PartName = null);

public record UpdateChapterDto(
    [Range(1, 100000, ErrorMessage = "Số thứ tự chương phải từ 1 đến 100.000")]
    int ChapterNumber,

    [Required(ErrorMessage = "Tiêu đề chương không được để trống")]
    [MaxLength(250, ErrorMessage = "Tiêu đề chương tối đa 250 ký tự")]
    string Title,

    [Required(ErrorMessage = "Nội dung chương không được để trống")]
    [MaxLength(500000, ErrorMessage = "Nội dung chương tối đa 500.000 ký tự")]
    string Content,

    DateTime? PublishAt,
    bool RenderAsImages = true,

    [MaxLength(100, ErrorMessage = "Tên tập/hồi tối đa 100 ký tự")]
    string? PartName = null);
