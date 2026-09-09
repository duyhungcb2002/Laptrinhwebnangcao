using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using TechHub.Application.Common.Interfaces;
using TechHub.Infrastructure.Persistence;
using TechHub.Infrastructure.Security;
using TechHub.Infrastructure.Services;

namespace TechHub.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment? environment = null)
    {
        string connectionString;

        if (environment != null && environment.IsEnvironment("Testing"))
        {
            connectionString = configuration.GetConnectionString("TestConnection") ?? string.Empty;
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new InvalidOperationException("FAIL-CLOSED: ConnectionStrings:TestConnection is required in Testing environment and must not fall back to DefaultConnection.");
            }

            var builderConn = new Npgsql.NpgsqlConnectionStringBuilder(connectionString);
            if (string.IsNullOrWhiteSpace(builderConn.Database) || builderConn.Database.Equals("techhub_pc", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("FAIL-CLOSED CẤM: Không được sử dụng hoặc fallback sang database 'techhub_pc'.");
            }

            if (!builderConn.Database.EndsWith("_test", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException($"FAIL-CLOSED: Tên database test phải kết thúc bằng '_test'. Database hiện tại: '{builderConn.Database}'");
            }
        }
        else
        {
            connectionString = configuration.GetConnectionString("DefaultConnection") ?? string.Empty;
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new InvalidOperationException("FAIL-CLOSED: ConnectionStrings:DefaultConnection is required.");
            }
        }

        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddHealthChecks()
            .AddDbContextCheck<AppDbContext>(name: "database");

        // Services
        services.AddSingleton<IPasswordService, PasswordService>();
        services.AddSingleton<ITokenService, TokenService>();
        services.AddSingleton<IRefreshTokenService, RefreshTokenService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<ICartService, CartService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<IInventoryService, InventoryService>();
        services.AddScoped<IReviewService, ReviewService>();
        services.AddScoped<IReportService, ReportService>();

        // RBAC & Ownership Security Handlers
        services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
        services.AddSingleton<IAuthorizationHandler, PermissionAuthorizationHandler>();
        services.AddSingleton<IAuthorizationHandler, OrderAuthorizationHandler>();

        return services;
    }
}
