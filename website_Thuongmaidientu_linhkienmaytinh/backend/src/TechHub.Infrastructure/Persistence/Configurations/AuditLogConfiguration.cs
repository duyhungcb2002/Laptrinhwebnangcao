using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TechHub.Domain.Entities;

namespace TechHub.Infrastructure.Persistence.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("audit_logs");

        builder.HasKey(al => al.Id);

        builder.HasIndex(al => al.UserId);

        builder.Property(al => al.Action)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(al => al.EntityType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(al => al.EntityId)
            .HasMaxLength(100);

        builder.Property(al => al.IpAddress)
            .HasMaxLength(45);

        builder.HasOne(al => al.User)
            .WithMany(u => u.AuditLogs)
            .HasForeignKey(al => al.UserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
