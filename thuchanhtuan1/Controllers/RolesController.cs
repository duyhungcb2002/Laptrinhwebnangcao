using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RbacApi.Data;
using RbacApi.DTOs;
using RbacApi.Entities;

namespace RbacApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RolesController : ControllerBase
{
    private readonly AppDbContext _context;

    public RolesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/roles
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoleResponseDto>>> GetRoles()
    {
        var roles = await _context.Roles
            .Select(r => new RoleResponseDto
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description,
                Permissions = r.RolePermissions.Select(rp => rp.Permission.Code).ToList()
            })
            .ToListAsync();

        return Ok(roles);
    }

    // GET: api/roles/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<RoleResponseDto>> GetRole(Guid id)
    {
        var role = await _context.Roles
            .Where(r => r.Id == id)
            .Select(r => new RoleResponseDto
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description,
                Permissions = r.RolePermissions.Select(rp => rp.Permission.Code).ToList()
            })
            .FirstOrDefaultAsync();

        if (role == null)
        {
            return NotFound(new { message = $"Role with Id {id} not found." });
        }

        return Ok(role);
    }

    // POST: api/roles
    [HttpPost]
    public async Task<ActionResult<RoleResponseDto>> CreateRole(CreateRoleDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new { message = "Role name is required." });
        }

        string cleanName = dto.Name.Trim();

        var exists = await _context.Roles.AnyAsync(r => r.Name == cleanName);
        if (exists)
        {
            return Conflict(new { message = $"Role with name '{cleanName}' already exists." });
        }

        var role = new Role
        {
            Id = Guid.NewGuid(),
            Name = cleanName,
            Description = dto.Description?.Trim()
        };

        _context.Roles.Add(role);
        await _context.SaveChangesAsync();

        var response = new RoleResponseDto
        {
            Id = role.Id,
            Name = role.Name,
            Description = role.Description,
            Permissions = new List<string>()
        };

        return CreatedAtAction(nameof(GetRole), new { id = role.Id }, response);
    }

    // PUT: api/roles/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRole(Guid id, UpdateRoleDto dto)
    {
        var role = await _context.Roles.FindAsync(id);
        if (role == null)
        {
            return NotFound(new { message = $"Role with Id {id} not found." });
        }

        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new { message = "Role name is required." });
        }

        string cleanName = dto.Name.Trim();

        var existsName = await _context.Roles.AnyAsync(r => r.Name == cleanName && r.Id != id);
        if (existsName)
        {
            return Conflict(new { message = $"Role with name '{cleanName}' already exists." });
        }

        role.Name = cleanName;
        role.Description = dto.Description?.Trim();

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/roles/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRole(Guid id)
    {
        var role = await _context.Roles.FindAsync(id);
        if (role == null)
        {
            return NotFound(new { message = $"Role with Id {id} not found." });
        }

        _context.Roles.Remove(role);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{roleId}/permissions/{permissionId}")]
    public async Task<IActionResult> AssignPermissionToRole(Guid roleId, Guid permissionId)
    {
        var roleExists = await _context.Roles.AnyAsync(r => r.Id == roleId);
        if (!roleExists)
        {
            return NotFound(new { message = $"Role with Id {roleId} not found." });
        }

        var permissionExists = await _context.Permissions.AnyAsync(p => p.Id == permissionId);
        if (!permissionExists)
        {
            return NotFound(new { message = $"Permission with Id {permissionId} not found." });
        }

        var relation = await _context.RolePermissions
            .FirstOrDefaultAsync(rp => rp.RoleId == roleId && rp.PermissionId == permissionId);

        if (relation != null)
        {
            return Conflict(new { message = $"Permission {permissionId} is already assigned to Role {roleId}." });
        }

        var rolePermission = new RolePermission
        {
            RoleId = roleId,
            PermissionId = permissionId
        };

        _context.RolePermissions.Add(rolePermission);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/roles/{roleId}/permissions/{permissionId}
    [HttpDelete("{roleId}/permissions/{permissionId}")]
    public async Task<IActionResult> RemovePermissionFromRole(Guid roleId, Guid permissionId)
    {
        var rolePermission = await _context.RolePermissions
            .FirstOrDefaultAsync(rp => rp.RoleId == roleId && rp.PermissionId == permissionId);

        if (rolePermission == null)
        {
            return NotFound(new { message = $"Assignment between Role {roleId} and Permission {permissionId} not found." });
        }

        _context.RolePermissions.Remove(rolePermission);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("{roleId}/permissions")]
    public async Task<ActionResult<IEnumerable<PermissionResponseDto>>> GetPermissionsOfRole(Guid roleId)
    {
        var roleExists = await _context.Roles.AnyAsync(r => r.Id == roleId);
        if (!roleExists)
        {
            return NotFound(new { message = $"Role with Id {roleId} not found." });
        }

        var permissions = await _context.RolePermissions
            .Where(rp => rp.RoleId == roleId)
            .Select(rp => new PermissionResponseDto
            {
                Id = rp.Permission.Id,
                Code = rp.Permission.Code,
                Description = rp.Permission.Description
            })
            .ToListAsync();

        return Ok(permissions);
    }
}
