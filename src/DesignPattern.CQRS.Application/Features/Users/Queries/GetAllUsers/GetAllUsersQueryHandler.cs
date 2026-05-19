using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using MediatR;
using DesignPattern.CQRS.Application.DTOs;
using DesignPattern.CQRS.Application.Interfaces;

namespace DesignPattern.CQRS.Application.Features.Users.Queries.GetAllUsers;

public class GetAllUsersQueryHandler : IRequestHandler<GetAllUsersQuery, PaginatedList<UserDto>>
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public GetAllUsersQueryHandler(IUserRepository userRepository, IMapper mapper)
    {
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<PaginatedList<UserDto>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
    {
        var (users, totalCount) = await _userRepository.GetPagedAsync(request.PageNumber, request.PageSize, cancellationToken);
        
        var userDtos = _mapper.Map<List<UserDto>>(users);

        return new PaginatedList<UserDto>(userDtos, totalCount, request.PageNumber, request.PageSize);
    }
}
