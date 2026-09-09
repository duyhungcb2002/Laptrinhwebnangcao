using TechHub.Application.DTOs.Reports;

namespace TechHub.Application.Common.Interfaces;

public interface IReportService
{
    Task<DashboardReportResponse> GetDashboardReportAsync(DashboardReportRequest request, CancellationToken ct = default);
}
