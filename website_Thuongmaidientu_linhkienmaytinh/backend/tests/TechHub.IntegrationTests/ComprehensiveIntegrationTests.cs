using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TechHub.Application.Common.Interfaces;
using TechHub.Application.DTOs.Auth;
using TechHub.Application.DTOs.Catalog;
using TechHub.Domain.Entities;
using TechHub.Domain.Enums;
using TechHub.Infrastructure.Persistence;
using TechHub.Infrastructure.Persistence.Configurations;
using TechHub.Infrastructure.Services;
using Xunit;

namespace TechHub.IntegrationTests;

[Collection("IntegrationTests")]
public class ComprehensiveIntegrationTests : IAsyncLifetime
{
    private readonly PostgresTestApplicationFactory _factory;
    private readonly PasswordService _passwordService = new();

    public ComprehensiveIntegrationTests(PostgresTestApplicationFactory factory)
    {
        _factory = factory;
    }

    public async Task InitializeAsync()
    {
        await _factory.EnsureDatabaseMigratedAsync();
        await _factory.ResetDatabaseAsync();
    }

    public Task DisposeAsync() => Task.CompletedTask;

    private async Task<(User user, string plainPassword)> SeedTestUserAsync(string roleName = "Customer", bool isActive = true)
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var plainPassword = "Password123!";
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = $"testuser_{Guid.NewGuid():N}@techhub.test",
            FullName = "Test User Integration",
            IsActive = isActive,
            CreatedAtUtc = DateTimeOffset.UtcNow
        };
        user.NormalizedEmail = user.Email.ToUpperInvariant();
        
        // Hash using the factory's PasswordService to guarantee exact hasher match
        var pwdService = scope.ServiceProvider.GetRequiredService<IPasswordService>();
        user.PasswordHash = pwdService.HashPassword(user, plainPassword);
        db.Users.Add(user);

        // Ensure standard Roles and Permissions exist in test DB
        var adminRole = await db.Roles.FirstOrDefaultAsync(r => r.Id == RoleConfiguration.AdminRoleId);
        if (adminRole == null)
        {
            adminRole = new Role { Id = RoleConfiguration.AdminRoleId, Name = "Admin", Description = "Administrator Role", CreatedAtUtc = DateTimeOffset.UtcNow };
            db.Roles.Add(adminRole);
        }

        var customerRole = await db.Roles.FirstOrDefaultAsync(r => r.Id == RoleConfiguration.CustomerRoleId);
        if (customerRole == null)
        {
            customerRole = new Role { Id = RoleConfiguration.CustomerRoleId, Name = "Customer", Description = "Customer Role", CreatedAtUtc = DateTimeOffset.UtcNow };
            db.Roles.Add(customerRole);
        }

        // Seed all permissions for tests
        var perms = new[] { "cart.manage", "orders.read.own", "orders.create", "products.manage", "orders.read.all", "orders.update", "inventory.manage", "reviews.manage" };
        foreach (var code in perms)
        {
            var p = await db.Permissions.FirstOrDefaultAsync(x => x.Code == code);
            if (p == null)
            {
                p = new Permission { Id = Guid.NewGuid(), Code = code, Description = code, CreatedAtUtc = DateTimeOffset.UtcNow };
                db.Permissions.Add(p);
            }

            var isAdminPerm = code.StartsWith("products.") || code.StartsWith("inventory.") || code.StartsWith("reviews.") || code == "orders.read.all" || code == "orders.update";
            
            // Assign admin permissions to adminRole, customer permissions to customerRole AND adminRole
            if (isAdminPerm)
            {
                var rp = await db.RolePermissions.FirstOrDefaultAsync(x => x.RoleId == adminRole.Id && x.PermissionId == p.Id);
                if (rp == null) db.RolePermissions.Add(new RolePermission { RoleId = adminRole.Id, PermissionId = p.Id, AssignedAtUtc = DateTimeOffset.UtcNow });
            }
            else
            {
                var rpCust = await db.RolePermissions.FirstOrDefaultAsync(x => x.RoleId == customerRole.Id && x.PermissionId == p.Id);
                if (rpCust == null) db.RolePermissions.Add(new RolePermission { RoleId = customerRole.Id, PermissionId = p.Id, AssignedAtUtc = DateTimeOffset.UtcNow });

                var rpAdmin = await db.RolePermissions.FirstOrDefaultAsync(x => x.RoleId == adminRole.Id && x.PermissionId == p.Id);
                if (rpAdmin == null) db.RolePermissions.Add(new RolePermission { RoleId = adminRole.Id, PermissionId = p.Id, AssignedAtUtc = DateTimeOffset.UtcNow });
            }
        }

        db.UserRoles.Add(new UserRole
        {
            UserId = user.Id,
            RoleId = roleName == "Admin" ? adminRole.Id : customerRole.Id,
            AssignedAtUtc = DateTimeOffset.UtcNow
        });

        // Load navigation properties for user so TokenService can fetch role/permissions if needed
        user.UserRoles = new List<UserRole>
        {
            new UserRole { UserId = user.Id, RoleId = roleName == "Admin" ? adminRole.Id : customerRole.Id, Role = roleName == "Admin" ? adminRole : customerRole }
        };

        db.Carts.Add(new Cart
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            CreatedAtUtc = DateTimeOffset.UtcNow
        });

        await db.SaveChangesAsync();
        return (user, plainPassword);
    }

    private async Task<string> GetAccessTokenAsync(HttpClient client, string email, string password)
    {
        client.DefaultRequestHeaders.Authorization = null;
        var response = await client.PostAsJsonAsync("/api/auth/login", new { email, password });
        var content = await response.Content.ReadAsStringAsync();
        if (!response.IsSuccessStatusCode)
        {
            throw new Exception($"Login failed for user '{email}' with password '{password}': Status={response.StatusCode}, Content={content}");
        }
        using var doc = JsonDocument.Parse(content);
        var accessToken = doc.RootElement.GetProperty("accessToken").GetString()!;
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        return accessToken;
    }

    private async Task<(Category cat, Product product)> SeedCategoryAndProductAsync(int stockQuantity = 10)
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var cat = new Category
        {
            Id = Guid.NewGuid(),
            Code = $"CAT_{Guid.NewGuid():N}",
            Name = "CPU Linh Kien Test",
            IsActive = true,
            CreatedAtUtc = DateTimeOffset.UtcNow
        };
        db.Categories.Add(cat);

        var prod = new Product
        {
            Id = Guid.NewGuid(),
            CategoryId = cat.Id,
            Code = $"PROD_{Guid.NewGuid():N}",
            Name = "Intel Core i9 Test Edition",
            Description = "CPU test cho integration",
            Price = 12000000m,
            StockQuantity = stockQuantity,
            IsActive = true,
            CreatedAtUtc = DateTimeOffset.UtcNow
        };
        db.Products.Add(prod);

        await db.SaveChangesAsync();
        return (cat, prod);
    }

    private async Task AssertProblemDetailsAsync(HttpResponseMessage response, HttpStatusCode expectedStatus, string? expectedTitle = null)
    {
        Assert.Equal(expectedStatus, response.StatusCode);
        var contentType = response.Content.Headers.ContentType?.ToString();
        Assert.NotNull(contentType);
        Assert.Contains("application/problem+json", contentType);

        using var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
        var root = doc.RootElement;

        Assert.True(root.TryGetProperty("status", out var statusProp) && statusProp.GetInt32() == (int)expectedStatus, "ProblemDetails status must match expected HTTP status code.");
        Assert.True(root.TryGetProperty("title", out var titleProp) && !string.IsNullOrWhiteSpace(titleProp.GetString()), "ProblemDetails title must exist.");
        Assert.True(root.TryGetProperty("detail", out var detailProp) && !string.IsNullOrWhiteSpace(detailProp.GetString()), "ProblemDetails detail must exist.");
        Assert.True(root.TryGetProperty("instance", out var instanceProp) && !string.IsNullOrWhiteSpace(instanceProp.GetString()), "ProblemDetails instance must exist.");
        Assert.True(root.TryGetProperty("traceId", out var traceIdProp) && !string.IsNullOrWhiteSpace(traceIdProp.GetString()), "ProblemDetails traceId must exist.");

        if (expectedTitle != null)
        {
            Assert.Equal(expectedTitle, titleProp.GetString());
        }
    }

    [Fact]
    public async Task Login_WithWrongPassword_ShouldReturn401ProblemDetails()
    {
        var client = _factory.CreateClient();
        var (user, _) = await SeedTestUserAsync();

        var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = user.Email,
            password = "WrongPassword999!"
        });

        await AssertProblemDetailsAsync(response, HttpStatusCode.Unauthorized, "Unauthorized");
    }

    [Fact]
    public async Task Login_WithLockedAccount_ShouldReturn401()
    {
        var client = _factory.CreateClient();
        var (user, password) = await SeedTestUserAsync(isActive: false);

        var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = user.Email,
            password
        });

        await AssertProblemDetailsAsync(response, HttpStatusCode.Unauthorized, "Unauthorized");
    }

    [Fact]
    public async Task GetMe_WithoutToken_ShouldReturn401()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/auth/me");
        await AssertProblemDetailsAsync(response, HttpStatusCode.Unauthorized, "Unauthorized");
    }

    [Fact]
    public async Task Customer_CallingAdminEndpoint_ShouldReturn403()
    {
        var client = _factory.CreateClient();
        var (customer, pass) = await SeedTestUserAsync("Customer");
        var token = await GetAccessTokenAsync(client, customer.Email, pass);

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var response = await client.GetAsync("/api/admin/inventory");
        await AssertProblemDetailsAsync(response, HttpStatusCode.Forbidden, "Forbidden");
    }

    [Fact]
    public async Task CustomerA_AccessingCustomerBOrder_ShouldReturn403()
    {
        var client = _factory.CreateClient();
        var (customerA, passA) = await SeedTestUserAsync("Customer");
        var (customerB, _) = await SeedTestUserAsync("Customer");

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var orderB = new Order
            {
                Id = Guid.NewGuid(),
                OrderNumber = "ORD-TEST-B001",
                UserId = customerB.Id,
                Status = OrderStatus.Pending,
                Total = 500000m,
                ShippingAddress = "123 Street B",
                RecipientName = "Customer B",
                PhoneNumber = "0988888888",
                PaymentMethod = PaymentMethod.Cod,
                CreatedAtUtc = DateTimeOffset.UtcNow
            };
            db.Orders.Add(orderB);
            await db.SaveChangesAsync();

            var tokenA = await GetAccessTokenAsync(client, customerA.Email, passA);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokenA);

            var response = await client.GetAsync($"/api/orders/{orderB.Id}");
            await AssertProblemDetailsAsync(response, HttpStatusCode.Forbidden, "Forbidden");
        }
    }

    [Fact]
    public async Task Checkout_ExceedingStock_ShouldReturn409()
    {
        var client = _factory.CreateClient();
        var (customer, pass) = await SeedTestUserAsync("Customer");
        var (_, product) = await SeedCategoryAndProductAsync(stockQuantity: 5);

        // Add item exceeding stock to customer cart
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var cart = await db.Carts.FirstAsync(c => c.UserId == customer.Id);
            db.CartItems.Add(new CartItem { Id = Guid.NewGuid(), CartId = cart.Id, ProductId = product.Id, Quantity = 10, CreatedAtUtc = DateTimeOffset.UtcNow });
            await db.SaveChangesAsync();
        }

        var token = await GetAccessTokenAsync(client, customer.Email, pass);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var checkoutPayload = new
        {
            recipientName = "Tester",
            phoneNumber = "0912345678",
            shippingAddress = "456 Main St",
            paymentMethod = "Cod"
        };

        var response = await client.PostAsJsonAsync("/api/checkout", checkoutPayload);
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Concurrency_TwoCustomersCheckoutStock1_OnlyOneSucceeds()
    {
        var (customerA, passA) = await SeedTestUserAsync("Customer");
        var (customerB, passB) = await SeedTestUserAsync("Customer");
        var (_, product) = await SeedCategoryAndProductAsync(stockQuantity: 1);

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var cartA = await db.Carts.FirstAsync(c => c.UserId == customerA.Id);
            var cartB = await db.Carts.FirstAsync(c => c.UserId == customerB.Id);
            db.CartItems.Add(new CartItem { Id = Guid.NewGuid(), CartId = cartA.Id, ProductId = product.Id, Quantity = 1, CreatedAtUtc = DateTimeOffset.UtcNow });
            db.CartItems.Add(new CartItem { Id = Guid.NewGuid(), CartId = cartB.Id, ProductId = product.Id, Quantity = 1, CreatedAtUtc = DateTimeOffset.UtcNow });
            await db.SaveChangesAsync();
        }

        var clientA = _factory.CreateClient();
        var clientB = _factory.CreateClient();

        var tokenA = await GetAccessTokenAsync(clientA, customerA.Email, passA);
        var tokenB = await GetAccessTokenAsync(clientB, customerB.Email, passB);

        clientA.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokenA);
        clientB.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokenB);

        var payload = new
        {
            recipientName = "Racer",
            phoneNumber = "0999999999",
            shippingAddress = "Concurrency St",
            paymentMethod = "Cod"
        };

        var task1 = clientA.PostAsJsonAsync("/api/checkout", payload);
        var task2 = clientB.PostAsJsonAsync("/api/checkout", payload);

        var responses = await Task.WhenAll(task1, task2);

        var statusCodes = responses.Select(r => r.StatusCode).ToList();
        Assert.Contains(HttpStatusCode.Created, statusCodes);
        Assert.Contains(HttpStatusCode.Conflict, statusCodes);

        using var scopeDb = _factory.Services.CreateScope();
        var db2 = scopeDb.ServiceProvider.GetRequiredService<AppDbContext>();
        var updatedProduct = await db2.Products.FirstAsync(p => p.Id == product.Id);
        Assert.Equal(0, updatedProduct.StockQuantity);

        var ordersCount = await db2.Orders.CountAsync();
        Assert.Equal(1, ordersCount);
    }

    [Fact]
    public async Task OrderStatus_InvalidTransition_ShouldReturn409()
    {
        var client = _factory.CreateClient();
        var (admin, pass) = await SeedTestUserAsync("Admin");
        var (customer, _) = await SeedTestUserAsync("Customer");

        Guid orderId;
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var order = new Order
            {
                Id = Guid.NewGuid(),
                OrderNumber = "ORD-STATUS-001",
                UserId = customer.Id,
                Status = OrderStatus.Completed,
                Total = 100000m,
                ShippingAddress = "Address",
                RecipientName = "Receiver",
                PhoneNumber = "0900000000",
                PaymentMethod = PaymentMethod.Cod,
                CreatedAtUtc = DateTimeOffset.UtcNow
            };
            db.Orders.Add(order);
            await db.SaveChangesAsync();
            orderId = order.Id;
        }

        var token = await GetAccessTokenAsync(client, admin.Email, pass);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await client.PatchAsJsonAsync($"/api/admin/orders/{orderId}/status", new { status = "Pending" });
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Xss_InProductSearch_ShouldBeHandledAsString()
    {
        var client = _factory.CreateClient();
        await SeedCategoryAndProductAsync();

        var xssPayload = "<script>alert('XSS-TEST')</script>";
        var response = await client.GetAsync($"/api/products?search={Uri.EscapeDataString(xssPayload)}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var pagedResult = await response.Content.ReadFromJsonAsync<PagedResult<ProductDto>>();
        Assert.NotNull(pagedResult);
        Assert.Equal(0, pagedResult!.TotalItems);
    }

    [Fact]
    public async Task SqlInjection_InProductSearch_ShouldNotFailWith500OrExposeAll()
    {
        var client = _factory.CreateClient();
        await SeedCategoryAndProductAsync();

        var sqlPayload = "' OR '1'='1";
        var response = await client.GetAsync($"/api/products?search={Uri.EscapeDataString(sqlPayload)}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var pagedResult = await response.Content.ReadFromJsonAsync<PagedResult<ProductDto>>();
        Assert.NotNull(pagedResult);
        Assert.Equal(0, pagedResult!.TotalItems);
    }

    [Fact]
    public async Task Upload_InvalidFileValidations_ShouldBeRejected()
    {
        var client = _factory.CreateClient();
        var (admin, pass) = await SeedTestUserAsync("Admin");
        var (_, product) = await SeedCategoryAndProductAsync();

        var token = await GetAccessTokenAsync(client, admin.Email, pass);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // 1. Invalid Extension (txt)
        var contentTxt = new MultipartFormDataContent();
        var fileContentTxt = new ByteArrayContent("hello text file"u8.ToArray());
        fileContentTxt.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
        contentTxt.Add(fileContentTxt, "file", "test.txt");

        var res1 = await client.PostAsync($"/api/admin/products/{product.Id}/images", contentTxt);
        Assert.Equal(HttpStatusCode.BadRequest, res1.StatusCode);

        // 2. MIME Fake (PDF magic bytes with JPG extension)
        var contentFake = new MultipartFormDataContent();
        var pdfBytes = "%PDF-1.4 header text data"u8.ToArray();
        var fileContentFake = new ByteArrayContent(pdfBytes);
        fileContentFake.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
        contentFake.Add(fileContentFake, "file", "fake.jpg");

        var res2 = await client.PostAsync($"/api/admin/products/{product.Id}/images", contentFake);
        Assert.Equal(HttpStatusCode.BadRequest, res2.StatusCode);

        // 3. Exceeds 5MB
        var contentLarge = new MultipartFormDataContent();
        var largeBytes = new byte[6 * 1024 * 1024];
        var fileContentLarge = new ByteArrayContent(largeBytes);
        fileContentLarge.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
        contentLarge.Add(fileContentLarge, "file", "large.jpg");

        var res3 = await client.PostAsync($"/api/admin/products/{product.Id}/images", contentLarge);
        Assert.True(res3.StatusCode == HttpStatusCode.BadRequest || res3.StatusCode == HttpStatusCode.RequestEntityTooLarge);
    }

    [Fact]
    public async Task RefreshToken_ReuseAfterRotation_ShouldReturn401AndRevokeFamily()
    {
        var client = _factory.CreateClient();
        var (user, pass) = await SeedTestUserAsync();

        // Login first time -> gets refresh token cookie
        var loginRes = await client.PostAsJsonAsync("/api/auth/login", new { email = user.Email, password = pass });
        loginRes.EnsureSuccessStatusCode();

        var setCookieHeader = loginRes.Headers.GetValues("Set-Cookie").FirstOrDefault(c => c.StartsWith("techhub_refresh="));
        Assert.NotNull(setCookieHeader);

        var firstCookieValue = setCookieHeader!.Split(';')[0];

        // Refresh 1 -> succeeds, gets new refresh token cookie
        var request1 = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh");
        request1.Headers.Add("Cookie", firstCookieValue);
        var refreshRes1 = await client.SendAsync(request1);
        Assert.Equal(HttpStatusCode.OK, refreshRes1.StatusCode);

        // Reuse old refresh token cookie -> 401 Unauthorized ProblemDetails
        var requestReuse = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh");
        requestReuse.Headers.Add("Cookie", firstCookieValue);
        var reuseRes = await client.SendAsync(requestReuse);
        await AssertProblemDetailsAsync(reuseRes, HttpStatusCode.Unauthorized, "Unauthorized");

        // Check DB: family revoked
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var tokens = await db.RefreshTokens.Where(rt => rt.UserId == user.Id).ToListAsync();
        Assert.All(tokens, t => Assert.NotNull(t.RevokedAtUtc));
    }
}
