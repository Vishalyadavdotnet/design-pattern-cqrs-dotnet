using System.Threading;
using System.Threading.Tasks;
using MediatR;
using DesignPattern.CQRS.Application.Interfaces;
using DesignPattern.CQRS.Domain.Exceptions;
using DesignPattern.CQRS.Domain.Entities;

namespace DesignPattern.CQRS.Application.Features.Users.Commands.UpdateUser;

public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateUserCommandHandler(IUserRepository userRepository, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.Id, cancellationToken);

        if (user == null)
        {
            throw new NotFoundException(nameof(User), request.Id);
        }

        user.Update(request.Name, request.Email);

        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
