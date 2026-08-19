using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace thuchanhtuan2.Models;

[Table("course")]
[Index(nameof(CourseCode), IsUnique = true)]
public class Course
{
    [Key, Column("course_id")]
    public long CourseId { get; set; }

    [Required, MaxLength(20), Column("course_code")]
    public string CourseCode { get; set; } = string.Empty;

    [Required, MaxLength(150), Column("course_name")]
    public string CourseName { get; set; } = string.Empty;

    [Column("credits")]
    public byte Credits { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;
}