using CarFactory.Application.Services;
using CarFactory.Contracts.Requests;
using CarFactory.Contracts.Responses;
using Microsoft.AspNetCore.Mvc;

namespace CarFactoryAPI.Controller
{
    [ApiController]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _inventoryService;

        public InventoryController(IInventoryService inventoryService)
        {
            _inventoryService = inventoryService;
        }

        [HttpGet(ApiEndpoints.Inventory.GetMaterialStock)]
        public async Task<IActionResult> GetMaterialStock([FromRoute] Guid materialId)
        {
            var stock = await _inventoryService.GetMaterialStock(materialId);
            if (stock is null)
            {
                return NotFound();
            }

            return Ok(new MaterialStockResponse
            {
                MaterialId = materialId,
                Quantity = stock.Value
            });
        }

        [HttpPost(ApiEndpoints.Inventory.AddMaterial)]
        public async Task<IActionResult> AddMaterial(
            [FromRoute] Guid materialId,
            [FromBody] MaterialQuantityRequest request)
        {
            if (request.Quantity <= 0)
            {
                return BadRequest("Quantity must be greater than zero.");
            }

            await _inventoryService.AddMaterial(materialId, request.Quantity);
            var stock = await _inventoryService.GetMaterialStock(materialId);

            return Ok(new MaterialStockResponse
            {
                MaterialId = materialId,
                Quantity = stock ?? 0
            });
        }

        [HttpPost(ApiEndpoints.Inventory.DeductMaterial)]
        public async Task<IActionResult> DeductMaterial(
            [FromRoute] Guid materialId,
            [FromBody] MaterialQuantityRequest request)
        {
            if (request.Quantity <= 0)
            {
                return BadRequest("Quantity must be greater than zero.");
            }

            var deducted = await _inventoryService.DeductMaterial(materialId, request.Quantity);
            if (!deducted)
            {
                return BadRequest("Material does not exist or has insufficient stock.");
            }

            var stock = await _inventoryService.GetMaterialStock(materialId);

            return Ok(new MaterialStockResponse
            {
                MaterialId = materialId,
                Quantity = stock ?? 0
            });
        }
    }
}
