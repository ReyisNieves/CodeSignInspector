using System.Diagnostics;
using CodeSignInspector.CodeSignEngine.Models;

namespace CodeSignInspector.CodeSignEngine;

public class LinuxSignatureValidator : ISignatureValidator
{
    public SignatureValidationResult ValidateSignature(string filePath)
    {
        var result = new SignatureValidationResult { FilePath = filePath };

        try
        {
            if (!File.Exists(filePath))
            {
                result.ErrorMessage = "File not found";
                return result;
            }

            // Check for GPG signatures
            var gpgResult = CheckGpgSignature(filePath);
            if (gpgResult.IsSigned)
            {
                result.IsSigned = true;
                result.IsValid = gpgResult.IsValid;
                result.SignerName = gpgResult.SignerName;
                result.ErrorMessage = gpgResult.ErrorMessage;
                return result;
            }

            // Check for embedded signatures (less common on Linux)
            var embeddedResult = CheckEmbeddedSignature(filePath);
            result.IsSigned = embeddedResult.IsSigned;
            result.IsValid = embeddedResult.IsValid;
            result.SignerName = embeddedResult.SignerName;
            result.ErrorMessage = embeddedResult.ErrorMessage;
        }
        catch (Exception ex)
        {
            result.ErrorMessage = ex.Message;
        }

        return result;
    }

    private (bool IsSigned, bool IsValid, string SignerName, string? ErrorMessage) CheckGpgSignature(string filePath)
    {
        try
        {
            // Check for detached signature file
            var sigFile = filePath + ".sig";
            if (File.Exists(sigFile))
            {
                var result = RunGpgCommand($"--verify \"{sigFile}\" \"{filePath}\"");
                var isSigned = result.ExitCode == 0;
                var signerName = ExtractGpgSigner(result.Output + result.Error);
                return (isSigned, isSigned, signerName, isSigned ? null : result.Error);
            }

            // Check for ASCII armored signature
            var ascFile = filePath + ".asc";
            if (File.Exists(ascFile))
            {
                var result = RunGpgCommand($"--verify \"{ascFile}\"");
                var isSigned = result.ExitCode == 0;
                var signerName = ExtractGpgSigner(result.Output + result.Error);
                return (isSigned, isSigned, signerName, isSigned ? null : result.Error);
            }

            return (false, false, "", null);
        }
        catch (Exception ex)
        {
            return (false, false, "", ex.Message);
        }
    }

    private (bool IsSigned, bool IsValid, string SignerName, string? ErrorMessage) CheckEmbeddedSignature(string filePath)
    {
        try
        {
            // Use objdump to check for signature sections
            var result = RunCommand("objdump", $"-h \"{filePath}\"");
            var hasSignatureSection = result.Output.Contains(".signature") || result.Output.Contains(".note.sig");
            
            if (hasSignatureSection)
            {
                return (true, true, "Embedded signature", null);
            }

            return (false, false, "", null);
        }
        catch (Exception ex)
        {
            return (false, false, "", ex.Message);
        }
    }

    private (int ExitCode, string Output, string Error) RunGpgCommand(string arguments)
    {
        return RunCommand("gpg", arguments);
    }

    private (int ExitCode, string Output, string Error) RunCommand(string command, string arguments)
    {
        try
        {
            var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = command,
                    Arguments = arguments,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                }
            };

            process.Start();
            var output = process.StandardOutput.ReadToEnd();
            var error = process.StandardError.ReadToEnd();
            process.WaitForExit();

            return (process.ExitCode, output, error);
        }
        catch (Exception ex)
        {
            return (-1, "", ex.Message);
        }
    }

    private string ExtractGpgSigner(string gpgOutput)
    {
        var lines = gpgOutput.Split('\n', StringSplitOptions.RemoveEmptyEntries);
        
        foreach (var line in lines)
        {
            if (line.Contains("Good signature from"))
            {
                var startIndex = line.IndexOf('"');
                var endIndex = line.LastIndexOf('"');
                if (startIndex != -1 && endIndex != -1 && endIndex > startIndex)
                {
                    return line.Substring(startIndex + 1, endIndex - startIndex - 1);
                }
            }
        }

        return "Unknown";
    }
}
