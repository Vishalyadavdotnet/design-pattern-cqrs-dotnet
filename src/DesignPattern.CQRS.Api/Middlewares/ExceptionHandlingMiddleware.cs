using System;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using DesignPattern.CQRS.Domain.Exceptions;

namespace DesignPattern.CQRS.Api.Middlewares;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred during request execution.");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, problemDetails) = exception switch
        {
            CustomValidationException validationEx => (
                StatusCodes.Status400BadRequest,
                new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                    Title = "Validation Error",
                    Detail = validationEx.Message,
                    Extensions = { ["errors"] = validationEx.Errors }
                }),

            NotFoundException notFoundEx => (
                StatusCodes.Status404NotFound,
                new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Type = "https://tools.ietf.org/html/rfc7231#section-6.5.4",
                    Title = "Not Found",
                    Detail = notFoundEx.Message
                }),

            _ => (
                StatusCodes.Status500InternalServerError,
                new ProblemDetails
                {
                    Status = StatusCodes.Status500InternalServerError,
                    Type = "https://tools.ietf.org/html/rfc7231#section-6.6.1",
                    Title = "Internal Server Error",
                    Detail = "An unexpected error occurred."
                })
        };

        context.Response.StatusCode = statusCode;

        var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var jsonResponse = JsonSerializer.Serialize(problemDetails, jsonOptions);

        await context.Response.WriteAsync(jsonResponse);
    }
}
