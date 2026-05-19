using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Serilog;
using Scalar.AspNetCore;
using DesignPattern.CQRS.Api.Middlewares;
using DesignPattern.CQRS.Application;
using DesignPattern.CQRS.Infrastructure;

try
{
    var builder = WebApplication.CreateBuilder(args);

    // Initialize Serilog from configuration
    Log.Logger = new LoggerConfiguration()
        .ReadFrom.Configuration(builder.Configuration)
        .Enrich.FromLogContext()
        .CreateLogger();

    builder.Host.UseSerilog();

    Log.Information("Configuring services...");

    // Add controller and routing support
    builder.Services.AddControllers();
    
    // Add .NET native OpenAPI document generator
    builder.Services.AddOpenApi();

    // Add CORS services
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowFrontend", policy =>
        {
            policy.WithOrigins("http://localhost:5173", "https://localhost:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
    });

    // Register Clean Architecture Layers
    builder.Services.AddApplicationServices();
    builder.Services.AddInfrastructureServices(builder.Configuration);

    var app = builder.Build();

    Log.Information("Configuring middleware pipeline...");

    // Global exception handling middleware is placed first to catch all subsequent request pipeline errors
    app.UseMiddleware<ExceptionHandlingMiddleware>();

    // Apply CORS policy before other routing/authorization middlewares
    app.UseCors("AllowFrontend");

    if (app.Environment.IsDevelopment())
    {
        // Maps the OpenAPI json document endpoint at /openapi/v1.json
        app.MapOpenApi();
        
        // Maps the interactive Scalar API Reference client at /scalar/v1
        app.MapScalarApiReference();
    }

    app.UseHttpsRedirection();
    app.UseAuthorization();
    app.MapControllers();

    Log.Information("Starting application web host...");
    app.Run();
}
catch (Exception ex) when (ex.GetType().Name is not "HostAbortedException")
{
    Log.Fatal(ex, "Host terminated unexpectedly during startup.");
}
finally
{
    Log.CloseAndFlush();
}
