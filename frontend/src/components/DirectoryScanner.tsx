import React, { useState } from 'react';
import { apiService, ScanResult, SignatureValidationResult } from '../services/apiService';

const DirectoryScanner: React.FC = () => {
  const [selectedDirectory, setSelectedDirectory] = useState<string>('');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [recursive, setRecursive] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'signed' | 'unsigned' | 'expired'>('all');

  const handleDirectorySelect = async () => {
    try {
      const directoryPath = await (window as any).electronAPI.selectDirectory();
      if (directoryPath) {
        setSelectedDirectory(directoryPath);
        setScanResult(null);
        setError('');
      }
    } catch (err) {
      setError('Failed to select directory');
    }
  };

  const handleScan = async () => {
    if (!selectedDirectory) {
      setError('Please select a directory first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await apiService.scanDirectory(selectedDirectory, recursive);
      setScanResult(result);
      
      // Save to recent scans
      const recentScans = JSON.parse(localStorage.getItem('recentScans') || '[]');
      recentScans.unshift(result);
      localStorage.setItem('recentScans', JSON.stringify(recentScans.slice(0, 10)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (format: 'json' | 'csv' | 'html') => {
    if (!scanResult) return;

    try {
      const report = await apiService.generateReport(scanResult.results, format);
      const defaultPath = `code-sign-report-${new Date().getTime()}.${format}`;
      
      const savedPath = await (window as any).electronAPI.saveReport(report.data, defaultPath);
      if (savedPath) {
        alert(`Report saved to: ${savedPath}`);
      }
    } catch (err) {
      setError('Failed to export report');
    }
  };

  const getFilteredResults = () => {
    if (!scanResult) return [];

    let filtered = scanResult.results;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(result =>
        result.filePath.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.signerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    switch (statusFilter) {
      case 'signed':
        filtered = filtered.filter(result => result.isSigned && result.isValid && !result.isExpired);
        break;
      case 'unsigned':
        filtered = filtered.filter(result => !result.isSigned);
        break;
      case 'expired':
        filtered = filtered.filter(result => result.isSigned && result.isExpired);
        break;
    }

    return filtered;
  };

  const getStatusBadge = (result: SignatureValidationResult) => {
    if (!result.isSigned) {
      return <span className="status-badge status-unsigned">Unsigned</span>;
    }
    if (result.isExpired) {
      return <span className="status-badge status-expired">Expired</span>;
    }
    if (result.isValid) {
      return <span className="status-badge status-signed">Valid</span>;
    }
    return <span className="status-badge status-unsigned">Invalid</span>;
  };

  const filteredResults = getFilteredResults();

  return (
    <div className="directory-scanner">
      <div className="card">
        <h2>📁 Directory Scanner</h2>
        <p>Scan a directory for executable files and validate their digital signatures.</p>

        <div className="form-group">
          <label>Selected Directory:</label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              className="form-control"
              value={selectedDirectory}
              readOnly
              placeholder="No directory selected"
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleDirectorySelect}
            >
              📂 Browse
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={recursive}
              onChange={(e) => setRecursive(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Scan subdirectories recursively
          </label>
        </div>

        {error && (
          <div className="alert alert-error">
            ❌ {error}
          </div>
        )}

        <div className="btn-group">
          <button
            className="btn btn-primary"
            onClick={handleScan}
            disabled={!selectedDirectory || loading}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                Scanning...
              </>
            ) : (
              '🔍 Start Scan'
            )}
          </button>
        </div>
      </div>

      {scanResult && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number" style={{ color: '#667eea' }}>
                {scanResult.totalFiles}
              </div>
              <div className="stat-label">Total Files</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" style={{ color: '#28a745' }}>
                {scanResult.signedFiles}
              </div>
              <div className="stat-label">Signed Files</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" style={{ color: '#dc3545' }}>
                {scanResult.unsignedFiles}
              </div>
              <div className="stat-label">Unsigned Files</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" style={{ color: '#ffc107' }}>
                {scanResult.expiredSignatures}
              </div>
              <div className="stat-label">Expired Signatures</div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Scan Results ({filteredResults.length} files)</h3>
              <div className="btn-group">
                <button
                  className="btn btn-success"
                  onClick={() => handleExportReport('json')}
                >
                  📄 Export JSON
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => handleExportReport('csv')}
                >
                  📊 Export CSV
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => handleExportReport('html')}
                >
                  🌐 Export HTML
                </button>
              </div>
            </div>

            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Search files or signers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>

            <div className="filter-group">
              <button
                className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All Files
              </button>
              <button
                className={`filter-btn ${statusFilter === 'signed' ? 'active' : ''}`}
                onClick={() => setStatusFilter('signed')}
              >
                Signed
              </button>
              <button
                className={`filter-btn ${statusFilter === 'unsigned' ? 'active' : ''}`}
                onClick={() => setStatusFilter('unsigned')}
              >
                Unsigned
              </button>
              <button
                className={`filter-btn ${statusFilter === 'expired' ? 'active' : ''}`}
                onClick={() => setStatusFilter('expired')}
              >
                Expired
              </button>
            </div>

            {filteredResults.length === 0 ? (
              <div className="empty-state">
                <p>No files match the current filters</p>
              </div>
            ) : (
              <table className="results-table">
                <thead>
                  <tr>
                    <th>File Path</th>
                    <th>Status</th>
                    <th>Signer</th>
                    <th>Algorithm</th>
                    <th>Valid Until</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result, index) => (
                    <tr key={index}>
                      <td>
                        <div className="file-path">{result.filePath.split('/').pop()}</div>
                        <small style={{ color: '#666' }}>{result.filePath}</small>
                      </td>
                      <td>{getStatusBadge(result)}</td>
                      <td>{result.signerName || '-'}</td>
                      <td>{result.signatureAlgorithm || '-'}</td>
                      <td>
                        {result.validTo
                          ? new Date(result.validTo).toLocaleDateString()
                          : '-'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DirectoryScanner;
