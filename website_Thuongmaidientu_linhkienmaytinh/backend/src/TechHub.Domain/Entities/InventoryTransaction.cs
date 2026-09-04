using TechHub.Domain.Enums;

namespace TechHub.Domain.Entities;

public class InventoryTransaction
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public Guid? PerformedByUserId { get; set; }
    public InventoryTransactionType Type { get; set; }
    public int Quantity { get; set; }
    public int StockBefore { get; set; }
    public int StockAfter { get; set; }
    public string? Note { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;

    public Product Product { get; set; } = null!;
    public User? PerformedByUser { get; set; }
}
