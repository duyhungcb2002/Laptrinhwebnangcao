using System.ComponentModel.DataAnnotations;

namespace thuchanhtuan2.Dtos;

public class CourseCreateDto
{
    [Required, MaxLength(20)]
    public string CourseCode { get; set; } = string.Empty;

    [Required, MaxLength(150)]
    public string CourseName { get; set; } = string.Empty;

    [Range(1, 10)]
    public byte Credits { get; set; }

    public bool IsActive { get; set; } = true;
}

public sealed class CourseUpdateDto : CourseCreateDto
{
}

public sealed record CourseResponseDto(
    long CourseId,
    string CourseCode,
    string CourseName,
    byte Credits,
    bool IsActive);