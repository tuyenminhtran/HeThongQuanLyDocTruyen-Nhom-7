namespace StoryReader.Api.Models.Entities;

public class ReadingProgress
{
    public Guid UserId { get; set; }
    public AppUser User { get; set; } = null!;
    public Guid StoryId { get; set; }
    public Story Story { get; set; } = null!;
    public Guid LastChapterId { get; set; }
    public Chapter LastChapter { get; set; } = null!;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public enum DiscussionStatus { Visible, Hidden, Reported }

public class Discussion
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ChapterId { get; set; }
    public Chapter Chapter { get; set; } = null!;
    public Guid UserId { get; set; }
    public AppUser User { get; set; } = null!;
    public string Content { get; set; } = string.Empty;
    public DiscussionStatus Status { get; set; } = DiscussionStatus.Visible;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
