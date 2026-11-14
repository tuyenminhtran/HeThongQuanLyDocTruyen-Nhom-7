using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using StoryReader.Api.Data;
using StoryReader.Api.Models.Entities;
using StoryReader.Api.Services;
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
        services.AddSingleton<IAppCacheService, StoryReader.Api.Services.ResilientAppCacheService>();
        services.AddSingleton<IViewCounterService, StoryReader.Api.Services.ChapterViewBufferService>();
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

    public static IConfiguration BuildConfiguration(IDictionary<string, string?>? overrides = null)
    {
        var values = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase)
        {
            ["ConnectionStrings:Default"] = "Host=localhost;Database=storyreader_test;Username=postgres;Password=postgres",
            ["Jwt:Key"] = "TestOnly_StoryReader_Jwt_Secret_Key_AtLeast_32_Chars_Long_2026",
            ["Jwt:Issuer"] = "StoryReader.Api",
            ["Jwt:Audience"] = "StoryReader.Clients",
            ["Jwt:AccessTokenMinutes"] = "15",
            ["Jwt:RefreshTokenDays"] = "7",
            ["Payments:EnableDevSimulation"] = "true",
            ["Payments:CallbackSecret"] = "TestOnly_Callback_Secret_2026",
            ["Payments:VnPay:TmnCode"] = "STORYDEV",
            ["Payments:VnPay:HashSecret"] = "TestOnly_VnPay_HmacSha512_Secret_2026"
        };

        if (overrides is not null)
        {
            foreach (var (k, v) in overrides)
                values[k] = v;
        }

        return new ConfigurationBuilder()
            .AddInMemoryCollection(values)
            .Build();
    }

    public static ServiceProvider BuildIdentityServiceProvider(string? dbName = null, IConfiguration? configuration = null)
    {
        var name = dbName ?? Guid.NewGuid().ToString();
        var config = configuration ?? BuildConfiguration();
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddMemoryCache();
        services.AddSingleton(config);
        services.AddDbContext<AppDbContext>(opt => opt.UseInMemoryDatabase(name));
        services.AddIdentityCore<AppUser>(options =>
            {
                options.Password.RequireDigit = true;
                options.Password.RequiredLength = 6;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = false;
            })
            .AddRoles<IdentityRole<Guid>>()
            .AddEntityFrameworkStores<AppDbContext>();
        services.AddSingleton<IAppCacheService, ResilientAppCacheService>();
        services.AddSingleton<IViewCounterService, ChapterViewBufferService>();
        services.AddScoped<IAuthService, AuthService>();
        return services.BuildServiceProvider();
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
