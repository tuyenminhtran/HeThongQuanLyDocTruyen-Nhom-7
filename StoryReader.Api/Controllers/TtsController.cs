using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
        Timeout = TimeSpan.FromSeconds(10)
    };

    static TtsController()
    {
        _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    }

    [HttpGet]
    [ResponseCache(Duration = 86400, Location = ResponseCacheLocation.Any)]
    public async Task<IActionResult> GetAudio([FromQuery] string text, [FromQuery] string lang = "vi")
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return BadRequest(new { message = "Text is required" });
        }

        if (text.Length > 250)
        {
            text = text.Substring(0, 250);
        }

        try
        {
            var url = $"https://translate.google.com/translate_tts?ie=UTF-8&tl={lang}&client=tw-ob&q={Uri.EscapeDataString(text)}";
            var response = await _httpClient.GetAsync(url, HttpCompletionOption.ResponseHeadersRead);
            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, new { message = "TTS service unavailable" });
            }

            var stream = await response.Content.ReadAsStreamAsync();
            return File(stream, "audio/mpeg", enableRangeProcessing: true);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"TTS error: {ex.Message}" });
        }
    }
}
