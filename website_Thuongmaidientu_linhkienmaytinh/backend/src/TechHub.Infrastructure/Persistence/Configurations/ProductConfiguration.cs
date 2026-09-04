using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TechHub.Domain.Entities;

namespace TechHub.Infrastructure.Persistence.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("products", t =>
        {
            t.HasCheckConstraint("CK_Product_Price", "\"Price\" >= 0");
            t.HasCheckConstraint("CK_Product_StockQuantity", "\"StockQuantity\" >= 0");
        });

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(p => p.Code)
            .IsUnique();

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(250);

        builder.HasIndex(p => p.Name);
        builder.HasIndex(p => p.CategoryId);
        builder.HasIndex(p => p.IsActive);

        builder.Property(p => p.Price)
            .HasPrecision(18, 2);

        builder.Property(p => p.OldPrice)
            .HasPrecision(18, 2);

        builder.Property(p => p.Description)
            .HasMaxLength(2000);

        builder.Property(p => p.ImageUrl)
            .HasMaxLength(500);

        builder.HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
