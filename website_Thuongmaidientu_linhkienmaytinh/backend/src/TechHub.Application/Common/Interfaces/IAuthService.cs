using TechHub.Application.DTOs.Auth;

namespace TechHub.Application.Common.Interfaces;

public interface IAuthService
{
    Task<(AuthResponse authResponse, string rawRefreshToken)> RegisterAsync(RegisterRequest request, string? ipAddress, CancellationToken ct = default);
    Task<(AuthResponse authResponse, string rawRefreshToken)> LoginAsync(LoginRequest request, string? ipAddress, CancellationToken ct = default);
    Task<(AuthResponse authResponse, string rawRefreshToken)> RefreshAsync(string rawRefreshToken, string? ipAddress, CancellationToken ct = default);
    Task RevokeTokenAsync(string rawRefreshToken, string? ipAddress, CancellationToken ct = default);
    Task<CurrentUserResponse?> GetCurrentUserAsync(Guid userId, CancellationToken ct = default);
}
