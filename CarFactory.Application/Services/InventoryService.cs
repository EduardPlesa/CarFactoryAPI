using CarFactory.Application.Repositories;
using System.Data;

namespace CarFactory.Application.Services
{
    public class InventoryService : IInventoryService
    {
        private readonly IMaterialRepository _materialRepository;

        public InventoryService(IMaterialRepository materialRepository)
        {
            _materialRepository = materialRepository;
        }

        public async Task<float?> GetMaterialStock(Guid materialId)
        {
            return await _materialRepository.GetStockAsync(materialId);
        }

        public async Task<float?> GetMaterialStock(Guid materialId, IDbConnection connection, IDbTransaction transaction)
        {
            return await _materialRepository.GetStockAsync(materialId, connection, transaction);
        }

        public async Task<bool> AddMaterial(Guid materialId, float quantity)
        {
            return await _materialRepository.AddAsync(materialId, quantity);
        }

        public async Task<bool> DeductMaterial(Guid materialId, float quantity)
        {
            return await _materialRepository.DeductAsync(materialId, quantity);
        }

        public async Task<bool> DeductMaterial(Guid materialId, float quantity, IDbConnection connection, IDbTransaction transaction)
        {
            return await _materialRepository.DeductAsync(materialId, quantity, connection, transaction);
        }
    }
}
