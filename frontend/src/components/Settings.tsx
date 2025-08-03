import React, { useState, useEffect } from 'react';

interface Settings {
  apiEndpoint: string;
  autoScanEnabled: boolean;
  scanInterval: number;
  includePatterns: string[];
  excludePatterns: string[];
  whitelistedCerts: string[];
  blacklistedCerts: string[];
  maxFileSize: number;
  enableTimestampChecking: boolean;
  enableRevocationChecking: boolean;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    apiEndpoint: 'http://localhost:5000/api',
    autoScanEnabled: false,
    scanInterval: 3600,
    includePatterns: ['*.exe', '*.dll', '*.sys', '*.msi', '*.app', '*.pkg', '*.so'],
    excludePatterns: ['*temp*', '*cache*'],
    whitelistedCerts: [],
    blacklistedCerts: [],
    maxFileSize: 100,
    enableTimestampChecking: true,
    enableRevocationChecking: false
  });

  const [newPattern, setNewPattern] = useState('');
  const [newExcludePattern, setNewExcludePattern] = useState('');
  const [newWhitelistedCert, setNewWhitelistedCert] = useState('');
  const [newBlacklistedCert, setNewBlacklistedCert] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const saveSettings = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateSetting = (key: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const addPattern = () => {
    if (newPattern.trim()) {
      updateSetting('includePatterns', [...settings.includePatterns, newPattern.trim()]);
      setNewPattern('');
    }
  };

  const removePattern = (index: number) => {
    updateSetting('includePatterns', settings.includePatterns.filter((_, i) => i !== index));
  };

  const addExcludePattern = () => {
    if (newExcludePattern.trim()) {
      updateSetting('excludePatterns', [...settings.excludePatterns, newExcludePattern.trim()]);
      setNewExcludePattern('');
    }
  };

  const removeExcludePattern = (index: number) => {
    updateSetting('excludePatterns', settings.excludePatterns.filter((_, i) => i !== index));
  };

  const addWhitelistedCert = () => {
    if (newWhitelistedCert.trim()) {
      updateSetting('whitelistedCerts', [...settings.whitelistedCerts, newWhitelistedCert.trim()]);
      setNewWhitelistedCert('');
    }
  };

  const removeWhitelistedCert = (index: number) => {
    updateSetting('whitelistedCerts', settings.whitelistedCerts.filter((_, i) => i !== index));
  };

  const addBlacklistedCert = () => {
    if (newBlacklistedCert.trim()) {
      updateSetting('blacklistedCerts', [...settings.blacklistedCerts, newBlacklistedCert.trim()]);
      setNewBlacklistedCert('');
    }
  };

  const removeBlacklistedCert = (index: number) => {
    updateSetting('blacklistedCerts', settings.blacklistedCerts.filter((_, i) => i !== index));
  };

  const exportSettings = async () => {
    try {
      const dataStr = JSON.stringify(settings, null, 2);
      const defaultPath = `codesign-inspector-settings-${new Date().getTime()}.json`;
      
      const savedPath = await (window as any).electronAPI.saveReport(dataStr, defaultPath);
      if (savedPath) {
        alert(`Settings exported to: ${savedPath}`);
      }
    } catch (err) {
      alert('Failed to export settings');
    }
  };

  const importSettings = async () => {
    try {
      const filePath = await (window as any).electronAPI.selectFile();
      if (filePath) {
        // In a real app, you'd read the file content here
        alert('Import functionality would be implemented here');
      }
    } catch (err) {
      alert('Failed to import settings');
    }
  };

  return (
    <div className="settings">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>⚙️ Settings</h2>
          <div className="btn-group">
            <button className="btn btn-secondary" onClick={exportSettings}>
              📤 Export
            </button>
            <button className="btn btn-secondary" onClick={importSettings}>
              📥 Import
            </button>
            <button className="btn btn-primary" onClick={saveSettings}>
              💾 Save Settings
            </button>
          </div>
        </div>

        {saved && (
          <div className="alert alert-success">
            ✅ Settings saved successfully!
          </div>
        )}

        <div className="form-group">
          <label>API Endpoint:</label>
          <input
            type="text"
            className="form-control"
            value={settings.apiEndpoint}
            onChange={(e) => updateSetting('apiEndpoint', e.target.value)}
            placeholder="http://localhost:5000/api"
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={settings.autoScanEnabled}
              onChange={(e) => updateSetting('autoScanEnabled', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Enable automatic scanning
          </label>
        </div>

        {settings.autoScanEnabled && (
          <div className="form-group">
            <label>Scan Interval (seconds):</label>
            <input
              type="number"
              className="form-control"
              value={settings.scanInterval}
              onChange={(e) => updateSetting('scanInterval', parseInt(e.target.value) || 3600)}
              min="60"
            />
          </div>
        )}

        <div className="form-group">
          <label>Maximum File Size (MB):</label>
          <input
            type="number"
            className="form-control"
            value={settings.maxFileSize}
            onChange={(e) => updateSetting('maxFileSize', parseInt(e.target.value) || 100)}
            min="1"
            max="1000"
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={settings.enableTimestampChecking}
              onChange={(e) => updateSetting('enableTimestampChecking', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Enable timestamp verification
          </label>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={settings.enableRevocationChecking}
              onChange={(e) => updateSetting('enableRevocationChecking', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Enable certificate revocation checking (slower)
          </label>
        </div>
      </div>

      <div className="card">
        <h3>File Patterns</h3>
        
        <div className="form-group">
          <label>Include Patterns:</label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              className="form-control"
              value={newPattern}
              onChange={(e) => setNewPattern(e.target.value)}
              placeholder="e.g., *.exe"
              onKeyPress={(e) => e.key === 'Enter' && addPattern()}
            />
            <button type="button" className="btn btn-secondary" onClick={addPattern}>
              ➕ Add
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {settings.includePatterns.map((pattern, index) => (
              <span key={index} className="status-badge" style={{ background: '#e9ecef', color: '#495057' }}>
                {pattern}
                <button
                  type="button"
                  onClick={() => removePattern(index)}
                  style={{ marginLeft: '5px', background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Exclude Patterns:</label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              className="form-control"
              value={newExcludePattern}
              onChange={(e) => setNewExcludePattern(e.target.value)}
              placeholder="e.g., *temp*"
              onKeyPress={(e) => e.key === 'Enter' && addExcludePattern()}
            />
            <button type="button" className="btn btn-secondary" onClick={addExcludePattern}>
              ➕ Add
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {settings.excludePatterns.map((pattern, index) => (
              <span key={index} className="status-badge" style={{ background: '#f8d7da', color: '#721c24' }}>
                {pattern}
                <button
                  type="button"
                  onClick={() => removeExcludePattern(index)}
                  style={{ marginLeft: '5px', background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Certificate Management</h3>
        
        <div className="form-group">
          <label>Whitelisted Certificates (Trusted):</label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              className="form-control"
              value={newWhitelistedCert}
              onChange={(e) => setNewWhitelistedCert(e.target.value)}
              placeholder="Certificate thumbprint or CN"
              onKeyPress={(e) => e.key === 'Enter' && addWhitelistedCert()}
            />
            <button type="button" className="btn btn-secondary" onClick={addWhitelistedCert}>
              ➕ Add
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {settings.whitelistedCerts.map((cert, index) => (
              <span key={index} className="status-badge status-signed">
                {cert}
                <button
                  type="button"
                  onClick={() => removeWhitelistedCert(index)}
                  style={{ marginLeft: '5px', background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Blacklisted Certificates (Untrusted):</label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              className="form-control"
              value={newBlacklistedCert}
              onChange={(e) => setNewBlacklistedCert(e.target.value)}
              placeholder="Certificate thumbprint or CN"
              onKeyPress={(e) => e.key === 'Enter' && addBlacklistedCert()}
            />
            <button type="button" className="btn btn-secondary" onClick={addBlacklistedCert}>
              ➕ Add
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {settings.blacklistedCerts.map((cert, index) => (
              <span key={index} className="status-badge status-unsigned">
                {cert}
                <button
                  type="button"
                  onClick={() => removeBlacklistedCert(index)}
                  style={{ marginLeft: '5px', background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
