using System.Threading;
using System.Threading.Tasks;
using MediatR;
using DesignPattern.CQRS.Application.Interfaces;
using DesignPattern.CQRS.Domain.Exceptions;
using DesignPattern.CQRS.Domain.Entities;

namespace DesignPattern.CQRS.Application.Features.Users.Commands.DeleteUser;

public class DeleteUserCommandHandler : IRequestHandler<DeleteUserCommand>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteUserCommandHandler(IUserRepository userRepository, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.Id, cancellationToken);

        if (user == null)
        {
            throw new NotFoundException(nameof(User), request.Id);
        }

        _userRepository.Delete(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
