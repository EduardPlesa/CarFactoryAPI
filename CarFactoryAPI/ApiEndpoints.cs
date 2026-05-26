namespace CarFactoryAPI
{
    public static class ApiEndpoints
    {
        private const string ApiBase = "api";

        public static class Frames
        {
            public const string Base = $"{ApiBase}/frames";

            public const string Create = Base;
            public const string Get = $"{Base}/{{idOrSlug}}";

            public const string GetAll = Base;
            public const string Update = $"{Base}/{{id:guid}}";
            public const string Delete = $"{Base}/{{id:guid}}";
        }

        public static class Inventory
        {
            public const string Base = $"{ApiBase}/inventory";

            public const string GetMaterialStock = $"{Base}/{{materialId:guid}}";
            public const string AddMaterial = $"{Base}/{{materialId:guid}}/add";
            public const string DeductMaterial = $"{Base}/{{materialId:guid}}/deduct";
        }

        public static class Blueprints
        {
            public const string Base = $"{ApiBase}/blueprints";

            public const string GetFrameBlueprint = $"{Base}/frames/{{frameTypeId:guid}}";
            public const string SetFrameBlueprint = $"{Base}/frames/{{frameTypeId:guid}}";
        }
    }
}
