using CarFactory.Application.Models;
using CarFactory.Application.Repositories;
using CarFactory.Contracts.Requests;
using Microsoft.AspNetCore.Mvc;

namespace CarFactory.Api.Controllers
{
    [ApiController]
    [Route("api")]
    public class FrameController : ControllerBase
    {
        private readonly IFrameRepository _frameRepository;

        public FrameController(IFrameRepository frameRepository)
        {
            _frameRepository = frameRepository;
        }

        public async Task<IActionResult> Create([FromBody]CreateFrameRequest request)
        {
            var frame = new Frame()
            {
                Id = Guid.NewGuid(),
                CarType = request.CarType,
                Name = request.Name,

            };
            await _frameRepository.CreateAsync(frame);
            return Ok(request);
        }
    }
}
