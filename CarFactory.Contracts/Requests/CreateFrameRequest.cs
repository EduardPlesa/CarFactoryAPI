using System;
using System.Collections.Generic;
using System.Text;

namespace CarFactory.Contracts.Requests
{
    public class CreateFrameRequest
    {
        public required string CarType {  get; set; }

        public required string Name { get; set; }
    }
}
