using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StoryReader.Api.Data;
using StoryReader.Api.Models.Entities;
using StoryReader.Api.Security;
using StoryReader.Api.Services;
using StoryReader.Api.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

SecurityConfigValidator.Validate(builder.Configuration, builder.Environment);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(opt =>
{
    opt.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "Nhập: Bearer {token}",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    opt.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services
    .AddIdentity<AppUser, IdentityRole<Guid>>(opt =>
    {
        opt.Password.RequiredLength = 6;
        opt.Password.RequireNonAlphanumeric = false;
        opt.Password.RequireUppercase = false;
        opt.Password.RequireLowercase = false;
        opt.Password.RequireDigit = false;
        opt.User.RequireUniqueEmail = true;
        opt.Lockout.MaxFailedAccessAttempts = 5;
        opt.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    })
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services
    .AddAuthentication(opt =>
    {
        opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ClockSkew = TimeSpan.FromMinutes(1),
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
        opt.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                var userIdStr = context.Principal?.FindFirstValue(ClaimTypes.NameIdentifier);
                if (!Guid.TryParse(userIdStr, out var userId))
                {
                    context.Fail("Token không hợp lệ.");
                    return;
                }

                var jti = context.Principal?.FindFirstValue(JwtRegisteredClaimNames.Jti);
                var iatStr = context.Principal?.FindFirstValue(JwtRegisteredClaimNames.Iat);
                long? iatUnix = long.TryParse(iatStr, NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsedIat)
                    ? parsedIat
                    : null;

                var authService = context.HttpContext.RequestServices.GetRequiredService<IAuthService>();
                if (await authService.IsTokenRevokedAsync(jti, userId, iatUnix))
                {
                    context.Fail("Phiên đăng nhập đã đăng xuất hoặc bị thu hồi.");
                    return;
                }

                var db = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
                var userStatus = await db.Users
                    .AsNoTracking()
                    .Where(u => u.Id == userId)
                    .Select(u => new { u.IsRestricted })
                    .FirstOrDefaultAsync();

                if (userStatus is null || userStatus.IsRestricted)
                {
                    context.Fail("Tài khoản đã bị khóa hoặc không tồn tại.");
                }
            }
        };
    });

builder.Services.AddAuthorization();

static RateLimitPartition<string> CreateFixedPartition(string key, int permitLimit, int windowMinutes = 1) =>
    RateLimitPartition.GetFixedWindowLimiter(
        partitionKey: key,
        factory: _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = permitLimit,
            Window = TimeSpan.FromMinutes(windowMinutes),
            QueueLimit = 0
        });

static string PartitionByUserOrIp(HttpContext httpContext, string prefix)
{
    var userId = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
    var identityKey = !string.IsNullOrWhiteSpace(userId)
        ? $"user:{userId}"
        : $"ip:{httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown"}";
    return $"{prefix}:{identityKey}";
}

builder.Services.AddRateLimiter(opt =>
{
    opt.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    opt.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.ContentType = "application/json; charset=utf-8";
        await context.HttpContext.Response.WriteAsJsonAsync(new
        {
            message = "Bạn đang thao tác quá nhanh. Vui lòng thử lại sau ít phút."
        }, cancellationToken: token);
    };

    opt.AddPolicy("auth", httpContext =>
        CreateFixedPartition($"auth:{httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown"}", permitLimit: 20));

    opt.AddPolicy("discussion", httpContext =>
        CreateFixedPartition(PartitionByUserOrIp(httpContext, "discussion"), permitLimit: 6));

    opt.AddPolicy("payment", httpContext =>
        CreateFixedPartition(PartitionByUserOrIp(httpContext, "payment"), permitLimit: 10));

    opt.AddPolicy("tts", httpContext =>
        CreateFixedPartition(PartitionByUserOrIp(httpContext, "tts"), permitLimit: 60));
});

builder.Services.AddMemoryCache();

var redisConnection = builder.Configuration.GetConnectionString("Redis")?.Trim();
if (!string.IsNullOrWhiteSpace(redisConnection))
{
    var normalizedRedis = redisConnection.Contains("abortConnect", StringComparison.OrdinalIgnoreCase)
        ? redisConnection
        : $"{redisConnection},abortConnect=false,connectTimeout=1000,syncTimeout=1000,asyncTimeout=1000";

    builder.Services.AddStackExchangeRedisCache(opt =>
    {
        opt.InstanceName = "storyreader:";
        opt.Configuration = normalizedRedis;
    });
}

builder.Services.AddSingleton<IAppCacheService, ResilientAppCacheService>();
builder.Services.AddSingleton<IViewCounterService, ChapterViewBufferService>();
builder.Services.AddHostedService<ChapterViewFlushWorker>();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IStoryService, StoryService>();
builder.Services.AddScoped<IChapterAccessService, ChapterAccessService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<ISubscriptionService, SubscriptionService>();
builder.Services.AddScoped<IStatsService, StatsService>();
builder.Services.AddScoped<ITextToImageService, TextToImageService>();
builder.Services.AddHostedService<ScheduledChapterPublisherWorker>();

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[]
    {
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:4173"
    };

builder.Services.AddCors(opt =>
    opt.AddDefaultPolicy(p =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // VULN-07: Trong Development chỉ cho phép loopback (Vite/Flutter Web) và danh sách AllowedOrigins, không mở wildcard toàn cầu.
            p.SetIsOriginAllowed(origin =>
                Uri.TryCreate(origin, UriKind.Absolute, out var uri) &&
                (uri.IsLoopback || allowedOrigins.Contains(origin, StringComparer.OrdinalIgnoreCase)))
             .AllowAnyHeader()
             .AllowAnyMethod()
             .AllowCredentials();
        }
        else
        {
            p.WithOrigins(allowedOrigins)
             .AllowAnyHeader()
             .AllowAnyMethod()
             .AllowCredentials();
        }
    }));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Tự động cập nhật Migration & Seed các role/dữ liệu mặc định khi ứng dụng khởi động.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (db.Database.IsRelational())
    {
        await db.Database.MigrateAsync();
    }

    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
    foreach (var role in new[] { "Admin", "Member" })
        if (!await roleManager.RoleExistsAsync(role))
            await roleManager.CreateAsync(new IdentityRole<Guid>(role));

    await StoryReader.Api.Data.DataSeeder.SeedAsync(scope.ServiceProvider);
}

var webRoot = app.Environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
Directory.CreateDirectory(Path.Combine(webRoot, "uploads", "covers"));

app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    context.Response.Headers["X-Permitted-Cross-Domain-Policies"] = "none";
    context.Response.Headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
    await next();
});

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/health", async (AppDbContext db, IAppCacheService cache, CancellationToken ct) =>
{
    var dbHealthy = await db.Database.CanConnectAsync(ct);
    var status = dbHealthy ? "healthy" : "degraded";
    return Results.Json(new
    {
        status,
        database = dbHealthy ? "up" : "down",
        cache = cache.IsDistributedConfigured
            ? (cache.IsDistributedHealthy ? "redis:up" : "redis:fallback-memory")
            : "memory",
        timestampUtc = DateTime.UtcNow
    }, statusCode: dbHealthy ? StatusCodes.Status200OK : StatusCodes.Status503ServiceUnavailable);
}).AllowAnonymous();

app.MapControllers();

app.Run();
