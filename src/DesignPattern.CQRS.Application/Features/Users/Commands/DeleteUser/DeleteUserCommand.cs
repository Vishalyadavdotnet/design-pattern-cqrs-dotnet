using System;
using MediatR;

namespace DesignPattern.CQRS.Application.Features.Users.Commands.DeleteUser;

public record DeleteUserCommand(Guid Id) : IRequest;
