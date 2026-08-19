using Microsoft.EntityFrameworkCore;
using thuchanhtuan2.Models;

namespace thuchanhtuan2.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : DbContext(options)
{
    public DbSet<Programme> Programmes => Set<Programme>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Student> Students => Set<Student>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Student>()
            .HasOne(s => s.Programme)
            .WithMany(p => p.Students)
            .HasForeignKey(s => s.ProgrammeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Programme>()
            .Property(p => p.DurationYears)
            .HasColumnType("tinyint unsigned");

        modelBuilder.Entity<Course>()
            .Property(c => c.Credits)
            .HasColumnType("tinyint unsigned");
    }
}