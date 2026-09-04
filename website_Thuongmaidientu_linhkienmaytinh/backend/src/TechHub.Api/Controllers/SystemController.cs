using Microsoft.AspNetCore.Mvc;

namespace TechHub.Api.Controllers;

[ApiController]
[Route("api/system")]
public class SystemController : ControllerBase
{
    [HttpGet("status")]
    public IActionResult GetStatus()
    {
        return Ok(new
        {
            apiName = "TechHub PC API",
            version = "v1",
            status = "Running",
            timestamp = DateTimeOffset.UtcNow
        });
    }
}
