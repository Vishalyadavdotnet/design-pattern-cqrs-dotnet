using System;
using MediatR;

namespace DesignPattern.CQRS.Application.Features.Users.Commands.UpdateUser;

public record UpdateUserCommand : IRequest
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Email { get; init; }
}
