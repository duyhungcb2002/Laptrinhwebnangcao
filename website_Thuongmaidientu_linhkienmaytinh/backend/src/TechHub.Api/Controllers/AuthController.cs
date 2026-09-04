using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechHub.Application.Common.Exceptions;
using TechHub.Application.Common.Interfaces;
using TechHub.Application.DTOs.Auth;

namespace TechHub.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IHostEnvironment _environment;

    public AuthController(IAuthService authService, IHostEnvironment environment)
    {
        _authService = authService;
        _environment = environment;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var (response, rawRefreshToken) = await _authService.RegisterAsync(request, ipAddress, ct);

        SetRefreshTokenCookie(rawRefreshToken);
        return StatusCode(StatusCodes.Status201Created, response);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var (response, rawRefreshToken) = await _authService.LoginAsync(request, ipAddress, ct);

        SetRefreshTokenCookie(rawRefreshToken);
        return Ok(response);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(CancellationToken ct)
    {
        var rawRefreshToken = Request.Cookies["techhub_refresh"];
        if (string.IsNullOrWhiteSpace(rawRefreshToken))
        {
            throw new UnauthorizedAccessException("Refresh token cookie is missing.");
        }

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var (response, newRawRefreshToken) = await _authService.RefreshAsync(rawRefreshToken, ipAddress, ct);

        SetRefreshTokenCookie(newRawRefreshToken);
        return Ok(response);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(CancellationToken ct)
    {
        var rawRefreshToken = Request.Cookies["techhub_refresh"];
        if (!string.IsNullOrWhiteSpace(rawRefreshToken))
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            await _authService.RevokeTokenAsync(rawRefreshToken, ipAddress, ct);
        }

        DeleteRefreshTokenCookie();
        return NoContent();
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMe(CancellationToken ct)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;

        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("User identifier in token is missing or invalid.");
        }

        var user = await _authService.GetCurrentUserAsync(userId, ct);
        if (user == null)
        {
            throw new UnauthorizedAccessException("User account is not found or inactive.");
        }

        return Ok(user);
    }

    private void SetRefreshTokenCookie(string rawRefreshToken)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Lax,
            Path = "/api/auth",
            Expires = DateTimeOffset.UtcNow.AddDays(7),
            Secure = !_environment.IsDevelopment()
        };

        Response.Cookies.Append("techhub_refresh", rawRefreshToken, cookieOptions);
    }

    private void DeleteRefreshTokenCookie()
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Lax,
            Path = "/api/auth",
            Expires = DateTimeOffset.UtcNow.AddDays(-1),
            Secure = !_environment.IsDevelopment()
        };

        Response.Cookies.Delete("techhub_refresh", cookieOptions);
    }
}
