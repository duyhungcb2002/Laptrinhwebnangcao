using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using TechHub.Infrastructure.Persistence;

namespace TechHub.IntegrationTests;

public class PostgresTestApplicationFactory : WebApplicationFactory<Program>
{
    public string ConnectionString { get; private set; } = string.Empty;

    public PostgresTestApplicationFactory()
    {
        Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Testing");
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureAppConfiguration((context, configBuilder) =>
        {
            var testSettingsPath = Path.Combine(AppContext.BaseDirectory, "appsettings.Test.json");
            if (File.Exists(testSettingsPath))
            {
                configBuilder.AddJsonFile(testSettingsPath, optional: true, reloadOnChange: false);
            }
            configBuilder.AddUserSecrets<Program>(optional: true);
            configBuilder.AddUserSecrets(typeof(PostgresTestApplicationFactory).Assembly, optional: true);
        });

        builder.ConfigureServices((context, services) =>
        {
            var config = context.Configuration;
            var testConn = config.GetConnectionString("TestConnection");

            if (string.IsNullOrWhiteSpace(testConn))
            {
                throw new InvalidOperationException("FAIL-CLOSED: Không tìm thấy ConnectionStrings:TestConnection trong User Secrets hoặc appsettings.Test.json. Hủy thực thi integration test.");
            }

            var builderConn = new Npgsql.NpgsqlConnectionStringBuilder(testConn);
            if (string.IsNullOrWhiteSpace(builderConn.Database) || builderConn.Database.Equals("techhub_pc", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("FAIL-CLOSED CẤM: Không được sử dụng hoặc fallback sang database 'techhub_pc'.");
            }

            if (!builderConn.Database.EndsWith("_test", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException($"FAIL-CLOSED: Tên database test phải kết thúc bằng '_test'. Database hiện tại: '{builderConn.Database}'");
            }

            // Verify PostgreSQL connection early
            try
            {
                using var conn = new Npgsql.NpgsqlConnection(testConn);
                conn.Open();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"FAIL-CLOSED: Không thể kết nối tới PostgreSQL database '{builderConn.Database}'. Lỗi: {ex.Message}", ex);
            }

            ConnectionString = testConn;

            // Remove existing DbContextOptions & AppDbContext registrations to prevent fallback
            var descriptors = services.Where(d => 
                d.ServiceType == typeof(DbContextOptions<AppDbContext>) || 
                d.ServiceType == typeof(DbContextOptions) ||
                d.ServiceType == typeof(AppDbContext)).ToList();

            foreach (var d in descriptors)
            {
                services.Remove(d);
            }

            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseNpgsql(testConn);
            });

            services.PostConfigure<Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerOptions>(
                Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme,
                options =>
                {
                    var kBytes = TechHub.Infrastructure.Security.JwtKeyValidator.GetValidatedKeyBytes(config);
                    options.TokenValidationParameters.ValidateIssuerSigningKey = true;
                    options.TokenValidationParameters.IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(kBytes);
                    options.TokenValidationParameters.ValidateIssuer = true;
                    options.TokenValidationParameters.ValidIssuer = config["Jwt:Issuer"] ?? "TechHub.Api";
                    options.TokenValidationParameters.ValidateAudience = true;
                    options.TokenValidationParameters.ValidAudience = config["Jwt:Audience"] ?? "TechHub.Frontend";
                    options.TokenValidationParameters.ValidateLifetime = true;
                    options.TokenValidationParameters.ClockSkew = TimeSpan.FromMinutes(1);
                });
        });
    }

    public async Task EnsureDatabaseMigratedAsync()
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();
    }

    public async Task ResetDatabaseAsync()
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.ExecuteSqlRawAsync(@"
            TRUNCATE TABLE audit_logs, reviews, inventory_transactions, order_items, orders, cart_items, carts, product_images, products, categories, user_roles, refresh_tokens, users, role_permissions, permissions, roles RESTART IDENTITY CASCADE;
        ");

        var adminRole = new TechHub.Domain.Entities.Role { Id = TechHub.Infrastructure.Persistence.Configurations.RoleConfiguration.AdminRoleId, Name = "Admin", Description = "Administrator Role", CreatedAtUtc = DateTimeOffset.UtcNow };
        var customerRole = new TechHub.Domain.Entities.Role { Id = TechHub.Infrastructure.Persistence.Configurations.RoleConfiguration.CustomerRoleId, Name = "Customer", Description = "Customer Role", CreatedAtUtc = DateTimeOffset.UtcNow };
        db.Roles.AddRange(adminRole, customerRole);

        var perms = new[] { "cart.manage", "orders.read.own", "orders.create", "products.manage", "orders.read.all", "orders.update", "inventory.manage", "reviews.manage" };
        foreach (var code in perms)
        {
            var p = new TechHub.Domain.Entities.Permission { Id = Guid.NewGuid(), Code = code, Description = code, CreatedAtUtc = DateTimeOffset.UtcNow };
            db.Permissions.Add(p);

            var isAdminPerm = code.StartsWith("products.") || code.StartsWith("inventory.") || code.StartsWith("reviews.") || code == "orders.read.all" || code == "orders.update";
            var targetRole = isAdminPerm ? adminRole : customerRole;
            db.RolePermissions.Add(new TechHub.Domain.Entities.RolePermission { RoleId = targetRole.Id, PermissionId = p.Id, AssignedAtUtc = DateTimeOffset.UtcNow });
        }

        await db.SaveChangesAsync();
    }
}

