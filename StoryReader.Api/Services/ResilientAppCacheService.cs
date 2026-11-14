using System.Text;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using StoryReader.Api.Services.Interfaces;

namespace StoryReader.Api.Services;

/// <summary>
/// Quản lý cache phân tán (Redis) kèm cơ chế tự ngắt mạch tạm thời và fallback về IMemoryCache
/// để hệ thống không bị gián đoạn ngay cả khi container Redis chưa khởi động.
/// </summary>
public sealed class ResilientAppCacheService : IAppCacheService
{
    private readonly IMemoryCache _memoryCache;
    private readonly IDistributedCache? _distributedCache;
    private readonly ILogger<ResilientAppCacheService> _logger;
    private long _circuitOpenUntilUtcTicks;

    private static readonly TimeSpan RedisOperationTimeout = TimeSpan.FromMilliseconds(1200);
    private static readonly TimeSpan CircuitCooldown = TimeSpan.FromSeconds(15);

    public ResilientAppCacheService(
        IMemoryCache memoryCache,
        ILogger<ResilientAppCacheService> logger,
        IDistributedCache? distributedCache = null)
    {
        _memoryCache = memoryCache;
        _logger = logger;
        _distributedCache = distributedCache;
    }

    public bool IsDistributedConfigured => _distributedCache is not null;

    public bool IsDistributedHealthy =>
        _distributedCache is not null &&
        DateTime.UtcNow.Ticks >= Interlocked.Read(ref _circuitOpenUntilUtcTicks);

    public async Task<byte[]?> GetBytesAsync(string key, CancellationToken ct = default)
    {
        if (IsDistributedHealthy)
        {
            try
            {
                using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
                cts.CancelAfter(RedisOperationTimeout);
                var data = await _distributedCache!.GetAsync(key, cts.Token);
                if (data is not null)
                    return data;
            }
            catch (Exception ex) when (ex is not OperationCanceledException || !ct.IsCancellationRequested)
            {
                TripCircuit(ex);
            }
        }

        return _memoryCache.TryGetValue<byte[]>(MemoryKey(key), out var localBytes)
            ? localBytes
            : null;
    }

    public async Task SetBytesAsync(string key, byte[] value, TimeSpan ttl, CancellationToken ct = default)
    {
        if (ttl <= TimeSpan.Zero) return;

        _memoryCache.Set(MemoryKey(key), value, ttl);

        if (IsDistributedHealthy)
        {
            try
            {
                using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
                cts.CancelAfter(RedisOperationTimeout);
                await _distributedCache!.SetAsync(
                    key,
                    value,
                    new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = ttl },
                    cts.Token);
            }
            catch (Exception ex) when (ex is not OperationCanceledException || !ct.IsCancellationRequested)
            {
                TripCircuit(ex);
            }
        }
    }

    public async Task<string?> GetStringAsync(string key, CancellationToken ct = default)
    {
        var bytes = await GetBytesAsync(key, ct);
        return bytes is null ? null : Encoding.UTF8.GetString(bytes);
    }

    public Task SetStringAsync(string key, string value, TimeSpan ttl, CancellationToken ct = default)
        => SetBytesAsync(key, Encoding.UTF8.GetBytes(value), ttl, ct);

    public async Task RemoveAsync(string key, CancellationToken ct = default)
    {
        _memoryCache.Remove(MemoryKey(key));

        if (IsDistributedHealthy)
        {
            try
            {
                using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
                cts.CancelAfter(RedisOperationTimeout);
                await _distributedCache!.RemoveAsync(key, cts.Token);
            }
            catch (Exception ex) when (ex is not OperationCanceledException || !ct.IsCancellationRequested)
            {
                TripCircuit(ex);
            }
        }
    }

    private void TripCircuit(Exception ex)
    {
        var reopenAt = DateTime.UtcNow.Add(CircuitCooldown).Ticks;
        Interlocked.Exchange(ref _circuitOpenUntilUtcTicks, reopenAt);
        _logger.LogWarning(ex, "Redis tạm thời không phản hồi, chuyển sang IMemoryCache trong {CooldownSeconds}s.", CircuitCooldown.TotalSeconds);
    }

    private static string MemoryKey(string key) => $"appcache:{key}";
}
