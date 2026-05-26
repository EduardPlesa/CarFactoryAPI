using CarFactory.Application.Services;
using CarFactory.Contracts.Requests;
using CarFactoryAPI.Mapping;
using Microsoft.AspNetCore.Mvc;

namespace CarFactoryAPI.Controller
{
    [ApiController]
    public class BlueprintController : ControllerBase
    {
        private readonly IBlueprintCatalogService _blueprintCatalogService;

        public BlueprintController(IBlueprintCatalogService blueprintCatalogService)
        {
            _blueprintCatalogService = blueprintCatalogService;
        }

        [HttpGet(ApiEndpoints.Blueprints.GetFrameBlueprint)]
        public async Task<IActionResult> GetFrameBlueprint([FromRoute] Guid frameTypeId)
        {
            var blueprint = await _blueprintCatalogService.GetFrameBlueprint(frameTypeId);
            if (blueprint.Count == 0)
            {
                return NotFound();
            }

            return Ok(blueprint.MapToResponse(frameTypeId));
        }

        [HttpPut(ApiEndpoints.Blueprints.SetFrameBlueprint)]
        public async Task<IActionResult> SetFrameBlueprint(
            [FromRoute] Guid frameTypeId,
            [FromBody] UpsertFrameBlueprintRequest request)
        {
            var materials = request.Materials.Select(x => x.MapToBlueprintMaterial()).ToArray();
            if (materials.Length == 0 || materials.Any(x => x.Quantity <= 0))
            {
                return BadRequest("Blueprint must contain at least one material with a quantity greater than zero.");
            }

            await _blueprintCatalogService.SetFrameBlueprint(frameTypeId, materials);

            return Ok(materials.MapToResponse(frameTypeId));
        }
    }
}
