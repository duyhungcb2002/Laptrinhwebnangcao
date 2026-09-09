using TechHub.Application.DTOs.Catalog;

namespace TechHub.Application.Common.Interfaces;

public interface IProductService
{
    Task<PagedResult<ProductDto>> GetPublicProductsAsync(ProductFilterParams filter, CancellationToken ct = default);
    Task<ProductDetailDto> GetPublicProductByIdAsync(Guid id, CancellationToken ct = default);
    Task<PagedResult<ProductDto>> GetAdminProductsAsync(ProductFilterParams filter, CancellationToken ct = default);
    Task<ProductDetailDto> GetAdminProductByIdAsync(Guid id, CancellationToken ct = default);
    Task<ProductDto> CreateProductAsync(Guid actorUserId, string? ipAddress, CreateProductRequest request, CancellationToken ct = default);
    Task<ProductDto> UpdateProductAsync(Guid id, UpdateProductRequest request, CancellationToken ct = default);
    Task SoftDeleteProductAsync(Guid id, CancellationToken ct = default);
    Task<ProductDto> RestoreProductAsync(Guid id, CancellationToken ct = default);
    Task<ProductImageDto> UploadProductImageAsync(Guid productId, UploadProductImageInput input, CancellationToken ct = default);
    Task DeleteProductImageAsync(Guid productId, Guid imageId, CancellationToken ct = default);
}
