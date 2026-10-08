namespace StoryReader.Api.Models.Dtos;

public record MemberListItemDto(Guid Id, string Email, string DisplayName, string Role, bool IsRestricted, DateTime CreatedAt);
