using System.ComponentModel.DataAnnotations;

namespace RbacApi.DTOs;

public class CreateRoleDto
{
    [Required(ErrorMessage = "Tên Role là bắt buộc.")]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }
}

public class UpdateRoleDto
{
    [Required(ErrorMessage = "Tên Role là bắt buộc.")]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }
}

public class RoleResponseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<string> Permissions { get; set; } = new();
}
