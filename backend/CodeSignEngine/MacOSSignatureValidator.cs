using System.Diagnostics;
using CodeSignInspector.CodeSignEngine.Models;

namespace CodeSignInspector.CodeSignEngine;

public class MacOSSignatureValidator : ISignatureValidator
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

            // Use codesign command to verify signature
            var verifyResult = RunCodesignCommand("-v", filePath);
            result.IsSigned = verifyResult.ExitCode == 0;

            if (result.IsSigned)
            {
                // Get detailed signature information
                var displayResult = RunCodesignCommand("-dv", filePath);
                ParseCodesignOutput(displayResult.Output, result);
                result.IsValid = true;
            }
            else
            {
                result.ErrorMessage = verifyResult.Error;
            }
        }
        catch (Exception ex)
        {
            result.ErrorMessage = ex.Message;
        }

        return result;
    }

    private (int ExitCode, string Output, string Error) RunCodesignCommand(string arguments, string filePath)
    {
        try
        {
            var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = "codesign",
                    Arguments = $"{arguments} \"{filePath}\"",
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

    private void ParseCodesignOutput(string output, SignatureValidationResult result)
    {
        var lines = output.Split('\n', StringSplitOptions.RemoveEmptyEntries);

        foreach (var line in lines)
        {
            if (line.StartsWith("Authority="))
            {
                result.SignerName = line.Substring("Authority=".Length).Trim();
            }
            else if (line.StartsWith("Timestamp="))
            {
                result.HasTimestamp = true;
                var timestampStr = line.Substring("Timestamp=".Length).Trim();
                if (DateTime.TryParse(timestampStr, out var timestamp))
                {
                    result.ValidFrom = timestamp;
                }
            }
            else if (line.Contains("Signature="))
            {
                result.SignatureAlgorithm = ExtractSignatureAlgorithm(line);
            }
        }
    }

    private string ExtractSignatureAlgorithm(string line)
    {
        // Extract signature algorithm from codesign output
        var parts = line.Split('=');
        return parts.Length > 1 ? parts[1].Trim() : "Unknown";
    }
}
