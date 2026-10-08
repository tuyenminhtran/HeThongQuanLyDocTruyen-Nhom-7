namespace StoryReader.Api.Models.Entities;

public enum ReleaseStatus { Ongoing, Completed }

public enum AccessPolicy { Free, Paid, Mixed }

public class Story
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string CoverImageUrl { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public ReleaseStatus Status { get; set; } = ReleaseStatus.Ongoing;
    public AccessPolicy AccessPolicy { get; set; } = AccessPolicy.Free;

    /// <summary>Price to purchase this story outright (only relevant when AccessPolicy != Free).</summary>
    public decimal? Price { get; set; }

    /// <summary>Number of leading chapters (by ChapterNumber) readable for free even if the story is Paid/Mixed.</summary>
    public int FreeChapterCount { get; set; } = 0;

    public int ViewCount { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Chapter> Chapters { get; set; } = new List<Chapter>();
    public ICollection<StoryGenre> StoryGenres { get; set; } = new List<StoryGenre>();
    public ICollection<Purchase> Purchases { get; set; } = new List<Purchase>();
    public ICollection<StoryFollow> Followers { get; set; } = new List<StoryFollow>();
}

public class Genre
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;

    public ICollection<StoryGenre> StoryGenres { get; set; } = new List<StoryGenre>();
}

/// <summary>Many-to-many join between Story and Genre.</summary>
public class StoryGenre
{
    public Guid StoryId { get; set; }
    public Story Story { get; set; } = null!;
    public Guid GenreId { get; set; }
    public Genre Genre { get; set; } = null!;
}

public class Chapter
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid StoryId { get; set; }
    public Story Story { get; set; } = null!;

    public int ChapterNumber { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;

    /// <summary>Chapter is invisible to readers until this time (staged/scheduled release).</summary>
    public DateTime? PublishAt { get; set; }
    public bool IsPublished => PublishAt == null || PublishAt <= DateTime.UtcNow;

    public int ViewCount { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Discussion> Discussions { get; set; } = new List<Discussion>();
}

public class StoryFollow
{
    public Guid UserId { get; set; }
    public AppUser User { get; set; } = null!;
    public Guid StoryId { get; set; }
    public Story Story { get; set; } = null!;
    public DateTime FollowedAt { get; set; } = DateTime.UtcNow;
}
