using System.Diagnostics;
using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TechHub.Domain.Entities;
using TechHub.Infrastructure.Persistence;
using Xunit;

namespace TechHub.IntegrationTests;

[Collection("IntegrationTests")]
public class CatalogPerformanceTests : IAsyncLifetime
{
    private readonly PostgresTestApplicationFactory _factory;

    public CatalogPerformanceTests(PostgresTestApplicationFactory factory)
    {
        _factory = factory;
    }

    public async Task InitializeAsync()
    {
        await _factory.EnsureDatabaseMigratedAsync();
        await _factory.ResetDatabaseAsync();
    }

    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task Measure_CatalogPerformance_Seeds1000Products_AndExportsJson()
    {
        // 1. Seed 1,000 products into test DB
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var category = new Category
            {
                Id = Guid.NewGuid(),
                Code = $"PERF_CAT_{Guid.NewGuid():N}",
                Name = "Performance Test Category",
                IsActive = true,
                CreatedAtUtc = DateTimeOffset.UtcNow
            };
            db.Categories.Add(category);
            await db.SaveChangesAsync();

            var products = new List<Product>(1000);
            for (int i = 1; i <= 1000; i++)
            {
                products.Add(new Product
                {
                    Id = Guid.NewGuid(),
                    CategoryId = category.Id,
                    Code = $"PROD_PERF_{i:D5}",
                    Name = $"Linh Kien PC Performance Item #{i}",
                    Description = $"Mo ta chi tiet linh kien may tinh thuoc catalog test performance {i}",
                    Price = 100000m + (i * 1000m),
                    StockQuantity = 50,
                    IsActive = true,
                    CreatedAtUtc = DateTimeOffset.UtcNow
                });
            }

            await db.Products.AddRangeAsync(products);
            await db.SaveChangesAsync();
        }

        var client = _factory.CreateClient();

        // 2. Warm-up request
        var warmupSw = Stopwatch.StartNew();
        var warmupResp = await client.GetAsync("/api/products?page=1&pageSize=20");
        warmupSw.Stop();
        Assert.Equal(HttpStatusCode.OK, warmupResp.StatusCode);
        double warmupMs = warmupSw.Elapsed.TotalMilliseconds;

        // 3. Measure multiple calls (50 samples)
        int sampleCount = 50;
        var latencies = new List<double>(sampleCount);

        for (int i = 0; i < sampleCount; i++)
        {
            var sw = Stopwatch.StartNew();
            var resp = await client.GetAsync("/api/products?page=1&pageSize=20");
            sw.Stop();
            Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
            latencies.Add(sw.Elapsed.TotalMilliseconds);
        }

        latencies.Sort();

        // Calculate Median
        double medianMs = (sampleCount % 2 == 0)
            ? (latencies[(sampleCount / 2) - 1] + latencies[sampleCount / 2]) / 2.0
            : latencies[sampleCount / 2];

        // Calculate P95
        int p95Index = (int)Math.Ceiling(0.95 * sampleCount) - 1;
        double p95Ms = latencies[Math.Min(p95Index, sampleCount - 1)];

        var report = new
        {
            totalProductsSeeded = 1000,
            sampleCount = sampleCount,
            warmupLatencyMs = Math.Round(warmupMs, 2),
            medianLatencyMs = Math.Round(medianMs, 2),
            p95LatencyMs = Math.Round(p95Ms, 2),
            minLatencyMs = Math.Round(latencies.First(), 2),
            maxLatencyMs = Math.Round(latencies.Last(), 2),
            timestampUtc = DateTimeOffset.UtcNow.ToString("o")
        };

        // 4. Export to TestResults/catalog-performance.json
        var testResultsDir = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "TestResults");
        Directory.CreateDirectory(testResultsDir);

        var jsonPath = Path.Combine(testResultsDir, "catalog-performance.json");
        var jsonOptions = new JsonSerializerOptions { WriteIndented = true };
        var jsonContent = JsonSerializer.Serialize(report, jsonOptions);

        await File.WriteAllTextAsync(jsonPath, jsonContent);

        // Also copy to backend/tests/TechHub.IntegrationTests/TestResults/catalog-performance.json if needed
        var sourceDir = Path.Combine(Directory.GetCurrentDirectory(), "tests", "TechHub.IntegrationTests", "TestResults");
        if (Directory.Exists(Path.GetDirectoryName(sourceDir)))
        {
            Directory.CreateDirectory(sourceDir);
            await File.WriteAllTextAsync(Path.Combine(sourceDir, "catalog-performance.json"), jsonContent);
        }

        Assert.True(File.Exists(jsonPath), $"catalog-performance.json should exist at {jsonPath}");
    }
}
