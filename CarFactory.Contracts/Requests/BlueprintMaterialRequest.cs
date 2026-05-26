namespace CarFactory.Contracts.Requests
{
    public class BlueprintMaterialRequest
    {
        public required Guid MaterialId { get; set; }

        public required float Quantity { get; set; }
    }
}
