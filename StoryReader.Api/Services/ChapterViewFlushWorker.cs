using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using StoryReader.Api.Services.Interfaces;

namespace StoryReader.Api.Services;

/// <summary>Worker nền định kỳ mỗi 5 giây đồng bộ lượt xem đã gom trong buffer xuống PostgreSQL.</summary>
public sealed class ChapterViewFlushWorker : BackgroundService
{
    private static readonly TimeSpan FlushInterval = TimeSpan.FromSeconds(5);

    private readonly IViewCounterService _viewCounter;
    private readonly ILogger<ChapterViewFlushWorker> _logger;

    public ChapterViewFlushWorker(IViewCounterService viewCounter, ILogger<ChapterViewFlushWorker> logger)
    {
        _viewCounter = viewCounter;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(FlushInterval);
        while (!stoppingToken.IsCancellationRequested && await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                await _viewCounter.FlushPendingViewsAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "ChapterViewFlushWorker sẽ thử flush lại ở chu kỳ kế tiếp.");
            }
        }
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        try
        {
            await _viewCounter.FlushPendingViewsAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Không thể flush nốt lượt xem khi tắt ứng dụng.");
        }

        await base.StopAsync(cancellationToken);
    }
}
