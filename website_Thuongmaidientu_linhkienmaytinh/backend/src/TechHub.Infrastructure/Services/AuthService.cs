using System.Net.Mail;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using TechHub.Application.Common.Exceptions;
using TechHub.Application.Common.Interfaces;
using TechHub.Application.DTOs.Auth;
using TechHub.Domain.Entities;
using TechHub.Infrastructure.Persistence;
using TechHub.Infrastructure.Persistence.Configurations;

namespace TechHub.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IPasswordService _passwordService;
    private readonly ITokenService _tokenService;
    private readonly IRefreshTokenService _refreshTokenService;

    public AuthService(
        AppDbContext context,
        IPasswordService passwordService,
        ITokenService tokenService,
        IRefreshTokenService refreshTokenService)
    {
        _context = context;
        _passwordService = passwordService;
        _tokenService = tokenService;
        _refreshTokenService = refreshTokenService;
    }

    public async Task<(AuthResponse authResponse, string rawRefreshToken)> RegisterAsync(
        RegisterRequest request, string? ipAddress, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.FullName))
            throw new ArgumentException("Full name is required.");

        if (string.IsNullOrWhiteSpace(request.Email))
            throw new ArgumentException("Email is required.");

        if (!IsValidEmail(request.Email.Trim()))
            throw new ArgumentException("Invalid email format.");

        ValidatePassword(request.Password);

        var normalizedEmail = request.Email.Trim().ToUpperInvariant();
        var emailExists = await _context.Users.AnyAsync(u => u.NormalizedEmail == normalizedEmail, ct);
        if (emailExists)
        {
            throw new ConflictException("Email is already registered.");
        }

        // Fetch Customer role and its seeded permissions
        var customerRole = await _context.Roles
            .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(r => r.Id == RoleConfiguration.CustomerRoleId || r.Name == "Customer", ct);

        if (customerRole == null)
        {
            throw new InvalidOperationException("Customer role does not exist in the system. Unable to complete registration.");
        }

        using var transaction = await _context.Database.BeginTransactionAsync(ct);
        try
        {
            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = request.Email.Trim(),
                NormalizedEmail = normalizedEmail,
                FullName = request.FullName.Trim(),
                IsActive = true,
                CreatedAtUtc = DateTimeOffset.UtcNow
            };

            user.PasswordHash = _passwordService.HashPassword(user, request.Password);
            _context.Users.Add(user);

            // Assign Customer role
            _context.UserRoles.Add(new UserRole
            {
                UserId = user.Id,
                RoleId = customerRole.Id,
                AssignedAtUtc = DateTimeOffset.UtcNow
            });

            // Create empty Cart
            _context.Carts.Add(new Cart
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                CreatedAtUtc = DateTimeOffset.UtcNow
            });

            var (rawRefreshToken, refreshTokenEntity) = _refreshTokenService.CreateRefreshToken(user.Id, Guid.NewGuid(), ipAddress);
            _context.RefreshTokens.Add(refreshTokenEntity);

            await _context.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);

            var roles = new List<string> { customerRole.Name };
            var permissions = customerRole.RolePermissions
                .Select(rp => rp.Permission.Code)
                .Distinct()
                .ToList();

            var accessToken = _tokenService.GenerateAccessToken(user, roles, permissions);

            var response = new AuthResponse
            {
                AccessToken = accessToken,
                ExpiresInMinutes = 15,
                User = new UserSummaryResponse
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    Roles = roles,
                    Permissions = permissions
                }
            };

            return (response, rawRefreshToken);
        }
        catch
        {
            await transaction.RollbackAsync(ct);
            throw;
        }
    }

    public async Task<(AuthResponse authResponse, string rawRefreshToken)> LoginAsync(
        LoginRequest request, string? ipAddress, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        var normalizedEmail = request.Email.Trim().ToUpperInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail, ct);

        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        if (!_passwordService.VerifyPassword(user, user.PasswordHash, request.Password, out var rehashNeeded))
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        if (rehashNeeded)
        {
            user.PasswordHash = _passwordService.HashPassword(user, request.Password);
            user.UpdatedAtUtc = DateTimeOffset.UtcNow;
        }

        if (!user.IsActive)
        {
            throw new ForbiddenAccessException("User account is locked.");
        }

        var (roles, permissions) = await GetUserRolesAndPermissionsAsync(user.Id, ct);
        var accessToken = _tokenService.GenerateAccessToken(user, roles, permissions);
        var (rawRefreshToken, refreshTokenEntity) = _refreshTokenService.CreateRefreshToken(user.Id, Guid.NewGuid(), ipAddress);

        _context.RefreshTokens.Add(refreshTokenEntity);
        await _context.SaveChangesAsync(ct);

        var response = new AuthResponse
        {
            AccessToken = accessToken,
            ExpiresInMinutes = 15,
            User = new UserSummaryResponse
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Roles = roles,
                Permissions = permissions
            }
        };

        return (response, rawRefreshToken);
    }

    public async Task<(AuthResponse authResponse, string rawRefreshToken)> RefreshAsync(
        string rawRefreshToken, string? ipAddress, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(rawRefreshToken))
        {
            throw new UnauthorizedAccessException("Refresh token is required.");
        }

        var tokenHash = _refreshTokenService.HashToken(rawRefreshToken);
        var existingToken = await _context.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash, ct);

        if (existingToken == null)
        {
            throw new UnauthorizedAccessException("Invalid refresh token.");
        }

        if (existingToken.RevokedAtUtc != null)
        {
            // Reuse detected! Revoke all active tokens in the family and record detection time
            existingToken.ReuseDetectedAtUtc = DateTimeOffset.UtcNow;

            var familyTokens = await _context.RefreshTokens
                .Where(rt => rt.FamilyId == existingToken.FamilyId && rt.RevokedAtUtc == null)
                .ToListAsync(ct);

            foreach (var token in familyTokens)
            {
                token.RevokedAtUtc = DateTimeOffset.UtcNow;
                token.RevokedByIp = ipAddress;
                token.ReuseDetectedAtUtc = DateTimeOffset.UtcNow;
            }

            await _context.SaveChangesAsync(ct);
            throw new UnauthorizedAccessException("Refresh token reuse detected. All tokens in this session have been revoked.");
        }

        if (existingToken.ExpiresAtUtc <= DateTimeOffset.UtcNow)
        {
            throw new UnauthorizedAccessException("Refresh token has expired.");
        }

        if (!existingToken.User.IsActive)
        {
            throw new ForbiddenAccessException("User account is locked.");
        }

        // Rotate token safely in transaction
        using var transaction = await _context.Database.BeginTransactionAsync(ct);
        try
        {
            var (newRawRefreshToken, newTokenEntity) = _refreshTokenService.CreateRefreshToken(
                existingToken.UserId, existingToken.FamilyId, ipAddress);

            existingToken.RevokedAtUtc = DateTimeOffset.UtcNow;
            existingToken.RevokedByIp = ipAddress;
            existingToken.ReplacedByTokenId = newTokenEntity.Id;

            _context.RefreshTokens.Add(newTokenEntity);

            await _context.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);

            var (roles, permissions) = await GetUserRolesAndPermissionsAsync(existingToken.User.Id, ct);
            var accessToken = _tokenService.GenerateAccessToken(existingToken.User, roles, permissions);

            var response = new AuthResponse
            {
                AccessToken = accessToken,
                ExpiresInMinutes = 15,
                User = new UserSummaryResponse
                {
                    Id = existingToken.User.Id,
                    FullName = existingToken.User.FullName,
                    Email = existingToken.User.Email,
                    Roles = roles,
                    Permissions = permissions
                }
            };

            return (response, newRawRefreshToken);
        }
        catch
        {
            await transaction.RollbackAsync(ct);
            throw;
        }
    }

    public async Task RevokeTokenAsync(string rawRefreshToken, string? ipAddress, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(rawRefreshToken)) return;

        var tokenHash = _refreshTokenService.HashToken(rawRefreshToken);
        var token = await _context.RefreshTokens.FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash, ct);

        if (token != null && token.RevokedAtUtc == null)
        {
            token.RevokedAtUtc = DateTimeOffset.UtcNow;
            token.RevokedByIp = ipAddress;
            await _context.SaveChangesAsync(ct);
        }
    }

    public async Task<CurrentUserResponse?> GetCurrentUserAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive, ct);
        if (user == null) return null;

        var (roles, permissions) = await GetUserRolesAndPermissionsAsync(user.Id, ct);

        return new CurrentUserResponse
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Roles = roles,
            Permissions = permissions
        };
    }

    private async Task<(List<string> roles, List<string> permissions)> GetUserRolesAndPermissionsAsync(
        Guid userId, CancellationToken ct)
    {
        var userRoles = await _context.UserRoles
            .Where(ur => ur.UserId == userId)
            .Include(ur => ur.Role)
                .ThenInclude(r => r.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
            .ToListAsync(ct);

        var roles = userRoles.Select(ur => ur.Role.Name).Distinct().ToList();
        var permissions = userRoles
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Code)
            .Distinct()
            .ToList();

        return (roles, permissions);
    }

    private static bool IsValidEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email)) return false;
        try
        {
            var addr = new MailAddress(email);
            return addr.Address.Equals(email, StringComparison.OrdinalIgnoreCase)
                && Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$");
        }
        catch
        {
            return false;
        }
    }

    private static void ValidatePassword(string password)
    {
        if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
        {
            throw new ArgumentException("Password must be at least 8 characters long.");
        }

        if (!Regex.IsMatch(password, @"[A-Z]"))
        {
            throw new ArgumentException("Password must contain at least one uppercase letter.");
        }

        if (!Regex.IsMatch(password, @"[a-z]"))
        {
            throw new ArgumentException("Password must contain at least one lowercase letter.");
        }

        if (!Regex.IsMatch(password, @"[0-9]"))
        {
            throw new ArgumentException("Password must contain at least one digit.");
        }

        if (!Regex.IsMatch(password, @"[\W_]"))
        {
            throw new ArgumentException("Password must contain at least one special character.");
        }
    }
}
