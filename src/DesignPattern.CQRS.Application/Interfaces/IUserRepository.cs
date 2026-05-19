using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using DesignPattern.CQRS.Domain.Entities;

namespace DesignPattern.CQRS.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<User>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<(IEnumerable<User> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task AddAsync(User user, CancellationToken cancellationToken = default);
    void Update(User user);
    void Delete(User user);
}
