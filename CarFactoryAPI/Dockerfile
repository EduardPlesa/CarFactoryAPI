FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["CarFactoryAPI/CarFactoryAPI.csproj", "CarFactoryAPI/"]
COPY ["CarFactory.Application/CarFactory.Application.csproj", "CarFactory.Application/"]
COPY ["CarFactory.Contracts/CarFactory.Contracts.csproj", "CarFactory.Contracts/"]
RUN dotnet restore "CarFactoryAPI/CarFactoryAPI.csproj"
COPY . .
WORKDIR "/src/CarFactoryAPI"
RUN dotnet publish "CarFactoryAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "CarFactoryAPI.dll"]
