using System.Text.RegularExpressions;

namespace CarFactory.Application.Models
{
    public class Frame
    {
        public required Guid Id { get; init; }

        public required string CarType { get; set; }

        public required string Name { get; set; }

        public string Slug => GenerateSlug();
        public float weight { get; set; }

        private string GenerateSlug()
        {
            var sluggedName = Regex.Replace(Name, "[^0-9A-Za-z _ -]",string.Empty)
                .ToLower().Replace(" ","-");
            return $"{sluggedName}";
        }
    }
}
