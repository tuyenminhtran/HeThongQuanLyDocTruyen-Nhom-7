namespace StoryReader.Api.Models.Dtos;

public record UserProfileDto(
    Guid Id,
    string Email,
    string DisplayName,
    string Role,
    bool IsRestricted,
    DateTime CreatedAt,
    string? ActivePlanName,
    DateTime? SubscriptionEndAt
);

public record UpdateProfileDto(string DisplayName);

public record ChangePasswordDto(string CurrentPassword, string NewPassword);
