using CarFactory.Application.Models;
using CarFactory.Application.Repositories;
using System.Data;

namespace CarFactory.Application.Services
{
    public class BlueprintCatalogService : IBlueprintCatalogService
    {
        private readonly IBlueprintRepository _blueprintRepository;

        public BlueprintCatalogService(IBlueprintRepository blueprintRepository)
        {
            _blueprintRepository = blueprintRepository;
        }

        public async Task<IReadOnlyCollection<BlueprintMaterial>> GetFrameBlueprint(Guid frameTypeId)
        {
            return await _blueprintRepository.GetByFrameTypeIdAsync(frameTypeId);
        }

        public async Task<IReadOnlyCollection<BlueprintMaterial>> GetFrameBlueprint(
            Guid frameTypeId,
            IDbConnection connection,
            IDbTransaction transaction)
        {
            return await _blueprintRepository.GetByFrameTypeIdAsync(frameTypeId, connection, transaction);
        }

        public async Task<bool> SetFrameBlueprint(Guid frameTypeId, IEnumerable<BlueprintMaterial> materials)
        {
            return await _blueprintRepository.SetAsync(frameTypeId, materials);
        }
    }
}
