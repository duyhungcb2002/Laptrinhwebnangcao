using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using TechHub.Domain.Entities;

namespace TechHub.Infrastructure.Security;

public class OrderAuthorizationHandler : AuthorizationHandler<OrderOwnerRequirement, Order>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        OrderOwnerRequirement requirement,
        Order resource)
    {
        // Admin with 'orders.read.all' permission can access any order
        if (context.User.Claims.Any(c => c.Type == "permission" && c.Value == "orders.read.all"))
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        // Customer can read order if Order.UserId matches user id in claim 'sub' or NameIdentifier
        var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
            ?? context.User.FindFirst("sub")?.Value;

        if (Guid.TryParse(userIdClaim, out var userId) && resource.UserId == userId)
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
