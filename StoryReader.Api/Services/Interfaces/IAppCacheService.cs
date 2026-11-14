namespace StoryReader.Api.Services.Interfaces;

/// <summary>Lớp cache thống nhất dùng Redis (IDistributedCache) khi khả dụng và tự động fallback sang IMemoryCache.</summary>
public interface IAppCacheService
{
    bool IsDistributedConfigured { get; }
    bool IsDistributedHealthy { get; }

    Task<byte[]?> GetBytesAsync(string key, CancellationToken ct = default);
    Task SetBytesAsync(string key, byte[] value, TimeSpan ttl, CancellationToken ct = default);

    Task<string?> GetStringAsync(string key, CancellationToken ct = default);
    Task SetStringAsync(string key, string value, TimeSpan ttl, CancellationToken ct = default);

    Task RemoveAsync(string key, CancellationToken ct = default);
}
