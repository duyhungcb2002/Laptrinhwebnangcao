using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TechHub.Application.Common.Exceptions;
using TechHub.Application.Common.Interfaces;
using TechHub.Application.DTOs.Catalog;
using TechHub.Application.DTOs.Inventory;
using TechHub.Domain.Entities;
using TechHub.Domain.Enums;
using TechHub.Infrastructure.Persistence;
using TechHub.Infrastructure.Security;

namespace TechHub.Infrastructure.Services;

public class InventoryService : IInventoryService
{
    private readonly AppDbContext _context;

    public InventoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<InventoryItemDto>> GetInventoryAsync(InventoryFilterParams filter, CancellationToken ct = default)
    {
        if (filter.Page < 1)
        {
            throw new ArgumentException("Trang (page) phải lớn hơn hoặc bằng 1.");
        }
        if (filter.PageSize < 1 || filter.PageSize > 100)
        {
            throw new ArgumentException("Kích thước trang (pageSize) phải từ 1 đến 100.");
        }
        if (filter.Threshold < 0)
        {
            throw new ArgumentException("Ngưỡng tồn kho (Threshold) không được âm.");
        }

        var query = _context.Products
            .Include(p => p.Category)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim().ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(search) || p.Code.ToLower().Contains(search));
        }

        var threshold = filter.Threshold;
        if (filter.LowStockOnly == true)
        {
            query = query.Where(p => p.StockQuantity <= threshold);
        }

        var totalCount = await query.CountAsync(ct);
        var page = filter.Page;
        var pageSize = filter.PageSize;

        var products = await query
            .OrderBy(p => p.StockQuantity)
            .ThenBy(p => p.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var items = products.Select(p => MapToInventoryItemDto(p, threshold)).ToList();

        return new PagedResult<InventoryItemDto>
        {
            Items = items,
            TotalItems = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<InventoryItemDto> ImportStockAsync(Guid userId, string? ipAddress, Guid productId, ImportInventoryRequest request, CancellationToken ct = default)
    {
        ProductionValidators.ValidateInventoryQuantity(request.Quantity, "nhập");
        if (!string.IsNullOrWhiteSpace(request.Note) && request.Note.Length > 500)
        {
            throw new ArgumentException("Ghi chú nhập kho không được vượt quá 500 ký tự.");
        }

        using var transaction = await _context.Database.BeginTransactionAsync(ct);

        try
        {
            var product = await _context.Products
                .FromSqlInterpolated($"SELECT * FROM products WHERE \"Id\" = {productId} FOR UPDATE")
                .Include(p => p.Category)
                .SingleOrDefaultAsync(ct);

            if (product == null)
            {
                throw new NotFoundException($"Không tìm thấy sản phẩm với ID '{productId}'.");
            }

            var stockBefore = product.StockQuantity;
            
            // Overflow check
            checked
            {
                try
                {
                    var test = stockBefore + request.Quantity;
                }
                catch (OverflowException)
                {
                    throw new ArgumentException("Số lượng tồn kho vượt quá giới hạn lưu trữ tối đa.");
                }
            }

            var stockAfter = stockBefore + request.Quantity;
            var now = DateTimeOffset.UtcNow;

            product.StockQuantity = stockAfter;
            product.UpdatedAtUtc = now;

            var invTx = new InventoryTransaction
            {
                Id = Guid.NewGuid(),
                ProductId = product.Id,
                PerformedByUserId = userId,
                Type = InventoryTransactionType.Import,
                Quantity = request.Quantity,
                StockBefore = stockBefore,
                StockAfter = stockAfter,
                Note = request.Note?.Trim(),
                CreatedAtUtc = now
            };
            _context.InventoryTransactions.Add(invTx);

            var auditLog = new AuditLog
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Action = "inventory.import",
                EntityType = "Product",
                EntityId = product.Id.ToString(),
                DetailsJson = JsonSerializer.Serialize(new
                {
                    sku = product.Code,
                    quantity = request.Quantity,
                    stockBefore,
                    stockAfter,
                    note = request.Note
                }),
                IpAddress = ipAddress,
                CreatedAtUtc = now
            };
            _context.AuditLogs.Add(auditLog);

            await _context.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);

            return MapToInventoryItemDto(product);
        }
        catch
        {
            await transaction.RollbackAsync(ct);
            throw;
        }
    }

    public async Task<InventoryItemDto> ExportStockAsync(Guid userId, string? ipAddress, Guid productId, ExportInventoryRequest request, CancellationToken ct = default)
    {
        ProductionValidators.ValidateInventoryQuantity(request.Quantity, "xuất");
        if (!string.IsNullOrWhiteSpace(request.Note) && request.Note.Length > 500)
        {
            throw new ArgumentException("Ghi chú xuất kho không được vượt quá 500 ký tự.");
        }

        using var transaction = await _context.Database.BeginTransactionAsync(ct);

        try
        {
            var product = await _context.Products
                .FromSqlInterpolated($"SELECT * FROM products WHERE \"Id\" = {productId} FOR UPDATE")
                .Include(p => p.Category)
                .SingleOrDefaultAsync(ct);

            if (product == null)
            {
                throw new NotFoundException($"Không tìm thấy sản phẩm với ID '{productId}'.");
            }

            var stockBefore = product.StockQuantity;
            if (stockBefore < request.Quantity)
            {
                throw new ConflictException($"Không đủ tồn kho để xuất ({product.Name} hiện có {stockBefore}, xuất {request.Quantity}).");
            }

            var stockAfter = stockBefore - request.Quantity;
            var now = DateTimeOffset.UtcNow;

            product.StockQuantity = stockAfter;
            product.UpdatedAtUtc = now;

            var invTx = new InventoryTransaction
            {
                Id = Guid.NewGuid(),
                ProductId = product.Id,
                PerformedByUserId = userId,
                Type = InventoryTransactionType.Export,
                Quantity = request.Quantity,
                StockBefore = stockBefore,
                StockAfter = stockAfter,
                Note = request.Note?.Trim(),
                CreatedAtUtc = now
            };
            _context.InventoryTransactions.Add(invTx);

            var auditLog = new AuditLog
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Action = "inventory.export",
                EntityType = "Product",
                EntityId = product.Id.ToString(),
                DetailsJson = JsonSerializer.Serialize(new
                {
                    sku = product.Code,
                    quantity = request.Quantity,
                    stockBefore,
                    stockAfter,
                    note = request.Note
                }),
                IpAddress = ipAddress,
                CreatedAtUtc = now
            };
            _context.AuditLogs.Add(auditLog);

            await _context.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);

            return MapToInventoryItemDto(product);
        }
        catch
        {
            await transaction.RollbackAsync(ct);
            throw;
        }
    }

    public async Task<InventoryItemDto> AdjustStockAsync(Guid userId, string? ipAddress, Guid productId, AdjustInventoryRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Note))
        {
            throw new ArgumentException("Ghi chú bắt buộc phải nhập khi điều chỉnh tồn kho.");
        }

        if (request.Note.Length > 500)
        {
            throw new ArgumentException("Ghi chú điều chỉnh kho không được vượt quá 500 ký tự.");
        }

        using var transaction = await _context.Database.BeginTransactionAsync(ct);

        try
        {
            var product = await _context.Products
                .FromSqlInterpolated($"SELECT * FROM products WHERE \"Id\" = {productId} FOR UPDATE")
                .Include(p => p.Category)
                .SingleOrDefaultAsync(ct);

            if (product == null)
            {
                throw new NotFoundException($"Không tìm thấy sản phẩm với ID '{productId}'.");
            }

            var stockBefore = product.StockQuantity;
            var stockAfter = request.NewQuantity;

            ProductionValidators.ValidateInventoryAdjustChange(stockBefore, stockAfter);

            var absoluteDiff = Math.Abs(stockAfter - stockBefore);
            var now = DateTimeOffset.UtcNow;

            product.StockQuantity = stockAfter;
            product.UpdatedAtUtc = now;

            var invTx = new InventoryTransaction
            {
                Id = Guid.NewGuid(),
                ProductId = product.Id,
                PerformedByUserId = userId,
                Type = InventoryTransactionType.Adjustment,
                Quantity = absoluteDiff,
                StockBefore = stockBefore,
                StockAfter = stockAfter,
                Note = request.Note.Trim(),
                CreatedAtUtc = now
            };
            _context.InventoryTransactions.Add(invTx);

            var auditLog = new AuditLog
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Action = "inventory.adjust",
                EntityType = "Product",
                EntityId = product.Id.ToString(),
                DetailsJson = JsonSerializer.Serialize(new
                {
                    sku = product.Code,
                    quantity = absoluteDiff,
                    stockBefore,
                    stockAfter,
                    note = request.Note.Trim()
                }),
                IpAddress = ipAddress,
                CreatedAtUtc = now
            };
            _context.AuditLogs.Add(auditLog);

            await _context.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);

            return MapToInventoryItemDto(product);
        }
        catch
        {
            await transaction.RollbackAsync(ct);
            throw;
        }
    }

    public async Task<PagedResult<InventoryTransactionDto>> GetHistoryAsync(InventoryHistoryFilterParams filter, CancellationToken ct = default)
    {
        if (filter.Page < 1)
        {
            throw new ArgumentException("Trang (page) phải lớn hơn hoặc bằng 1.");
        }
        if (filter.PageSize < 1 || filter.PageSize > 100)
        {
            throw new ArgumentException("Kích thước trang (pageSize) phải từ 1 đến 100.");
        }
        if (filter.FromUtc.HasValue && filter.ToUtc.HasValue && filter.FromUtc.Value >= filter.ToUtc.Value)
        {
            throw new ArgumentException("FromUtc phải nhỏ hơn ToUtc.");
        }
        if (!string.IsNullOrWhiteSpace(filter.Type) && !Enum.TryParse<InventoryTransactionType>(filter.Type, true, out _))
        {
            throw new ArgumentException($"Loại giao dịch '{filter.Type}' không hợp lệ.");
        }

        var query = _context.InventoryTransactions
            .Include(t => t.Product)
            .Include(t => t.PerformedByUser)
            .AsNoTracking();

        if (filter.ProductId.HasValue)
        {
            query = query.Where(t => t.ProductId == filter.ProductId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Type) && Enum.TryParse<InventoryTransactionType>(filter.Type, true, out var type))
        {
            query = query.Where(t => t.Type == type);
        }

        if (filter.PerformedByUserId.HasValue)
        {
            query = query.Where(t => t.PerformedByUserId == filter.PerformedByUserId.Value);
        }

        if (filter.FromUtc.HasValue)
        {
            query = query.Where(t => t.CreatedAtUtc >= filter.FromUtc.Value);
        }

        if (filter.ToUtc.HasValue)
        {
            query = query.Where(t => t.CreatedAtUtc < filter.ToUtc.Value);
        }

        var totalCount = await query.CountAsync(ct);
        var page = filter.Page;
        var pageSize = filter.PageSize;

        var transactions = await query
            .OrderByDescending(t => t.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var dtos = transactions.Select(t => new InventoryTransactionDto
        {
            TransactionId = t.Id,
            ProductId = t.ProductId,
            ProductCode = t.Product?.Code ?? string.Empty,
            ProductName = t.Product?.Name ?? string.Empty,
            Type = t.Type.ToString(),
            Quantity = t.Quantity,
            StockBefore = t.StockBefore,
            StockAfter = t.StockAfter,
            Note = t.Note,
            PerformedBy = t.PerformedByUser?.FullName ?? t.PerformedByUser?.Email ?? "System / Auto",
            CreatedAtUtc = t.CreatedAtUtc
        }).ToList();

        return new PagedResult<InventoryTransactionDto>
        {
            Items = dtos,
            TotalItems = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<List<InventoryItemDto>> GetLowStockProductsAsync(int threshold, CancellationToken ct = default)
    {
        if (threshold < 0)
        {
            throw new ArgumentException("Threshold không được âm.");
        }

        var products = await _context.Products
            .Include(p => p.Category)
            .Where(p => p.IsActive && p.StockQuantity <= threshold)
            .OrderBy(p => p.StockQuantity)
            .ThenBy(p => p.Name)
            .AsNoTracking()
            .ToListAsync(ct);

        return products.Select(p => MapToInventoryItemDto(p, threshold)).ToList();
    }

    private static InventoryItemDto MapToInventoryItemDto(Product product, int threshold = 10)
    {
        var stockStatus = product.StockQuantity == 0 ? "OutOfStock"
            : product.StockQuantity <= threshold ? "LowStock" : "InStock";

        return new InventoryItemDto
        {
            ProductId = product.Id,
            ProductCode = product.Code,
            ProductName = product.Name,
            CategoryName = product.Category?.Name ?? string.Empty,
            StockQuantity = product.StockQuantity,
            StockStatus = stockStatus,
            LastUpdatedAtUtc = product.UpdatedAtUtc ?? product.CreatedAtUtc
        };
    }
}
