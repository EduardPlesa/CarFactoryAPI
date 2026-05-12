using System;
using System.Collections.Generic;
using System.Text;

namespace CarFactory.Contracts.Responses
{
    public class FrameResponse
    {
        public required Guid Id { get; init; }
        public required string CarType { get; set; }

        public required string Name { get; set; }

        public required string Slug {  get; set; }
    }
}
