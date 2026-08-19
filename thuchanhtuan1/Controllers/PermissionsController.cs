using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RbacApi.Data;
using RbacApi.DTOs;
using RbacApi.Entities;

namespace RbacApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PermissionsController : ControllerBase
{
    private readonly AppDbContext _context;

    public PermissionsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/permissions
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PermissionResponseDto>>> GetPermissions()
    {
        var permissions = await _context.Permissions
            .Select(p => new PermissionResponseDto
            {
                Id = p.Id,
                Code = p.Code,
                Description = p.Description
            })
            .ToListAsync();

        return Ok(permissions);
    }

    // GET: api/permissions/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<PermissionResponseDto>> GetPermission(Guid id)
    {
        var permission = await _context.Permissions.FindAsync(id);

        if (permission == null)
        {
            return NotFound(new { message = $"Permission with Id {id} not found." });
        }

        return Ok(new PermissionResponseDto
        {
            Id = permission.Id,
            Code = permission.Code,
            Description = permission.Description
        });
    }

    // POST: api/permissions
    [HttpPost]
    public async Task<ActionResult<PermissionResponseDto>> CreatePermission(CreatePermissionDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Code))
        {
            return BadRequest(new { message = "Permission code is required." });
        }

        string cleanCode = dto.Code.Trim();

        var exists = await _context.Permissions.AnyAsync(p => p.Code == cleanCode);
        if (exists)
        {
            return Conflict(new { message = $"Permission code '{cleanCode}' already exists." });
        }

        var permission = new Permission
        {
            Id = Guid.NewGuid(),
            Code = cleanCode,
            Description = dto.Description?.Trim()
        };

        _context.Permissions.Add(permission);
        await _context.SaveChangesAsync();

        var response = new PermissionResponseDto
        {
            Id = permission.Id,
            Code = permission.Code,
            Description = permission.Description
        };

        return CreatedAtAction(nameof(GetPermission), new { id = permission.Id }, response);
    }

    // PUT: api/permissions/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePermission(Guid id, UpdatePermissionDto dto)
    {
        var permission = await _context.Permissions.FindAsync(id);
        if (permission == null)
        {
            return NotFound(new { message = $"Permission with Id {id} not found." });
        }

        if (string.IsNullOrWhiteSpace(dto.Code))
        {
            return BadRequest(new { message = "Permission code is required." });
        }

        string cleanCode = dto.Code.Trim();

        var existsCode = await _context.Permissions.AnyAsync(p => p.Code == cleanCode && p.Id != id);
        if (existsCode)
        {
            return Conflict(new { message = $"Permission code '{cleanCode}' already exists." });
        }

        permission.Code = cleanCode;
        permission.Description = dto.Description?.Trim();

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/permissions/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePermission(Guid id)
    {
        var permission = await _context.Permissions.FindAsync(id);
        if (permission == null)
        {
            return NotFound(new { message = $"Permission with Id {id} not found." });
        }

        _context.Permissions.Remove(permission);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
