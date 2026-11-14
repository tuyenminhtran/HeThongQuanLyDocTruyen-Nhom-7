using System.Collections.Concurrent;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using StoryReader.Api.Data;
using StoryReader.Api.Services.Interfaces;

namespace StoryReader.Api.Services;

/// <summary>
/// Chống bot cày ViewCount và giảm tải ghi PostgreSQL (VULN-04):
/// mỗi viewerKey chỉ được tính 1 lượt xem/chương trong 2 phút, các lượt hợp lệ được gom lại để flush theo batch.
/// </summary>
public sealed class ChapterViewBufferService : IViewCounterService
{
    private static readonly TimeSpan DedupeWindow = TimeSpan.FromMinutes(2);

    private readonly IAppCacheService _cache;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ChapterViewBufferService> _logger;
    private readonly SemaphoreSlim _flushLock = new(1, 1);

    private readonly ConcurrentDictionary<Guid, int> _pendingChapterViews = new();
    private readonly ConcurrentDictionary<Guid, int> _pendingStoryViews = new();

    public ChapterViewBufferService(
        IAppCacheService cache,
        IServiceScopeFactory scopeFactory,
        ILogger<ChapterViewBufferService> logger)
    {
        _cache = cache;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    public async Task<bool> RecordChapterViewAsync(
        Guid chapterId,
        Guid storyId,
        string viewerKey,
        CancellationToken ct = default)
    {
        var safeViewer = string.IsNullOrWhiteSpace(viewerKey) ? "anonymous" : viewerKey.Trim();
        var dedupeKey = $"view-dedupe:{chapterId}:{safeViewer}";

        var alreadyCounted = await _cache.GetStringAsync(dedupeKey, ct);
        if (alreadyCounted is not null)
        {
            return false;
        }

        await _cache.SetStringAsync(dedupeKey, "1", DedupeWindow, ct);
        _pendingChapterViews.AddOrUpdate(chapterId, 1, (_, existing) => existing + 1);
        _pendingStoryViews.AddOrUpdate(storyId, 1, (_, existing) => existing + 1);
        return true;
    }

    public async Task FlushPendingViewsAsync(CancellationToken ct = default)
    {
        if (_pendingChapterViews.IsEmpty && _pendingStoryViews.IsEmpty)
            return;

        await _flushLock.WaitAsync(ct);
        try
        {
            var chapterDeltas = DrainCounts(_pendingChapterViews);
            var storyDeltas = DrainCounts(_pendingStoryViews);

            if (chapterDeltas.Count == 0 && storyDeltas.Count == 0)
                return;

            try
            {
                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                if (chapterDeltas.Count > 0)
                {
                    var chapterIds = chapterDeltas.Keys.ToList();
                    var chapters = await db.Chapters
                        .Where(c => chapterIds.Contains(c.Id))
                        .ToListAsync(ct);

                    foreach (var chapter in chapters)
                    {
                        if (chapterDeltas.TryGetValue(chapter.Id, out var delta) && delta > 0)
                        {
                            chapter.ViewCount += delta;
                        }
                    }
                }

                if (storyDeltas.Count > 0)
                {
                    var storyIds = storyDeltas.Keys.ToList();
                    var stories = await db.Stories
                        .Where(s => storyIds.Contains(s.Id))
                        .ToListAsync(ct);

                    foreach (var story in stories)
                    {
                        if (storyDeltas.TryGetValue(story.Id, out var delta) && delta > 0)
                        {
                            story.ViewCount += delta;
                        }
                    }
                }

                await db.SaveChangesAsync(ct);
            }
            catch (Exception ex)
            {
                // Khôi phục lại số đếm vào buffer nếu lưu DB lỗi để không mất dữ liệu lượt xem
                RequeueCounts(_pendingChapterViews, chapterDeltas);
                RequeueCounts(_pendingStoryViews, storyDeltas);
                _logger.LogWarning(ex, "Lỗi khi flush batch lượt xem vào CSDL.");
                throw;
            }
        }
        finally
        {
            _flushLock.Release();
        }
    }

    private static Dictionary<Guid, int> DrainCounts(ConcurrentDictionary<Guid, int> source)
    {
        var result = new Dictionary<Guid, int>();
        foreach (var key in source.Keys)
        {
            if (source.TryRemove(key, out var count) && count > 0)
            {
                result[key] = count;
            }
        }
        return result;
    }

    private static void RequeueCounts(ConcurrentDictionary<Guid, int> target, Dictionary<Guid, int> deltas)
    {
        foreach (var (id, delta) in deltas)
        {
            if (delta > 0)
            {
                target.AddOrUpdate(id, delta, (_, existing) => existing + delta);
            }
        }
    }
}
