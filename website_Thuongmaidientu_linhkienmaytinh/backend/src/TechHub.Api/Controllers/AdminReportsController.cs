using Microsoft.AspNetCore.Mvc;
using TechHub.Application.Common.Interfaces;
using TechHub.Application.DTOs.Reports;
using TechHub.Infrastructure.Security;

namespace TechHub.Api.Controllers;

[ApiController]
[Route("api/admin/reports")]
[HasPermission("reports.read")]
public class AdminReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public AdminReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardReportResponse>> GetDashboardReport(
        [FromQuery] DashboardReportRequest request,
        CancellationToken ct)
    {
        var result = await _reportService.GetDashboardReportAsync(request, ct);
        return Ok(result);
    }
}
