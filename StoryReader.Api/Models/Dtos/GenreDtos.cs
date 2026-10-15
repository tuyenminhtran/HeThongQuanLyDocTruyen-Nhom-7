namespace StoryReader.Api.Models.Dtos;

public record GenreDto(Guid Id, string Name, string Slug, int StoryCount);

public record CreateGenreDto(string Name);

public record UpdateGenreDto(string Name);
