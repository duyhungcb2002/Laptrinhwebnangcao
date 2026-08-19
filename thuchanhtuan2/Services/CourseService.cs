using Microsoft.EntityFrameworkCore;
using thuchanhtuan2.Data;
using thuchanhtuan2.Dtos;
using thuchanhtuan2.Models;

namespace thuchanhtuan2.Services;

public sealed class CourseService(AppDbContext db) : ICourseService
{
    public async Task<IReadOnlyList<CourseResponseDto>> GetAllAsync(
        CancellationToken ct) =>
        await db.Courses.AsNoTracking()
            .OrderBy(c => c.CourseCode)
            .Select(c => new CourseResponseDto(
                c.CourseId,
                c.CourseCode,
                c.CourseName,
                c.Credits,
                c.IsActive))
            .ToListAsync(ct);

    public async Task<CourseResponseDto?> GetByIdAsync(
        long id, CancellationToken ct) =>
        await db.Courses.AsNoTracking()
            .Where(c => c.CourseId == id)
            .Select(c => new CourseResponseDto(
                c.CourseId,
                c.CourseCode,
                c.CourseName,
                c.Credits,
                c.IsActive))
            .SingleOrDefaultAsync(ct);

    public async Task<CourseResponseDto> CreateAsync(
        CourseCreateDto dto, CancellationToken ct)
    {
        var code = dto.CourseCode.Trim().ToUpperInvariant();

        if (await db.Courses.AnyAsync(c => c.CourseCode == code, ct))
        {
            throw new InvalidOperationException(
                "Course code already exists.");
        }

        var entity = new Course
        {
            CourseCode = code,
            CourseName = dto.CourseName.Trim(),
            Credits = dto.Credits,
            IsActive = dto.IsActive
        };

        db.Courses.Add(entity);
        await db.SaveChangesAsync(ct);

        return Map(entity);
    }

    public async Task<CourseResponseDto?> UpdateAsync(
        long id, CourseUpdateDto dto, CancellationToken ct)
    {
        var entity = await db.Courses.FindAsync([id], ct);
        if (entity is null)
            return null;

        var code = dto.CourseCode.Trim().ToUpperInvariant();

        if (await db.Courses.AnyAsync(
                c => c.CourseId != id && c.CourseCode == code, ct))
        {
            throw new InvalidOperationException(
                "Course code already exists.");
        }

        entity.CourseCode = code;
        entity.CourseName = dto.CourseName.Trim();
        entity.Credits = dto.Credits;
        entity.IsActive = dto.IsActive;

        await db.SaveChangesAsync(ct);
        return Map(entity);
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken ct)
    {
        var entity = await db.Courses.FindAsync([id], ct);
        if (entity is null)
            return false;

        db.Courses.Remove(entity);
        await db.SaveChangesAsync(ct);
        return true;
    }

    private static CourseResponseDto Map(Course entity) =>
        new(
            entity.CourseId,
            entity.CourseCode,
            entity.CourseName,
            entity.Credits,
            entity.IsActive);
}