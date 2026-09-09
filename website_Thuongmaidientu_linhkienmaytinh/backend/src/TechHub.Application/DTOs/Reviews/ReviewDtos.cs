namespace TechHub.Application.DTOs.Reviews;

public class ReviewDto
{
    public Guid ReviewId { get; set; }
    public Guid ProductId { get; set; }
    public string UserDisplayName { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public bool IsVisible { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
}

public class AdminReviewDto
{
    public Guid ReviewId { get; set; }
    public Guid ProductId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string ReviewerDisplayName { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public bool IsVisible { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
}

public class ProductReviewsResponse
{
    public Guid ProductId { get; set; }
    public double AverageRating { get; set; }
    public int TotalReviews { get; set; }
    public IEnumerable<ReviewDto> Items { get; set; } = new List<ReviewDto>();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public long TotalItems { get; set; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalItems / PageSize) : 0;
}

public class EligibleOrderItemDto
{
    public Guid OrderItemId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public DateTimeOffset CompletedAtOrOrderDate { get; set; }
    public bool EligibleToReview { get; set; } = true;
}

public class CreateReviewRequest
{
    public Guid OrderItemId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
}

public class UpdateReviewVisibilityRequest
{
    public bool IsVisible { get; set; }
}

public class AdminReviewFilterParams
{
    public string? Search { get; set; }
    public bool? IsVisible { get; set; }
    public int? Rating { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

