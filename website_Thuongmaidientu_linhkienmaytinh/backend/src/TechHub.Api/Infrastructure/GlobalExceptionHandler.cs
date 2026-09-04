using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using TechHub.Application.Common.Exceptions;

namespace TechHub.Api.Infrastructure;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        _logger.LogError(exception, "An unhandled exception occurred: {Message}", exception.Message);

        var (statusCode, title, type) = exception switch
        {
            ArgumentException => (
                StatusCodes.Status400BadRequest,
                "Bad Request",
                "https://tools.ietf.org/html/rfc7231#section-6.5.1"
            ),
            UnauthorizedAccessException => (
                StatusCodes.Status401Unauthorized,
                "Unauthorized",
                "https://tools.ietf.org/html/rfc7235#section-3.1"
            ),
            ForbiddenAccessException => (
                StatusCodes.Status403Forbidden,
                "Forbidden",
                "https://tools.ietf.org/html/rfc7231#section-6.5.3"
            ),
            KeyNotFoundException or NotFoundException => (
                StatusCodes.Status404NotFound,
                "Not Found",
                "https://tools.ietf.org/html/rfc7231#section-6.5.4"
            ),
            ConflictException => (
                StatusCodes.Status409Conflict,
                "Conflict",
                "https://tools.ietf.org/html/rfc7231#section-6.5.8"
            ),
            _ => (
                StatusCodes.Status500InternalServerError,
                "Internal Server Error",
                "https://tools.ietf.org/html/rfc7231#section-6.6.1"
            )
        };

        var problemDetails = new ProblemDetails
        {
            Type = type,
            Title = title,
            Status = statusCode,
            Detail = statusCode == StatusCodes.Status500InternalServerError 
                ? "An unexpected error occurred. Please try again later."
                : exception.Message,
            Instance = httpContext.Request.Path
        };

        problemDetails.Extensions["traceId"] = httpContext.TraceIdentifier;

        httpContext.Response.StatusCode = statusCode;
        httpContext.Response.ContentType = "application/problem+json";

        await httpContext.Response.WriteAsync(
            System.Text.Json.JsonSerializer.Serialize(problemDetails),
            cancellationToken);

        return true;
    }
}
