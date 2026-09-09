using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using TechHub.Application.Common.Exceptions;
using TechHub.Application.Common.Interfaces;
using TechHub.Application.DTOs.Catalog;
using TechHub.Application.DTOs.Orders;
using TechHub.Domain.Entities;
using TechHub.Domain.Enums;
using TechHub.Infrastructure.Persistence;

namespace TechHub.Infrastructure.Services;

public class OrderService : IOrderService
{
    private readonly AppDbContext _context;

    public OrderService(AppDbContext context)
    {
        _context = context;
    }

    private static void ValidateCheckoutInput(CheckoutRequest request)
    {
        var name = request.RecipientName?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Tên người nhận không được để trống.");
        }
        if (name.Length > 150)
        {
            throw new ArgumentException("Tên người nhận không được vượt quá 150 ký tự.");
        }

        var phoneInput = request.PhoneNumber?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(phoneInput))
        {
            throw new ArgumentException("Số điện thoại không được để trống.");
        }
        if (phoneInput.Length > 20)
        {
            throw new ArgumentException("Số điện thoại không được vượt quá 20 ký tự.");
        }

        var normalizedPhone = Regex.Replace(phoneInput, @"[\+\s\-]", "");
        if (!Regex.IsMatch(normalizedPhone, @"^\d{9,15}$"))
        {
            throw new ArgumentException("Số điện thoại không hợp lệ (phải từ 9 đến 15 chữ số sau khi chuẩn hóa).");
        }

        var address = request.ShippingAddress?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(address))
        {
            throw new ArgumentException("Địa chỉ giao hàng không được để trống.");
        }
        if (address.Length > 500)
        {
            throw new ArgumentException("Địa chỉ giao hàng không được vượt quá 500 ký tự.");
        }

        if (!Enum.TryParse<PaymentMethod>(request.PaymentMethod, true, out var paymentMethod) ||
            (paymentMethod != PaymentMethod.Cod && paymentMethod != PaymentMethod.MockGateway))
        {
            throw new ArgumentException("Phương thức thanh toán không hợp lệ. Chỉ hỗ trợ 'Cod' hoặc 'MockGateway'.");
        }
    }

    public async Task<OrderDto> CheckoutAsync(Guid userId, CheckoutRequest request, CancellationToken ct = default)
    {
        ValidateCheckoutInput(request);
        Enum.TryParse<PaymentMethod>(request.PaymentMethod, true, out var paymentMethod);

        using var transaction = await _context.Database.BeginTransactionAsync(ct);

        try
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.UserId == userId, ct);

            if (cart == null || !cart.CartItems.Any())
            {
                throw new ConflictException("Giỏ hàng của bạn đang rỗng.");
            }

            var cartItemProductIds = cart.CartItems.Select(ci => ci.ProductId).Distinct().OrderBy(id => id).ToList();

            var products = await _context.Products
                .FromSqlRaw("SELECT * FROM products WHERE \"Id\" = ANY({0}) ORDER BY \"Id\" FOR UPDATE", cartItemProductIds)
                .Include(p => p.Category)
                .ToListAsync(ct);

            var now = DateTimeOffset.UtcNow;
            var orderItems = new List<OrderItem>();
            decimal subtotal = 0;

            foreach (var item in cart.CartItems)
            {
                var product = products.FirstOrDefault(p => p.Id == item.ProductId);
                if (product == null || !product.IsActive || product.Category == null || !product.Category.IsActive)
                {
                    throw new ConflictException($"Sản phẩm mã '{item.ProductId}' không tồn tại, đã bị ẩn hoặc thuộc danh mục không hoạt động.");
                }

                if (product.StockQuantity < item.Quantity)
                {
                    throw new ConflictException($"Sản phẩm '{product.Name}' không đủ tồn kho (còn {product.StockQuantity}, cần {item.Quantity}).");
                }

                var stockBefore = product.StockQuantity;
                var stockAfter = stockBefore - item.Quantity;

                product.StockQuantity = stockAfter;
                product.UpdatedAtUtc = now;

                var invTx = new InventoryTransaction
                {
                    Id = Guid.NewGuid(),
                    ProductId = product.Id,
                    PerformedByUserId = userId,
                    Type = InventoryTransactionType.Order,
                    Quantity = item.Quantity,
                    StockBefore = stockBefore,
                    StockAfter = stockAfter,
                    Note = $"Trừ kho tự động khi đặt hàng #{item.ProductId}",
                    CreatedAtUtc = now
                };
                _context.InventoryTransactions.Add(invTx);

                var lineTotal = product.Price * item.Quantity;
                subtotal += lineTotal;

                orderItems.Add(new OrderItem
                {
                    Id = Guid.NewGuid(),
                    ProductId = product.Id,
                    ProductCode = product.Code,
                    ProductName = product.Name,
                    UnitPrice = product.Price,
                    Quantity = item.Quantity,
                    LineTotal = lineTotal
                });
            }

            var shippingFee = 0m;
            var total = subtotal + shippingFee;

            var orderNumber = $"ORD-{now:yyyyMMddHHmmss}-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}";

            var order = new Order
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                OrderNumber = orderNumber,
                Status = OrderStatus.Pending,
                RecipientName = request.RecipientName.Trim(),
                PhoneNumber = request.PhoneNumber.Trim(),
                ShippingAddress = request.ShippingAddress.Trim(),
                PaymentMethod = paymentMethod,
                Subtotal = subtotal,
                ShippingFee = shippingFee,
                Total = total,
                CreatedAtUtc = now,
                OrderItems = orderItems
            };

            _context.Orders.Add(order);

            _context.CartItems.RemoveRange(cart.CartItems);
            cart.UpdatedAtUtc = now;

            await _context.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);

            return MapToDto(order);
        }
        catch
        {
            await transaction.RollbackAsync(ct);
            throw;
        }
    }

    public async Task<PagedResult<OrderDto>> GetCustomerOrdersAsync(Guid userId, OrderFilterParams filter, CancellationToken ct = default)
    {
        var query = _context.Orders
            .Include(o => o.OrderItems)
            .Where(o => o.UserId == userId)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(filter.Status) && Enum.TryParse<OrderStatus>(filter.Status, true, out var status))
        {
            query = query.Where(o => o.Status == status);
        }

        var totalCount = await query.CountAsync(ct);
        var page = Math.Max(1, filter.Page);
        var pageSize = Math.Clamp(filter.PageSize, 1, 100);

        var orders = await query
            .OrderByDescending(o => o.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var dtos = orders.Select(MapToDto).ToList();

        return new PagedResult<OrderDto>
        {
            Items = dtos,
            TotalItems = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<OrderDto> GetOrderByIdAsync(Guid orderId, CancellationToken ct = default)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == orderId, ct);

        if (order == null)
        {
            throw new NotFoundException($"Không tìm thấy đơn hàng mã '{orderId}'.");
        }

        return MapToDto(order);
    }

    public async Task<OrderDto> CancelOrderAsync(Guid userId, Guid orderId, CancellationToken ct = default)
    {
        using var transaction = await _context.Database.BeginTransactionAsync(ct);

        try
        {
            var order = await _context.Orders
                .FromSqlInterpolated($"SELECT * FROM orders WHERE \"Id\" = {orderId} FOR UPDATE")
                .SingleOrDefaultAsync(ct);

            if (order == null)
            {
                throw new NotFoundException($"Không tìm thấy đơn hàng mã '{orderId}'.");
            }

            if (order.UserId != userId)
            {
                throw new ForbiddenAccessException("Bạn không có quyền hủy đơn hàng của tài khoản khác.");
            }

            if (order.Status != OrderStatus.Pending)
            {
                throw new ConflictException($"Chỉ có thể hủy đơn hàng khi ở trạng thái 'Pending'. Trạng thái hiện tại: '{order.Status}'.");
            }

            await _context.Entry(order)
                .Collection(o => o.OrderItems)
                .LoadAsync(ct);

            var now = DateTimeOffset.UtcNow;
            order.Status = OrderStatus.Cancelled;
            order.UpdatedAtUtc = now;

            var itemProductIds = order.OrderItems.Select(oi => oi.ProductId).Distinct().OrderBy(id => id).ToList();
            var products = await _context.Products
                .FromSqlRaw("SELECT * FROM products WHERE \"Id\" = ANY({0}) ORDER BY \"Id\" FOR UPDATE", itemProductIds)
                .ToListAsync(ct);

            foreach (var item in order.OrderItems)
            {
                var product = products.FirstOrDefault(p => p.Id == item.ProductId);
                if (product != null)
                {
                    var stockBefore = product.StockQuantity;
                    var stockAfter = stockBefore + item.Quantity;

                    product.StockQuantity = stockAfter;
                    product.UpdatedAtUtc = now;

                    var invTx = new InventoryTransaction
                    {
                        Id = Guid.NewGuid(),
                        ProductId = product.Id,
                        PerformedByUserId = userId,
                        Type = InventoryTransactionType.Cancellation,
                        Quantity = item.Quantity,
                        StockBefore = stockBefore,
                        StockAfter = stockAfter,
                        Note = $"Hoàn tồn kho do Customer hủy đơn #{order.OrderNumber}",
                        CreatedAtUtc = now
                    };
                    _context.InventoryTransactions.Add(invTx);
                }
            }

            await _context.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);

            return MapToDto(order);
        }
        catch
        {
            await transaction.RollbackAsync(ct);
            throw;
        }
    }

    public async Task<PagedResult<OrderDto>> GetAdminOrdersAsync(OrderFilterParams filter, CancellationToken ct = default)
    {
        var query = _context.Orders
            .Include(o => o.OrderItems)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(filter.Status) && Enum.TryParse<OrderStatus>(filter.Status, true, out var status))
        {
            query = query.Where(o => o.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim().ToLower();
            query = query.Where(o =>
                o.OrderNumber.ToLower().Contains(search) ||
                o.RecipientName.ToLower().Contains(search) ||
                o.PhoneNumber.Contains(search));
        }

        var totalCount = await query.CountAsync(ct);
        var page = Math.Max(1, filter.Page);
        var pageSize = Math.Clamp(filter.PageSize, 1, 100);

        var orders = await query
            .OrderByDescending(o => o.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var dtos = orders.Select(MapToDto).ToList();

        return new PagedResult<OrderDto>
        {
            Items = dtos,
            TotalItems = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<OrderDto> AdminUpdateOrderStatusAsync(Guid adminUserId, Guid orderId, UpdateOrderStatusRequest request, CancellationToken ct = default)
    {
        if (!Enum.TryParse<OrderStatus>(request.Status, true, out var newStatus))
        {
            throw new ArgumentException($"Trạng thái '{request.Status}' không hợp lệ.");
        }

        using var transaction = await _context.Database.BeginTransactionAsync(ct);

        try
        {
            var order = await _context.Orders
                .FromSqlInterpolated($"SELECT * FROM orders WHERE \"Id\" = {orderId} FOR UPDATE")
                .SingleOrDefaultAsync(ct);

            if (order == null)
            {
                throw new NotFoundException($"Không tìm thấy đơn hàng mã '{orderId}'.");
            }

            var currentStatus = order.Status;
            if (currentStatus == newStatus)
            {
                throw new ConflictException("Đơn hàng đã ở trạng thái này.");
            }

            ValidateStatusTransition(currentStatus, newStatus);

            await _context.Entry(order)
                .Collection(o => o.OrderItems)
                .LoadAsync(ct);

            var now = DateTimeOffset.UtcNow;
            order.Status = newStatus;
            order.UpdatedAtUtc = now;

            if (newStatus == OrderStatus.Cancelled)
            {
                var itemProductIds = order.OrderItems.Select(oi => oi.ProductId).Distinct().OrderBy(id => id).ToList();
                var products = await _context.Products
                    .FromSqlRaw("SELECT * FROM products WHERE \"Id\" = ANY({0}) ORDER BY \"Id\" FOR UPDATE", itemProductIds)
                    .ToListAsync(ct);

                foreach (var item in order.OrderItems)
                {
                    var product = products.FirstOrDefault(p => p.Id == item.ProductId);
                    if (product != null)
                    {
                        var stockBefore = product.StockQuantity;
                        var stockAfter = stockBefore + item.Quantity;

                        product.StockQuantity = stockAfter;
                        product.UpdatedAtUtc = now;

                        var invTx = new InventoryTransaction
                        {
                            Id = Guid.NewGuid(),
                            ProductId = product.Id,
                            PerformedByUserId = adminUserId,
                            Type = InventoryTransactionType.Cancellation,
                            Quantity = item.Quantity,
                            StockBefore = stockBefore,
                            StockAfter = stockAfter,
                            Note = $"Hoàn tồn kho do Admin hủy đơn #{order.OrderNumber}",
                            CreatedAtUtc = now
                        };
                        _context.InventoryTransactions.Add(invTx);
                    }
                }
            }

            await _context.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);

            return MapToDto(order);
        }
        catch
        {
            await transaction.RollbackAsync(ct);
            throw;
        }
    }

    public static void ValidateStatusTransition(OrderStatus current, OrderStatus next)
    {
        bool isValid = (current, next) switch
        {
            (OrderStatus.Pending, OrderStatus.Confirmed) => true,
            (OrderStatus.Confirmed, OrderStatus.Preparing) => true,
            (OrderStatus.Preparing, OrderStatus.Shipping) => true,
            (OrderStatus.Shipping, OrderStatus.Completed) => true,
            (OrderStatus.Pending, OrderStatus.Cancelled) => true,
            (OrderStatus.Confirmed, OrderStatus.Cancelled) => true,
            (OrderStatus.Preparing, OrderStatus.Cancelled) => true,
            _ => false
        };

        if (!isValid)
        {
            throw new ConflictException($"Không thể chuyển trạng thái đơn hàng từ '{current}' sang '{next}'.");
        }
    }

    private static OrderDto MapToDto(Order order)
    {
        return new OrderDto
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
    }
}
