namespace TechHub.Application.DTOs.Reports;

public class DashboardReportRequest
{
    public DateTimeOffset? FromUtc { get; set; }
    public DateTimeOffset? ToUtc { get; set; }
    public string Granularity { get; set; } = "day"; // "day" or "month"
    public int LowStockThreshold { get; set; } = 10;
    public int Top { get; set; } = 5;
}

public class DashboardSummaryDto
{
    public decimal TotalRevenue { get; set; }
    public int TotalOrders { get; set; }
    public int CompletedOrders { get; set; }
    public int CancelledOrders { get; set; }
    public int TotalItemsSold { get; set; }
    public int NewCustomers { get; set; }
}

public class RevenueSeriesPointDto
{
    public string Period { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public int CompletedOrderCount { get; set; }
}

public class TopSellingProductDto
{
    public Guid ProductId { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int QuantitySold { get; set; }
    public decimal Revenue { get; set; }
}

public class LowStockProductReportDto
{
    public Guid ProductId { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
}

public class DashboardRecentOrderDto
{
    public Guid OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string RecipientName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAtUtc { get; set; }
}

public class DashboardReportResponse
{
    public DashboardSummaryDto Summary { get; set; } = new();
    public List<RevenueSeriesPointDto> RevenueSeries { get; set; } = new();
    public List<TopSellingProductDto> TopSellingProducts { get; set; } = new();
    public List<LowStockProductReportDto> LowStockProducts { get; set; } = new();
    public List<DashboardRecentOrderDto> RecentOrders { get; set; } = new();
}
