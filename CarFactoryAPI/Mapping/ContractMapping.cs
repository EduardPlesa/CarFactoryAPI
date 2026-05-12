using CarFactory.Application.Models;
using CarFactory.Contracts.Requests;
using CarFactory.Contracts.Responses;

namespace CarFactoryAPI.Mapping
{
    public static class ContractMapping
    {
        public static Frame MapToFrame(this CreateFrameRequest request)
        {
            return new Frame
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                CarType = request.CarType,
            };
        }
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
            };
        }
    }

}
