namespace TechHub.Application.DTOs.Cart;

public class CartItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string MainImageUrl { get; set; } = string.Empty;
    public decimal CurrentPrice { get; set; }
    public int StockQuantity { get; set; }
    public int Quantity { get; set; }
    public decimal LineTotal { get; set; }
}

public class CartDto
{
    public Guid CartId { get; set; }
    public List<CartItemDto> Items { get; set; } = new();
    public int TotalQuantity { get; set; }
    public decimal Subtotal { get; set; }
}

public class AddCartItemRequest
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
}

public class UpdateCartItemRequest
{
    public int Quantity { get; set; }
}
