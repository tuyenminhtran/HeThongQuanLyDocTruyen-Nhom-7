using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace StoryReader.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class TtsController : ControllerBase
{
    private static readonly HttpClient _httpClient = new(new HttpClientHandler
    {
        AutomaticDecompression = System.Net.DecompressionMethods.All
    })
    {
        Timeout = TimeSpan.FromSeconds(15)
    };

    // Cache âm thanh TTS trong RAM (tối đa 500 câu) để tránh gọi trùng lên Google và hỗ trợ tua/Range mượt mà
    private static readonly MemoryCache _audioCache = new(new MemoryCacheOptions
    {
        SizeLimit = 500
    });

    static TtsController()
    {
        _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    }

    [HttpGet]
    [HttpHead]
    public async Task<IActionResult> GetAudio([FromQuery] string text, [FromQuery] string lang = "vi")
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return BadRequest(new { message = "Text is required" });
        }

        text = text.Trim();
        if (text.Length > 250)
        {
            text = text.Substring(0, 250);
        }

        var safeLang = string.IsNullOrWhiteSpace(lang) ? "vi" : lang.Trim();
        var cacheKey = $"{safeLang}:{text}";

        Response.Headers.CacheControl = "public, max-age=86400";

        if (_audioCache.TryGetValue(cacheKey, out byte[]? cachedBytes) && cachedBytes is { Length: > 0 })
        {
            return File(cachedBytes, "audio/mpeg", enableRangeProcessing: true);
        }

        try
        {
            var encodedText = Uri.EscapeDataString(text);
            var encodedLang = Uri.EscapeDataString(safeLang);
            var clients = new[] { "tw-ob", "gtx" };

            HttpStatusCodeInfo lastError = new(503, "TTS service unavailable");

            foreach (var client in clients)
            {
                var url = $"https://translate.google.com/translate_tts?ie=UTF-8&tl={encodedLang}&client={client}&q={encodedText}";
                using var response = await _httpClient.GetAsync(url);

                if (response.IsSuccessStatusCode)
                {
                    var bytes = await response.Content.ReadAsByteArrayAsync();
                    if (bytes.Length > 0)
                    {
                        _audioCache.Set(cacheKey, bytes, new MemoryCacheEntryOptions
                        {
                            Size = 1,
                            SlidingExpiration = TimeSpan.FromHours(6)
                        });
                        return File(bytes, "audio/mpeg", enableRangeProcessing: true);
                    }
                }

                lastError = new((int)response.StatusCode, $"TTS upstream returned {(int)response.StatusCode}");
            }

            return StatusCode(lastError.StatusCode, new { message = lastError.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"TTS error: {ex.Message}" });
        }
    }

    private sealed record HttpStatusCodeInfo(int StatusCode, string Message);
}
