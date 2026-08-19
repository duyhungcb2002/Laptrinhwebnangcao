using System.ComponentModel.DataAnnotations;

namespace thuchanhtuan2.Dtos;

public class ProgrammeCreateDto
{
    [Required, MaxLength(20)]
    public string ProgrammeCode { get; set; } = string.Empty;

    [Required, MaxLength(150)]
    public string ProgrammeName { get; set; } = string.Empty;

    [Required, MaxLength(30)]
    public string DegreeLevel { get; set; } = string.Empty;

    [Range(1, 8)]
    public byte DurationYears { get; set; }
}

public sealed class ProgrammeUpdateDto : ProgrammeCreateDto
{
}

public sealed record ProgrammeResponseDto(
    long ProgrammeId,
    string ProgrammeCode,
    string ProgrammeName,
    string DegreeLevel,
    byte DurationYears,
    int StudentCount);