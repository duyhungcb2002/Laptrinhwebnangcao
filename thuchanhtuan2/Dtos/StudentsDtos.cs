using System.ComponentModel.DataAnnotations;

namespace thuchanhtuan2.Dtos;

public class StudentCreateDto
{
    [Range(1, long.MaxValue)]
    public long ProgrammeId { get; set; }

    [Required, MaxLength(20)]
    public string StudentCode { get; set; } = string.Empty;

    [Required, MaxLength(150)]
    public string FullName { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    public DateOnly? DateOfBirth { get; set; }

    [Range(2000, 2100)]
    public int YearOfEntry { get; set; }

    [RegularExpression("^(ACTIVE|SUSPENDED|GRADUATED)$")]
    public string Status { get; set; } = "ACTIVE";
}

public sealed class StudentUpdateDto : StudentCreateDto
{
}

public sealed record StudentResponseDto(
    long StudentId,
    long ProgrammeId,
    string ProgrammeCode,
    string ProgrammeName,
    string StudentCode,
    string FullName,
    string Email,
    DateOnly? DateOfBirth,
    int YearOfEntry,
    string Status);