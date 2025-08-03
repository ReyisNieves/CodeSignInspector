import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

interface ScanResult {
  totalFiles: number;
  signedFiles: number;
  unsignedFiles: number;
  expiredSignatures: number;
  results: SignatureValidationResult[];
}

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

const Dashboard: React.FC = () => {
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalFiles: 0,
    signedFiles: 0,
    unsignedFiles: 0,
    expiredSignatures: 0
  });

  useEffect(() => {
    loadRecentScans();
  }, []);

  const loadRecentScans = async () => {
    setLoading(true);
    try {
      // Load recent scans from local storage or API
      const savedScans = localStorage.getItem('recentScans');
      if (savedScans) {
        const scans = JSON.parse(savedScans);
        setRecentScans(scans);
        calculateStats(scans);
      }
    } catch (error) {
      console.error('Error loading recent scans:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (scans: ScanResult[]) => {
    const totals = scans.reduce((acc, scan) => ({
      totalFiles: acc.totalFiles + scan.totalFiles,
      signedFiles: acc.signedFiles + scan.signedFiles,
      unsignedFiles: acc.unsignedFiles + scan.unsignedFiles,
      expiredSignatures: acc.expiredSignatures + scan.expiredSignatures
    }), { totalFiles: 0, signedFiles: 0, unsignedFiles: 0, expiredSignatures: 0 });
    
    setStats(totals);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#667eea' }}>
            {stats.totalFiles}
          </div>
          <div className="stat-label">Total Files Scanned</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#28a745' }}>
            {stats.signedFiles}
          </div>
          <div className="stat-label">Signed Files</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#dc3545' }}>
            {stats.unsignedFiles}
          </div>
          <div className="stat-label">Unsigned Files</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#ffc107' }}>
            {stats.expiredSignatures}
          </div>
          <div className="stat-label">Expired Signatures</div>
        </div>
      </div>

      <div className="card">
        <h2>Recent Scans</h2>
        {recentScans.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 4v16h18V4H3zm2 14V6h14v12H5zm11-9h-3V7h3v2zm0 3h-6v-2h6v2zm-6 3h6v-2h-6v2z"/>
            </svg>
            <h3>No scans yet</h3>
            <p>Start by scanning a file or directory to see results here</p>
          </div>
        ) : (
          <div className="recent-scans">
            {recentScans.slice(0, 5).map((scan, index) => (
              <div key={index} className="scan-summary">
                <div className="scan-info">
                  <strong>Scan #{index + 1}</strong>
                  <span className="scan-date">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <div className="scan-stats">
                  <span className="stat">
                    📁 {scan.totalFiles} files
                  </span>
                  <span className="stat status-signed">
                    ✅ {scan.signedFiles} signed
                  </span>
                  <span className="stat status-unsigned">
                    ❌ {scan.unsignedFiles} unsigned
                  </span>
                  {scan.expiredSignatures > 0 && (
                    <span className="stat status-expired">
                      ⚠️ {scan.expiredSignatures} expired
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2>Quick Actions</h2>
        <div className="btn-group">
          <button className="btn btn-primary">
            📄 Validate Single File
          </button>
          <button className="btn btn-secondary">
            📁 Scan Directory
          </button>
          <button className="btn btn-success">
            📊 Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
