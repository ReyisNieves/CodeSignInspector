using CodeSignInspector.CodeSignEngine.Models;

namespace CodeSignInspector.API.Services;

public interface ISignatureValidationService
{
    Task<SignatureValidationResult> ValidateSignatureAsync(string filePath);
}

public interface IFileSystemService
{
    Task<List<string>> GetExecutableFilesAsync(string directoryPath, bool recursive);
}

public interface IReportingService
{
    Task<string> GenerateReportAsync(List<SignatureValidationResult> results, string format);
}
