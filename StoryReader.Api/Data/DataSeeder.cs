using Microsoft.AspNetCore.Identity;
using StoryReader.Api.Data;
using StoryReader.Api.Models.Entities;

namespace StoryReader.Api.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var db = services.GetRequiredService<AppDbContext>();
        var userManager = services.GetRequiredService<UserManager<AppUser>>();

        if (!db.SubscriptionPlans.Any())
        {
            db.SubscriptionPlans.AddRange(
                new SubscriptionPlan { Name = "Gói 1 tháng", Price = 49000, DurationDays = 30, Scope = "all" },
                new SubscriptionPlan { Name = "Gói 3 tháng", Price = 129000, DurationDays = 90, Scope = "all" },
                new SubscriptionPlan { Name = "Gói 12 tháng", Price = 399000, DurationDays = 365, Scope = "all" }
            );
            await db.SaveChangesAsync();
        }

        const string adminEmail = "admin@storynest.local";
        if (await userManager.FindByEmailAsync(adminEmail) is null)
        {
            var admin = new AppUser { UserName = adminEmail, Email = adminEmail, DisplayName = "Administrator" };
            var result = await userManager.CreateAsync(admin, "Admin@123456");
            if (result.Succeeded)
                await userManager.AddToRoleAsync(admin, "Admin");
        }
    }
}
