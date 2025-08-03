import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadingComplete }) => {
  const [loadingStage, setLoadingStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Initializing...');
  const [backendReady, setBackendReady] = useState(false);

  const loadingStages = [
    { message: 'Initializing CodeSign Inspector...', duration: 1000 },
    { message: 'Checking backend API connection...', duration: 2000 },
    { message: 'Loading signature validation engine...', duration: 1500 },
    { message: 'Preparing user interface...', duration: 1000 },
    { message: 'Ready to validate signatures!', duration: 500 }
  ];

  const checkBackendHealth = async (): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:5000/api/health', {
        method: 'GET',
        timeout: 5000
      } as any);
      return response.ok;
    } catch (error) {
      console.warn('Backend health check failed:', error);
      return false;
    }
  };

  useEffect(() => {
    const loadApplication = async () => {
      for (let stage = 0; stage < loadingStages.length; stage++) {
        setLoadingStage(stage);
        setStatusMessage(loadingStages[stage].message);
        
        // Special handling for backend check stage
        if (stage === 1) {
          let attempts = 0;
          const maxAttempts = 15; // 15 seconds max wait
          
          while (attempts < maxAttempts && !backendReady) {
            const isHealthy = await checkBackendHealth();
            if (isHealthy) {
              setBackendReady(true);
              setStatusMessage('✅ Backend API connected successfully!');
              break;
            }
            
            attempts++;
            setStatusMessage(`🔄 Waiting for backend API... (${attempts}/${maxAttempts})`);
            
            // Update progress during backend wait
            const backendProgress = (attempts / maxAttempts) * 100;
            setProgress(((stage) / loadingStages.length) * 100 + (backendProgress / loadingStages.length));
            
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          if (!backendReady) {
            setStatusMessage('⚠️ Backend API not responding - some features may be limited');
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } else {
          // Normal stage progression
          const stageProgress = 100 / loadingStages.length;
          const startProgress = stage * stageProgress;
          const endProgress = (stage + 1) * stageProgress;
          
          const duration = loadingStages[stage].duration;
          const steps = 20;
          const stepDuration = duration / steps;
          
          for (let step = 0; step <= steps; step++) {
            const stepProgress = startProgress + ((endProgress - startProgress) * (step / steps));
            setProgress(stepProgress);
            await new Promise(resolve => setTimeout(resolve, stepDuration));
          }
        }
      }
      
      // Final completion
      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));
      onLoadingComplete();
    };

    loadApplication();
  }, [onLoadingComplete, backendReady]);

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-header">
          <div className="loading-logo">
            🛡️
          </div>
          <h1>CodeSign Inspector</h1>
          <p>Cross-Platform Code Signing Validation & Reporting</p>
        </div>
        
        <div className="loading-body">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          
          <div className="loading-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="progress-text">{Math.round(progress)}%</div>
          </div>
          
          <div className="loading-status">
            <p>{statusMessage}</p>
          </div>
          
          <div className="loading-info">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Backend API:</span>
                <span className={`info-value ${backendReady ? 'connected' : 'connecting'}`}>
                  {backendReady ? '✅ Connected' : '🔄 Connecting...'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Frontend:</span>
                <span className="info-value ready">✅ Ready</span>
              </div>
              <div className="info-item">
                <span className="info-label">Platform:</span>
                <span className="info-value ready">
                  {navigator.platform.includes('Mac') ? '🍎 macOS' : 
                   navigator.platform.includes('Win') ? '🪟 Windows' : 
                   '🐧 Linux'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="loading-footer">
          <p>Powered by Electron & .NET</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
