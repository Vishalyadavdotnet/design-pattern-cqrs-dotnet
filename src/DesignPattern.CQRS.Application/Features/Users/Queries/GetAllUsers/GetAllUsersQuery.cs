using MediatR;
using DesignPattern.CQRS.Application.DTOs;

namespace DesignPattern.CQRS.Application.Features.Users.Queries.GetAllUsers;

public record GetAllUsersQuery : IRequest<PaginatedList<UserDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}
