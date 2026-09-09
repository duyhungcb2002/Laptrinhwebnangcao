using TechHub.Application.DTOs.Catalog;
using TechHub.Application.DTOs.Inventory;

namespace TechHub.Application.Common.Interfaces;

public interface IInventoryService
{
    Task<PagedResult<InventoryItemDto>> GetInventoryAsync(InventoryFilterParams filter, CancellationToken ct = default);
    Task<InventoryItemDto> ImportStockAsync(Guid userId, string? ipAddress, Guid productId, ImportInventoryRequest request, CancellationToken ct = default);
    Task<InventoryItemDto> ExportStockAsync(Guid userId, string? ipAddress, Guid productId, ExportInventoryRequest request, CancellationToken ct = default);
    Task<InventoryItemDto> AdjustStockAsync(Guid userId, string? ipAddress, Guid productId, AdjustInventoryRequest request, CancellationToken ct = default);
    Task<PagedResult<InventoryTransactionDto>> GetHistoryAsync(InventoryHistoryFilterParams filter, CancellationToken ct = default);
    Task<List<InventoryItemDto>> GetLowStockProductsAsync(int threshold, CancellationToken ct = default);
}
