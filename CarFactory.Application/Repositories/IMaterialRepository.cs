using System.Data;

namespace CarFactory.Application.Repositories
{
    public interface IMaterialRepository
    {
        Task<float?> GetStockAsync(Guid materialId);
        Task<float?> GetStockAsync(Guid materialId, IDbConnection connection, IDbTransaction? transaction);
        Task<bool> AddAsync(Guid materialId, float quantity);
        Task<bool> DeductAsync(Guid materialId, float quantity);
        Task<bool> DeductAsync(Guid materialId, float quantity, IDbConnection connection, IDbTransaction? transaction);
    }
}
