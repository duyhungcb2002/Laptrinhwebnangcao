using Microsoft.EntityFrameworkCore;
using thuchanhtuan2.Data;
using thuchanhtuan2.Dtos;
using thuchanhtuan2.Models;

namespace thuchanhtuan2.Services;

public sealed class StudentService(AppDbContext db) : IStudentService
{
    public async Task<IReadOnlyList<StudentResponseDto>> GetAllAsync(
        string? status, int page, int pageSize, CancellationToken ct)
    {
        var query = db.Students.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(status))
        {
            var normalizedStatus = status.Trim().ToUpperInvariant();
            query = query.Where(s => s.Status == normalizedStatus);
        }

        return await query
            .OrderBy(s => s.StudentCode)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new StudentResponseDto(
                s.StudentId,
                s.ProgrammeId,
                s.Programme.ProgrammeCode,
                s.Programme.ProgrammeName,
                s.StudentCode,
                s.FullName,
                s.Email,
                s.DateOfBirth,
                s.YearOfEntry,
                s.Status))
            .ToListAsync(ct);
    }

    public async Task<StudentResponseDto?> GetByIdAsync(
        long id, CancellationToken ct) =>
        await db.Students.AsNoTracking()
            .Where(s => s.StudentId == id)
            .Select(s => new StudentResponseDto(
                s.StudentId,
                s.ProgrammeId,
                s.Programme.ProgrammeCode,
                s.Programme.ProgrammeName,
                s.StudentCode,
                s.FullName,
                s.Email,
                s.DateOfBirth,
                s.YearOfEntry,
                s.Status))
            .SingleOrDefaultAsync(ct);

    public async Task<StudentResponseDto> CreateAsync(
        StudentCreateDto dto, CancellationToken ct)
    {
        var programmeExists = await db.Programmes.AnyAsync(
            p => p.ProgrammeId == dto.ProgrammeId, ct);

        if (!programmeExists)
        {
            throw new KeyNotFoundException(
                "Programme does not exist.");
        }

        var code = dto.StudentCode.Trim().ToUpperInvariant();
        var email = dto.Email.Trim().ToLowerInvariant();

        var duplicateExists = await db.Students.AnyAsync(
            s => s.StudentCode == code || s.Email == email, ct);

        if (duplicateExists)
        {
            throw new InvalidOperationException(
                "Student code or email already exists.");
        }

        var entity = new Student
        {
            ProgrammeId = dto.ProgrammeId,
            StudentCode = code,
            FullName = dto.FullName.Trim(),
            Email = email,
            DateOfBirth = dto.DateOfBirth,
            YearOfEntry = dto.YearOfEntry,
            Status = dto.Status.Trim().ToUpperInvariant()
        };

        db.Students.Add(entity);
        await db.SaveChangesAsync(ct);

        return (await GetByIdAsync(entity.StudentId, ct))!;
    }

    public async Task<StudentResponseDto?> UpdateAsync(
        long id, StudentUpdateDto dto, CancellationToken ct)
    {
        var entity = await db.Students.FindAsync([id], ct);
        if (entity is null)
            return null;

        var programmeExists = await db.Programmes.AnyAsync(
            p => p.ProgrammeId == dto.ProgrammeId, ct);

        if (!programmeExists)
        {
            throw new KeyNotFoundException(
                "Programme does not exist.");
        }

        var code = dto.StudentCode.Trim().ToUpperInvariant();
        var email = dto.Email.Trim().ToLowerInvariant();

        var duplicateExists = await db.Students.AnyAsync(
            s => s.StudentId != id &&
                 (s.StudentCode == code || s.Email == email), ct);

        if (duplicateExists)
        {
            throw new InvalidOperationException(
                "Student code or email already exists.");
        }

        entity.ProgrammeId = dto.ProgrammeId;
        entity.StudentCode = code;
        entity.FullName = dto.FullName.Trim();
        entity.Email = email;
        entity.DateOfBirth = dto.DateOfBirth;
        entity.YearOfEntry = dto.YearOfEntry;
        entity.Status = dto.Status.Trim().ToUpperInvariant();

        await db.SaveChangesAsync(ct);
        return await GetByIdAsync(id, ct);
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken ct)
    {
        var entity = await db.Students.FindAsync([id], ct);
        if (entity is null)
            return false;

        db.Students.Remove(entity);
        await db.SaveChangesAsync(ct);
        return true;
    }
}