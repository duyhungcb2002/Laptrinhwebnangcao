using TechHub.Application.DTOs.Catalog;

namespace TechHub.Application.Common.Interfaces;

public interface ICategoryService
{
    Task<IEnumerable<CategoryDto>> GetPublicCategoriesAsync(CancellationToken ct = default);
    Task<IEnumerable<CategoryDto>> GetAllAdminCategoriesAsync(CancellationToken ct = default);
    Task<CategoryDto> GetCategoryByIdAsync(Guid id, CancellationToken ct = default);
    Task<CategoryDto> CreateCategoryAsync(CreateCategoryRequest request, CancellationToken ct = default);
    Task<CategoryDto> UpdateCategoryAsync(Guid id, UpdateCategoryRequest request, CancellationToken ct = default);
    Task SoftDeleteCategoryAsync(Guid id, CancellationToken ct = default);
}
