namespace TechHub.Application.DTOs.Auth;

public class AuthResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public int ExpiresInMinutes { get; set; } = 15;
    public UserSummaryResponse User { get; set; } = null!;
}
