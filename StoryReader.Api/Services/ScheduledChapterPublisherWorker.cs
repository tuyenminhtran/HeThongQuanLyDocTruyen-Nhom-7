using Microsoft.EntityFrameworkCore;
using StoryReader.Api.Data;

namespace StoryReader.Api.Services;

/// <summary>
/// Worker chạy nền định kỳ kiểm tra các chương hẹn giờ đã đến thời điểm xuất bản (PublishAt <= UTC Now)
/// để cập nhật thời gian mới của truyện và gửi thông báo tới độc giả theo dõi.
/// </summary>
public class ScheduledChapterPublisherWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ScheduledChapterPublisherWorker> _logger;
    private readonly TimeSpan _interval = TimeSpan.FromMinutes(1);

    public ScheduledChapterPublisherWorker(
        IServiceScopeFactory scopeFactory,
        ILogger<ScheduledChapterPublisherWorker> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            await ProcessDueChaptersAsync(stoppingToken);
        }
        catch (OperationCanceledException)
        {
            return;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi kiểm tra xuất bản chương hẹn giờ lúc khởi động.");
        }

        using var timer = new PeriodicTimer(_interval);
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                await ProcessDueChaptersAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi trong vòng lặp tự động xuất bản chương hẹn giờ.");
            }
        }
    }

    public async Task<int> ProcessDueChaptersAsync(CancellationToken ct = default)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var now = DateTime.UtcNow;

        var dueChapters = await db.Chapters
            .Include(c => c.Story)
            .Where(c => c.PublishAt != null && c.PublishAt <= now && c.UpdatedAt < c.PublishAt)
            .ToListAsync(ct);

        if (dueChapters.Count == 0)
            return 0;

        foreach (var chapter in dueChapters)
        {
            chapter.UpdatedAt = now;
            if (chapter.Story.UpdatedAt < now)
            {
                chapter.Story.UpdatedAt = now;
            }
        }

        await db.SaveChangesAsync(ct);

        foreach (var chapter in dueChapters)
        {
            await ChapterPublicationHelper.NotifyFollowersAsync(db, chapter.Story, chapter, ct);
        }

        _logger.LogInformation("Đã tự động xuất bản và đồng bộ thông báo cho {Count} chương hẹn giờ.", dueChapters.Count);
        return dueChapters.Count;
    }
}
