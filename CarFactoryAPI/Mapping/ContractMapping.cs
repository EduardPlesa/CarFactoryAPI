using CarFactory.Application.Models;
using CarFactory.Contracts.Requests;
using CarFactory.Contracts.Responses;

namespace CarFactoryAPI.Mapping
{
    public static class ContractMapping
    {
        public static FrameResponse MapToResponse(this Frame frame)
        {
            return new FrameResponse
            {
                Id = frame.Id,
                Name = frame.Name,
                Slug = frame.Slug,
                CarType = frame.CarType,
            };
        }

        public static FramesResponse MapToResponse(this IEnumerable<Frame> frames)
        {
            return new FramesResponse
            {
                Items = frames.Select(MapToResponse)
            };
        }

        public static Frame MapToFrame(this UpdateFrameRequest request, Guid id)
        {
            return new Frame
            {
                Id = id,
                Name = request.Name,
                CarType = request.CarType,
                Weight = request.Weight,
            };
        }

        public static BlueprintMaterial MapToBlueprintMaterial(this BlueprintMaterialRequest request)
        {
            return new BlueprintMaterial
            {
                MaterialId = request.MaterialId,
                Quantity = request.Quantity
            };
        }

        public static FrameBlueprintResponse MapToResponse(
            this IEnumerable<BlueprintMaterial> materials,
            Guid frameTypeId)
        {
            return new FrameBlueprintResponse
            {
                FrameTypeId = frameTypeId,
                Materials = materials.Select(x => new BlueprintMaterialResponse
                {
                    MaterialId = x.MaterialId,
                    Quantity = x.Quantity
                })
            };
        }
    }
}
