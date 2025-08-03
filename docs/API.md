# CodeSign Inspector API Documentation

## Overview

The CodeSign Inspector API provides endpoints for validating digital signatures across Windows, macOS, and Linux platforms.

## Base URL
```
http://localhost:5000/api
```

## Authentication

Currently, the API does not require authentication. In production environments, consider implementing API keys or OAuth.

## Endpoints

### POST /signature/validate

Validates the digital signature of a single file.

#### Request
```json
{
  "filePath": "/path/to/executable/file.exe"
}
```

#### Response
```json
{
  "filePath": "/path/to/executable/file.exe",
  "isSigned": true,
  "isValid": true,
  "isExpired": false,
  "hasTimestamp": true,
  "signerName": "Microsoft Corporation",
  "issuerName": "Microsoft Code Signing PCA 2011",
  "validFrom": "2023-01-01T00:00:00Z",
  "validTo": "2024-01-01T00:00:00Z",
  "errorMessage": null,
  "certificateChain": [
    "Microsoft Code Signing PCA 2011",
    "Microsoft Root Certificate Authority 2011"
  ],
  "signatureAlgorithm": "sha256RSA",
  "isRevoked": false
}
```

#### Status Codes
- `200 OK`: Validation completed successfully
- `400 Bad Request`: Invalid request or file not found
- `500 Internal Server Error`: Server error during validation

### POST /signature/scan

Scans a directory for executable files and validates their signatures.

#### Request
```json
{
  "directoryPath": "/path/to/directory",
  "recursive": true
}
```

#### Response
```json
{
  "totalFiles": 10,
  "signedFiles": 7,
  "unsignedFiles": 3,
  "expiredSignatures": 1,
  "results": [
    {
      "filePath": "/path/to/file1.exe",
      "isSigned": true,
      "isValid": true,
      "isExpired": false,
      "hasTimestamp": true,
      "signerName": "Microsoft Corporation",
      "issuerName": "Microsoft Code Signing PCA 2011",
      "validFrom": "2023-01-01T00:00:00Z",
      "validTo": "2024-01-01T00:00:00Z",
      "errorMessage": null,
      "certificateChain": ["..."],
      "signatureAlgorithm": "sha256RSA",
      "isRevoked": false
    }
  ]
}
```

### POST /signature/report

Generates a report from scan results in various formats.

#### Request
```json
{
  "scanResults": [
    {
      "filePath": "/path/to/file.exe",
      "isSigned": true,
      "isValid": true,
      "isExpired": false,
      "hasTimestamp": true,
      "signerName": "Microsoft Corporation",
      "issuerName": "Microsoft Code Signing PCA 2011",
      "validFrom": "2023-01-01T00:00:00Z",
      "validTo": "2024-01-01T00:00:00Z",
      "errorMessage": null,
      "certificateChain": ["..."],
      "signatureAlgorithm": "sha256RSA",
      "isRevoked": false
    }
  ],
  "format": "json"
}
```

#### Supported Formats
- `json`: JSON format
- `csv`: Comma-separated values
- `html`: HTML report with styling

#### Response
```json
{
  "format": "json",
  "data": "formatted report data",
  "generatedAt": "2023-01-01T12:00:00Z"
}
```

## Data Models

### SignatureValidationResult
| Field | Type | Description |
|-------|------|-------------|
| filePath | string | Path to the validated file |
| isSigned | boolean | Whether the file has a digital signature |
| isValid | boolean | Whether the signature is valid |
| isExpired | boolean | Whether the signature has expired |
| hasTimestamp | boolean | Whether the signature includes a timestamp |
| signerName | string | Name of the certificate holder |
| issuerName | string | Name of the certificate issuer |
| validFrom | datetime | Start of certificate validity period |
| validTo | datetime | End of certificate validity period |
| errorMessage | string | Error message if validation failed |
| certificateChain | string[] | List of certificates in the chain |
| signatureAlgorithm | string | Algorithm used for signing |
| isRevoked | boolean | Whether the certificate has been revoked |

### ScanResult
| Field | Type | Description |
|-------|------|-------------|
| totalFiles | number | Total number of files scanned |
| signedFiles | number | Number of files with valid signatures |
| unsignedFiles | number | Number of files without signatures |
| expiredSignatures | number | Number of files with expired signatures |
| results | SignatureValidationResult[] | Detailed results for each file |

## Error Handling

The API returns standard HTTP status codes and error messages in JSON format:

```json
{
  "error": "File not found: /path/to/file.exe"
}
```

Common error scenarios:
- File not found or inaccessible
- Unsupported file format
- Platform-specific validation errors
- Network timeouts during revocation checking

## Platform-Specific Behavior

### Windows
- Uses Windows Trust API (WinTrust)
- Supports Authenticode signatures
- Can validate EXE, DLL, SYS, MSI files
- Requires Windows platform to run

### macOS
- Uses `codesign` command-line tool
- Supports Apple code signatures
- Can validate APP and PKG files
- Requires macOS platform and Xcode tools

### Linux
- Uses GPG for signature validation
- Limited support for embedded signatures
- Primarily validates detached GPG signatures
- Supports ELF and SO files with signatures

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

## Swagger Documentation

Interactive API documentation is available at:
```
http://localhost:5000/swagger
```

## Examples

### Validate a Windows Executable
```bash
curl -X POST "http://localhost:5000/api/signature/validate" \
     -H "Content-Type: application/json" \
     -d '{"filePath": "C:\\Windows\\System32\\notepad.exe"}'
```

### Scan a Directory
```bash
curl -X POST "http://localhost:5000/api/signature/scan" \
     -H "Content-Type: application/json" \
     -d '{"directoryPath": "C:\\Program Files", "recursive": true}'
```

### Generate HTML Report
```bash
curl -X POST "http://localhost:5000/api/signature/report" \
     -H "Content-Type: application/json" \
     -d '{"scanResults": [...], "format": "html"}'
```
