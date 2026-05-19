using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using DesignPattern.CQRS.Application.Interfaces;
using DesignPattern.CQRS.Domain.Entities;
using DesignPattern.CQRS.Infrastructure.Persistence;

namespace DesignPattern.CQRS.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;

    public UserRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<User>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Users.ToListAsync(cancellationToken);
    }

    public async Task<(IEnumerable<User> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = _context.Users.AsNoTracking();
        
        var totalCount = await query.CountAsync(cancellationToken);
        
        var items = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        await _context.Users.AddAsync(user, cancellationToken);
    }

    public void Update(User user)
    {
        _context.Users.Update(user);
    }

    public void Delete(User user)
    {
        _context.Users.Remove(user);
    }
}
