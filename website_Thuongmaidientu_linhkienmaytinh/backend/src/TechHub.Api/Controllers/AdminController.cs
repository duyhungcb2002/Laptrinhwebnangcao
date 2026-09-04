using Microsoft.AspNetCore.Mvc;
using TechHub.Infrastructure.Security;

namespace TechHub.Api.Controllers;

[ApiController]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    [HttpGet("security-check")]
    [HasPermission("admin.access")]
    public IActionResult SecurityCheck()
    {
        return Ok(new
        {
            message = "Admin security check passed.",
            timestamp = DateTimeOffset.UtcNow
        });
    }
}
