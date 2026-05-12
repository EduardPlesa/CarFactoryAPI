using CarFactory.Application.Models;
using CarFactory.Application.Repositories;
using CarFactory.Contracts.Requests;
using CarFactoryAPI.Mapping;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApiExplorer;

namespace CarFactoryAPI.Controller
{
    [ApiController]
    public class FrameController : ControllerBase
    {
        private readonly IFrameRepository _frameRepository;

        public FrameController(IFrameRepository frameRepository)
        {
            _frameRepository = frameRepository;
        }
        [HttpPost(ApiEndpoints.Frames.Create)]
        public async Task<IActionResult> Create([FromBody] CreateFrameRequest request)
        {

            var frame = request.MapToFrame();

            await _frameRepository.CreateAsync(frame);
            return CreatedAtAction(nameof(Get), new {idOrSlug = frame.Id}, frame);
        }
        [HttpGet(ApiEndpoints.Frames.Get)]
        public async Task<IActionResult> Get([FromRoute] string idOrSlug)
        {
            var frame = Guid.TryParse(idOrSlug, out var id) ? 
                await _frameRepository.GetByIdAsync(id)
                : await _frameRepository.GetBySlugAsync(idOrSlug);

            if (frame is null)
            { 
                return NotFound();
            } 
            var response = frame.MapToResponse();
            return Ok(response);

        }
        [HttpGet(ApiEndpoints.Frames.GetAll)]
        public async Task<IActionResult> GetAll()
        {
            var frames = await _frameRepository.GetAllAsync();

            var frameResponse = frames.MapToResponse();

            return Ok(frameResponse);
        }
        [HttpPut(ApiEndpoints.Frames.Update)]
        public async Task<IActionResult> Update([FromRoute]Guid id,
            [FromBody]UpdateFrameRequest request)
        {
            var frame = request.MapToFrame(id);
            var updated = await _frameRepository.UpdateAsync(frame);

            if (!updated)
            {
                return NotFound();
            }
            var response = frame.MapToResponse();
            return Ok(response);
        }

        [HttpDelete(ApiEndpoints.Frames.Delete)]
        public async Task<IActionResult> Delete([FromRoute] Guid id)
        {
            var deleted = await _frameRepository.DeleteByIdAsync(id);
            if (!deleted)
            {
                return NotFound();
            }
            return Ok();
        }
    }
}
