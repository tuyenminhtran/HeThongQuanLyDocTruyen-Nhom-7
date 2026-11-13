using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using StoryReader.Api.Data;
using StoryReader.Api.Models.Entities;
using StoryReader.Api.Services.Interfaces;

namespace StoryReader.Tests.Helpers;

internal static class TestDbFactory
{
    public static ServiceProvider BuildServiceProvider(string? dbName = null)
    {
        var name = dbName ?? Guid.NewGuid().ToString();
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddMemoryCache();
        services.AddDbContext<AppDbContext>(opt => opt.UseInMemoryDatabase(name));
        return services.BuildServiceProvider();
    }

    public static async Task<(AppUser user, IdentityRole<Guid> role)> SeedUserAsync(
        AppDbContext db,
        string email,
        string roleName = "Member",
        bool isRestricted = false)
    {
        var role = await db.Roles.FirstOrDefaultAsync(r => r.Name == roleName);
        if (role is null)
        {
            role = new IdentityRole<Guid>
            {
                Id = Guid.NewGuid(),
                Name = roleName,
                NormalizedName = roleName.ToUpperInvariant()
            };
            db.Roles.Add(role);
        }

        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            Email = email,
            NormalizedEmail = email.ToUpperInvariant(),
            UserName = email,
            NormalizedUserName = email.ToUpperInvariant(),
            DisplayName = email.Split('@')[0],
            IsRestricted = isRestricted
        };

        db.Users.Add(user);
        db.UserRoles.Add(new IdentityUserRole<Guid>
        {
            UserId = user.Id,
            RoleId = role.Id
        });
        await db.SaveChangesAsync();

        return (user, role);
    }

    public static ControllerContext CreateUserContext(Guid userId)
    {
        var identity = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString())
        }, "TestAuth");

        return new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(identity)
            }
        };
    }
}

internal sealed class NoOpTextToImageService : ITextToImageService
{
    public Task<List<string>> RenderTextToImagesAsync(string text, Guid chapterId)
        => Task.FromResult(new List<string> { $"/uploads/chapters/{chapterId}/page-1.png" });
}
