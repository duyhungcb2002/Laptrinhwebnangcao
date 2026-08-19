using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RbacApi.Data;
using RbacApi.DTOs;
using RbacApi.Entities;

namespace RbacApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly PasswordHasher<User> _passwordHasher;

    public UsersController(AppDbContext context)
    {
        _context = context;
        _passwordHasher = new PasswordHasher<User>();
    }

    // GET: api/users
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetUsers()
    {
        var users = await _context.Users
            .Select(u => new UserResponseDto
            {
                Id = u.Id,
                Email = u.Email,
                DisplayName = u.DisplayName,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt,
                Roles = u.UserRoles.Select(ur => ur.Role.Name).ToList()
            })
            .ToListAsync();

        return Ok(users);
    }

    // GET: api/users/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<UserResponseDto>> GetUser(Guid id)
    {
        var user = await _context.Users
            .Where(u => u.Id == id)
            .Select(u => new UserResponseDto
            {
                Id = u.Id,
                Email = u.Email,
                DisplayName = u.DisplayName,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt,
                Roles = u.UserRoles.Select(ur => ur.Role.Name).ToList()
            })
            .FirstOrDefaultAsync();

        if (user == null)
        {
            return NotFound(new { message = $"User with Id {id} not found." });
        }

        return Ok(user);
    }

    // POST: api/users
    [HttpPost]
    public async Task<ActionResult<UserResponseDto>> CreateUser(CreateUserDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest(new { message = "Email and Password are required." });
        }

        string cleanEmail = dto.Email.Trim().ToLowerInvariant();
        string cleanDisplayName = dto.DisplayName.Trim();

        var exists = await _context.Users.AnyAsync(u => u.Email == cleanEmail);
        if (exists)
        {
            return Conflict(new { message = $"Email '{cleanEmail}' already exists." });
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = cleanEmail,
            DisplayName = cleanDisplayName,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, dto.Password);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var response = new UserResponseDto
        {
            Id = user.Id,
            Email = user.Email,
            DisplayName = user.DisplayName,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            Roles = new List<string>()
        };

        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, response);
    }

    // PUT: api/users/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(Guid id, UpdateUserDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound(new { message = $"User with Id {id} not found." });
        }

        user.DisplayName = dto.DisplayName.Trim();
        user.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/users/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound(new { message = $"User with Id {id} not found." });
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{userId}/roles/{roleId}")]
    public async Task<IActionResult> AssignRoleToUser(Guid userId, Guid roleId)
    {
        var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
        {
            return NotFound(new { message = $"User with Id {userId} not found." });
        }

        var roleExists = await _context.Roles.AnyAsync(r => r.Id == roleId);
        if (!roleExists)
        {
            return NotFound(new { message = $"Role with Id {roleId} not found." });
        }

        var relation = await _context.UserRoles
            .FirstOrDefaultAsync(ur => ur.UserId == userId && ur.RoleId == roleId);

        if (relation != null)
        {
            return Conflict(new { message = $"Role {roleId} is already assigned to User {userId}." });
        }

        var userRole = new UserRole
        {
            UserId = userId,
            RoleId = roleId
        };

        _context.UserRoles.Add(userRole);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/users/{userId}/roles/{roleId}
    [HttpDelete("{userId}/roles/{roleId}")]
    public async Task<IActionResult> RemoveRoleFromUser(Guid userId, Guid roleId)
    {
        var userRole = await _context.UserRoles
            .FirstOrDefaultAsync(ur => ur.UserId == userId && ur.RoleId == roleId);

        if (userRole == null)
        {
            return NotFound(new { message = $"Assignment between User {userId} and Role {roleId} not found." });
        }

        _context.UserRoles.Remove(userRole);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("{userId}/roles")]
    public async Task<ActionResult<IEnumerable<RoleResponseDto>>> GetRolesOfUser(Guid userId)
    {
        var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
        {
            return NotFound(new { message = $"User with Id {userId} not found." });
        }

        var roles = await _context.UserRoles
            .Where(ur => ur.UserId == userId)
            .Select(ur => new RoleResponseDto
            {
                Id = ur.Role.Id,
                Name = ur.Role.Name,
                Description = ur.Role.Description,
                Permissions = ur.Role.RolePermissions.Select(rp => rp.Permission.Code).ToList()
            })
            .ToListAsync();

        return Ok(roles);
    }
}
