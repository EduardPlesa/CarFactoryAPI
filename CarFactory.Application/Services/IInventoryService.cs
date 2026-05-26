using System.Data;

namespace CarFactory.Application.Services
{
    public interface IInventoryService
    {
        Task<float?> GetMaterialStock(Guid materialId);

        Task<float?> GetMaterialStock(Guid materialId, IDbConnection connection, IDbTransaction transaction);

        Task<bool> AddMaterial(Guid materialId, float quantity);

        Task<bool> DeductMaterial(Guid materialId, float quantity);

        Task<bool> DeductMaterial(Guid materialId, float quantity, IDbConnection connection, IDbTransaction transaction);
    }
}
