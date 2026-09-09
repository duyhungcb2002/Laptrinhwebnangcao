using TechHub.Application.DTOs.Catalog;
using TechHub.Application.DTOs.Reviews;

namespace TechHub.Application.Common.Interfaces;

public interface IReviewService
{
    Task<ProductReviewsResponse> GetPublicProductReviewsAsync(Guid productId, int page, int pageSize, CancellationToken ct = default);
    Task<List<EligibleOrderItemDto>> GetEligibleOrderItemsAsync(Guid userId, Guid productId, CancellationToken ct = default);
    Task<ReviewDto> CreateReviewAsync(Guid userId, CreateReviewRequest request, CancellationToken ct = default);

    // Admin methods
    Task<PagedResult<AdminReviewDto>> GetAdminReviewsAsync(AdminReviewFilterParams filter, CancellationToken ct = default);
    Task<AdminReviewDto> UpdateReviewVisibilityAsync(Guid reviewId, UpdateReviewVisibilityRequest request, CancellationToken ct = default);
}
