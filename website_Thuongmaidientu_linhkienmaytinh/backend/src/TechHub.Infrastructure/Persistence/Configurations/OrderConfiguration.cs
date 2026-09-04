using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TechHub.Domain.Entities;

namespace TechHub.Infrastructure.Persistence.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("orders", t =>
        {
            t.HasCheckConstraint("CK_Order_Subtotal", "\"Subtotal\" >= 0");
            t.HasCheckConstraint("CK_Order_ShippingFee", "\"ShippingFee\" >= 0");
            t.HasCheckConstraint("CK_Order_Total", "\"Total\" >= 0");
        });

        builder.HasKey(o => o.Id);

        builder.Property(o => o.OrderNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(o => o.OrderNumber)
            .IsUnique();

        builder.HasIndex(o => o.UserId);

        builder.Property(o => o.Status)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(o => o.PaymentMethod)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(o => o.RecipientName)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(o => o.PhoneNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(o => o.ShippingAddress)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(o => o.Subtotal)
            .HasPrecision(18, 2);

        builder.Property(o => o.ShippingFee)
            .HasPrecision(18, 2);

        builder.Property(o => o.Total)
            .HasPrecision(18, 2);

        builder.HasOne(o => o.User)
            .WithMany(u => u.Orders)
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
