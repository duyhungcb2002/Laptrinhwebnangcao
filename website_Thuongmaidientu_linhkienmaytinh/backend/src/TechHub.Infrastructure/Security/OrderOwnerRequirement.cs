using Microsoft.AspNetCore.Authorization;

namespace TechHub.Infrastructure.Security;

public class OrderOwnerRequirement : IAuthorizationRequirement
{
}
