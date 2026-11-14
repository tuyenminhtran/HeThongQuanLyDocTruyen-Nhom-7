using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using StoryReader.Api.Services.Interfaces;

namespace StoryReader.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
[EnableRateLimiting("tts")]
public class TtsController : ControllerBase
{
    private static readonly HttpClient _httpClient = new(new HttpClientHandler
    {
        AutomaticDecompression = System.Net.DecompressionMethods.All
    })
    {
        Timeout = TimeSpan.FromSeconds(15)
    };

    private readonly IAppCacheService _cache;

    static TtsController()
    {
        _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    }

    public TtsController(IAppCacheService cache)
    {
        _cache = cache;
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
            text = text[..250];
        }

        var safeLang = string.IsNullOrWhiteSpace(lang) ? "vi" : lang.Trim();
        var cacheKey = $"tts:{safeLang}:{text}";

        Response.Headers.CacheControl = "public, max-age=86400";

        var cachedBytes = await _cache.GetBytesAsync(cacheKey, HttpContext.RequestAborted);
        if (cachedBytes is { Length: > 0 })
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
                using var response = await _httpClient.GetAsync(url, HttpContext.RequestAborted);

                if (response.IsSuccessStatusCode)
                {
                    var bytes = await response.Content.ReadAsByteArrayAsync(HttpContext.RequestAborted);
                    if (bytes.Length > 0)
                    {
                        await _cache.SetBytesAsync(cacheKey, bytes, TimeSpan.FromHours(6), HttpContext.RequestAborted);
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
