using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using TechHub.Application.Common.Interfaces;
using TechHub.Application.DTOs.Catalog;
using TechHub.Application.DTOs.Reviews;
using TechHub.Infrastructure.Security;

namespace TechHub.Api.Controllers;

[ApiController]
[Route("api")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    private Guid GetUserId()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
        {
            throw new UnauthorizedAccessException("Không xác định được danh tính người dùng.");
        }
        return userId;
    }

    [HttpGet("products/{productId:guid}/reviews")]
    public async Task<ActionResult<ProductReviewsResponse>> GetPublicProductReviews(
        Guid productId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        var result = await _reviewService.GetPublicProductReviewsAsync(productId, page, pageSize, ct);
        return Ok(result);
    }

    [HttpGet("reviews/eligible-order-items")]
    [HasPermission("reviews.create")]
    public async Task<ActionResult<List<EligibleOrderItemDto>>> GetEligibleOrderItems(
        [FromQuery] Guid productId,
        CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await _reviewService.GetEligibleOrderItemsAsync(userId, productId, ct);
        return Ok(result);
    }

    [HttpPost("reviews")]
    [HasPermission("reviews.create")]
    public async Task<ActionResult<ReviewDto>> CreateReview(
        [FromBody] CreateReviewRequest request,
        CancellationToken ct)
    {
        var userId = GetUserId();
        var review = await _reviewService.CreateReviewAsync(userId, request, ct);
        return StatusCode(201, review);
    }
}

[ApiController]
[Route("api/admin/reviews")]
[HasPermission("reviews.manage")]
public class AdminReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public AdminReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<AdminReviewDto>>> GetAdminReviews(
        [FromQuery] AdminReviewFilterParams filter,
        CancellationToken ct)
    {
        var result = await _reviewService.GetAdminReviewsAsync(filter, ct);
        return Ok(result);
    }

    [HttpPatch("{id:guid}/visibility")]
    public async Task<ActionResult<AdminReviewDto>> UpdateReviewVisibility(
        Guid id,
        [FromBody] UpdateReviewVisibilityRequest request,
        CancellationToken ct)
    {
        var review = await _reviewService.UpdateReviewVisibilityAsync(id, request, ct);
        return Ok(review);
    }
}

