namespace CodeSignInspector.CodeSignEngine.Models;

public class SignatureValidationResult
{
    public string FilePath { get; set; } = string.Empty;
    public bool IsSigned { get; set; }
    public bool IsValid { get; set; }
    public bool IsExpired { get; set; }
    public bool HasTimestamp { get; set; }
    public string SignerName { get; set; } = string.Empty;
    public string IssuerName { get; set; } = string.Empty;
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
    public string? ErrorMessage { get; set; }
    public List<string> CertificateChain { get; set; } = new();
    public string SignatureAlgorithm { get; set; } = string.Empty;
    public bool IsRevoked { get; set; }
}

public class ScanResult
{
    public int TotalFiles { get; set; }
    public int SignedFiles { get; set; }
    public int UnsignedFiles { get; set; }
    public int ExpiredSignatures { get; set; }
    public List<SignatureValidationResult> Results { get; set; } = new();
}

public class ReportResult
{
    public string Format { get; set; } = string.Empty;
    public string Data { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; }
}
