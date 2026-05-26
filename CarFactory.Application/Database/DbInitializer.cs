using Dapper;
namespace CarFactory.Application.Database
{
    public class DbInitializer
    {
        private readonly IDbConnectionFactory _dbconnectionFactory;
        public DbInitializer(IDbConnectionFactory dbConnectionFactory)
        {
            _dbconnectionFactory = dbConnectionFactory;
        }

        public async Task InitializeAsync()
        {
            using var connection = await _dbconnectionFactory.CreateConnectionAsync();
            await connection.ExecuteAsync("""
                create table if not exists frames (
                    id UUID primary key,
                    name TEXT not null,
                    slug TEXT not null,
                    car_type TEXT not null,
                    weight REAL not null check (weight >= 0)
                )
                """ );

            await connection.ExecuteAsync("""
                alter table frames
                add column if not exists name TEXT
                """);

            await connection.ExecuteAsync("""
                update frames
                set name = slug
                where name is null
                """);

            await connection.ExecuteAsync("""
                alter table frames
                alter column name set not null
                """);

            await connection.ExecuteAsync("""
                create unique index concurrently if not exists frames_slug_idx
                on frames
                using btree(slug)

                """
              );

            await connection.ExecuteAsync("""
                create table if not exists material_inventory (
                    material_id UUID primary key,
                    stock_quantity REAL not null check (stock_quantity >= 0)
                )
                """ );

            await connection.ExecuteAsync("""
                create table if not exists frame_blueprint_materials (
                    frame_type_id UUID not null,
                    material_id UUID not null,
                    quantity REAL not null check (quantity > 0),
                    primary key (frame_type_id, material_id)
                )
                """ );

            await connection.ExecuteAsync("""
                do $$
                begin
                    if not exists (
                        select 1
                        from pg_constraint
                        where conname = 'frames_weight_non_negative'
                    ) then
                        alter table frames
                        add constraint frames_weight_non_negative check (weight >= 0) not valid;
                    end if;
                end $$;
                """);

            await connection.ExecuteAsync("""
                do $$
                begin
                    if not exists (
                        select 1
                        from pg_constraint
                        where conname = 'material_inventory_stock_non_negative'
                    ) then
                        alter table material_inventory
                        add constraint material_inventory_stock_non_negative check (stock_quantity >= 0) not valid;
                    end if;
                end $$;
                """);

            await connection.ExecuteAsync("""
                do $$
                begin
                    if not exists (
                        select 1
                        from pg_constraint
                        where conname = 'frame_blueprint_materials_quantity_positive'
                    ) then
                        alter table frame_blueprint_materials
                        add constraint frame_blueprint_materials_quantity_positive check (quantity > 0) not valid;
                    end if;
                end $$;
                """);
        }
    }
}
