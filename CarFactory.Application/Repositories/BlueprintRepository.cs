using CarFactory.Application.Database;
using CarFactory.Application.Models;
using Dapper;
using System.Data;

namespace CarFactory.Application.Repositories
{
    public class BlueprintRepository : IBlueprintRepository
    {
        private const string BlueprintSelect = """
            select
                material_id as "MaterialId",
                quantity as "Quantity"
            from frame_blueprint_materials
            where frame_type_id = @FrameTypeId
            """;

        private readonly IDbConnectionFactory _dbConnectionFactory;

        public BlueprintRepository(IDbConnectionFactory connectionFactory)
        {
            _dbConnectionFactory = connectionFactory;
        }

        public async Task<IReadOnlyCollection<BlueprintMaterial>> GetByFrameTypeIdAsync(Guid frameTypeId)
        {
            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            return await GetByFrameTypeIdAsync(frameTypeId, connection, transaction: null);
        }

        public async Task<IReadOnlyCollection<BlueprintMaterial>> GetByFrameTypeIdAsync(Guid frameTypeId, IDbConnection connection, IDbTransaction? transaction)
        {
            var materials = await connection.QueryAsync<BlueprintMaterial>(new CommandDefinition(
                BlueprintSelect,
                new { FrameTypeId = frameTypeId },
                transaction));

            return materials.ToArray();
        }

        public async Task<bool> SetAsync(Guid frameTypeId, IEnumerable<BlueprintMaterial> materials)
        {
            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            using var transaction = connection.BeginTransaction();

            try
            {
                await DeleteByFrameTypeIdAsync(frameTypeId, connection, transaction);

                var materialList = materials.ToArray();
                foreach (var material in materialList)
                {
                    await AddAsync(frameTypeId, material, connection, transaction);
                }

                transaction.Commit();
                return materialList.Length > 0;
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        public async Task<bool> DeleteByFrameTypeIdAsync(Guid frameTypeId, IDbConnection connection, IDbTransaction? transaction)
        {
            var result = await connection.ExecuteAsync(new CommandDefinition(
                """
                delete from frame_blueprint_materials
                where frame_type_id = @FrameTypeId
                """,
                new { FrameTypeId = frameTypeId },
                transaction));

            return result > 0;
        }

        public async Task<bool> AddAsync(Guid frameTypeId, BlueprintMaterial material, IDbConnection connection, IDbTransaction? transaction)
        {
            var result = await connection.ExecuteAsync(new CommandDefinition(
                """
                insert into frame_blueprint_materials (frame_type_id, material_id, quantity)
                values (@FrameTypeId, @MaterialId, @Quantity)
                """,
                new
                {
                    FrameTypeId = frameTypeId,
                    material.MaterialId,
                    material.Quantity
                },
                transaction));

            return result > 0;
        }
    }
}
