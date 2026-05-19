using AutoMapper;
using DesignPattern.CQRS.Application.DTOs;
using DesignPattern.CQRS.Domain.Entities;

namespace DesignPattern.CQRS.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<User, UserDto>();
    }
}
