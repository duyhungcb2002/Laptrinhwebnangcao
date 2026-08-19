using Microsoft.AspNetCore.Mvc;
using thuchanhtuan2.Dtos;
using thuchanhtuan2.Services;

namespace thuchanhtuan2.Controllers;

[ApiController]
[Route("api/programmes")]
public class ProgrammesController(IProgrammeService programmeService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProgrammeResponseDto>>> GetAll(
        CancellationToken ct)
    {
        var result = await programmeService.GetAllAsync(ct);
        return Ok(result);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ProgrammeResponseDto>> GetById(
        long id, CancellationToken ct)
    {
        var result = await programmeService.GetByIdAsync(id, ct);
        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ProgrammeResponseDto>> Create(
        [FromBody] ProgrammeCreateDto dto, CancellationToken ct)
    {
        var result = await programmeService.CreateAsync(dto, ct);
        return CreatedAtAction(
            nameof(GetById),
            new { id = result.ProgrammeId },
            result);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<ProgrammeResponseDto>> Update(
        long id, [FromBody] ProgrammeUpdateDto dto, CancellationToken ct)
    {
        var result = await programmeService.UpdateAsync(id, dto, ct);
        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(
        long id, CancellationToken ct)
    {
        var success = await programmeService.DeleteAsync(id, ct);
        if (!success)
            return NotFound();

        return NoContent();
    }

    [HttpGet("{id:long}/students")]
    public async Task<ActionResult<IReadOnlyList<StudentResponseDto>>> GetStudents(
        long id, CancellationToken ct)
    {
        var result = await programmeService.GetStudentsByProgrammeIdAsync(id, ct);
        if (result is null)
            return NotFound();

        return Ok(result);
    }
}
