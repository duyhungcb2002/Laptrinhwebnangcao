using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using TechHub.Application.Common.Interfaces;
using TechHub.Application.DTOs.Catalog;
using TechHub.Application.DTOs.Inventory;
using TechHub.Infrastructure.Security;

namespace TechHub.Api.Controllers;

[ApiController]
[Route("api/admin/inventory")]
[HasPermission("inventory.manage")]
public class AdminInventoryController : ControllerBase
{
    private readonly IInventoryService _inventoryService;

    public AdminInventoryController(IInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
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

    private string GetIpAddress()
    {
        return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<InventoryItemDto>>> GetInventory(
        [FromQuery] InventoryFilterParams filter,
        CancellationToken ct)
    {
        var result = await _inventoryService.GetInventoryAsync(filter, ct);
        return Ok(result);
    }

    [HttpPost("{productId:guid}/import")]
    public async Task<ActionResult<InventoryItemDto>> ImportStock(
        Guid productId,
        [FromBody] ImportInventoryRequest request,
        CancellationToken ct)
    {
        var userId = GetUserId();
        var ip = GetIpAddress();
        var result = await _inventoryService.ImportStockAsync(userId, ip, productId, request, ct);
        return Ok(result);
    }

    [HttpPost("{productId:guid}/export")]
    public async Task<ActionResult<InventoryItemDto>> ExportStock(
        Guid productId,
        [FromBody] ExportInventoryRequest request,
        CancellationToken ct)
    {
        var userId = GetUserId();
        var ip = GetIpAddress();
        var result = await _inventoryService.ExportStockAsync(userId, ip, productId, request, ct);
        return Ok(result);
    }

    [HttpPost("{productId:guid}/adjust")]
    public async Task<ActionResult<InventoryItemDto>> AdjustStock(
        Guid productId,
        [FromBody] AdjustInventoryRequest request,
        CancellationToken ct)
    {
        var userId = GetUserId();
        var ip = GetIpAddress();
        var result = await _inventoryService.AdjustStockAsync(userId, ip, productId, request, ct);
        return Ok(result);
    }

    [HttpGet("history")]
    public async Task<ActionResult<PagedResult<InventoryTransactionDto>>> GetHistory(
        [FromQuery] InventoryHistoryFilterParams filter,
        CancellationToken ct)
    {
        var result = await _inventoryService.GetHistoryAsync(filter, ct);
        return Ok(result);
    }

    [HttpGet("low-stock")]
    public async Task<ActionResult<List<InventoryItemDto>>> GetLowStock(
        [FromQuery] int threshold = 10,
        CancellationToken ct = default)
    {
        var result = await _inventoryService.GetLowStockProductsAsync(threshold, ct);
        return Ok(result);
    }
}
