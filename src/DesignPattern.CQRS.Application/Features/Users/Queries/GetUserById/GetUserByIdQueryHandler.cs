using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using MediatR;
using DesignPattern.CQRS.Application.DTOs;
using DesignPattern.CQRS.Application.Interfaces;
using DesignPattern.CQRS.Domain.Exceptions;
using DesignPattern.CQRS.Domain.Entities;

namespace DesignPattern.CQRS.Application.Features.Users.Queries.GetUserById;

public class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, UserDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public GetUserByIdQueryHandler(IUserRepository userRepository, IMapper mapper)
    {
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<UserDto> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.Id, cancellationToken);

        if (user == null)
        {
            throw new NotFoundException(nameof(User), request.Id);
        }

        return _mapper.Map<UserDto>(user);
    }
}
