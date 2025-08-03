using CodeSignInspector.CodeSignEngine.Models;

namespace CodeSignInspector.CodeSignEngine;

public interface ISignatureValidator
{
    SignatureValidationResult ValidateSignature(string filePath);
}

public class SignatureValidatorFactory
{
    public ISignatureValidator CreateValidator()
    {
        return OperatingSystem.IsWindows() ? new WindowsSignatureValidator() :
               OperatingSystem.IsMacOS() ? new MacOSSignatureValidator() :
               new LinuxSignatureValidator();
    }
}
