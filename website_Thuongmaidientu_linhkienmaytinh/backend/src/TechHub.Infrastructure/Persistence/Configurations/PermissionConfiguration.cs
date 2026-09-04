using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TechHub.Domain.Entities;

namespace TechHub.Infrastructure.Persistence.Configurations;

public class PermissionConfiguration : IEntityTypeConfiguration<Permission>
{
    public static readonly Guid AdminAccessId = Guid.Parse("20000000-0000-0000-0000-000000000001");
    public static readonly Guid ProfileReadId = Guid.Parse("20000000-0000-0000-0000-000000000002");
    public static readonly Guid ProfileUpdateId = Guid.Parse("20000000-0000-0000-0000-000000000003");
    public static readonly Guid CartManageId = Guid.Parse("20000000-0000-0000-0000-000000000004");
    public static readonly Guid OrdersReadOwnId = Guid.Parse("20000000-0000-0000-0000-000000000005");
    public static readonly Guid OrdersReadAllId = Guid.Parse("20000000-0000-0000-0000-000000000006");
    public static readonly Guid OrdersUpdateId = Guid.Parse("20000000-0000-0000-0000-000000000007");
    public static readonly Guid ProductsManageId = Guid.Parse("20000000-0000-0000-0000-000000000008");
    public static readonly Guid CategoriesManageId = Guid.Parse("20000000-0000-0000-0000-000000000009");
    public static readonly Guid InventoryManageId = Guid.Parse("20000000-0000-0000-0000-000000000010");
    public static readonly Guid UsersManageId = Guid.Parse("20000000-0000-0000-0000-000000000011");
    public static readonly Guid ReviewsCreateId = Guid.Parse("20000000-0000-0000-0000-000000000012");
    public static readonly Guid ReviewsManageId = Guid.Parse("20000000-0000-0000-0000-000000000013");
    public static readonly Guid ReportsReadId = Guid.Parse("20000000-0000-0000-0000-000000000014");

    public void Configure(EntityTypeBuilder<Permission> builder)
    {
        builder.ToTable("permissions");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Code)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(p => p.Code)
            .IsUnique();

        builder.Property(p => p.Description)
            .HasMaxLength(250);

        var seedDate = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero);

        builder.HasData(
            new Permission { Id = AdminAccessId, Code = "admin.access", Description = "Truy cập giao diện quản trị Admin", CreatedAtUtc = seedDate },
            new Permission { Id = ProfileReadId, Code = "profile.read", Description = "Xem thông tin cá nhân", CreatedAtUtc = seedDate },
            new Permission { Id = ProfileUpdateId, Code = "profile.update", Description = "Cập nhật thông tin cá nhân", CreatedAtUtc = seedDate },
            new Permission { Id = CartManageId, Code = "cart.manage", Description = "Quản lý giỏ hàng cá nhân", CreatedAtUtc = seedDate },
            new Permission { Id = OrdersReadOwnId, Code = "orders.read.own", Description = "Xem đơn hàng của chính mình", CreatedAtUtc = seedDate },
            new Permission { Id = OrdersReadAllId, Code = "orders.read.all", Description = "Xem tất cả đơn hàng hệ thống", CreatedAtUtc = seedDate },
            new Permission { Id = OrdersUpdateId, Code = "orders.update", Description = "Cập nhật trạng thái đơn hàng", CreatedAtUtc = seedDate },
            new Permission { Id = ProductsManageId, Code = "products.manage", Description = "Quản lý sản phẩm", CreatedAtUtc = seedDate },
            new Permission { Id = CategoriesManageId, Code = "categories.manage", Description = "Quản lý danh mục sản phẩm", CreatedAtUtc = seedDate },
            new Permission { Id = InventoryManageId, Code = "inventory.manage", Description = "Quản lý kho hàng", CreatedAtUtc = seedDate },
            new Permission { Id = UsersManageId, Code = "users.manage", Description = "Quản lý người dùng hệ thống", CreatedAtUtc = seedDate },
            new Permission { Id = ReviewsCreateId, Code = "reviews.create", Description = "Viết đánh giá sản phẩm", CreatedAtUtc = seedDate },
            new Permission { Id = ReviewsManageId, Code = "reviews.manage", Description = "Quản lý đánh giá sản phẩm", CreatedAtUtc = seedDate },
            new Permission { Id = ReportsReadId, Code = "reports.read", Description = "Xem báo cáo thống kê", CreatedAtUtc = seedDate }
        );
    }
}
