using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging.Abstractions;
using StoryReader.Api.Controllers;
using StoryReader.Api.Data;
using StoryReader.Api.Models.Dtos;
using StoryReader.Api.Models.Entities;
using StoryReader.Api.Security;
using StoryReader.Api.Services;
using StoryReader.Api.Services.Interfaces;
using StoryReader.Tests.Helpers;
using Xunit;

namespace StoryReader.Tests;

public class SecurityHardeningTests
{
    private sealed class FakeWebHostEnvironment(string environmentName) : IWebHostEnvironment
    {
        public string EnvironmentName { get; set; } = environmentName;
        public string ApplicationName { get; set; } = "StoryReader.Api";
        public string WebRootPath { get; set; } = Path.GetTempPath();
        public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
        public string ContentRootPath { get; set; } = Path.GetTempPath();
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    }

    [Fact]
    public void SecurityConfigValidator_EnforcesStrongSecretsInProduction_AllowsValidDevAndProd()
    {
        var devEnv = new FakeWebHostEnvironment(Environments.Development);
        var prodEnv = new FakeWebHostEnvironment(Environments.Production);

        // Thiếu Jwt:Key -> throw kể cả ở Development
        var missingJwt = TestDbFactory.BuildConfiguration(new Dictionary<string, string?>
        {
            ["Jwt:Key"] = ""
        });
        Assert.Throws<InvalidOperationException>(() => SecurityConfigValidator.Validate(missingJwt, devEnv));

        // Jwt:Key < 32 ký tự -> throw
        var shortJwt = TestDbFactory.BuildConfiguration(new Dictionary<string, string?>
        {
            ["Jwt:Key"] = "too-short-jwt-key"
        });
        Assert.Throws<InvalidOperationException>(() => SecurityConfigValidator.Validate(shortJwt, devEnv));

        // DevOnly / CHANGE_ME hợp lệ ở Development (nếu >= 32 ký tự), bị chặn ở Production
        var devKeyConfig = TestDbFactory.BuildConfiguration(new Dictionary<string, string?>
        {
            ["Jwt:Key"] = "DevOnly_Local_StoryReader_Jwt_Secret_Key_Do_Not_Use_In_Prod_2026",
            ["Payments:CallbackSecret"] = "",
            ["Payments:VnPay:HashSecret"] = ""
        });
        SecurityConfigValidator.Validate(devKeyConfig, devEnv);
        Assert.Throws<InvalidOperationException>(() => SecurityConfigValidator.Validate(devKeyConfig, prodEnv));

        var placeholderConfig = TestDbFactory.BuildConfiguration(new Dictionary<string, string?>
        {
            ["Jwt:Key"] = SecurityConfigValidator.DefaultPlaceholderJwtKey
        });
        Assert.Throws<InvalidOperationException>(() => SecurityConfigValidator.Validate(placeholderConfig, prodEnv));

        // Production thiếu CallbackSecret & HashSecret -> throw
        var prodMissingPaymentSecret = TestDbFactory.BuildConfiguration(new Dictionary<string, string?>
        {
            ["Jwt:Key"] = "Prod_Strong_Random_Jwt_Secret_Key_At_Least_32_Bytes_2026!",
            ["Payments:CallbackSecret"] = "",
            ["Payments:VnPay:HashSecret"] = ""
        });
        Assert.Throws<InvalidOperationException>(() => SecurityConfigValidator.Validate(prodMissingPaymentSecret, prodEnv));

        // Production đầy đủ secret mạnh -> pass
        var prodValid = TestDbFactory.BuildConfiguration(new Dictionary<string, string?>
        {
            ["Jwt:Key"] = "Prod_Strong_Random_Jwt_Secret_Key_At_Least_32_Bytes_2026!",
            ["Payments:CallbackSecret"] = "Prod_Strong_Callback_Secret_2026!"
        });
        SecurityConfigValidator.Validate(prodValid, prodEnv);
    }

    [Fact]
    public void VnPayGatewayHelper_BuildsVerifiableSignature_AndDetectsTampering()
    {
        const string hashSecret = "TestOnly_VnPay_HmacSha512_Secret_2026";
        var url = VnPayGatewayHelper.BuildSignedPaymentUrl(
            VnPayGatewayHelper.DefaultSandboxBaseUrl,
            "STORYDEV",
            hashSecret,
            "SR202611140001",
            49000m,
            "Thanh toan goi VIP",
            "http://localhost:5000/payment-result",
            nowUtc: new DateTime(2026, 11, 14, 5, 0, 0, DateTimeKind.Utc));

        var parsed = QueryHelpers.ParseQuery(new Uri(url).Query)
            .ToDictionary(kv => kv.Key, kv => kv.Value.ToString());

        Assert.True(VnPayGatewayHelper.VerifySignature(parsed, hashSecret));

        // Giả mạo vnp_Amount -> chữ ký phải không hợp lệ
        var tampered = new Dictionary<string, string>(parsed)
        {
            ["vnp_Amount"] = "100"
        };
        Assert.False(VnPayGatewayHelper.VerifySignature(tampered, hashSecret));
    }

