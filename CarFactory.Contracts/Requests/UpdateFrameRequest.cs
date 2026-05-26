using System;
using System.Collections.Generic;
using System.Text;

namespace CarFactory.Contracts.Requests
{
    public class UpdateFrameRequest
    {
        public required string CarType { get; set; }
        public required string Name { get; set; }
        public required float Weight { get; set; }
    }
}
