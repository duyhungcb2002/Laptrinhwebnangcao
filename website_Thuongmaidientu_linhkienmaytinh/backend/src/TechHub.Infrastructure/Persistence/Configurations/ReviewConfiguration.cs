using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TechHub.Domain.Entities;

namespace TechHub.Infrastructure.Persistence.Configurations;

public class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> builder)
    {
        builder.ToTable("reviews", t =>
        {
            t.HasCheckConstraint("CK_Review_Rating", "\"Rating\" >= 1 AND \"Rating\" <= 5");
        });

        builder.HasKey(r => r.Id);

        builder.HasIndex(r => r.UserId);
        builder.HasIndex(r => r.ProductId);

        builder.HasIndex(r => r.OrderItemId)
            .IsUnique();

        builder.Property(r => r.Comment)
            .HasMaxLength(2000);

        builder.HasOne(r => r.User)
            .WithMany(u => u.Reviews)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Product)
            .WithMany(p => p.Reviews)
            .HasForeignKey(r => r.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.OrderItem)
            .WithOne()
            .HasForeignKey<Review>(r => r.OrderItemId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
