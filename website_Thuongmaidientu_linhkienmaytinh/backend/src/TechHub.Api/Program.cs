using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using TechHub.Api.Infrastructure;
using TechHub.Application.Common.Interfaces;
using TechHub.Infrastructure;
using TechHub.Infrastructure.Persistence;
using TechHub.Infrastructure.Persistence.Seeder;

var builder = WebApplication.CreateBuilder(args);

if (builder.Environment.IsEnvironment("Testing"))
{
    var testSettingsPath = Path.Combine(AppContext.BaseDirectory, "appsettings.Test.json");
    if (File.Exists(testSettingsPath))
    {
        builder.Configuration.AddJsonFile(testSettingsPath, optional: true);
    }
    builder.Configuration.AddUserSecrets<Program>(optional: true);
}

// Add Controllers
builder.Services.AddControllers();

// Add Swagger / OpenAPI with Bearer Authorization
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "TechHub PC API",
        Version = "v1",
        Description = "Backend API for TechHub PC E-commerce Platform with Authentication & RBAC"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Enter JWT Bearer token in the format: Bearer {token}",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    options.AddSecurityRequirement((doc) => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", doc)] = new List<string>()
    });
});

// Add ProblemDetails & Global Exception Handler
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

// Configure CORS (AllowCredentials enabled for HttpOnly Cookie)
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:5173" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Add Infrastructure Services & AppDbContext
builder.Services.AddInfrastructure(builder.Configuration, builder.Environment);

// Add JWT Authentication
var keyBytes = TechHub.Infrastructure.Security.JwtKeyValidator.GetValidatedKeyBytes(builder.Configuration);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "TechHub.Api",
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "TechHub.Frontend",
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
    options.Events = new JwtBearerEvents
    {
        OnChallenge = async context =>
        {
            context.HandleResponse();
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/problem+json";

            var traceId = System.Diagnostics.Activity.Current?.Id ?? context.HttpContext.TraceIdentifier;
            var problemDetails = new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Unauthorized",
                Detail = context.ErrorDescription ?? "Authentication token is missing, invalid, or expired.",
                Instance = context.Request.Path,
                Type = "https://tools.ietf.org/html/rfc7235#section-3.1"
            };
            problemDetails.Extensions["traceId"] = traceId;

            await context.Response.WriteAsJsonAsync(problemDetails, options: (System.Text.Json.JsonSerializerOptions?)null, contentType: "application/problem+json");
        },
        OnForbidden = async context =>
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            context.Response.ContentType = "application/problem+json";

            var traceId = System.Diagnostics.Activity.Current?.Id ?? context.HttpContext.TraceIdentifier;
            var problemDetails = new ProblemDetails
            {
                Status = StatusCodes.Status403Forbidden,
                Title = "Forbidden",
                Detail = "You do not have permission to access this resource.",
                Instance = context.Request.Path,
                Type = "https://tools.ietf.org/html/rfc7231#section-6.5.3"
            };
            problemDetails.Extensions["traceId"] = traceId;

            await context.Response.WriteAsJsonAsync(problemDetails, options: (System.Text.Json.JsonSerializerOptions?)null, contentType: "application/problem+json");
        }
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

// Configure HTTP request pipeline
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "TechHub PC API v1");
    });

    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var passwordService = scope.ServiceProvider.GetRequiredService<IPasswordService>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    await DevelopmentSeeder.SeedAsync(dbContext, app.Configuration, passwordService, logger);
}

app.UseCors("Frontend");
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health Check Endpoint
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";

        var response = new
        {
            status = report.Status.ToString(),
            totalDuration = report.TotalDuration.ToString(),
            entries = report.Entries.ToDictionary(
                pair => pair.Key,
                pair => new
                {
                    status = pair.Value.Status.ToString(),
                    description = pair.Value.Description,
                    duration = pair.Value.Duration.ToString()
                }
            )
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            WriteIndented = true
        }));
    }
});

app.Run();

public partial class Program { }
