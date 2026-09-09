using TechHub.Application.DTOs.Catalog;
using TechHub.Application.DTOs.Orders;

namespace TechHub.Application.Common.Interfaces;

public interface IOrderService
{
    Task<OrderDto> CheckoutAsync(Guid userId, CheckoutRequest request, CancellationToken ct = default);
    Task<PagedResult<OrderDto>> GetCustomerOrdersAsync(Guid userId, OrderFilterParams filter, CancellationToken ct = default);
    Task<OrderDto> GetOrderByIdAsync(Guid orderId, CancellationToken ct = default);
    Task<OrderDto> CancelOrderAsync(Guid userId, Guid orderId, CancellationToken ct = default);

    // Admin methods
    Task<PagedResult<OrderDto>> GetAdminOrdersAsync(OrderFilterParams filter, CancellationToken ct = default);
    Task<OrderDto> AdminUpdateOrderStatusAsync(Guid adminUserId, Guid orderId, UpdateOrderStatusRequest request, CancellationToken ct = default);
}
