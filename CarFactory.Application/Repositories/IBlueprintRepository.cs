using CarFactory.Application.Models;
using System.Data;

namespace CarFactory.Application.Repositories
{
    public interface IBlueprintRepository
    {
        Task<IReadOnlyCollection<BlueprintMaterial>> GetByFrameTypeIdAsync(Guid frameTypeId);
        Task<IReadOnlyCollection<BlueprintMaterial>> GetByFrameTypeIdAsync(Guid frameTypeId, IDbConnection connection, IDbTransaction? transaction);
        Task<bool> SetAsync(Guid frameTypeId, IEnumerable<BlueprintMaterial> materials);
        Task<bool> DeleteByFrameTypeIdAsync(Guid frameTypeId, IDbConnection connection, IDbTransaction? transaction);
        Task<bool> AddAsync(Guid frameTypeId, BlueprintMaterial material, IDbConnection connection, IDbTransaction? transaction);
    }
}
