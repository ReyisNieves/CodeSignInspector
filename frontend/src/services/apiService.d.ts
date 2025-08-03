const API_BASE_URL = 'http://localhost:5000/api';

export interface SignatureValidationResult {
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

export interface ScanResult {
  totalFiles: number;
  signedFiles: number;
  unsignedFiles: number;
  expiredSignatures: number;
  results: SignatureValidationResult[];
}

export interface ReportResult {
  format: string;
  data: string;
  generatedAt: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async generateReport(scanResults: SignatureValidationResult[], format: 'json' | 'csv' | 'html'): Promise<ReportResult> {
    const response = await fetch(`${this.baseUrl}/signature/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ scanResults, format }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
export { ApiService };
