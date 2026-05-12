using System;
using System.Collections.Generic;
using System.Text;

namespace CarFactory.Contracts.Responses
{
    public class FramesResponse
    {
       public required IEnumerable<FrameResponse> Items { get; init; } = Enumerable.Empty<FrameResponse>();
    }
}
