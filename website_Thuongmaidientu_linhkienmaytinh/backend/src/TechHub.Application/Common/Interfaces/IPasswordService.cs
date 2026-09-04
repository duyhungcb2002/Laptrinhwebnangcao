using TechHub.Domain.Entities;

namespace TechHub.Application.Common.Interfaces;

public interface IPasswordService
{
    string HashPassword(User user, string password);
    bool VerifyPassword(User user, string hashedPassword, string providedPassword, out bool rehashNeeded);
}