    [Fact]
    public async Task PaymentsController_Callback_RejectsMissingSecretEvenInDevelopment_AndAcceptsValidSecret()
    {
        using var sp = TestDbFactory.BuildServiceProvider();
        using var scope = sp.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var config = TestDbFactory.BuildConfiguration();

        var (buyer, _) = await TestDbFactory.SeedUserAsync(db, "buyer-cb@test.local");
        var (otherUser, _) = await TestDbFactory.SeedUserAsync(db, "other-cb@test.local");

        var story = new Story
        {
            Title = "Truyện trả phí bảo mật",
            AccessPolicy = AccessPolicy.Paid,
            Price = 30000m
        };
        db.Stories.Add(story);
        await db.SaveChangesAsync();

        var paymentService = new PaymentService(db, config);
        var (_, paymentUrl) = await paymentService.InitiateStoryPurchaseAsync(buyer.Id, story.Id);
        var query = QueryHelpers.ParseQuery(new Uri(paymentUrl).Query);
        var providerRef = query["ref"].ToString();

        var controller = new PaymentsController(
            paymentService,
            new FakeWebHostEnvironment(Environments.Development),
            config)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            }
        };

        // 1. Gọi /callback KHÔNG có X-Payment-Callback-Secret và KHÔNG có vnp_SecureHash -> 401 ngay cả ở Development
        var unauthorizedResult = await controller.Callback(providerRef, success: true);
        Assert.IsType<UnauthorizedObjectResult>(unauthorizedResult);

        // 2. BOLA check: ConfirmDevSimulationAsync bởi user khác phải bị chặn, giao dịch giữ nguyên Pending
        var bolaEx = await Record.ExceptionAsync(() =>
            paymentService.ConfirmDevSimulationAsync(otherUser.Id, providerRef, success: true));
        Assert.NotNull(bolaEx);
        var txAfterBola = await db.Transactions.FirstAsync(t => t.ProviderTransactionRef == providerRef);
        Assert.Equal(TransactionStatus.Pending, txAfterBola.Status);
        Assert.Empty(db.Purchases);

        // 3. HandleVnPayCallbackAsync sai số tiền phải từ chối cấp quyền
        var (matchedBadAmount, processedBadAmount) = await paymentService.HandleVnPayCallbackAsync(providerRef, 1000m, success: true);
        Assert.False(matchedBadAmount);
        Assert.False(processedBadAmount);

        // 4. Gọi /callback kèm X-Payment-Callback-Secret hợp lệ -> 200 Ok và mở khóa truyện
        var authedHttp = new DefaultHttpContext();
        authedHttp.Request.Headers["X-Payment-Callback-Secret"] = config["Payments:CallbackSecret"];
        controller.ControllerContext = new ControllerContext { HttpContext = authedHttp };

        var okResult = await controller.Callback(providerRef, success: true);
        Assert.IsType<OkObjectResult>(okResult);

        var completedTx = await db.Transactions.FirstAsync(t => t.ProviderTransactionRef == providerRef);
        Assert.Equal(TransactionStatus.Success, completedTx.Status);
        Assert.Single(db.Purchases);
    }

    [Fact]
    public async Task AuthService_IssuesJtiAndRefreshToken_RotatesDetectsReuse_AndRevokesSessions()
    {
        using var sp = TestDbFactory.BuildIdentityServiceProvider();
        using var scope = sp.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var auth = scope.ServiceProvider.GetRequiredService<IAuthService>();

        db.Roles.Add(new IdentityRole<Guid>
        {
            Id = Guid.NewGuid(),
            Name = "Member",
            NormalizedName = "MEMBER"
        });
        await db.SaveChangesAsync();

        var registered = await auth.RegisterAsync(new RegisterDto("member-sec@test.local", "Password123", "Member Sec"));
        Assert.False(string.IsNullOrWhiteSpace(registered.RefreshToken));

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(registered.AccessToken);
        var jti = jwt.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Jti)?.Value;
        var iatStr = jwt.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Iat)?.Value;
        var subStr = jwt.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier || c.Type == JwtRegisteredClaimNames.Sub)?.Value;

        Assert.False(string.IsNullOrWhiteSpace(jti));
        Assert.True(long.TryParse(iatStr, out var iat));
        Assert.True(Guid.TryParse(subStr, out var userId));
        Assert.False(await auth.IsTokenRevokedAsync(jti, userId, iat));

        // Token trong CSDL phải là bản băm SHA-256 chứ không lưu plaintext
        var storedToken = await db.RefreshTokens.SingleAsync(t => t.UserId == userId);
        Assert.NotEqual(registered.RefreshToken, storedToken.TokenHash);

        // 1. Refresh xoay vòng token mới
        var rotated = await auth.RefreshAsync(registered.RefreshToken!);
        Assert.NotEqual(registered.RefreshToken, rotated.RefreshToken);

        // 2. Phát hiện reuse khi dùng lại refresh token cũ -> ném lỗi và thu hồi toàn bộ refresh token đang hoạt động
        var reuseEx = await Record.ExceptionAsync(() => auth.RefreshAsync(registered.RefreshToken!));
        Assert.NotNull(reuseEx);
        var allTokensAfterReuse = await db.RefreshTokens.Where(t => t.UserId == userId).ToListAsync();
        Assert.All(allTokensAfterReuse, t => Assert.NotNull(t.RevokedAt));

        // 3. Login lại -> kiểm tra Logout thu hồi jti & RevokeAllUserSessionsAsync vô hiệu hóa JWT hiện hành
        var loginRes = await auth.LoginAsync(new LoginDto("member-sec@test.local", "Password123"));
        var loginJwt = handler.ReadJwtToken(loginRes.AccessToken);
        var loginJti = loginJwt.Claims.First(c => c.Type == JwtRegisteredClaimNames.Jti).Value;
        var loginIat = long.Parse(loginJwt.Claims.First(c => c.Type == JwtRegisteredClaimNames.Iat).Value);

        await auth.RevokeSessionAsync(loginJti, loginRes.ExpiresAt, loginRes.RefreshToken);
        Assert.True(await auth.IsTokenRevokedAsync(loginJti, userId, loginIat));

        // Login phiên mới rồi thu hồi toàn bộ phiên của user (ví dụ đổi mật khẩu / bị khóa tài khoản)
        var loginRes2 = await auth.LoginAsync(new LoginDto("member-sec@test.local", "Password123"));
        var loginJwt2 = handler.ReadJwtToken(loginRes2.AccessToken);
        var loginJti2 = loginJwt2.Claims.First(c => c.Type == JwtRegisteredClaimNames.Jti).Value;
        var loginIat2 = long.Parse(loginJwt2.Claims.First(c => c.Type == JwtRegisteredClaimNames.Iat).Value);

        await auth.RevokeAllUserSessionsAsync(userId);
        Assert.True(await auth.IsTokenRevokedAsync(loginJti2, userId, loginIat2));
    }

    [Fact]
    public async Task ChapterViewBufferService_DeduplicatesSameViewer_AndFlushesToDatabase()
    {
        using var sp = TestDbFactory.BuildServiceProvider();
        Guid storyId;
        Guid chapterId;

        using (var seedScope = sp.CreateScope())
        {
            var db = seedScope.ServiceProvider.GetRequiredService<AppDbContext>();
            var story = new Story { Title = "Truyện buffer lượt xem", ViewCount = 0 };
            var chapter = new Chapter { StoryId = story.Id, ChapterNumber = 1, Title = "Chương 1", Content = "Test", ViewCount = 0 };
            db.Stories.Add(story);
            db.Chapters.Add(chapter);
            await db.SaveChangesAsync();
            storyId = story.Id;
            chapterId = chapter.Id;
        }

        var viewCounter = sp.GetRequiredService<IViewCounterService>();

        // Cùng 1 viewerKey đọc dồn 3 lần -> chỉ tính 1 lượt
        Assert.True(await viewCounter.RecordChapterViewAsync(chapterId, storyId, "user:u1"));
        Assert.False(await viewCounter.RecordChapterViewAsync(chapterId, storyId, "user:u1"));
        Assert.False(await viewCounter.RecordChapterViewAsync(chapterId, storyId, "user:u1"));

        // Viewer thứ hai đọc -> tính thêm 1 lượt
        Assert.True(await viewCounter.RecordChapterViewAsync(chapterId, storyId, "anon:127.0.0.1"));

        await viewCounter.FlushPendingViewsAsync();

        using var verifyScope = sp.CreateScope();
        var verifyDb = verifyScope.ServiceProvider.GetRequiredService<AppDbContext>();
        var savedStory = await verifyDb.Stories.FindAsync(storyId);
        var savedChapter = await verifyDb.Chapters.FindAsync(chapterId);

        Assert.Equal(2, savedStory!.ViewCount);
        Assert.Equal(2, savedChapter!.ViewCount);
    }

    [Fact]
    public void StoryDtos_RejectOverlongChapterContent()
    {
        var oversized = new string('a', 500_001);

        foreach (var dtoType in new[] { typeof(CreateChapterDto), typeof(UpdateChapterDto) })
        {
            var ctor = dtoType.GetConstructors().Single();
            var contentParam = ctor.GetParameters().Single(p => p.Name == "Content");
            var attrs = contentParam.GetCustomAttributes(typeof(ValidationAttribute), inherit: true)
                .Cast<ValidationAttribute>()
                .ToList();

            Assert.Contains(attrs, a => a is MaxLengthAttribute { Length: 500000 });
            Assert.False(Validator.TryValidateValue(oversized, new ValidationContext(oversized), new List<ValidationResult>(), attrs));
            Assert.True(Validator.TryValidateValue("Nội dung hợp lệ", new ValidationContext("ok"), new List<ValidationResult>(), attrs));
        }
    }
}
