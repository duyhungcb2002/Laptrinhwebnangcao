using System.ComponentModel.DataAnnotations;

namespace RbacApi.DTOs;

public class CreatePermissionDto
{
    [Required(ErrorMessage = "Mã Permission là bắt buộc.")]
    public string Code { get; set; } = string.Empty;

    public string? Description { get; set; }
}

public class UpdatePermissionDto
{
    [Required(ErrorMessage = "Mã Permission là bắt buộc.")]
    public string Code { get; set; } = string.Empty;

    public string? Description { get; set; }
}

public class PermissionResponseDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
}
