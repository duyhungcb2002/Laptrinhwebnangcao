using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TechHub.Domain.Entities;

namespace TechHub.Infrastructure.Persistence.Configurations;

public class InventoryTransactionConfiguration : IEntityTypeConfiguration<InventoryTransaction>
{
    public void Configure(EntityTypeBuilder<InventoryTransaction> builder)
    {
        builder.ToTable("inventory_transactions");

        builder.HasKey(it => it.Id);

        builder.HasIndex(it => it.ProductId);
        builder.HasIndex(it => it.PerformedByUserId);

        builder.Property(it => it.Type)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(it => it.Note)
            .HasMaxLength(500);

        builder.HasOne(it => it.Product)
            .WithMany(p => p.InventoryTransactions)
            .HasForeignKey(it => it.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(it => it.PerformedByUser)
            .WithMany(u => u.InventoryTransactions)
            .HasForeignKey(it => it.PerformedByUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
