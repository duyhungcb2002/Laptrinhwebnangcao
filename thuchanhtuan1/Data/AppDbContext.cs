using Microsoft.EntityFrameworkCore;
using RbacApi.Entities;

namespace RbacApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(u => u.Id);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Email).IsRequired().HasMaxLength(255);
            entity.Property(u => u.DisplayName).IsRequired().HasMaxLength(150);
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.Property(u => u.IsActive).HasDefaultValue(true);
            entity.Property(u => u.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("roles");
            entity.HasKey(r => r.Id);
            entity.HasIndex(r => r.Name).IsUnique();
            entity.Property(r => r.Name).IsRequired().HasMaxLength(100);
            entity.Property(r => r.Description).HasMaxLength(255);
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.ToTable("permissions");
            entity.HasKey(p => p.Id);
            entity.HasIndex(p => p.Code).IsUnique();
            entity.Property(p => p.Code).IsRequired().HasMaxLength(100);
            entity.Property(p => p.Description).HasMaxLength(255);
        });

        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.ToTable("user_roles");
            entity.HasKey(ur => new { ur.UserId, ur.RoleId });

            entity.HasOne(ur => ur.User)
                .WithMany(u => u.UserRoles)
                .HasForeignKey(ur => ur.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(ur => ur.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(ur => ur.RoleId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<RolePermission>(entity =>
        {
            entity.ToTable("role_permissions");
            entity.HasKey(rp => new { rp.RoleId, rp.PermissionId });

            entity.HasOne(rp => rp.Role)
                .WithMany(r => r.RolePermissions)
                .HasForeignKey(rp => rp.RoleId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(rp => rp.Permission)
                .WithMany(p => p.RolePermissions)
                .HasForeignKey(rp => rp.PermissionId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
