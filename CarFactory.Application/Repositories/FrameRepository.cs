using CarFactory.Application.Database;
using CarFactory.Application.Models;
using Dapper;
using System.Data;

namespace CarFactory.Application.Repositories
{
    public class FrameRepository : IFrameRepository
    {
        private const string FrameSelect = """
            select
                id as "Id",
                name as "Name",
                slug as "Slug",
                car_type as "CarType",
                weight as "Weight"
            from frames
            """;

        private readonly IDbConnectionFactory _dbConnectionFactory;

        public FrameRepository(IDbConnectionFactory connectionFactory)
        {
            _dbConnectionFactory = connectionFactory;
        }

        public async Task<bool> CreateAsync(Frame frame)
        {
            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            var result = await InsertFrameAsync(frame, connection);

            return result > 0;
        }

        public async Task<bool> CreateAsync(Frame frame, IDbConnection connection, IDbTransaction transaction)
        {
            var result = await InsertFrameAsync(frame, connection, transaction);

            return result > 0;
        }

        private static async Task<int> InsertFrameAsync(Frame frame, IDbConnection connection, IDbTransaction? transaction = null)
        {
            var result = await connection.ExecuteAsync(new CommandDefinition(
                """
                insert into frames (id, name, slug, car_type, weight)
                values (@Id, @Name, @Slug, @CarType, @Weight)
                """,
                frame,
                transaction));

            return result;
        }

        public async Task<Frame?> GetByIdAsync(Guid id)
        {
            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            return await connection.QuerySingleOrDefaultAsync<Frame>(
                new CommandDefinition($"""
                    {FrameSelect}
                    where id = @Id
                    """,
                    new { Id = id }));
        }

        public async Task<Frame?> GetBySlugAsync(string slug)
        {
            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            return await connection.QuerySingleOrDefaultAsync<Frame>(
                new CommandDefinition($"""
                    {FrameSelect}
                    where slug = @Slug
                    """,
                    new { Slug = slug }));
        }

        public async Task<IEnumerable<Frame>> GetAllAsync()
        {
            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            return await connection.QueryAsync<Frame>(new CommandDefinition($"""
                {FrameSelect}
                order by name
                """));
        }

        public async Task<bool> UpdateAsync(Frame frame)
        {
            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            var result = await connection.ExecuteAsync(new CommandDefinition(
                """
                update frames
                set name = @Name,
                    slug = @Slug,
                    car_type = @CarType,
                    weight = @Weight
                where id = @Id
                """,
                frame));

            return result > 0;
        }

        public async Task<bool> DeleteByIdAsync(Guid id)
        {
            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            var result = await connection.ExecuteAsync(new CommandDefinition(
                """
                delete from frames
                where id = @Id
                """,
                new { Id = id }));

            return result > 0;
        }

        public async Task<bool> ExistsByIdAsync(Guid id)
        {
            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            return await connection.ExecuteScalarAsync<bool>(new CommandDefinition(
                """
                select exists (
                    select 1
                    from frames
                    where id = @Id
                )
                """,
                new { Id = id }));
        }
    }
}
