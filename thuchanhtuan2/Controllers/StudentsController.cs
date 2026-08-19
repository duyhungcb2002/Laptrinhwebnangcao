using Microsoft.AspNetCore.Mvc;
using thuchanhtuan2.Dtos;
using thuchanhtuan2.Services;

namespace thuchanhtuan2.Controllers;

[ApiController]
[Route("api/students")]
public class StudentsController(IStudentService studentService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<StudentResponseDto>>> GetAll(
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        if (page < 1 || pageSize < 1 || pageSize > 100)
        {
            return BadRequest("Page and PageSize must be greater than 0, and PageSize cannot exceed 100.");
        }

        var result = await studentService.GetAllAsync(status, page, pageSize, ct);
        return Ok(result);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<StudentResponseDto>> GetById(
        long id, CancellationToken ct)
    {
        var result = await studentService.GetByIdAsync(id, ct);
        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<StudentResponseDto>> Create(
        [FromBody] StudentCreateDto dto, CancellationToken ct)
    {
        var result = await studentService.CreateAsync(dto, ct);
        return CreatedAtAction(
            nameof(GetById),
            new { id = result.StudentId },
            result);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<StudentResponseDto>> Update(
        long id, [FromBody] StudentUpdateDto dto, CancellationToken ct)
    {
        var result = await studentService.UpdateAsync(id, dto, ct);
        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(
        long id, CancellationToken ct)
    {
        var success = await studentService.DeleteAsync(id, ct);
        if (!success)
            return NotFound();

        return NoContent();
    }
}
