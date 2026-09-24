namespace StoryReader.Api.Models.Dtos;

public record MemberListItemDto(Guid Id, string Email, string DisplayName, bool IsRestricted, DateTime CreatedAt);
