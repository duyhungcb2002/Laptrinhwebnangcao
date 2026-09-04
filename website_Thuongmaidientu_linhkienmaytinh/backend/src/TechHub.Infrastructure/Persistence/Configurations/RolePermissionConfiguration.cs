using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TechHub.Domain.Entities;

namespace TechHub.Infrastructure.Persistence.Configurations;

public class RolePermissionConfiguration : IEntityTypeConfiguration<RolePermission>
{
    public void Configure(EntityTypeBuilder<RolePermission> builder)
    {
        builder.ToTable("role_permissions");

        builder.HasKey(rp => new { rp.RoleId, rp.PermissionId });

        builder.HasOne(rp => rp.Role)
            .WithMany(r => r.RolePermissions)
            .HasForeignKey(rp => rp.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(rp => rp.Permission)
            .WithMany(p => p.RolePermissions)
            .HasForeignKey(rp => rp.PermissionId)
            .OnDelete(DeleteBehavior.Cascade);

        var seedDate = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero);

        var rolePermissions = new List<RolePermission>();

        // Customer Role Permissions
        var customerPermIds = new[]
        {
            PermissionConfiguration.ProfileReadId,
            PermissionConfiguration.ProfileUpdateId,
            PermissionConfiguration.CartManageId,
            PermissionConfiguration.OrdersReadOwnId,
            PermissionConfiguration.ReviewsCreateId
        };

        foreach (var permId in customerPermIds)
        {
            rolePermissions.Add(new RolePermission
            {
                RoleId = RoleConfiguration.CustomerRoleId,
                PermissionId = permId,
                AssignedAtUtc = seedDate
            });
        }

        // Admin Role Permissions (All 14)
        var allPermIds = new[]
        {
            PermissionConfiguration.AdminAccessId,
            PermissionConfiguration.ProfileReadId,
            PermissionConfiguration.ProfileUpdateId,
            PermissionConfiguration.CartManageId,
            PermissionConfiguration.OrdersReadOwnId,
            PermissionConfiguration.OrdersReadAllId,
            PermissionConfiguration.OrdersUpdateId,
            PermissionConfiguration.ProductsManageId,
            PermissionConfiguration.CategoriesManageId,
            PermissionConfiguration.InventoryManageId,
            PermissionConfiguration.UsersManageId,
            PermissionConfiguration.ReviewsCreateId,
            PermissionConfiguration.ReviewsManageId,
            PermissionConfiguration.ReportsReadId
        };

        foreach (var permId in allPermIds)
        {
            rolePermissions.Add(new RolePermission
            {
                RoleId = RoleConfiguration.AdminRoleId,
                PermissionId = permId,
                AssignedAtUtc = seedDate
            });
        }

        builder.HasData(rolePermissions);
    }
}
