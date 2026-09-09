using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using TechHub.Application.Common.Interfaces;
using TechHub.Application.DTOs.Catalog;
using TechHub.Infrastructure.Security;

namespace TechHub.Api.Controllers;

[ApiController]
[Route("api/admin/products")]
[HasPermission("products.manage")]
public class AdminProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public AdminProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductDto>>> GetAdminProducts(
        [FromQuery] ProductFilterParams filter,
        CancellationToken ct)
    {
        var result = await _productService.GetAdminProductsAsync(filter, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProductDetailDto>> GetAdminProductById(Guid id, CancellationToken ct)
    {
        var product = await _productService.GetAdminProductByIdAsync(id, ct);
        return Ok(product);
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

    [HttpPost]
    public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        var ip = GetIpAddress();
        var product = await _productService.CreateProductAsync(userId, ip, request, ct);
        return CreatedAtAction(nameof(GetAdminProductById), new { id = product.Id }, product);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ProductDto>> UpdateProduct(Guid id, [FromBody] UpdateProductRequest request, CancellationToken ct)
    {
        var product = await _productService.UpdateProductAsync(id, request, ct);
        return Ok(product);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteProduct(Guid id, CancellationToken ct)
    {
        await _productService.SoftDeleteProductAsync(id, ct);
        return NoContent();
    }

    [HttpPatch("{id:guid}/restore")]
    public async Task<ActionResult<ProductDto>> RestoreProduct(Guid id, CancellationToken ct)
    {
        var product = await _productService.RestoreProductAsync(id, ct);
        return Ok(product);
    }

    [HttpPost("{id:guid}/images")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    [RequestFormLimits(MultipartBodyLengthLimit = 5 * 1024 * 1024)]
    public async Task<ActionResult<ProductImageDto>> UploadProductImage(Guid id, IFormFile file, CancellationToken ct)
    {
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("File tải lên không được để trống.");
        }

        using var stream = file.OpenReadStream();
        var input = new UploadProductImageInput
        {
            Content = stream,
            FileName = file.FileName,
            ContentType = file.ContentType,
            Length = file.Length
        };

        var imageDto = await _productService.UploadProductImageAsync(id, input, ct);
        return Ok(imageDto);
    }

    [HttpDelete("{id:guid}/images/{imageId:guid}")]
    public async Task<IActionResult> DeleteProductImage(Guid id, Guid imageId, CancellationToken ct)
    {
        await _productService.DeleteProductImageAsync(id, imageId, ct);
        return NoContent();
    }
}
