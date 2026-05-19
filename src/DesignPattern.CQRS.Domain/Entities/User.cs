using System;
using DesignPattern.CQRS.Domain.Common;

namespace DesignPattern.CQRS.Domain.Entities;

public class User : BaseEntity
{
    public required string Name { get; set; }
    public required string Email { get; set; }

    // Helper method to update User details
    public void Update(string name, string email)
    {
        Name = name;
        Email = email;
        LastModifiedAt = DateTimeOffset.UtcNow;
    }
}
