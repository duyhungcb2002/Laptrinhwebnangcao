using Microsoft.EntityFrameworkCore;
using TechHub.Application.Common.Exceptions;
using TechHub.Application.Common.Interfaces;
using TechHub.Application.DTOs.Cart;
using TechHub.Domain.Entities;
using TechHub.Infrastructure.Persistence;

namespace TechHub.Infrastructure.Services;

public class CartService : ICartService
{
    private readonly AppDbContext _context;

    public CartService(AppDbContext context)
    {
        _context = context;
    }

    private async Task<Cart> GetOrCreateCartEntityAsync(Guid userId, CancellationToken ct)
    {
        var cart = await _context.Carts
            .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Product)
                    .ThenInclude(p => p.Category)
            .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Product)
                    .ThenInclude(p => p.ProductImages)
            .FirstOrDefaultAsync(c => c.UserId == userId, ct);

        if (cart == null)
        {
            cart = new Cart
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CreatedAtUtc = DateTimeOffset.UtcNow
            };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync(ct);
        }

        return cart;
    }

    private CartDto MapToDto(Cart cart)
    {
        var items = cart.CartItems
            .Where(ci => ci.Product != null && ci.Product.IsActive && ci.Product.Category != null && ci.Product.Category.IsActive)
            .Select(ci =>
            {
                var mainImg = ci.Product.ImageUrl ?? ci.Product.ProductImages
                    .OrderBy(img => img.DisplayOrder)
                    .FirstOrDefault()?.Url ?? string.Empty;

                var lineTotal = ci.Product.Price * ci.Quantity;

                return new CartItemDto
                {
                    Id = ci.Id,
                    ProductId = ci.ProductId,
                    ProductCode = ci.Product.Code,
                    ProductName = ci.Product.Name,
                    MainImageUrl = mainImg,
                    CurrentPrice = ci.Product.Price,
                    StockQuantity = ci.Product.StockQuantity,
                    Quantity = ci.Quantity,
                    LineTotal = lineTotal
                };
            })
            .ToList();

        return new CartDto
        {
            CartId = cart.Id,
            Items = items,
            TotalQuantity = items.Sum(i => i.Quantity),
            Subtotal = items.Sum(i => i.LineTotal)
        };
    }

    public async Task<CartDto> GetCartAsync(Guid userId, CancellationToken ct = default)
    {
        var cart = await GetOrCreateCartEntityAsync(userId, ct);
        return MapToDto(cart);
    }

    public async Task<CartDto> AddItemAsync(Guid userId, AddCartItemRequest request, CancellationToken ct = default)
    {
        if (request.Quantity <= 0)
        {
            throw new ArgumentException("Số lượng phải lớn hơn 0.");
        }

        var product = await _context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == request.ProductId, ct);

        if (product == null || !product.IsActive || product.Category == null || !product.Category.IsActive)
        {
            throw new NotFoundException("Sản phẩm không tồn tại hoặc đã bị ẩn (thuộc danh mục không hoạt động).");
        }

        var cart = await GetOrCreateCartEntityAsync(userId, ct);

        var existingItem = cart.CartItems.FirstOrDefault(ci => ci.ProductId == request.ProductId);
        var newTotalQuantity = (existingItem?.Quantity ?? 0) + request.Quantity;

        if (newTotalQuantity > product.StockQuantity)
        {
            throw new ConflictException($"Số lượng vượt quá tồn kho hiện có ({product.StockQuantity} sản phẩm).");
        }

        if (existingItem != null)
        {
            existingItem.Quantity = newTotalQuantity;
            existingItem.UpdatedAtUtc = DateTimeOffset.UtcNow;
        }
        else
        {
            var newItem = new CartItem
            {
                Id = Guid.NewGuid(),
                CartId = cart.Id,
                ProductId = product.Id,
                Quantity = request.Quantity,
                CreatedAtUtc = DateTimeOffset.UtcNow
            };
            _context.CartItems.Add(newItem);
        }

        cart.UpdatedAtUtc = DateTimeOffset.UtcNow;
        await _context.SaveChangesAsync(ct);

        return await GetCartAsync(userId, ct);
    }

    public async Task<CartDto> UpdateItemAsync(Guid userId, Guid itemId, UpdateCartItemRequest request, CancellationToken ct = default)
    {
        if (request.Quantity <= 0)
        {
            throw new ArgumentException("Số lượng phải lớn hơn 0.");
        }

        var cart = await GetOrCreateCartEntityAsync(userId, ct);
        var cartItem = cart.CartItems.FirstOrDefault(ci => ci.Id == itemId);

        if (cartItem == null)
        {
            throw new NotFoundException("Sản phẩm không có trong giỏ hàng của bạn.");
        }

        var product = await _context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == cartItem.ProductId, ct);

        if (product == null || !product.IsActive || product.Category == null || !product.Category.IsActive)
        {
            throw new NotFoundException("Sản phẩm không tồn tại hoặc đã bị ẩn (thuộc danh mục không hoạt động).");
        }

        if (request.Quantity > product.StockQuantity)
        {
            throw new ConflictException($"Số lượng vượt quá tồn kho hiện có ({product.StockQuantity} sản phẩm).");
        }

        cartItem.Quantity = request.Quantity;
        cartItem.UpdatedAtUtc = DateTimeOffset.UtcNow;
        cart.UpdatedAtUtc = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync(ct);

        return await GetCartAsync(userId, ct);
    }

    public async Task RemoveItemAsync(Guid userId, Guid itemId, CancellationToken ct = default)
    {
        var cart = await GetOrCreateCartEntityAsync(userId, ct);
        var cartItem = cart.CartItems.FirstOrDefault(ci => ci.Id == itemId);

        if (cartItem == null)
        {
            throw new NotFoundException("Sản phẩm không có trong giỏ hàng của bạn.");
        }

        _context.CartItems.Remove(cartItem);
        cart.UpdatedAtUtc = DateTimeOffset.UtcNow;
        await _context.SaveChangesAsync(ct);
    }
}
