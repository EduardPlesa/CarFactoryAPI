namespace CarFactory.Application.Models
{
    public class BlueprintMaterial
    {
        public required Guid MaterialId { get; init; }

        public required float Quantity { get; init; }
    }
}
