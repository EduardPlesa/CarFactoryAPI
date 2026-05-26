namespace CarFactory.Contracts.Responses
{
    public class BlueprintMaterialResponse
    {
        public required Guid MaterialId { get; init; }

        public required float Quantity { get; init; }
    }
}
