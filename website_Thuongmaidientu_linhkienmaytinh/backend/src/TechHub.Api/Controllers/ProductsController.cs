using Microsoft.AspNetCore.Mvc;
using TechHub.Application.Common.Interfaces;
using TechHub.Application.DTOs.Catalog;

namespace TechHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductDto>>> GetPublicProducts(
        [FromQuery] ProductFilterParams filter,
        CancellationToken ct)
    {
        var result = await _productService.GetPublicProductsAsync(filter, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProductDetailDto>> GetPublicProductById(Guid id, CancellationToken ct)
    {
        var product = await _productService.GetPublicProductByIdAsync(id, ct);
        return Ok(product);
    }
}
