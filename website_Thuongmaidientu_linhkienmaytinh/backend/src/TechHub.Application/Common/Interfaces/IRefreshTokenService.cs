using TechHub.Domain.Entities;

namespace TechHub.Application.Common.Interfaces;

public interface IRefreshTokenService
{
    (string rawToken, RefreshToken refreshToken) CreateRefreshToken(Guid userId, Guid familyId, string? ipAddress);
    string HashToken(string rawToken);
}
