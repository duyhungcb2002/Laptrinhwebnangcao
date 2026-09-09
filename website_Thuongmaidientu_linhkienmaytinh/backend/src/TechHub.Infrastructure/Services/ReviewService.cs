using Npgsql;
using Microsoft.EntityFrameworkCore;
using TechHub.Application.Common.Exceptions;
using TechHub.Application.Common.Interfaces;
using TechHub.Application.DTOs.Catalog;
using TechHub.Application.DTOs.Reviews;
using TechHub.Domain.Entities;
using TechHub.Infrastructure.Persistence;
using TechHub.Infrastructure.Security;

namespace TechHub.Infrastructure.Services;

public class ReviewService : IReviewService
{
    private readonly AppDbContext _context;

    public ReviewService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ProductReviewsResponse> GetPublicProductReviewsAsync(Guid productId, int page, int pageSize, CancellationToken ct = default)
    {
        if (page < 1)
        {
            throw new ArgumentException("Trang (page) phải lớn hơn hoặc bằng 1.");
        }
        if (pageSize < 1 || pageSize > 100)
        {
            throw new ArgumentException("Kích thước trang (pageSize) phải nằm trong khoảng từ 1 đến 100.");
        }

        var productExists = await _context.Products
            .Include(p => p.Category)
            .AnyAsync(p => p.Id == productId && p.IsActive && p.Category.IsActive, ct);

        if (!productExists)
        {
            throw new NotFoundException($"Sản phẩm với ID '{productId}' không tồn tại hoặc đã bị ẩn.");
        }

        var baseQuery = _context.Reviews
            .Where(r => r.ProductId == productId && r.IsVisible)
            .AsNoTracking();

        var totalReviews = await baseQuery.CountAsync(ct);
        var averageRating = totalReviews > 0 ? await baseQuery.AverageAsync(r => r.Rating, ct) : 0.0;

        var reviews = await baseQuery
            .Include(r => r.User)
            .OrderByDescending(r => r.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var dtos = reviews.Select(r => new ReviewDto
        {
            ReviewId = r.Id,
            ProductId = r.ProductId,
            UserDisplayName = r.User?.FullName ?? "Khách hàng TechHub",
            Rating = r.Rating,
            Comment = r.Comment,
            IsVisible = r.IsVisible,
            CreatedAtUtc = r.CreatedAtUtc
        }).ToList();

        return new ProductReviewsResponse
        {
            ProductId = productId,
            AverageRating = Math.Round(averageRating, 1),
            TotalReviews = totalReviews,
            Items = dtos,
            Page = page,
            PageSize = pageSize,
            TotalItems = totalReviews
        };
    }

    public async Task<List<EligibleOrderItemDto>> GetEligibleOrderItemsAsync(Guid userId, Guid productId, CancellationToken ct = default)
    {
        // Find OrderItems for Completed orders of this user for given productId that don't have a review yet
        var eligibleItems = await _context.OrderItems
            .Include(oi => oi.Order)
            .Where(oi => oi.Order.UserId == userId &&
                         oi.Order.Status == Domain.Enums.OrderStatus.Completed &&
                         oi.ProductId == productId &&
                         !_context.Reviews.Any(r => r.OrderItemId == oi.Id))
            .AsNoTracking()
            .ToListAsync(ct);

        return eligibleItems.Select(oi => new EligibleOrderItemDto
        {
            OrderItemId = oi.Id,
            OrderNumber = oi.Order.OrderNumber,
            ProductId = oi.ProductId,
            ProductName = oi.ProductName,
            CompletedAtOrOrderDate = oi.Order.UpdatedAtUtc ?? oi.Order.CreatedAtUtc,
            EligibleToReview = true
        }).ToList();
    }

    public async Task<ReviewDto> CreateReviewAsync(Guid userId, CreateReviewRequest request, CancellationToken ct = default)
    {
        ProductionValidators.ValidateReviewRating(request.Rating);

        if (!string.IsNullOrWhiteSpace(request.Comment) && request.Comment.Length > 2000)
        {
            throw new ArgumentException("Nội dung nhận xét tối đa 2000 ký tự.");
        }

        var orderItem = await _context.OrderItems
            .Include(oi => oi.Order)
            .Include(oi => oi.Product)
            .FirstOrDefaultAsync(oi => oi.Id == request.OrderItemId, ct);

        if (orderItem == null)
        {
            throw new NotFoundException($"Sản phẩm trong đơn hàng (OrderItemId '{request.OrderItemId}') không tồn tại.");
        }

        if (orderItem.Order.UserId != userId)
        {
            throw new ForbiddenAccessException("Bạn không có quyền đánh giá sản phẩm từ đơn hàng của tài khoản khác.");
        }

        if (orderItem.Order.Status != Domain.Enums.OrderStatus.Completed)
        {
            throw new ConflictException("Chỉ có thể đánh giá sản phẩm khi đơn hàng đã chuyển sang trạng thái 'Completed'.");
        }

        var existingReview = await _context.Reviews.AnyAsync(r => r.OrderItemId == request.OrderItemId, ct);
        if (existingReview)
        {
            throw new ConflictException("Sản phẩm trong đơn hàng này đã được đánh giá trước đó.");
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);

        var review = new Review
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ProductId = orderItem.ProductId,
            OrderItemId = orderItem.Id,
            Rating = request.Rating,
            Comment = request.Comment?.Trim(),
            IsVisible = true,
            CreatedAtUtc = DateTimeOffset.UtcNow
        };

        _context.Reviews.Add(review);

        try
        {
            await _context.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException pgEx && pgEx.SqlState == PostgresErrorCodes.UniqueViolation)
        {
            throw new ConflictException("Sản phẩm trong đơn hàng này đã được đánh giá trước đó.");
        }

        return new ReviewDto
        {
            ReviewId = review.Id,
            ProductId = review.ProductId,
            UserDisplayName = user?.FullName ?? "Khách hàng TechHub",
            Rating = review.Rating,
            Comment = review.Comment,
            IsVisible = review.IsVisible,
            CreatedAtUtc = review.CreatedAtUtc
        };
    }

