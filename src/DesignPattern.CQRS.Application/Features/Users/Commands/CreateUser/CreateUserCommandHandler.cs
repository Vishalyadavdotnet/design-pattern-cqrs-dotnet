using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using DesignPattern.CQRS.Application.Interfaces;
using DesignPattern.CQRS.Domain.Entities;

namespace DesignPattern.CQRS.Application.Features.Users.Commands.CreateUser;

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, Guid>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateUserCommandHandler(IUserRepository userRepository, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var user = new User
        {
            Name = request.Name,
            Email = request.Email
        };

        await _userRepository.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return user.Id;
    }
}
