using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using FluentValidation;
using MediatR;
using DesignPattern.CQRS.Application.Behaviors;

namespace DesignPattern.CQRS.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        services.AddAutoMapper(assembly);
        services.AddValidatorsFromAssembly(assembly);

        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(assembly);
            
            // Registers logging pipeline behavior first, then validation behavior
            cfg.AddOpenBehavior(typeof(LoggingBehavior<,>));
            cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });

        return services;
    }
}
