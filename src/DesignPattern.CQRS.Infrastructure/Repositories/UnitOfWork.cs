using System.Threading;
using System.Threading.Tasks;
using DesignPattern.CQRS.Application.Interfaces;
using DesignPattern.CQRS.Infrastructure.Persistence;

namespace DesignPattern.CQRS.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }
}
