import React, { useState } from 'react';
import { apiService, SignatureValidationResult } from '../services/apiService';

const FileValidator: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [validationResult, setValidationResult] = useState<SignatureValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileSelect = async () => {
    try {
      const filePath = await (window as any).electronAPI.selectFile();
      if (filePath) {
        setSelectedFile(filePath);
        setValidationResult(null);
        setError('');
      }
    } catch (err) {
      setError('Failed to select file');
    }
  };

  const handleValidate = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await apiService.validateSignature(selectedFile);
      setValidationResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="file-validator">
      <div className="card">
        <h2>📄 File Signature Validator</h2>
        <p>Select an executable file to validate its digital signature.</p>

        <div className="form-group">
          <label>Selected File:</label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              className="form-control"
              value={selectedFile}
              readOnly
              placeholder="No file selected"
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleFileSelect}
            >
              📂 Browse
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            ❌ {error}
          </div>
        )}

        <div className="btn-group">
          <button
            className="btn btn-primary"
            onClick={handleValidate}
            disabled={!selectedFile || loading}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                Validating...
              </>
            ) : (
              '🔍 Validate Signature'
            )}
          </button>
        </div>
      </div>

      {validationResult && (
        <div className="card">
          <h3>Validation Results</h3>
          <div className="signature-details">
            <dl>
              <dt>File Path</dt>
              <dd className="file-path">{validationResult.filePath}</dd>

              <dt>Signature Status</dt>
              <dd>{getStatusBadge(validationResult)}</dd>

              {validationResult.isSigned && (
                <>
                  <dt>Signer Name</dt>
                  <dd>{validationResult.signerName || 'Unknown'}</dd>

                  <dt>Issuer Name</dt>
                  <dd>{validationResult.issuerName || 'Unknown'}</dd>

                  <dt>Signature Algorithm</dt>
                  <dd>{validationResult.signatureAlgorithm || 'Unknown'}</dd>

                  <dt>Valid From</dt>
                  <dd>{validationResult.validFrom ? new Date(validationResult.validFrom).toLocaleString() : 'Unknown'}</dd>

                  <dt>Valid To</dt>
                  <dd>{validationResult.validTo ? new Date(validationResult.validTo).toLocaleString() : 'Unknown'}</dd>

                  <dt>Has Timestamp</dt>
                  <dd>{validationResult.hasTimestamp ? 'Yes' : 'No'}</dd>

                  <dt>Is Revoked</dt>
                  <dd>{validationResult.isRevoked ? 'Yes' : 'No'}</dd>

                  {validationResult.certificateChain.length > 0 && (
                    <>
                      <dt>Certificate Chain</dt>
                      <dd>
                        <ul>
                          {validationResult.certificateChain.map((cert, index) => (
                            <li key={index}>{cert}</li>
                          ))}
                        </ul>
                      </dd>
                    </>
                  )}
                </>
              )}

              {validationResult.errorMessage && (
                <>
                  <dt>Error Message</dt>
                  <dd style={{ color: '#dc3545' }}>{validationResult.errorMessage}</dd>
                </>
              )}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileValidator;
