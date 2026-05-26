namespace CarFactory.Contracts.Responses
{
    public class FrameBlueprintResponse
    {
        public required Guid FrameTypeId { get; init; }

        public required IEnumerable<BlueprintMaterialResponse> Materials { get; init; }
    }
}
