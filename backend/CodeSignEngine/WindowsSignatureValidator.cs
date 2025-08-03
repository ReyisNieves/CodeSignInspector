using System.Security.Cryptography.X509Certificates;
using System.Security.Cryptography.Pkcs;
using CodeSignInspector.CodeSignEngine.Models;
using System.Runtime.InteropServices;

namespace CodeSignInspector.CodeSignEngine;

public class WindowsSignatureValidator : ISignatureValidator
{
    [DllImport("wintrust.dll", ExactSpelling = true, SetLastError = false, CharSet = CharSet.Unicode)]
    private static extern uint WinVerifyTrust(
        [In] IntPtr hwnd,
        [In] [MarshalAs(UnmanagedType.LPStruct)] Guid pgActionID,
        [In] WinTrustData pWVTData
    );

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

            // Check if file has a signature using WinTrust API
            var trustResult = VerifyEmbeddedSignature(filePath);
            result.IsSigned = trustResult == 0;

            if (result.IsSigned)
            {
                // Extract certificate information
                var certInfo = ExtractCertificateInfo(filePath);
                if (certInfo != null)
                {
                    result.IsValid = true;
                    result.SignerName = certInfo.SubjectName.Name;
                    result.IssuerName = certInfo.IssuerName.Name;
                    result.ValidFrom = certInfo.NotBefore;
                    result.ValidTo = certInfo.NotAfter;
                    result.IsExpired = DateTime.Now > certInfo.NotAfter;
                    result.SignatureAlgorithm = certInfo.SignatureAlgorithm.FriendlyName ?? "Unknown";
                }
            }
        }
        catch (Exception ex)
        {
            result.ErrorMessage = ex.Message;
        }

        return result;
    }

    private uint VerifyEmbeddedSignature(string filePath)
    {
        var file = new WinTrustFileInfo
        {
            cbStruct = (uint)Marshal.SizeOf(typeof(WinTrustFileInfo)),
            pcwszFilePath = filePath,
            hFile = IntPtr.Zero,
            pgKnownSubject = IntPtr.Zero
        };

        var fileInfoPtr = Marshal.AllocHGlobal(Marshal.SizeOf(file));
        Marshal.StructureToPtr(file, fileInfoPtr, false);

        var data = new WinTrustData
        {
            cbStruct = (uint)Marshal.SizeOf(typeof(WinTrustData)),
            pPolicyCallbackData = IntPtr.Zero,
            pSIPClientData = IntPtr.Zero,
            dwUIChoice = WinTrustDataUIChoice.WTD_UI_NONE,
            fdwRevocationChecks = WinTrustDataRevocationChecks.WTD_REVOKE_NONE,
            dwUnionChoice = WinTrustDataUnionChoice.WTD_CHOICE_FILE,
            dwStateAction = WinTrustDataStateAction.WTD_STATEACTION_VERIFY,
            hWVTStateData = IntPtr.Zero,
            pwszURLReference = IntPtr.Zero,
            dwUIContext = WinTrustDataUIContext.WTD_UICONTEXT_EXECUTE,
            pFile = fileInfoPtr
        };

        var wintrust_action_generic_verify_v2 = new Guid("{00AAC56B-CD44-11d0-8CC2-00C04FC295EE}");
        var result = WinVerifyTrust(IntPtr.Zero, wintrust_action_generic_verify_v2, data);

        Marshal.FreeHGlobal(fileInfoPtr);
        return result;
    }

    private X509Certificate2? ExtractCertificateInfo(string filePath)
    {
        try
        {
            var cert = X509Certificate.CreateFromSignedFile(filePath);
            return new X509Certificate2(cert);
        }
        catch
        {
            return null;
        }
    }

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    private struct WinTrustFileInfo
    {
        public uint cbStruct;
        public string pcwszFilePath;
        public IntPtr hFile;
        public IntPtr pgKnownSubject;
    }

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    private struct WinTrustData
    {
        public uint cbStruct;
        public IntPtr pPolicyCallbackData;
        public IntPtr pSIPClientData;
        public WinTrustDataUIChoice dwUIChoice;
        public WinTrustDataRevocationChecks fdwRevocationChecks;
        public WinTrustDataUnionChoice dwUnionChoice;
        public IntPtr pFile;
        public WinTrustDataStateAction dwStateAction;
        public IntPtr hWVTStateData;
        public IntPtr pwszURLReference;
        public WinTrustDataUIContext dwUIContext;
    }

    private enum WinTrustDataUIChoice : uint
    {
        WTD_UI_ALL = 1,
        WTD_UI_NONE = 2,
        WTD_UI_NOBAD = 3,
        WTD_UI_NOGOOD = 4
    }

    private enum WinTrustDataRevocationChecks : uint
    {
        WTD_REVOKE_NONE = 0,
        WTD_REVOKE_WHOLECHAIN = 1
    }

    private enum WinTrustDataUnionChoice : uint
    {
        WTD_CHOICE_FILE = 1,
        WTD_CHOICE_CATALOG = 2,
        WTD_CHOICE_BLOB = 3,
        WTD_CHOICE_SIGNER = 4,
        WTD_CHOICE_CERT = 5
    }

    private enum WinTrustDataStateAction : uint
    {
        WTD_STATEACTION_IGNORE = 0,
        WTD_STATEACTION_VERIFY = 1,
        WTD_STATEACTION_CLOSE = 2,
        WTD_STATEACTION_AUTO_CACHE = 3,
        WTD_STATEACTION_AUTO_CACHE_FLUSH = 4
    }

    private enum WinTrustDataUIContext : uint
    {
        WTD_UICONTEXT_EXECUTE = 0,
        WTD_UICONTEXT_INSTALL = 1
    }
}
