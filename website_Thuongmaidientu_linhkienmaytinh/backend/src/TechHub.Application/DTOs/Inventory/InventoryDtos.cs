namespace TechHub.Application.DTOs.Inventory;

public class InventoryItemDto
{
    public Guid ProductId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
    public string StockStatus { get; set; } = string.Empty; // OutOfStock, LowStock, InStock
    public DateTimeOffset? LastUpdatedAtUtc { get; set; }
}

public class ImportInventoryRequest
{
    public int Quantity { get; set; }
    public string? Note { get; set; }
}

public class ExportInventoryRequest
{
    public int Quantity { get; set; }
    public string? Note { get; set; }
}

public class AdjustInventoryRequest
{
    public int NewQuantity { get; set; }
    public string Note { get; set; } = string.Empty;
}

public class InventoryTransactionDto
{
    public Guid TransactionId { get; set; }
    public Guid ProductId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public int StockBefore { get; set; }
    public int StockAfter { get; set; }
    public string? Note { get; set; }
    public string PerformedBy { get; set; } = string.Empty;
    public DateTimeOffset CreatedAtUtc { get; set; }
}

public class InventoryFilterParams
{
    public string? Search { get; set; }
    public bool? LowStockOnly { get; set; }
    public int Threshold { get; set; } = 10;
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class InventoryHistoryFilterParams
{
    public Guid? ProductId { get; set; }
    public string? Type { get; set; }
    public Guid? PerformedByUserId { get; set; }
    public DateTimeOffset? FromUtc { get; set; }
    public DateTimeOffset? ToUtc { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
