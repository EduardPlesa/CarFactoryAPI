using CarFactory.Application.Models;
using System.Data;

namespace CarFactory.Application.Services
{
    public interface IBlueprintCatalogService
    {
        Task<IReadOnlyCollection<BlueprintMaterial>> GetFrameBlueprint(Guid frameTypeId);

        Task<IReadOnlyCollection<BlueprintMaterial>> GetFrameBlueprint(
            Guid frameTypeId,
            IDbConnection connection,
            IDbTransaction transaction);

        Task<bool> SetFrameBlueprint(Guid frameTypeId, IEnumerable<BlueprintMaterial> materials);
    }
}
