using Microsoft.AspNetCore.Mvc;
using thuchanhtuan2.Dtos;
using thuchanhtuan2.Services;

namespace thuchanhtuan2.Controllers;

[ApiController]
[Route("api/courses")]
public class CoursesController(ICourseService courseService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CourseResponseDto>>> GetAll(
        CancellationToken ct)
    {
        var result = await courseService.GetAllAsync(ct);
        return Ok(result);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<CourseResponseDto>> GetById(
        long id, CancellationToken ct)
    {
        var result = await courseService.GetByIdAsync(id, ct);
        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<CourseResponseDto>> Create(
        [FromBody] CourseCreateDto dto, CancellationToken ct)
    {
        var result = await courseService.CreateAsync(dto, ct);
        return CreatedAtAction(
            nameof(GetById),
            new { id = result.CourseId },
            result);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<CourseResponseDto>> Update(
        long id, [FromBody] CourseUpdateDto dto, CancellationToken ct)
    {
        var result = await courseService.UpdateAsync(id, dto, ct);
        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(
        long id, CancellationToken ct)
    {
        var success = await courseService.DeleteAsync(id, ct);
        if (!success)
            return NotFound();

        return NoContent();
    }
}
