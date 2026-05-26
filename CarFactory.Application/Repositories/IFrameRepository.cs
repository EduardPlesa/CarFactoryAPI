using CarFactory.Application.Models;
using System.Data;

namespace CarFactory.Application.Repositories
{
    public interface IFrameRepository
    {
        Task<bool> CreateAsync(Frame frame);

        Task<bool> CreateAsync(Frame frame, IDbConnection connection, IDbTransaction transaction);

        Task<Frame?> GetByIdAsync(Guid id);

        Task<Frame?> GetBySlugAsync(string slug);

        Task<IEnumerable<Frame>> GetAllAsync();

        Task<bool> UpdateAsync(Frame frame);

        Task<bool> DeleteByIdAsync(Guid id);

        Task<bool> ExistsByIdAsync(Guid id);
    }
}
