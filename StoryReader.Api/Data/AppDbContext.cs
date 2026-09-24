using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using StoryReader.Api.Models.Entities;

namespace StoryReader.Api.Data;

public class AppDbContext : IdentityDbContext<AppUser, IdentityRole<Guid>, Guid>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Story> Stories => Set<Story>();
    public DbSet<Chapter> Chapters => Set<Chapter>();
    public DbSet<Genre> Genres => Set<Genre>();
    public DbSet<StoryGenre> StoryGenres => Set<StoryGenre>();
    public DbSet<StoryFollow> StoryFollows => Set<StoryFollow>();

    public DbSet<SubscriptionPlan> SubscriptionPlans => Set<SubscriptionPlan>();
    public DbSet<UserSubscription> UserSubscriptions => Set<UserSubscription>();
    public DbSet<Purchase> Purchases => Set<Purchase>();
    public DbSet<Transaction> Transactions => Set<Transaction>();

    public DbSet<ReadingProgress> ReadingProgresses => Set<ReadingProgress>();
    public DbSet<Discussion> Discussions => Set<Discussion>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<StoryGenre>().HasKey(sg => new { sg.StoryId, sg.GenreId });
        builder.Entity<StoryGenre>()
            .HasOne(sg => sg.Story).WithMany(s => s.StoryGenres).HasForeignKey(sg => sg.StoryId);
        builder.Entity<StoryGenre>()
            .HasOne(sg => sg.Genre).WithMany(g => g.StoryGenres).HasForeignKey(sg => sg.GenreId);

        builder.Entity<StoryFollow>().HasKey(f => new { f.UserId, f.StoryId });

        builder.Entity<ReadingProgress>().HasKey(r => new { r.UserId, r.StoryId });

        builder.Entity<Chapter>()
            .HasIndex(c => new { c.StoryId, c.ChapterNumber }).IsUnique();

        builder.Entity<Purchase>()
            .HasIndex(p => new { p.UserId, p.StoryId }).IsUnique();

        builder.Entity<Story>().Property(s => s.Price).HasPrecision(12, 2);
        builder.Entity<SubscriptionPlan>().Property(p => p.Price).HasPrecision(12, 2);
        builder.Entity<Purchase>().Property(p => p.PricePaid).HasPrecision(12, 2);
        builder.Entity<Transaction>().Property(t => t.Amount).HasPrecision(12, 2);
    }
}
