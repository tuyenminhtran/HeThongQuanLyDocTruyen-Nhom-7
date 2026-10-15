using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoryReader.Api.Data;
using StoryReader.Api.Models.Dtos;
using StoryReader.Api.Models.Entities;

namespace StoryReader.Api.Controllers;

[ApiController]
[Route("api/genres")]
public class GenresController : ControllerBase
{
    private readonly AppDbContext _db;

    public GenresController(AppDbContext db)
    {
        _db = db;
    }

    private static string ToSlug(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return string.Empty;
        var normalizedString = text.Normalize(NormalizationForm.FormD);
        var stringBuilder = new StringBuilder();

        foreach (var c in normalizedString)
        {
            var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
            if (unicodeCategory != UnicodeCategory.NonSpacingMark)
            {
                stringBuilder.Append(c);
            }
        }

        var clean = stringBuilder.ToString().Normalize(NormalizationForm.FormC).ToLowerInvariant();
        clean = clean.Replace('đ', 'd').Replace('Đ', 'd');
        clean = Regex.Replace(clean, @"[^a-z0-9\s-]", "");
        clean = Regex.Replace(clean, @"\s+", " ").Trim();
        return Regex.Replace(clean, @"\s", "-");
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var genres = await _db.Genres
            .AsNoTracking()
            .OrderBy(g => g.Name)
            .Select(g => new
            {
                g.Id,
                g.Name,
                StoryCount = g.StoryGenres.Count
            })
            .ToListAsync();

        var result = genres.Select(g => new GenreDto(
            g.Id,
            g.Name,
            ToSlug(g.Name),
            g.StoryCount
        )).ToList();

        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateGenreDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { message = "Tên thể loại không được để trống." });

        var trimmed = dto.Name.Trim();
        var exists = await _db.Genres.AnyAsync(g => g.Name.ToLower() == trimmed.ToLower());
        if (exists)
            return BadRequest(new { message = "Thể loại này đã tồn tại." });

        var genre = new Genre
        {
            Name = trimmed
        };

        _db.Genres.Add(genre);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { id = genre.Id }, new GenreDto(
            genre.Id,
            genre.Name,
            ToSlug(genre.Name),
            0
        ));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateGenreDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { message = "Tên thể loại không được để trống." });

        var trimmed = dto.Name.Trim();
        var genre = await _db.Genres.FindAsync(id);
        if (genre == null)
            return NotFound(new { message = "Không tìm thấy thể loại." });

        var duplicate = await _db.Genres.AnyAsync(g => g.Id != id && g.Name.ToLower() == trimmed.ToLower());
        if (duplicate)
            return BadRequest(new { message = "Tên thể loại này đã được sử dụng." });

        genre.Name = trimmed;
        await _db.SaveChangesAsync();

        var storyCount = await _db.StoryGenres.CountAsync(sg => sg.GenreId == id);
        return Ok(new GenreDto(genre.Id, genre.Name, ToSlug(genre.Name), storyCount));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var genre = await _db.Genres.Include(g => g.StoryGenres).FirstOrDefaultAsync(g => g.Id == id);
        if (genre == null)
            return NotFound(new { message = "Không tìm thấy thể loại." });

        _db.StoryGenres.RemoveRange(genre.StoryGenres);
        _db.Genres.Remove(genre);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đã xóa thể loại thành công." });
    }
}
