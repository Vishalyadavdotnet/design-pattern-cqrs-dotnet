using System;
using MediatR;

namespace DesignPattern.CQRS.Application.Features.Users.Commands.CreateUser;

public record CreateUserCommand : IRequest<Guid>
{
    public required string Name { get; init; }
    public required string Email { get; init; }
}
