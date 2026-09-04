using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Configuration;
using TechHub.Application.Common.Interfaces;
using TechHub.Domain.Entities;

namespace TechHub.Infrastructure.Services;

public class RefreshTokenService : IRefreshTokenService
{
    private readonly IConfiguration _configuration;

    public RefreshTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public (string rawToken, RefreshToken refreshToken) CreateRefreshToken(Guid userId, Guid familyId, string? ipAddress)
    {
        var randomBytes = new byte[64];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomBytes);
        }

        var rawToken = WebEncoders.Base64UrlEncode(randomBytes);
        var tokenHash = HashToken(rawToken);

        var days = int.TryParse(_configuration["Jwt:RefreshTokenDays"], out var d) ? d : 7;

        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TokenHash = tokenHash,
            FamilyId = familyId == Guid.Empty ? Guid.NewGuid() : familyId,
            CreatedAtUtc = DateTimeOffset.UtcNow,
            ExpiresAtUtc = DateTimeOffset.UtcNow.AddDays(days),
            CreatedByIp = ipAddress
        };

        return (rawToken, refreshToken);
    }

    public string HashToken(string rawToken)
    {
        var bytes = Encoding.UTF8.GetBytes(rawToken);
        var hash = SHA256.HashData(bytes);
        return Convert.ToHexStringLower(hash);
    }
}
