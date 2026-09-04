using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TechHub.Domain.Entities;

namespace TechHub.Infrastructure.Persistence.Configurations;

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public static readonly Guid AdminRoleId = Guid.Parse("10000000-0000-0000-0000-000000000001");
    public static readonly Guid CustomerRoleId = Guid.Parse("10000000-0000-0000-0000-000000000002");

    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.ToTable("roles");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Name)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(r => r.Name)
            .IsUnique();

        builder.Property(r => r.Description)
            .HasMaxLength(250);

        var seedDate = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero);

        builder.HasData(
            new Role
            {
                Id = AdminRoleId,
                Name = "Admin",
                Description = "Quản trị viên hệ thống có toàn quyền",
                IsSystem = true,
                CreatedAtUtc = seedDate
            },
            new Role
            {
                Id = CustomerRoleId,
                Name = "Customer",
                Description = "Khách hàng mua sắm trên hệ thống",
                IsSystem = true,
                CreatedAtUtc = seedDate
            }
        );
    }
}
