using CodeSignInspector.CodeSignEngine;
using CodeSignInspector.CodeSignEngine.Models;

namespace CodeSignInspector.API.Services;

public class SignatureValidationService : ISignatureValidationService
{
    private readonly ISignatureValidator _validator;

    public SignatureValidationService()
    {
        _validator = new SignatureValidatorFactory().CreateValidator();
    }

    public async Task<SignatureValidationResult> ValidateSignatureAsync(string filePath)
    {
        return await Task.Run(() => _validator.ValidateSignature(filePath));
    }
}

public class FileSystemService : IFileSystemService
{
    private readonly string[] _executableExtensions = { ".exe", ".dll", ".sys", ".msi", ".app", ".pkg", ".so", ".sh" };

    public async Task<List<string>> GetExecutableFilesAsync(string directoryPath, bool recursive)
    {
        return await Task.Run(() =>
        {
            var searchOption = recursive ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly;
            var files = new List<string>();

            foreach (var extension in _executableExtensions)
            {
                try
                {
                    var foundFiles = Directory.GetFiles(directoryPath, $"*{extension}", searchOption);
                    files.AddRange(foundFiles);
                }
                catch (DirectoryNotFoundException)
                {
                    throw new DirectoryNotFoundException($"Directory not found: {directoryPath}");
                }
                catch (UnauthorizedAccessException)
                {
                    // Skip directories we can't access
                    continue;
                }
            }

            return files.Distinct().ToList();
        });
    }
}

public class ReportingService : IReportingService
{
    public async Task<string> GenerateReportAsync(List<SignatureValidationResult> results, string format)
    {
        return await Task.Run(() =>
        {
            return format.ToLower() switch
            {
                "json" => System.Text.Json.JsonSerializer.Serialize(results, new System.Text.Json.JsonSerializerOptions { WriteIndented = true }),
                "csv" => GenerateCsvReport(results),
                "html" => GenerateHtmlReport(results),
                _ => throw new ArgumentException($"Unsupported format: {format}")
            };
        });
    }

    private string GenerateCsvReport(List<SignatureValidationResult> results)
    {
        var csv = new System.Text.StringBuilder();
        csv.AppendLine("FilePath,IsSigned,IsValid,IsExpired,SignerName,IssuerName,ValidFrom,ValidTo,HasTimestamp");

        foreach (var result in results)
        {
            csv.AppendLine($"\"{result.FilePath}\",{result.IsSigned},{result.IsValid},{result.IsExpired},\"{result.SignerName}\",\"{result.IssuerName}\",{result.ValidFrom},{result.ValidTo},{result.HasTimestamp}");
        }

        return csv.ToString();
    }

    private string GenerateHtmlReport(List<SignatureValidationResult> results)
    {
        var html = new System.Text.StringBuilder();
        html.AppendLine("<!DOCTYPE html>");
        html.AppendLine("<html><head><title>Code Signature Report</title></head><body>");
        html.AppendLine("<h1>Code Signature Validation Report</h1>");
        html.AppendLine("<table border='1'>");
        html.AppendLine("<tr><th>File Path</th><th>Signed</th><th>Valid</th><th>Expired</th><th>Signer</th><th>Issuer</th></tr>");

        foreach (var result in results)
        {
            var rowClass = result.IsSigned ? (result.IsValid ? "valid" : "invalid") : "unsigned";
            html.AppendLine($"<tr class='{rowClass}'>");
            html.AppendLine($"<td>{result.FilePath}</td>");
            html.AppendLine($"<td>{result.IsSigned}</td>");
            html.AppendLine($"<td>{result.IsValid}</td>");
            html.AppendLine($"<td>{result.IsExpired}</td>");
            html.AppendLine($"<td>{result.SignerName}</td>");
            html.AppendLine($"<td>{result.IssuerName}</td>");
            html.AppendLine("</tr>");
        }

        html.AppendLine("</table></body></html>");
        return html.ToString();
    }
}
