using Xunit;
using CodeSignInspector.CodeSignEngine;
using CodeSignInspector.CodeSignEngine.Models;

namespace CodeSignInspector.Tests;

public class SignatureValidatorTests
{
    [Fact]
    public void CreateValidator_ShouldReturnCorrectValidatorForPlatform()
    {
        // Arrange
        var factory = new SignatureValidatorFactory();

        // Act
        var validator = factory.CreateValidator();

        // Assert
        Assert.NotNull(validator);
        if (OperatingSystem.IsWindows())
        {
            Assert.IsType<WindowsSignatureValidator>(validator);
        }
        else if (OperatingSystem.IsMacOS())
        {
            Assert.IsType<MacOSSignatureValidator>(validator);
        }
        else
        {
            Assert.IsType<LinuxSignatureValidator>(validator);
        }
    }

    [Fact]
    public void ValidateSignature_WithNonExistentFile_ShouldReturnErrorResult()
    {
        // Arrange
        var factory = new SignatureValidatorFactory();
        var validator = factory.CreateValidator();
        var nonExistentFile = "/path/to/nonexistent/file.exe";

        // Act
        var result = validator.ValidateSignature(nonExistentFile);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(nonExistentFile, result.FilePath);
        Assert.False(result.IsSigned);
        Assert.False(result.IsValid);
        Assert.NotNull(result.ErrorMessage);
    }
}
