import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import FileValidator from './components/FileValidator';
import DirectoryScanner from './components/DirectoryScanner';
import Settings from './components/Settings';
import './App.css';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1>🛡️ CodeSign Inspector</h1>
          <p>Cross-Platform Code Signing Validation & Reporting</p>
        </div>
      </header>

      <div className="container">
        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`nav-tab ${activeTab === 'file' ? 'active' : ''}`}
            onClick={() => setActiveTab('file')}
          >
            📄 File Validator
          </button>
          <button
            className={`nav-tab ${activeTab === 'directory' ? 'active' : ''}`}
            onClick={() => setActiveTab('directory')}
          >
            📁 Directory Scanner
          </button>
          <button
            className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Settings
          </button>
        </nav>

        <main>
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'file' && <FileValidator />}
          {activeTab === 'directory' && <DirectoryScanner />}
          {activeTab === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
};

export default App;
