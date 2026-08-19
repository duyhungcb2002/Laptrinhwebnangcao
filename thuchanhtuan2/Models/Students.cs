using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace thuchanhtuan2.Models;

[Table("student")]
[Index(nameof(StudentCode), IsUnique = true)]
[Index(nameof(Email), IsUnique = true)]
public class Student
{
    [Key, Column("student_id")]
    public long StudentId { get; set; }

    [Column("programme_id")]
    public long ProgrammeId { get; set; }

    [Required, MaxLength(20), Column("student_code")]
    public string StudentCode { get; set; } = string.Empty;

    [Required, MaxLength(150), Column("full_name")]
    public string FullName { get; set; } = string.Empty;

    [Required, MaxLength(150), Column("email")]
    public string Email { get; set; } = string.Empty;

    [Column("date_of_birth", TypeName = "date")]
    public DateOnly? DateOfBirth { get; set; }

    [Column("year_of_entry")]
    public int YearOfEntry { get; set; }

    [Required, MaxLength(20), Column("status")]
    public string Status { get; set; } = "ACTIVE";

    [ForeignKey(nameof(ProgrammeId))]
    public Programme Programme { get; set; } = null!;
}