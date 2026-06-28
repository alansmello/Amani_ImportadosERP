FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["src/Amani.ImportadosERP.Api/Amani.ImportadosERP.Api.csproj", "src/Amani.ImportadosERP.Api/"]
COPY ["src/Amani.ImportadosERP.Application/Amani.ImportadosERP.Application.csproj", "src/Amani.ImportadosERP.Application/"]
COPY ["src/Amani.ImportadosERP.Domain/Amani.ImportadosERP.Domain.csproj", "src/Amani.ImportadosERP.Domain/"]
COPY ["src/Amani.ImportadosERP.Infra.Data/Amani.ImportadosERP.Infra.Data.csproj", "src/Amani.ImportadosERP.Infra.Data/"]
COPY ["src/Amani.ImportadosERP.Infra.IoC/Amani.ImportadosERP.Infra.IoC.csproj", "src/Amani.ImportadosERP.Infra.IoC/"]

RUN dotnet restore "src/Amani.ImportadosERP.Api/Amani.ImportadosERP.Api.csproj"

COPY . .

RUN dotnet publish "src/Amani.ImportadosERP.Api/Amani.ImportadosERP.Api.csproj" \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 10000

COPY --from=build /app/publish .

ENTRYPOINT ["sh", "-c", "dotnet Amani.ImportadosERP.Api.dll --urls http://+:${PORT:-10000}"]
