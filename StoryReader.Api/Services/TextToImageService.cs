using SkiaSharp;
using StoryReader.Api.Services.Interfaces;

namespace StoryReader.Api.Services;

public class TextToImageService : ITextToImageService
{
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<TextToImageService> _logger;

    public TextToImageService(IWebHostEnvironment env, ILogger<TextToImageService> logger)
    {
        _env = env;
        _logger = logger;
    }

    public async Task<List<string>> RenderTextToImagesAsync(string text, Guid chapterId)
    {
        var resultUrls = new List<string>();

        if (string.IsNullOrWhiteSpace(text))
            return resultUrls;

        var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var chapterFolder = Path.Combine(webRoot, "uploads", "chapters", chapterId.ToString());

        if (Directory.Exists(chapterFolder))
        {
            try
            {
                Directory.Delete(chapterFolder, true);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Không thể xóa thư mục chương cũ: {Folder}", chapterFolder);
            }
        }

        Directory.CreateDirectory(chapterFolder);

        const int canvasWidth = 900;
        const int canvasHeight = 1400;
        const float paddingX = 60f;
        const float paddingTop = 80f;
        const float paddingBottom = 70f;
        const float maxTextWidth = canvasWidth - (paddingX * 2);

        const float fontSize = 21f;
        const float lineHeight = 36f;
        const float paragraphSpacing = 16f;

        // Font chữ tiếng Việt thân thiện
        var typeface = SKTypeface.FromFamilyName("Segoe UI", SKFontStyle.Normal)
                       ?? SKTypeface.FromFamilyName("Arial", SKFontStyle.Normal)
                       ?? SKTypeface.Default;

        using var textPaint = new SKPaint
        {
            Color = new SKColor(226, 232, 240), // #e2e8f0 (chữ sáng dịu)
            IsAntialias = true,
            TextSize = fontSize,
            Typeface = typeface
        };

        using var footerPaint = new SKPaint
        {
            Color = new SKColor(148, 163, 184, 180), // #94a3b8 mờ
            IsAntialias = true,
            TextSize = 13f,
            Typeface = typeface
        };

        using var watermarkPaint = new SKPaint
        {
            Color = new SKColor(255, 255, 255, 12), // watermark siêu mờ chống screenshot thương mại
            IsAntialias = true,
            TextSize = 32f,
            Typeface = typeface
        };

        // Chuẩn bị các dòng sau khi tự động wrap text
        var rawParagraphs = text.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.None);
        var wrappedLines = new List<string>();

        foreach (var rawPara in rawParagraphs)
        {
            var p = rawPara.Trim();
            if (string.IsNullOrEmpty(p))
            {
                wrappedLines.Add(""); // Dòng trống ngăn cách đoạn
                continue;
            }

            var words = p.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var currentLine = "";

            foreach (var word in words)
            {
                var testLine = string.IsNullOrEmpty(currentLine) ? word : $"{currentLine} {word}";
                var measuredWidth = textPaint.MeasureText(testLine);

                if (measuredWidth > maxTextWidth)
                {
                    if (!string.IsNullOrEmpty(currentLine))
                        wrappedLines.Add(currentLine);
                    currentLine = word;
                }
                else
                {
                    currentLine = testLine;
                }
            }

            if (!string.IsNullOrEmpty(currentLine))
                wrappedLines.Add(currentLine);
        }

        // Chia các dòng vào từng trang
        var pages = new List<List<string>>();
        var currentPage = new List<string>();
        float currentY = paddingTop;
        float usableHeight = canvasHeight - paddingBottom;

        foreach (var line in wrappedLines)
        {
            var addedHeight = string.IsNullOrEmpty(line) ? paragraphSpacing : lineHeight;

            if (currentY + addedHeight > usableHeight && currentPage.Count > 0)
            {
                pages.Add(currentPage);
                currentPage = new List<string>();
                currentY = paddingTop;
            }

            currentPage.Add(line);
            currentY += addedHeight;
        }

        if (currentPage.Count > 0)
        {
            pages.Add(currentPage);
        }

        // Vẽ từng trang và xuất ra file PNG
        var totalPages = pages.Count;
        for (var pageIdx = 0; pageIdx < totalPages; pageIdx++)
        {
            var pageLines = pages[pageIdx];
            var pageNum = pageIdx + 1;

            using var surface = SKSurface.Create(new SKImageInfo(canvasWidth, canvasHeight, SKColorType.Rgba8888, SKAlphaType.Premul));
            var canvas = surface.Canvas;

            // Nền tối sang trọng đồng bộ với theme StoryNest
            canvas.Clear(new SKColor(18, 22, 31)); // #12161f

            // Viền mỏng xung quanh trang sách
            using (var borderPaint = new SKPaint
            {
                Color = new SKColor(42, 50, 66),
                IsStroke = true,
                StrokeWidth = 1.5f
            })
            {
                canvas.DrawRoundRect(10, 10, canvasWidth - 20, canvasHeight - 20, 12, 12, borderPaint);
            }

            // Watermark chìm giữa trang
            canvas.Save();
            canvas.RotateDegrees(-30, canvasWidth / 2f, canvasHeight / 2f);
            var wmText = "STORYNEST • BẢN QUYỀN ĐỌC TRUYỆN";
            var wmWidth = watermarkPaint.MeasureText(wmText);
            canvas.DrawText(wmText, (canvasWidth - wmWidth) / 2f, canvasHeight / 2f, watermarkPaint);
            canvas.Restore();

            // Vẽ nội dung chữ
            float y = paddingTop + fontSize;
            foreach (var line in pageLines)
            {
                if (string.IsNullOrEmpty(line))
                {
                    y += paragraphSpacing;
                    continue;
                }

                canvas.DrawText(line, paddingX, y, textPaint);
                y += lineHeight;
            }

            // Vẽ footer (Số trang và bảo vệ bản quyền)
            var footerText = $"Trang {pageNum} / {totalPages}  •  StoryNest Protected Content";
            var footerWidth = footerPaint.MeasureText(footerText);
            canvas.DrawText(footerText, (canvasWidth - footerWidth) / 2f, canvasHeight - 35f, footerPaint);

            // Lưu ảnh PNG
            var fileName = $"page_{pageNum:D3}.png";
            var filePath = Path.Combine(chapterFolder, fileName);

            using (var image = surface.Snapshot())
            using (var data = image.Encode(SKEncodedImageFormat.Png, 90))
            using (var stream = File.OpenWrite(filePath))
            {
                data.SaveTo(stream);
            }

            var relativeUrl = $"/uploads/chapters/{chapterId}/{fileName}";
            resultUrls.Add(relativeUrl);
        }

        return await Task.FromResult(resultUrls);
    }
}
