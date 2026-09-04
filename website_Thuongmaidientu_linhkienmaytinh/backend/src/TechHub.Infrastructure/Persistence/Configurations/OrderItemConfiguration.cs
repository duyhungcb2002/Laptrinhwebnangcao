using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TechHub.Domain.Entities;

namespace TechHub.Infrastructure.Persistence.Configurations;

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.ToTable("order_items", t =>
        {
            t.HasCheckConstraint("CK_OrderItem_Quantity", "\"Quantity\" > 0");
            t.HasCheckConstraint("CK_OrderItem_UnitPrice", "\"UnitPrice\" >= 0");
            t.HasCheckConstraint("CK_OrderItem_LineTotal", "\"LineTotal\" >= 0");
        });

        builder.HasKey(oi => oi.Id);

        builder.HasIndex(oi => oi.OrderId);
        builder.HasIndex(oi => oi.ProductId);

        builder.Property(oi => oi.ProductCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(oi => oi.ProductName)
            .IsRequired()
            .HasMaxLength(250);

        builder.Property(oi => oi.UnitPrice)
            .HasPrecision(18, 2);

        builder.Property(oi => oi.LineTotal)
            .HasPrecision(18, 2);

        builder.HasOne(oi => oi.Order)
            .WithMany(o => o.OrderItems)
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(oi => oi.Product)
            .WithMany(p => p.OrderItems)
            .HasForeignKey(oi => oi.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
