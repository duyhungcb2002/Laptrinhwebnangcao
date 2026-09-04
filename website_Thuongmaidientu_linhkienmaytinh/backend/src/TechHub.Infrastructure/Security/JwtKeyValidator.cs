using System.Text;
using Microsoft.Extensions.Configuration;

namespace TechHub.Infrastructure.Security;

public static class JwtKeyValidator
{
    public const int MinimumKeySizeBytes = 32; // 256 bits for HMAC-SHA256

    public static byte[] GetValidatedKeyBytes(IConfiguration configuration)
    {
        var keyBase64 = configuration["Jwt:Key"];
        if (string.IsNullOrWhiteSpace(keyBase64))
        {
            throw new InvalidOperationException(
                "Configuration 'Jwt:Key' is missing or empty. Please set a valid Base64-encoded signing key (minimum 32 bytes) in User Secrets.");
        }

        byte[] keyBytes;
        try
        {
            keyBytes = Convert.FromBase64String(keyBase64.Trim());
        }
        catch (FormatException ex)
        {
            throw new InvalidOperationException(
                "Configuration 'Jwt:Key' is not a valid Base64 string. Please verify the value in User Secrets.", ex);
        }

        if (keyBytes.Length < MinimumKeySizeBytes)
        {
            throw new InvalidOperationException(
                $"Configuration 'Jwt:Key' must decode to at least {MinimumKeySizeBytes} bytes (256 bits). The provided key decoded to {keyBytes.Length} bytes.");
        }

        return keyBytes;
    }
}
