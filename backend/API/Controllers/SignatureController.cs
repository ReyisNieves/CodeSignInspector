using Microsoft.AspNetCore.Mvc;
using CodeSignInspector.API.Services;
using CodeSignInspector.CodeSignEngine.Models;

namespace CodeSignInspector.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SignatureController : ControllerBase
{
    private readonly ISignatureValidationService _signatureService;
    private readonly IFileSystemService _fileSystemService;
    private readonly IReportingService _reportingService;

    public SignatureController(
        ISignatureValidationService signatureService,
        IFileSystemService fileSystemService,
        IReportingService reportingService)
    {
        _signatureService = signatureService;
        _fileSystemService = fileSystemService;
        _reportingService = reportingService;
    }

    [HttpPost("validate")]
    public async Task<ActionResult<SignatureValidationResult>> ValidateSignature([FromBody] ValidateSignatureRequest request)
    {
        try
        {
            var result = await _signatureService.ValidateSignatureAsync(request.FilePath);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("scan")]
    public async Task<ActionResult<ScanResult>> ScanDirectory([FromBody] ScanDirectoryRequest request)
    {
        try
        {
            var files = await _fileSystemService.GetExecutableFilesAsync(request.DirectoryPath, request.Recursive);
            var results = new List<SignatureValidationResult>();

            foreach (var file in files)
            {
                var result = await _signatureService.ValidateSignatureAsync(file);
                results.Add(result);
            }

            var scanResult = new ScanResult
            {
                TotalFiles = results.Count,
                SignedFiles = results.Count(r => r.IsSigned),
                UnsignedFiles = results.Count(r => !r.IsSigned),
                ExpiredSignatures = results.Count(r => r.IsSigned && r.IsExpired),
                Results = results
            };

            return Ok(scanResult);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("report")]
    public async Task<ActionResult<ReportResult>> GenerateReport([FromBody] GenerateReportRequest request)
    {
        try
        {
            var reportData = await _reportingService.GenerateReportAsync(request.ScanResults, request.Format);
            return Ok(new ReportResult
            {
                Format = request.Format,
                Data = reportData,
                GeneratedAt = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}

public class ValidateSignatureRequest
{
    public string FilePath { get; set; } = string.Empty;
}

public class ScanDirectoryRequest
{
    public string DirectoryPath { get; set; } = string.Empty;
    public bool Recursive { get; set; } = true;
}

public class GenerateReportRequest
{
    public List<SignatureValidationResult> ScanResults { get; set; } = new();
    public string Format { get; set; } = "json";
}