    public async Task<PagedResult<AdminReviewDto>> GetAdminReviewsAsync(AdminReviewFilterParams filter, CancellationToken ct = default)
    {
        if (filter.Page < 1)
        {
            throw new ArgumentException("Trang (page) phải lớn hơn hoặc bằng 1.");
        }
        if (filter.PageSize < 1 || filter.PageSize > 100)
        {
            throw new ArgumentException("Kích thước trang (pageSize) phải nằm trong khoảng từ 1 đến 100.");
        }
        if (filter.Rating.HasValue && (filter.Rating.Value < 1 || filter.Rating.Value > 5))
        {
            throw new ArgumentException("Điểm đánh giá (Rating) phải từ 1 đến 5 sao.");
        }

        var query = _context.Reviews
            .Include(r => r.Product)
            .Include(r => r.User)
            .AsNoTracking();

        if (filter.IsVisible.HasValue)
        {
            query = query.Where(r => r.IsVisible == filter.IsVisible.Value);
        }

        if (filter.Rating.HasValue)
        {
            query = query.Where(r => r.Rating == filter.Rating.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim().ToLower();
            query = query.Where(r => r.Product.Name.ToLower().Contains(search) ||
                                     r.User.FullName.ToLower().Contains(search) ||
                                     (r.Comment != null && r.Comment.ToLower().Contains(search)));
        }

        var totalCount = await query.CountAsync(ct);
        var page = filter.Page;
        var pageSize = filter.PageSize;

        var reviews = await query
            .OrderByDescending(r => r.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var dtos = reviews.Select(r => new AdminReviewDto
        {
            ReviewId = r.Id,
            ProductId = r.ProductId,
            ProductCode = r.Product?.Code ?? string.Empty,
            ProductName = r.Product?.Name ?? string.Empty,
            ReviewerDisplayName = r.User?.FullName ?? "N/A",
            Rating = r.Rating,
            Comment = r.Comment,
            IsVisible = r.IsVisible,
            CreatedAtUtc = r.CreatedAtUtc
        }).ToList();

        return new PagedResult<AdminReviewDto>
        {
            Items = dtos,
            TotalItems = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<AdminReviewDto> UpdateReviewVisibilityAsync(Guid reviewId, UpdateReviewVisibilityRequest request, CancellationToken ct = default)
    {
        var review = await _context.Reviews
            .Include(r => r.User)
            .Include(r => r.Product)
            .FirstOrDefaultAsync(r => r.Id == reviewId, ct);

        if (review == null)
        {
            throw new NotFoundException($"Không tìm thấy đánh giá với ID '{reviewId}'.");
        }

        review.IsVisible = request.IsVisible;
        review.UpdatedAtUtc = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync(ct);

        return new AdminReviewDto
        {
            ReviewId = review.Id,
            ProductId = review.ProductId,
            ProductCode = review.Product?.Code ?? string.Empty,
            ProductName = review.Product?.Name ?? string.Empty,
            ReviewerDisplayName = review.User?.FullName ?? "N/A",
            Rating = review.Rating,
            Comment = review.Comment,
            IsVisible = review.IsVisible,
            CreatedAtUtc = review.CreatedAtUtc
        };
    }
}
