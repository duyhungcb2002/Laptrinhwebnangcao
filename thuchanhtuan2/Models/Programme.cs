using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace thuchanhtuan2.Models;

[Table("programme")]
[Index(nameof(ProgrammeCode), IsUnique = true)]
public class Programme
{
    [Key, Column("programme_id")]
    public long ProgrammeId { get; set; }

    [Required, MaxLength(20), Column("programme_code")]
    public string ProgrammeCode { get; set; } = string.Empty;

    [Required, MaxLength(150), Column("programme_name")]
    public string ProgrammeName { get; set; } = string.Empty;

    [Required, MaxLength(30), Column("degree_level")]
    public string DegreeLevel { get; set; } = string.Empty;

    [Column("duration_years")]
    public byte DurationYears { get; set; }

    public ICollection<Student> Students { get; set; } = new List<Student>();
}