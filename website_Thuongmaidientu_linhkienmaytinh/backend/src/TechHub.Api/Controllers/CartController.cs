using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using TechHub.Application.Common.Interfaces;
using TechHub.Application.DTOs.Cart;
using TechHub.Infrastructure.Security;

namespace TechHub.Api.Controllers;

[ApiController]
[Route("api/cart")]
[HasPermission("cart.manage")]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
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
    public async Task<ActionResult<CartDto>> GetCart(CancellationToken ct)
    {
        var userId = GetUserId();
        var cart = await _cartService.GetCartAsync(userId, ct);
        return Ok(cart);
    }

    [HttpPost("items")]
    public async Task<ActionResult<CartDto>> AddItem([FromBody] AddCartItemRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        var cart = await _cartService.AddItemAsync(userId, request, ct);
        return Ok(cart);
    }

    [HttpPut("items/{itemId:guid}")]
    public async Task<ActionResult<CartDto>> UpdateItem(Guid itemId, [FromBody] UpdateCartItemRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        var cart = await _cartService.UpdateItemAsync(userId, itemId, request, ct);
        return Ok(cart);
    }

    [HttpDelete("items/{itemId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid itemId, CancellationToken ct)
    {
        var userId = GetUserId();
        await _cartService.RemoveItemAsync(userId, itemId, ct);
        return NoContent();
    }
}
