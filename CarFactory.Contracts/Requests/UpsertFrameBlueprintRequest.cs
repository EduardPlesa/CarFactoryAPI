namespace CarFactory.Contracts.Requests
{
    public class UpsertFrameBlueprintRequest
    {
        public required IEnumerable<BlueprintMaterialRequest> Materials { get; set; }
    }
}
