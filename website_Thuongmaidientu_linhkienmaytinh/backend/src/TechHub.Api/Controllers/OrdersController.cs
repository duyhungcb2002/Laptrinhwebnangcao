using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechHub.Application.Common.Exceptions;
using TechHub.Application.Common.Interfaces;
using TechHub.Application.DTOs.Catalog;
using TechHub.Application.DTOs.Orders;
using TechHub.Infrastructure.Security;

namespace TechHub.Api.Controllers;

[ApiController]
[Route("api")]
public class CheckoutController : ControllerBase
{
    private readonly IOrderService _orderService;

    public CheckoutController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost("checkout")]
    [HasPermission("cart.manage")]
    public async Task<ActionResult<OrderDto>> Checkout([FromBody] CheckoutRequest request, CancellationToken ct)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
        {
            throw new UnauthorizedAccessException("Không xác định được danh tính người dùng.");
        }

        var order = await _orderService.CheckoutAsync(userId, request, ct);
        return CreatedAtAction("GetOrderById", "Orders", new { id = order.Id }, order);
    }
}

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly IAuthorizationService _authorizationService;

    public OrdersController(IOrderService orderService, IAuthorizationService authorizationService)
    {
        _orderService = orderService;
        _authorizationService = authorizationService;
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

    [HttpGet]
    [HasPermission("orders.read.own")]
    public async Task<ActionResult<PagedResult<OrderDto>>> GetMyOrders([FromQuery] OrderFilterParams filter, CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await _orderService.GetCustomerOrdersAsync(userId, filter, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<ActionResult<OrderDto>> GetOrderById(Guid id, CancellationToken ct)
    {
        var order = await _orderService.GetOrderByIdAsync(id, ct);

        // Check ownership or admin privilege using OrderOwnerRequirement
        var orderEntity = new Domain.Entities.Order { Id = order.Id, UserId = order.UserId };
        var authResult = await _authorizationService.AuthorizeAsync(User, orderEntity, new OrderOwnerRequirement());
        if (!authResult.Succeeded)
        {
            throw new ForbiddenAccessException("Bạn không có quyền truy cập đơn hàng này.");
        }

        return Ok(order);
    }

    [HttpPost("{id:guid}/cancel")]
    [HasPermission("orders.read.own")]
    public async Task<ActionResult<OrderDto>> CancelOrder(Guid id, CancellationToken ct)
    {
        var userId = GetUserId();
        var order = await _orderService.CancelOrderAsync(userId, id, ct);
        return Ok(order);
    }
}

[ApiController]
[Route("api/admin/orders")]
[HasPermission("orders.read.all")]
public class AdminOrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public AdminOrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<OrderDto>>> GetAdminOrders([FromQuery] OrderFilterParams filter, CancellationToken ct)
    {
        var result = await _orderService.GetAdminOrdersAsync(filter, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<OrderDto>> GetAdminOrderById(Guid id, CancellationToken ct)
    {
        var order = await _orderService.GetOrderByIdAsync(id, ct);
        return Ok(order);
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

    [HttpPatch("{id:guid}/status")]
    [HasPermission("orders.update")]
    public async Task<ActionResult<OrderDto>> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusRequest request, CancellationToken ct)
    {
        var adminUserId = GetUserId();
        var order = await _orderService.AdminUpdateOrderStatusAsync(adminUserId, id, request, ct);
        return Ok(order);
    }
}
