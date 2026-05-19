using System;

namespace DesignPattern.CQRS.Application.DTOs;

public class UserDto
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
