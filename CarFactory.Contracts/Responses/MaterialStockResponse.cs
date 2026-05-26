namespace CarFactory.Contracts.Responses
{
    public class MaterialStockResponse
    {
        public required Guid MaterialId { get; init; }

        public required float Quantity { get; init; }
    }
}
