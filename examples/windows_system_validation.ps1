# Example: Validating Windows System Files

This example demonstrates how to use CodeSign Inspector to validate Windows system files for proper digital signatures.

## Prerequisites
- Windows 10/11
- CodeSign Inspector running
- Administrator privileges (recommended)

## Script: Validate System32 Files

```powershell
# PowerShell script to validate critical Windows system files
$systemFiles = @(
    "C:\Windows\System32\kernel32.dll",
    "C:\Windows\System32\ntdll.dll", 
    "C:\Windows\System32\user32.dll",
    "C:\Windows\System32\advapi32.dll",
    "C:\Windows\System32\shell32.dll",
    "C:\Windows\System32\svchost.exe",
    "C:\Windows\System32\lsass.exe",
    "C:\Windows\System32\winlogon.exe"
)

$apiEndpoint = "http://localhost:5000/api/signature/validate"
$results = @()

foreach ($file in $systemFiles) {
    Write-Host "Validating: $file"
    
    $body = @{
        filePath = $file
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri $apiEndpoint -Method POST -Body $body -ContentType "application/json"
        $results += $response
        
        if ($response.isSigned -and $response.isValid) {
            Write-Host "✅ VALID: $file" -ForegroundColor Green
        } elseif ($response.isSigned -and -not $response.isValid) {
            Write-Host "⚠️  INVALID: $file" -ForegroundColor Yellow
        } else {
            Write-Host "❌ UNSIGNED: $file" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ ERROR: $file - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Generate summary
$totalFiles = $results.Count
$validSigned = ($results | Where-Object { $_.isSigned -and $_.isValid }).Count
$invalidSigned = ($results | Where-Object { $_.isSigned -and -not $_.isValid }).Count
$unsigned = ($results | Where-Object { -not $_.isSigned }).Count

Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Total files checked: $totalFiles"
Write-Host "Valid signatures: $validSigned" -ForegroundColor Green
Write-Host "Invalid signatures: $invalidSigned" -ForegroundColor Yellow  
Write-Host "Unsigned files: $unsigned" -ForegroundColor Red

# Export detailed results
$results | ConvertTo-Json -Depth 10 | Out-File "windows_system_validation.json"
Write-Host "`nDetailed results saved to: windows_system_validation.json"
```

## Expected Results

All Windows system files should be properly signed by Microsoft. Any unsigned or invalid signatures may indicate:

1. **System corruption** - Files may have been modified or corrupted
2. **Malware infection** - Malicious software may have replaced system files
3. **Development/test systems** - Some test builds may have unsigned components

## Investigating Issues

If you find unsigned or invalid system files:

1. **Run System File Checker**:
   ```cmd
   sfc /scannow
   ```

2. **Check file details**:
   ```powershell
   Get-AuthenticodeSignature "C:\Windows\System32\suspicious_file.dll" | Format-List
   ```

3. **Verify file hashes** against known good versions

4. **Check system logs** for evidence of tampering

## Automation

You can automate this check to run regularly:

```powershell
# Schedule daily system file validation
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File C:\Scripts\validate_system_files.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At "02:00"
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount
$task = New-ScheduledTask -Action $action -Trigger $trigger -Principal $principal
Register-ScheduledTask -TaskName "CodeSignValidator" -InputObject $task
```

This example demonstrates the practical security benefits of continuous code signature validation in enterprise environments.
