using System.Threading;
using System.Threading.Tasks;

namespace DesignPattern.CQRS.Application.Interfaces;

public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
