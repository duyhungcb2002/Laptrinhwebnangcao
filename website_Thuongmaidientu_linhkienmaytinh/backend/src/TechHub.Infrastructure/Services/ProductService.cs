using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Npgsql;
using TechHub.Application.Common.Exceptions;
using TechHub.Application.Common.Interfaces;
using TechHub.Application.DTOs.Catalog;
using TechHub.Domain.Entities;
using TechHub.Domain.Enums;
using TechHub.Infrastructure.Persistence;
using TechHub.Infrastructure.Security;

namespace TechHub.Infrastructure.Services;

public class ProductService : IProductService
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<ProductService> _logger;

    public ProductService(AppDbContext context, IWebHostEnvironment env, ILogger<ProductService> logger)
    {
        _context = context;
        _env = env;
        _logger = logger;
    }

    public async Task<PagedResult<ProductDto>> GetPublicProductsAsync(ProductFilterParams filter, CancellationToken ct = default)
    {
        ValidateFilterParams(filter);

        var query = _context.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Where(p => p.IsActive && p.Category.IsActive);

        query = ApplyFilters(query, filter);
        query = ApplySorting(query, filter.SortBy);

        var totalItems = await query.LongCountAsync(ct);

        var items = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(p => MapToDto(p))
            .ToListAsync(ct);

        return new PagedResult<ProductDto>
        {
            Items = items,
            Page = filter.Page,
            PageSize = filter.PageSize,
            TotalItems = totalItems
        };
    }

    public async Task<ProductDetailDto> GetPublicProductByIdAsync(Guid id, CancellationToken ct = default)
    {
        var product = await _context.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.ProductImages)
            .FirstOrDefaultAsync(p => p.Id == id && p.IsActive && p.Category.IsActive, ct);

        if (product == null)
        {
            throw new NotFoundException($"Không tìm thấy sản phẩm hoặc sản phẩm đã bị ẩn (ID: '{id}').");
        }

        return MapToDetailDto(product);
    }

    public async Task<PagedResult<ProductDto>> GetAdminProductsAsync(ProductFilterParams filter, CancellationToken ct = default)
    {
        ValidateFilterParams(filter);

        var query = _context.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .AsQueryable();

        query = ApplyFilters(query, filter);
        query = ApplySorting(query, filter.SortBy);

        var totalItems = await query.LongCountAsync(ct);

        var items = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(p => MapToDto(p))
            .ToListAsync(ct);

        return new PagedResult<ProductDto>
        {
            Items = items,
            Page = filter.Page,
            PageSize = filter.PageSize,
            TotalItems = totalItems
        };
    }

    public async Task<ProductDetailDto> GetAdminProductByIdAsync(Guid id, CancellationToken ct = default)
    {
        var product = await _context.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.ProductImages)
            .FirstOrDefaultAsync(p => p.Id == id, ct);

        if (product == null)
        {
            throw new NotFoundException($"Không tìm thấy sản phẩm với ID '{id}'.");
        }

        return MapToDetailDto(product);
    }

    public async Task<ProductDto> CreateProductAsync(Guid actorUserId, string? ipAddress, CreateProductRequest request, CancellationToken ct = default)
    {
        var normalizedCode = request.Code?.Trim().ToUpperInvariant() ?? string.Empty;
        ValidateProductInput(normalizedCode, request.Name, request.Price, request.OldPrice, request.StockQuantity);

        var category = await _context.Categories.FirstOrDefaultAsync(c => c.Id == request.CategoryId, ct);
        if (category == null || !category.IsActive)
        {
            throw new ArgumentException("Danh mục được chọn không tồn tại hoặc đã bị ẩn.");
        }

        var exists = await _context.Products.AnyAsync(p => p.Code.ToUpper() == normalizedCode, ct);
        if (exists)
        {
            throw new ConflictException($"Mã sản phẩm (SKU) '{normalizedCode}' đã tồn tại trong hệ thống.");
        }

        var product = new Product
        {
            Id = Guid.NewGuid(),
            CategoryId = request.CategoryId,
            Code = normalizedCode,
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            Price = request.Price,
            OldPrice = request.OldPrice,
            StockQuantity = request.StockQuantity,
            ImageUrl = request.ImageUrl?.Trim(),
            IsActive = request.IsActive,
            CreatedAtUtc = DateTimeOffset.UtcNow
        };

        _context.Products.Add(product);

        if (product.StockQuantity > 0)
        {
            var initialInvTx = new InventoryTransaction
            {
                Id = Guid.NewGuid(),
                ProductId = product.Id,
                PerformedByUserId = actorUserId,
                Type = InventoryTransactionType.Import,
                Quantity = product.StockQuantity,
                StockBefore = 0,
                StockAfter = product.StockQuantity,
                Note = "Khởi tạo tồn kho ban đầu khi tạo sản phẩm",
                CreatedAtUtc = product.CreatedAtUtc
            };
            _context.InventoryTransactions.Add(initialInvTx);

            var auditLog = new AuditLog
            {
                Id = Guid.NewGuid(),
                UserId = actorUserId,
                Action = "inventory.import",
                EntityType = "Product",
                EntityId = product.Id.ToString(),
                DetailsJson = JsonSerializer.Serialize(new
                {
                    sku = product.Code,
                    quantity = product.StockQuantity,
                    stockBefore = 0,
                    stockAfter = product.StockQuantity,
                    note = "Khởi tạo tồn kho ban đầu khi tạo sản phẩm"
                }),
                IpAddress = ipAddress,
                CreatedAtUtc = product.CreatedAtUtc
            };
            _context.AuditLogs.Add(auditLog);
        }

        await SafeSaveChangesAsync(ct, $"Mã sản phẩm (SKU) '{normalizedCode}' đã tồn tại.");

        product.Category = category;
        return MapToDto(product);
    }

    public async Task<ProductDto> UpdateProductAsync(Guid id, UpdateProductRequest request, CancellationToken ct = default)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id, ct);

        if (product == null)
        {
            throw new NotFoundException($"Không tìm thấy sản phẩm với ID '{id}'.");
        }

        var normalizedCode = request.Code?.Trim().ToUpperInvariant() ?? string.Empty;
        ValidateProductInput(normalizedCode, request.Name, request.Price, request.OldPrice);

        var category = await _context.Categories.FirstOrDefaultAsync(c => c.Id == request.CategoryId, ct);
        if (category == null || !category.IsActive)
        {
            throw new ArgumentException("Danh mục được chọn không tồn tại hoặc đã bị ẩn.");
        }

        var exists = await _context.Products.AnyAsync(p => p.Id != id && p.Code.ToUpper() == normalizedCode, ct);
        if (exists)
        {
            throw new ConflictException($"Mã sản phẩm (SKU) '{normalizedCode}' đã tồn tại trong hệ thống.");
        }

        product.CategoryId = request.CategoryId;
        product.Code = normalizedCode;
        product.Name = request.Name.Trim();
        product.Description = request.Description?.Trim();
        product.Price = request.Price;
        product.OldPrice = request.OldPrice;
        if (!string.IsNullOrWhiteSpace(request.ImageUrl))
        {
            product.ImageUrl = request.ImageUrl.Trim();
        }
        product.IsActive = request.IsActive;
        product.UpdatedAtUtc = DateTimeOffset.UtcNow;

        await SafeSaveChangesAsync(ct, $"Mã sản phẩm (SKU) '{normalizedCode}' đã tồn tại.");
        product.Category = category;

        return MapToDto(product);
    }

    public async Task SoftDeleteProductAsync(Guid id, CancellationToken ct = default)
    {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (product == null)
        {
            throw new NotFoundException($"Không tìm thấy sản phẩm với ID '{id}'.");
        }

        product.IsActive = false;
        product.UpdatedAtUtc = DateTimeOffset.UtcNow;
        await _context.SaveChangesAsync(ct);
    }

    public async Task<ProductDto> RestoreProductAsync(Guid id, CancellationToken ct = default)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id, ct);

        if (product == null)
        {
            throw new NotFoundException($"Không tìm thấy sản phẩm với ID '{id}'.");
        }

        if (product.Category == null || !product.Category.IsActive)
        {
            throw new ConflictException($"Không thể khôi phục sản phẩm vì danh mục '{product.Category?.Name ?? "đã chọn"}' đang bị ẩn.");
        }

        product.IsActive = true;
        product.UpdatedAtUtc = DateTimeOffset.UtcNow;
        await _context.SaveChangesAsync(ct);

        return MapToDto(product);
    }

    public async Task<ProductImageDto> UploadProductImageAsync(Guid productId, UploadProductImageInput input, CancellationToken ct = default)
    {
        var product = await _context.Products
            .Include(p => p.ProductImages)
            .FirstOrDefaultAsync(p => p.Id == productId, ct);

        if (product == null)
        {
            throw new NotFoundException($"Không tìm thấy sản phẩm với ID '{productId}'.");
        }

        await ProductionValidators.ValidateImageFileAsync(input.Content, input.FileName, input.ContentType, input.Length, ct);

        var safeFileName = Path.GetFileName(input.FileName);
        var extension = Path.GetExtension(safeFileName).ToLowerInvariant();

        // Save File with Safe Random Filename
        var uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "products");
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var uniqueFileName = $"{Guid.NewGuid():N}{extension}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        if (input.Content.CanSeek)
        {
            input.Content.Position = 0;
        }

        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await input.Content.CopyToAsync(fileStream, ct);
        }

        var relativeUrl = $"/uploads/products/{uniqueFileName}";

        var isPrimary = !product.ProductImages.Any();
        var maxOrder = product.ProductImages.Select(i => (int?)i.DisplayOrder).Max() ?? 0;

        var productImage = new ProductImage
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            Url = relativeUrl,
            AltText = product.Name,
            DisplayOrder = maxOrder + 1,
            IsPrimary = isPrimary,
            CreatedAtUtc = DateTimeOffset.UtcNow
        };

        _context.ProductImages.Add(productImage);

        if (string.IsNullOrWhiteSpace(product.ImageUrl) || isPrimary)
        {
            product.ImageUrl = relativeUrl;
        }

        try
        {
            await _context.SaveChangesAsync(ct);
        }
        catch
        {
            // Clean up file if DB save fails
            if (File.Exists(filePath))
            {
                try { File.Delete(filePath); } catch { }
            }
            throw;
        }

        return MapToImageDto(productImage);
    }

    public async Task DeleteProductImageAsync(Guid productId, Guid imageId, CancellationToken ct = default)
    {
        var product = await _context.Products
            .Include(p => p.ProductImages)
            .FirstOrDefaultAsync(p => p.Id == productId, ct);

        if (product == null)
        {
            throw new NotFoundException($"Không tìm thấy sản phẩm với ID '{productId}'.");
        }

        var image = product.ProductImages.FirstOrDefault(i => i.Id == imageId);
        if (image == null)
        {
            throw new NotFoundException("Không tìm thấy hình ảnh sản phẩm.");
        }

        var wasPrimary = image.IsPrimary || product.ImageUrl == image.Url;
        var imagePathToDelete = image.Url;

        _context.ProductImages.Remove(image);

        // If deleted image was primary or active ImageUrl, promote remaining image ordered by DisplayOrder
        if (wasPrimary)
        {
            var remainingImages = product.ProductImages
                .Where(i => i.Id != imageId)
                .OrderBy(i => i.DisplayOrder)
                .ToList();

            if (remainingImages.Any())
            {
                var newPrimary = remainingImages.First();
                newPrimary.IsPrimary = true;
                product.ImageUrl = newPrimary.Url;
            }
            else
            {
                product.ImageUrl = null;
            }
        }

        // 1. Save Database FIRST
        await _context.SaveChangesAsync(ct);

        // 2. Physical file deletion AFTER SaveChangesAsync succeeds
        if (!string.IsNullOrWhiteSpace(imagePathToDelete) && imagePathToDelete.StartsWith("/uploads/"))
        {
            var relativePath = imagePathToDelete.TrimStart('/');
            var fullPath = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), relativePath.Replace('/', Path.DirectorySeparatorChar));
            if (File.Exists(fullPath))
            {
                try
                {
                    File.Delete(fullPath);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Không thể xóa file ảnh vật lý tại path '{FilePath}'. Cơ sở dữ liệu đã được cập nhật thành công.", fullPath);
                }
            }
        }
    }

    private async Task SafeSaveChangesAsync(CancellationToken ct, string conflictMessage)
    {
        try
        {
            await _context.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex)
        {
            if (ex.InnerException is PostgresException pex && pex.SqlState == PostgresErrorCodes.UniqueViolation)
            {
                throw new ConflictException(conflictMessage, ex);
            }
            throw;
        }
    }

    private static void ValidateFilterParams(ProductFilterParams filter)
    {
        if (filter.Page < 1)
        {
            throw new ArgumentException("Trang (page) phải lớn hơn hoặc bằng 1.");
        }

        if (filter.PageSize < 1 || filter.PageSize > 100)
        {
            throw new ArgumentException("Kích thước trang (pageSize) phải nằm trong khoảng từ 1 đến 100.");
        }

        if (filter.MinPrice.HasValue && filter.MinPrice < 0)
        {
            throw new ArgumentException("Giá tối thiểu (minPrice) không được âm.");
        }

        if (filter.MaxPrice.HasValue && filter.MaxPrice < 0)
        {
            throw new ArgumentException("Giá tối đa (maxPrice) không được âm.");
        }

        if (filter.MinPrice.HasValue && filter.MaxPrice.HasValue && filter.MinPrice > filter.MaxPrice)
        {
            throw new ArgumentException("Giá tối thiểu (minPrice) không được lớn hơn giá tối đa (maxPrice).");
        }

        if (!string.IsNullOrWhiteSpace(filter.SortBy))
        {
            var validSorts = new[] { "newest", "priceasc", "pricedesc" };
            if (!validSorts.Contains(filter.SortBy.Trim().ToLowerInvariant()))
            {
                throw new ArgumentException($"Tham số sortBy '{filter.SortBy}' không hợp lệ.");
            }
        }
    }

    private static void ValidateProductInput(string code, string name, decimal price, decimal? oldPrice, int? stockQuantity = null)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            throw new ArgumentException("Mã sản phẩm (SKU) không được để trống.");
        }

        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Tên sản phẩm không được để trống.");
        }

        if (price <= 0)
        {
            throw new ArgumentException("Giá sản phẩm phải lớn hơn 0.");
        }

        if (oldPrice.HasValue)
        {
            if (oldPrice.Value < 0)
            {
                throw new ArgumentException("Giá cũ (oldPrice) không được âm.");
            }
            if (oldPrice.Value < price)
            {
                throw new ArgumentException("Giá cũ (oldPrice) phải lớn hơn hoặc bằng giá bán (price).");
            }
        }

        if (stockQuantity.HasValue && stockQuantity.Value < 0)
        {
            throw new ArgumentException("Số lượng tồn kho (stockQuantity) không được âm.");
        }
    }

    private static IQueryable<Product> ApplyFilters(IQueryable<Product> query, ProductFilterParams filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim().ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(search) || p.Code.ToLower().Contains(search));
        }

        if (filter.CategoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == filter.CategoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.CategoryCode))
        {
            var catCode = filter.CategoryCode.Trim().ToLower();
            query = query.Where(p => p.Category.Code.ToLower() == catCode);
        }

        if (filter.MinPrice.HasValue)
        {
            query = query.Where(p => p.Price >= filter.MinPrice.Value);
        }

        if (filter.MaxPrice.HasValue)
        {
            query = query.Where(p => p.Price <= filter.MaxPrice.Value);
        }

        return query;
    }

    private static IQueryable<Product> ApplySorting(IQueryable<Product> query, string? sortBy)
    {
        var sort = sortBy?.Trim().ToLowerInvariant();
        return sort switch
        {
            "priceasc" => query.OrderBy(p => p.Price),
            "pricedesc" => query.OrderByDescending(p => p.Price),
            _ => query.OrderByDescending(p => p.CreatedAtUtc)
        };
    }

    private static ProductDto MapToDto(Product p) => new()
    {
        Id = p.Id,
        CategoryId = p.CategoryId,
        CategoryCode = p.Category?.Code ?? string.Empty,
        CategoryName = p.Category?.Name ?? string.Empty,
        Code = p.Code,
        Name = p.Name,
        Description = p.Description,
        Price = p.Price,
        OldPrice = p.OldPrice,
        StockQuantity = p.StockQuantity,
        ImageUrl = p.ImageUrl,
        IsActive = p.IsActive,
        CreatedAtUtc = p.CreatedAtUtc,
        UpdatedAtUtc = p.UpdatedAtUtc
    };

    private static ProductDetailDto MapToDetailDto(Product p) => new()
    {
        Id = p.Id,
        CategoryId = p.CategoryId,
        CategoryCode = p.Category?.Code ?? string.Empty,
        CategoryName = p.Category?.Name ?? string.Empty,
        Code = p.Code,
        Name = p.Name,
        Description = p.Description,
        Price = p.Price,
        OldPrice = p.OldPrice,
        StockQuantity = p.StockQuantity,
        ImageUrl = p.ImageUrl,
        IsActive = p.IsActive,
        CreatedAtUtc = p.CreatedAtUtc,
        UpdatedAtUtc = p.UpdatedAtUtc,
        Category = p.Category != null ? new CategoryDto
        {
            Id = p.Category.Id,
            Code = p.Category.Code,
            Name = p.Category.Name,
            Description = p.Category.Description,
            IsActive = p.Category.IsActive,
            CreatedAtUtc = p.Category.CreatedAtUtc
        } : null,
        ProductImages = p.ProductImages?.Select(MapToImageDto).ToList() ?? new()
    };

    private static ProductImageDto MapToImageDto(ProductImage img) => new()
    {
        Id = img.Id,
        ProductId = img.ProductId,
        Url = img.Url,
        AltText = img.AltText,
        DisplayOrder = img.DisplayOrder,
        IsPrimary = img.IsPrimary,
        CreatedAtUtc = img.CreatedAtUtc
    };
}
