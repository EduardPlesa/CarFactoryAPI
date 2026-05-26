namespace CarFactory.Contracts.Requests
{
    public class CreateFrameRequest
    {
        public required Guid FrameTypeId { get; set; }

        public required string CarType { get; set; }

        public required string Name { get; set; }
    }
}
