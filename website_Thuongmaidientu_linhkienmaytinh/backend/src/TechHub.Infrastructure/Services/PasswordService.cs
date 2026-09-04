using Microsoft.AspNetCore.Identity;
using TechHub.Application.Common.Interfaces;
using TechHub.Domain.Entities;

namespace TechHub.Infrastructure.Services;

public class PasswordService : IPasswordService
{
    private readonly PasswordHasher<User> _passwordHasher = new();

    public string HashPassword(User user, string password)
    {
        return _passwordHasher.HashPassword(user, password);
    }

    public bool VerifyPassword(User user, string hashedPassword, string providedPassword, out bool rehashNeeded)
    {
        rehashNeeded = false;
        var result = _passwordHasher.VerifyHashedPassword(user, hashedPassword, providedPassword);

        if (result == PasswordVerificationResult.SuccessRehashNeeded)
        {
            rehashNeeded = true;
            return true;
        }

        return result == PasswordVerificationResult.Success;
    }
}
