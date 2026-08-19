using System.ComponentModel.DataAnnotations;

namespace RbacApi.DTOs;

public class CreateUserDto
{
    [Required(ErrorMessage = "Email là bắt buộc.")]
    [EmailAddress(ErrorMessage = "Email không đúng định dạng.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "DisplayName là bắt buộc.")]
    [MinLength(2, ErrorMessage = "DisplayName phải có tối thiểu 2 ký tự.")]
    public string DisplayName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password là bắt buộc.")]
    [MinLength(8, ErrorMessage = "Password phải có tối thiểu 8 ký tự.")]
    public string Password { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
}

public class UpdateUserDto
{
    [Required(ErrorMessage = "DisplayName là bắt buộc.")]
    [MinLength(2, ErrorMessage = "DisplayName phải có tối thiểu 2 ký tự.")]
    public string DisplayName { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
}

public class UserResponseDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<string> Roles { get; set; } = new();
}
