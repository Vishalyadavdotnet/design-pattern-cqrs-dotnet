using System;
using MediatR;
using DesignPattern.CQRS.Application.DTOs;

namespace DesignPattern.CQRS.Application.Features.Users.Queries.GetUserById;

public record GetUserByIdQuery(Guid Id) : IRequest<UserDto>;
