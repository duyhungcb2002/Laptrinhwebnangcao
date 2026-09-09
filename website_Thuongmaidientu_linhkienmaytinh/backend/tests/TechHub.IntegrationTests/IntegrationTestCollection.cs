using Xunit;

namespace TechHub.IntegrationTests;

[CollectionDefinition("IntegrationTests", DisableParallelization = true)]
public class IntegrationTestCollection : ICollectionFixture<PostgresTestApplicationFactory>
{
}
