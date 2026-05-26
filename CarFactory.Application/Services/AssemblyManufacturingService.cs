using CarFactory.Application.Database;
using CarFactory.Application.Models;
using CarFactory.Application.Repositories;

namespace CarFactory.Application.Services
{
    public class AssemblyManufacturingService : IAssemblyManufacturingService
    {
        private readonly IBlueprintCatalogService _blueprintCatalogService;
        private readonly IDbConnectionFactory _dbConnectionFactory;
        private readonly IFrameRepository _frameRepository;
        private readonly IInventoryService _inventoryService;

        public AssemblyManufacturingService(
            IBlueprintCatalogService blueprintCatalogService,
            IDbConnectionFactory dbConnectionFactory,
            IFrameRepository frameRepository,
            IInventoryService inventoryService)
        {
            _blueprintCatalogService = blueprintCatalogService;
            _dbConnectionFactory = dbConnectionFactory;
            _frameRepository = frameRepository;
            _inventoryService = inventoryService;
        }

        public async Task<AssemblyResult> CreateFrameAsync(Guid frameTypeId, string name, string carType)
        {
            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            using var transaction = connection.BeginTransaction();

            try
            {
                var blueprint = await _blueprintCatalogService.GetFrameBlueprint(frameTypeId, connection, transaction);
                if (blueprint.Count == 0)
                {
                    transaction.Rollback();
                    return new AssemblyResult
                    {
                        Success = false,
                        ErrorMessage = "Frame blueprint was not found."
                    };
                }

                var missingMaterials = new List<Guid>();
                foreach (var requiredMaterial in blueprint)
                {
                    var availableStock = await _inventoryService.GetMaterialStock(
                        requiredMaterial.MaterialId,
                        connection,
                        transaction);

                    if (availableStock is null || availableStock < requiredMaterial.Quantity)
                    {
                        missingMaterials.Add(requiredMaterial.MaterialId);
                    }
                }

                if (missingMaterials.Count > 0)
                {
                    transaction.Rollback();
                    return new AssemblyResult
                    {
                        Success = false,
                        ErrorMessage = "Not enough material stock to build this frame.",
                        MissingMaterialIds = missingMaterials
                    };
                }

                foreach (var requiredMaterial in blueprint)
                {
                    var deducted = await _inventoryService.DeductMaterial(
                        requiredMaterial.MaterialId,
                        requiredMaterial.Quantity,
                        connection,
                        transaction);

                    if (!deducted)
                    {
                        transaction.Rollback();
                        return new AssemblyResult
                        {
                            Success = false,
                            ErrorMessage = "Material stock changed before the frame could be assembled.",
                            MissingMaterialIds = [requiredMaterial.MaterialId]
                        };
                    }
                }

                var frame = new Frame
                {
                    Id = Guid.NewGuid(),
                    Name = name,
                    CarType = carType,
                    Weight = blueprint.Sum(x => x.Quantity)
                };

                var created = await _frameRepository.CreateAsync(frame, connection, transaction);
                if (!created)
                {
                    transaction.Rollback();
                    return new AssemblyResult
                    {
                        Success = false,
                        ErrorMessage = "Frame record could not be created."
                    };
                }

                transaction.Commit();
                return new AssemblyResult
                {
                    Success = true,
                    Frame = frame
                };
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
