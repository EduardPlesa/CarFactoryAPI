using CarFactory.Application.Database;
using Dapper;
using System.Data;

namespace CarFactory.Application.Repositories
{
    public class MaterialRepository : IMaterialRepository
    {
        private readonly IDbConnectionFactory _dbConnectionFactory;

        public MaterialRepository(IDbConnectionFactory connectionFactory)
        {
            _dbConnectionFactory = connectionFactory;
        }

        public async Task<float?> GetStockAsync(Guid materialId)
        {
            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            return await GetStockAsync(materialId, connection, transaction: null);
        }

        public async Task<float?> GetStockAsync(Guid materialId, IDbConnection connection, IDbTransaction? transaction)
        {
            return await connection.QuerySingleOrDefaultAsync<float?>(new CommandDefinition(
                """
                select stock_quantity
                from material_inventory
                where material_id = @MaterialId
                """,
                new { MaterialId = materialId },
                transaction));
        }

        public async Task<bool> AddAsync(Guid materialId, float quantity)
        {
            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            var result = await connection.ExecuteAsync(new CommandDefinition(
                """
                insert into material_inventory (material_id, stock_quantity)
                values (@MaterialId, @Quantity)
                on conflict (material_id)
                do update set stock_quantity = material_inventory.stock_quantity + @Quantity
                """,
                new { MaterialId = materialId, Quantity = quantity }));

            return result > 0;
        }

        public async Task<bool> DeductAsync(Guid materialId, float quantity)
        {
            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            return await DeductAsync(materialId, quantity, connection, transaction: null);
        }

        public async Task<bool> DeductAsync(Guid materialId, float quantity, IDbConnection connection, IDbTransaction? transaction)
        {
            var result = await connection.ExecuteAsync(new CommandDefinition(
                """
                update material_inventory
                set stock_quantity = stock_quantity - @Quantity
                where material_id = @MaterialId
                  and stock_quantity >= @Quantity
                """,
                new { MaterialId = materialId, Quantity = quantity },
                transaction));

            return result > 0;
        }
    }
}
