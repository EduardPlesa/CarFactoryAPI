namespace CarFactory.Application.Models
{
    public class AssemblyResult
    {
        public required bool Success { get; init; }

        public Frame? Frame { get; init; }

        public string? ErrorMessage { get; init; }

        public IReadOnlyCollection<Guid> MissingMaterialIds { get; init; } = [];
    }
}
