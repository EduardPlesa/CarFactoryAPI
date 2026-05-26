using CarFactory.Application.Database;
using CarFactory.Application.Repositories;
using CarFactory.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace CarFactory.Application
{
    public static class ApplicationServiceCollectionExtensions
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            services.AddSingleton<IFrameRepository, FrameRepository>();
            services.AddSingleton<IMaterialRepository, MaterialRepository>();
            services.AddSingleton<IBlueprintRepository, BlueprintRepository>();
            services.AddSingleton<IInventoryService, InventoryService>();
            services.AddSingleton<IBlueprintCatalogService, BlueprintCatalogService>();
            services.AddSingleton<IAssemblyManufacturingService, AssemblyManufacturingService>();
            return services;
        }

        public static IServiceCollection AddDatabase(this IServiceCollection services, string connectionString)
        {
            services.AddSingleton<IDbConnectionFactory>(_ =>
                new NpgsqlConnectionFactory(connectionString));
            services.AddSingleton<DbInitializer>();
            return services;
        }
    }
}
