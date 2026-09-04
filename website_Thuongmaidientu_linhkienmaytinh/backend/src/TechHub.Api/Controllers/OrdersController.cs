using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechHub.Application.Common.Exceptions;
using TechHub.Application.DTOs.Orders;
using TechHub.Infrastructure.Persistence;
using TechHub.Infrastructure.Security;

namespace TechHub.Api.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IAuthorizationService _authorizationService;

    public OrdersController(AppDbContext context, IAuthorizationService authorizationService)
    {
        _context = context;
        _authorizationService = authorizationService;
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetOrderById(Guid id, CancellationToken ct)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == id, ct);

        if (order == null)
        {
            throw new NotFoundException($"Order with ID '{id}' was not found.");
        }

        var authResult = await _authorizationService.AuthorizeAsync(User, order, new OrderOwnerRequirement());
        if (!authResult.Succeeded)
        {
            throw new ForbiddenAccessException("You do not have permission to access this order.");
        }

        var dto = new OrderDto
        {
            Id = order.Id,
            UserId = order.UserId,
            OrderNumber = order.OrderNumber,
            Status = order.Status.ToString(),
            RecipientName = order.RecipientName,
            PhoneNumber = order.PhoneNumber,
            ShippingAddress = order.ShippingAddress,
            PaymentMethod = order.PaymentMethod.ToString(),
            Subtotal = order.Subtotal,
            ShippingFee = order.ShippingFee,
            Total = order.Total,
            CreatedAtUtc = order.CreatedAtUtc,
            OrderItems = order.OrderItems.Select(oi => new OrderItemDto
            {
                Id = oi.Id,
                ProductId = oi.ProductId,
                ProductCode = oi.ProductCode,
                ProductName = oi.ProductName,
                UnitPrice = oi.UnitPrice,
                Quantity = oi.Quantity,
                LineTotal = oi.LineTotal
            }).ToList()
        };

        return Ok(dto);
    }
}
