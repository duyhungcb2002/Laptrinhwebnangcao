using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TechHub.Domain.Entities;

namespace TechHub.Infrastructure.Persistence.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("categories");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(c => c.Code)
            .IsUnique();

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(150);

        builder.HasIndex(c => c.Name);
        builder.HasIndex(c => c.IsActive);

        builder.Property(c => c.Description)
            .HasMaxLength(500);

        var seedDate = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero);

        builder.HasData(
            new Category
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                Code = "CPU",
                Name = "Bộ vi xử lý (CPU)",
                Description = "Các dòng vi xử lý Intel và AMD chính hãng",
                IsActive = true,
                CreatedAtUtc = seedDate
            },
            new Category
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                Code = "VGA",
                Name = "Card màn hình (VGA)",
                Description = "Card đồ họa NVIDIA RTX và AMD Radeon",
                IsActive = true,
                CreatedAtUtc = seedDate
            },
            new Category
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                Code = "RAM",
                Name = "Bộ nhớ trong (RAM)",
                Description = "RAM DDR4, DDR5 cho PC và Laptop",
                IsActive = true,
                CreatedAtUtc = seedDate
            },
            new Category
            {
                Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
                Code = "MAINBOARD",
                Name = "Bo mạch chủ (Mainboard)",
                Description = "Bo mạch chủ hỗ trợ các socket vi xử lý mới nhất",
                IsActive = true,
                CreatedAtUtc = seedDate
            },
            new Category
            {
                Id = Guid.Parse("55555555-5555-5555-5555-555555555555"),
                Code = "SSD",
                Name = "Ổ cứng SSD",
                Description = "Ổ cứng thể rắn NVMe PCIe và SATA3",
                IsActive = true,
                CreatedAtUtc = seedDate
            },
            new Category
            {
                Id = Guid.Parse("66666666-6666-6666-6666-666666666666"),
                Code = "PSU",
                Name = "Nguồn máy tính (PSU)",
                Description = "Nguồn công suất thực chuẩn 80 Plus",
                IsActive = true,
                CreatedAtUtc = seedDate
            },
            new Category
            {
                Id = Guid.Parse("77777777-7777-7777-7777-777777777777"),
                Code = "COOLING",
                Name = "Tản nhiệt (Cooling)",
                Description = "Tản nhiệt khí và tản nhiệt nước AIO",
                IsActive = true,
                CreatedAtUtc = seedDate
            }
        );
    }
}
