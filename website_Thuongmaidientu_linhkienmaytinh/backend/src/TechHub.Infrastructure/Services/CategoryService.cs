using Microsoft.EntityFrameworkCore;
using Npgsql;
using TechHub.Application.Common.Exceptions;
using TechHub.Application.Common.Interfaces;
using TechHub.Application.DTOs.Catalog;
using TechHub.Domain.Entities;
using TechHub.Infrastructure.Persistence;

namespace TechHub.Infrastructure.Services;

public class CategoryService : ICategoryService
{
    private readonly AppDbContext _context;

    public CategoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CategoryDto>> GetPublicCategoriesAsync(CancellationToken ct = default)
    {
        return await _context.Categories
            .AsNoTracking()
            .Where(c => c.IsActive)
            .OrderBy(c => c.Name)
            .Select(c => MapToDto(c))
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<CategoryDto>> GetAllAdminCategoriesAsync(CancellationToken ct = default)
    {
        return await _context.Categories
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .Select(c => MapToDto(c))
            .ToListAsync(ct);
    }

    public async Task<CategoryDto> GetCategoryByIdAsync(Guid id, CancellationToken ct = default)
    {
        var category = await _context.Categories
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id, ct);

        if (category == null)
        {
            throw new NotFoundException($"Không tìm thấy danh mục với ID '{id}'.");
        }

        return MapToDto(category);
    }

    public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Code))
        {
            throw new ArgumentException("Mã danh mục không được để trống.");
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ArgumentException("Tên danh mục không được để trống.");
        }

        var normalizedCode = request.Code.Trim().ToUpperInvariant();
        var exists = await _context.Categories
            .AnyAsync(c => c.Code.ToUpper() == normalizedCode, ct);

        if (exists)
        {
            throw new ConflictException($"Mã danh mục '{normalizedCode}' đã tồn tại trong hệ thống.");
        }

        var category = new Category
        {
            Id = Guid.NewGuid(),
            Code = normalizedCode,
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            IsActive = request.IsActive,
            CreatedAtUtc = DateTimeOffset.UtcNow
        };

        _context.Categories.Add(category);
        await SafeSaveChangesAsync(ct, $"Mã danh mục '{normalizedCode}' đã tồn tại trong hệ thống.");

        return MapToDto(category);
    }

    public async Task<CategoryDto> UpdateCategoryAsync(Guid id, UpdateCategoryRequest request, CancellationToken ct = default)
    {
        var category = await _context.Categories.FirstOrDefaultAsync(c => c.Id == id, ct);

        if (category == null)
        {
            throw new NotFoundException($"Không tìm thấy danh mục với ID '{id}'.");
        }

        if (string.IsNullOrWhiteSpace(request.Code))
        {
            throw new ArgumentException("Mã danh mục không được để trống.");
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ArgumentException("Tên danh mục không được để trống.");
        }

        var normalizedCode = request.Code.Trim().ToUpperInvariant();
        var exists = await _context.Categories
            .AnyAsync(c => c.Id != id && c.Code.ToUpper() == normalizedCode, ct);

        if (exists)
        {
            throw new ConflictException($"Mã danh mục '{normalizedCode}' đã tồn tại trong hệ thống.");
        }

        category.Code = normalizedCode;
        category.Name = request.Name.Trim();
        category.Description = request.Description?.Trim();
        category.IsActive = request.IsActive;

        await SafeSaveChangesAsync(ct, $"Mã danh mục '{normalizedCode}' đã tồn tại trong hệ thống.");

        return MapToDto(category);
    }

    public async Task SoftDeleteCategoryAsync(Guid id, CancellationToken ct = default)
    {
        var category = await _context.Categories.FirstOrDefaultAsync(c => c.Id == id, ct);

        if (category == null)
        {
            throw new NotFoundException($"Không tìm thấy danh mục với ID '{id}'.");
        }

        category.IsActive = false;
        await _context.SaveChangesAsync(ct);
    }

    private async Task SafeSaveChangesAsync(CancellationToken ct, string conflictMessage)
    {
        try
        {
            await _context.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex)
        {
            if (ex.InnerException is PostgresException pex && pex.SqlState == PostgresErrorCodes.UniqueViolation)
            {
                throw new ConflictException(conflictMessage, ex);
            }
            throw;
        }
    }

    private static CategoryDto MapToDto(Category c) => new()
    {
        Id = c.Id,
        Code = c.Code,
        Name = c.Name,
        Description = c.Description,
        IsActive = c.IsActive,
        CreatedAtUtc = c.CreatedAtUtc
    };
}
