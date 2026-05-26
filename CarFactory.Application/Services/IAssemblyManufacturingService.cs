using CarFactory.Application.Models;

namespace CarFactory.Application.Services
{
    public interface IAssemblyManufacturingService
    {
        Task<AssemblyResult> CreateFrameAsync(Guid frameTypeId, string name, string carType);
    }
}
