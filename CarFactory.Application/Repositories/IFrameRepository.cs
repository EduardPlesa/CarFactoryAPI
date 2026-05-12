using CarFactory.Application.Models;

namespace CarFactory.Application.Repositories
{
    public interface IFrameRepository
    {
         Task<bool> CreateAsync(Frame frame);

        Task<Frame?> GetByIdAsync(Guid id);

        Task<Frame?> GetBySlugAsync(string slug);
        Task<IEnumerable<Frame>> GetAllAsync();

        Task<bool> UpdateAsync(Frame frame);

        Task<bool> DeleteByIdAsync(Guid id);
    }
}
