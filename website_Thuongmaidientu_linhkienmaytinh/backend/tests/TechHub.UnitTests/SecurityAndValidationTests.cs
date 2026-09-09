using TechHub.Domain.Entities;
using TechHub.Domain.Enums;
using TechHub.Infrastructure.Security;
using TechHub.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace TechHub.UnitTests;

public class SecurityAndValidationTests
{
    private readonly PasswordService _passwordService = new();

    [Fact]
    public void PasswordService_ShouldVerifyCorrectPassword()
    {
        var user = new User { Id = Guid.NewGuid(), Email = "test@example.com" };
        var hash = _passwordService.HashPassword(user, "StrongPassword123!");

        var isValid = _passwordService.VerifyPassword(user, hash, "StrongPassword123!", out _);
        var isInvalid = _passwordService.VerifyPassword(user, hash, "WrongPassword", out _);

        Assert.True(isValid);
        Assert.False(isInvalid);
    }

    [Fact]
    public void JwtKeyValidator_ShouldThrowWhenConfigInvalid()
    {
        var emptyConfig = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>()).Build();
        Assert.Throws<InvalidOperationException>(() => JwtKeyValidator.GetValidatedKeyBytes(emptyConfig));

        var invalidBase64Config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?> { ["Jwt:Key"] = "not_base64!!!" }).Build();
        Assert.Throws<InvalidOperationException>(() => JwtKeyValidator.GetValidatedKeyBytes(invalidBase64Config));

        var shortKeyConfig = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?> { ["Jwt:Key"] = Convert.ToBase64String(new byte[16]) }).Build();
        Assert.Throws<InvalidOperationException>(() => JwtKeyValidator.GetValidatedKeyBytes(shortKeyConfig));
    }

    [Theory]
    [InlineData(OrderStatus.Pending, OrderStatus.Confirmed, true)]
    [InlineData(OrderStatus.Confirmed, OrderStatus.Preparing, true)]
    [InlineData(OrderStatus.Preparing, OrderStatus.Shipping, true)]
    [InlineData(OrderStatus.Shipping, OrderStatus.Completed, true)]
    [InlineData(OrderStatus.Pending, OrderStatus.Cancelled, true)]
    [InlineData(OrderStatus.Confirmed, OrderStatus.Cancelled, true)]
    [InlineData(OrderStatus.Preparing, OrderStatus.Cancelled, true)]
    [InlineData(OrderStatus.Pending, OrderStatus.Shipping, false)]
    [InlineData(OrderStatus.Completed, OrderStatus.Pending, false)]
    [InlineData(OrderStatus.Cancelled, OrderStatus.Confirmed, false)]
    public void OrderStatusTransition_ShouldValidateCorrectly(OrderStatus current, OrderStatus next, bool shouldBeValid)
    {
        if (shouldBeValid)
        {
            OrderService.ValidateStatusTransition(current, next);
        }
        else
        {
            Assert.Throws<Application.Common.Exceptions.ConflictException>(() => OrderService.ValidateStatusTransition(current, next));
        }
    }

    [Theory]
    [InlineData(0, false)]
    [InlineData(6, false)]
    [InlineData(-1, false)]
    [InlineData(1, true)]
    [InlineData(5, true)]
    public void ReviewRating_ShouldValidateBoundary1To5(int rating, bool isValid)
    {
        if (!isValid)
        {
            Assert.Throws<ArgumentException>(() => ProductionValidators.ValidateReviewRating(rating));
        }
        else
        {
            ProductionValidators.ValidateReviewRating(rating);
        }
    }

    [Theory]
    [InlineData(0, false)]
    [InlineData(-5, false)]
    [InlineData(10, true)]
    public void InventoryQuantity_ImportExport_ShouldBePositive(int quantity, bool isValid)
    {
        if (!isValid)
        {
            Assert.Throws<ArgumentException>(() => ProductionValidators.ValidateInventoryQuantity(quantity, "nhập"));
        }
        else
        {
            ProductionValidators.ValidateInventoryQuantity(quantity, "nhập");
        }
    }

    [Fact]
    public void InventoryAdjust_NoStockChange_ShouldBeInvalid()
    {
        Assert.Throws<ArgumentException>(() => ProductionValidators.ValidateInventoryAdjustChange(50, 50));
    }

    [Fact]
    public async Task ImageValidation_FileSignatures_ShouldDetectFakeExtensions()
    {
        // Fake JPEG header for PDF file: %PDF-1.4
        using var pdfStream = new MemoryStream("%PDF-1.4 header contents"u8.ToArray());
        await Assert.ThrowsAsync<ArgumentException>(async () =>
            await ProductionValidators.ValidateImageFileAsync(pdfStream, "fake.jpg", "image/jpeg", pdfStream.Length));

        // Valid PNG Magic bytes: 0x89, 0x50, 0x4E, 0x47
        using var pngStream = new MemoryStream(new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x00 });
        await ProductionValidators.ValidateImageFileAsync(pngStream, "image.png", "image/png", pngStream.Length);
    }
}

