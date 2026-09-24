using Microsoft.AspNetCore.Identity;

namespace StoryReader.Api.Models.Entities;

public class AppUser : IdentityUser<Guid>
{
    public string DisplayName { get; set; } = string.Empty;
    public bool IsRestricted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Purchase> Purchases { get; set; } = new List<Purchase>();
    public ICollection<UserSubscription> Subscriptions { get; set; } = new List<UserSubscription>();
    public ICollection<ReadingProgress> ReadingProgresses { get; set; } = new List<ReadingProgress>();
    public ICollection<Discussion> Discussions { get; set; } = new List<Discussion>();
    public ICollection<StoryFollow> FollowedStories { get; set; } = new List<StoryFollow>();
}
