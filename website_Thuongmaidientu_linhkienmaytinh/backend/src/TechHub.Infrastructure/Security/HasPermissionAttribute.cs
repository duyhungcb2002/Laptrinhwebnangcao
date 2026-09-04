using Microsoft.AspNetCore.Authorization;

namespace TechHub.Infrastructure.Security;

public class HasPermissionAttribute : AuthorizeAttribute
{
    public HasPermissionAttribute(string permission)
        : base(permission)
    {
    }
}
