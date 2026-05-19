using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using DesignPattern.CQRS.Application.DTOs;
using DesignPattern.CQRS.Application.Features.Users.Commands.CreateUser;
using DesignPattern.CQRS.Application.Features.Users.Commands.UpdateUser;
using DesignPattern.CQRS.Application.Features.Users.Commands.DeleteUser;
using DesignPattern.CQRS.Application.Features.Users.Queries.GetUserById;
using DesignPattern.CQRS.Application.Features.Users.Queries.GetAllUsers;

namespace DesignPattern.CQRS.Api.Controllers;

public class UsersController : ApiControllerBase
{
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(Guid))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateUserCommand command)
    {
        var id = await Mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(UserDto))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById([FromRoute] Guid id)
    {
        var result = await Mediator.Send(new GetUserByIdQuery(id));
        return Ok(result);
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PaginatedList<UserDto>))]
    public async Task<IActionResult> GetAll([FromQuery] GetAllUsersQuery query)
    {
        var result = await Mediator.Send(query);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateUserCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest("The ID in the URL route does not match the ID in the request body.");
        }

        await Mediator.Send(command);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete([FromRoute] Guid id)
    {
        await Mediator.Send(new DeleteUserCommand(id));
        return NoContent();
    }
}
