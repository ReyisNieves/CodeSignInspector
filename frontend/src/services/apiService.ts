interface SignatureValidationResult {
  filePath: string;
  isSigned: boolean;
  isValid: boolean;
  isExpired: boolean;
  hasTimestamp: boolean;
  signerName: string;
  issuerName: string;
  validFrom?: string;
  validTo?: string;
  errorMessage?: string;
  certificateChain: string[];
  signatureAlgorithm: string;
  isRevoked: boolean;
}

interface ScanResult {
  totalFiles: number;
  signedFiles: number;
  unsignedFiles: number;
  expiredSignatures: number;
  results: SignatureValidationResult[];
}

interface ReportResult {
  format: string;
  data: string;
  generatedAt: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'http://localhost:5000/api';
  }

  async validateSignature(filePath: string): Promise<SignatureValidationResult> {
    const response = await fetch(`${this.baseUrl}/signature/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filePath }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async scanDirectory(directoryPath: string, recursive: boolean = true): Promise<ScanResult> {
    const response = await fetch(`${this.baseUrl}/signature/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ directoryPath, recursive }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async generateReport(scanResults: SignatureValidationResult[], format: string): Promise<ReportResult> {
    const response = await fetch(`${this.baseUrl}/signature/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ scanResults, format }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}

export const apiService = new ApiService();
export type { SignatureValidationResult, ScanResult, ReportResult };
