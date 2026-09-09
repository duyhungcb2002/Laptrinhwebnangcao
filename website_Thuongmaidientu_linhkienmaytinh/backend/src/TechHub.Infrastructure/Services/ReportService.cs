using Microsoft.EntityFrameworkCore;
using TechHub.Application.Common.Interfaces;
using TechHub.Application.DTOs.Reports;
using TechHub.Domain.Enums;
using TechHub.Infrastructure.Persistence;

namespace TechHub.Infrastructure.Services;

public class ReportService : IReportService
{
    private readonly AppDbContext _context;

    public ReportService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardReportResponse> GetDashboardReportAsync(DashboardReportRequest request, CancellationToken ct = default)
    {
        // 1. Strict Input Validation
        if (request.FromUtc.HasValue && request.ToUtc.HasValue && request.FromUtc.Value >= request.ToUtc.Value)
        {
            throw new ArgumentException("Thời gian bắt đầu (FromUtc) phải nhỏ hơn thời gian kết thúc (ToUtc).");
        }

        var granularity = request.Granularity?.Trim().ToLower() ?? "day";
        if (granularity != "day" && granularity != "month")
        {
            throw new ArgumentException("Granularity chỉ nhận giá trị 'day' hoặc 'month'.");
        }

        if (request.LowStockThreshold < 0)
        {
            throw new ArgumentException("LowStockThreshold không được âm.");
        }

        if (request.Top < 1 || request.Top > 20)
        {
            throw new ArgumentException("Tham số Top phải nằm trong khoảng từ 1 đến 20.");
        }

        var threshold = request.LowStockThreshold;
        var top = request.Top;

        var fromUtc = request.FromUtc ?? DateTimeOffset.UtcNow.AddDays(-30);
        var toUtc = request.ToUtc ?? DateTimeOffset.UtcNow.AddDays(1);

        // 2. Base Queries
        var ordersQuery = _context.Orders
            .Where(o => o.CreatedAtUtc >= fromUtc && o.CreatedAtUtc < toUtc)
            .AsNoTracking();

        var completedOrdersQuery = ordersQuery.Where(o => o.Status == OrderStatus.Completed);

        // Aggregate Metrics directly in DB
        var totalOrders = await ordersQuery.CountAsync(ct);
        var completedOrdersCount = await completedOrdersQuery.CountAsync(ct);
        var cancelledOrdersCount = await ordersQuery.CountAsync(o => o.Status == OrderStatus.Cancelled, ct);

        var totalRevenue = await completedOrdersQuery.SumAsync(o => (decimal?)o.Total, ct) ?? 0m;

        var totalItemsSold = await _context.OrderItems
            .Where(oi => oi.Order.CreatedAtUtc >= fromUtc && oi.Order.CreatedAtUtc < toUtc && oi.Order.Status == OrderStatus.Completed)
            .SumAsync(oi => (int?)oi.Quantity, ct) ?? 0;

        var newCustomersCount = await _context.UserRoles
            .Where(ur => ur.Role.Name == "Customer" &&
                         ur.User.CreatedAtUtc >= fromUtc &&
                         ur.User.CreatedAtUtc < toUtc)
            .Select(ur => ur.UserId)
            .Distinct()
            .CountAsync(ct);

        var summary = new DashboardSummaryDto
        {
            TotalRevenue = totalRevenue,
            TotalOrders = totalOrders,
            CompletedOrders = completedOrdersCount,
            CancelledOrders = cancelledOrdersCount,
            TotalItemsSold = totalItemsSold,
            NewCustomers = newCustomersCount
        };

        // 3. Revenue Series Points (grouped & aggregated on DB side)
        List<RevenueSeriesPointDto> revenueSeries;
        if (granularity == "month")
        {
            revenueSeries = await completedOrdersQuery
                .GroupBy(o => new { o.CreatedAtUtc.Year, o.CreatedAtUtc.Month })
                .Select(g => new
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Revenue = g.Sum(o => o.Total),
                    Count = g.Count()
                })
                .OrderBy(x => x.Year).ThenBy(x => x.Month)
                .Select(x => new RevenueSeriesPointDto
                {
                    Period = $"{x.Year:D4}-{x.Month:D2}",
                    Revenue = x.Revenue,
                    CompletedOrderCount = x.Count
                })
                .ToListAsync(ct);
        }
        else
        {
            revenueSeries = await completedOrdersQuery
                .GroupBy(o => new { o.CreatedAtUtc.Year, o.CreatedAtUtc.Month, o.CreatedAtUtc.Day })
                .Select(g => new
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Day = g.Key.Day,
                    Revenue = g.Sum(o => o.Total),
                    Count = g.Count()
                })
                .OrderBy(x => x.Year).ThenBy(x => x.Month).ThenBy(x => x.Day)
                .Select(x => new RevenueSeriesPointDto
                {
                    Period = $"{x.Year:D4}-{x.Month:D2}-{x.Day:D2}",
                    Revenue = x.Revenue,
                    CompletedOrderCount = x.Count
                })
                .ToListAsync(ct);
        }

        // 4. Top Selling Products (Aggregated on DB side)
        var topSellingProducts = await _context.OrderItems
            .Where(oi => oi.Order.CreatedAtUtc >= fromUtc && oi.Order.CreatedAtUtc < toUtc && oi.Order.Status == OrderStatus.Completed)
            .GroupBy(oi => new { oi.ProductId, oi.ProductCode, oi.ProductName })
            .Select(g => new TopSellingProductDto
            {
                ProductId = g.Key.ProductId,
                Sku = g.Key.ProductCode,
                ProductName = g.Key.ProductName,
                QuantitySold = g.Sum(oi => oi.Quantity),
                Revenue = g.Sum(oi => oi.LineTotal)
            })
            .OrderByDescending(p => p.QuantitySold)
            .Take(top)
            .AsNoTracking()
            .ToListAsync(ct);

        // 5. Low Stock Products
        var lowStockProducts = await _context.Products
            .Where(p => p.IsActive && p.StockQuantity <= threshold)
            .OrderBy(p => p.StockQuantity)
            .Select(p => new LowStockProductReportDto
            {
                ProductId = p.Id,
                Sku = p.Code,
                ProductName = p.Name,
                StockQuantity = p.StockQuantity
            })
            .Take(20)
            .AsNoTracking()
            .ToListAsync(ct);

        // 6. Recent Orders
        var recentOrders = await _context.Orders
            .OrderByDescending(o => o.CreatedAtUtc)
            .Take(10)
            .Select(o => new DashboardRecentOrderDto
            {
                OrderId = o.Id,
                OrderNumber = o.OrderNumber,
                RecipientName = o.RecipientName,
                PhoneNumber = o.PhoneNumber,
                Total = o.Total,
                Status = o.Status.ToString(),
                CreatedAtUtc = o.CreatedAtUtc
            })
            .AsNoTracking()
            .ToListAsync(ct);

        return new DashboardReportResponse
        {
            Summary = summary,
            RevenueSeries = revenueSeries,
            TopSellingProducts = topSellingProducts,
            LowStockProducts = lowStockProducts,
            RecentOrders = recentOrders
        };
    }
}

