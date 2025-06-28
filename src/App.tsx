import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletConnector } from './components/WalletConnector';
import { CreatorSetup } from './components/CreatorSetup';
import { TipJarCreated } from './components/TipJarCreated';
import { TipJarViewer } from './components/TipJarViewer';
import { TipButtonDemo } from './components/TipButtonDemo';
import { CreatorProfileManager } from './components/CreatorProfileManager';
import { CreatorDashboard } from './components/CreatorDashboard';
import { HomePage } from './components/HomePage';
import { ShortlinkRedirect } from './components/ShortlinkRedirect';
import { AdminTrigger } from './components/AdminTrigger';
import { Navigation } from './components/Navigation';
import { SuperUserPanel } from './components/SuperUserPanel';
import { WalletConnection } from './utils/walletConnection';
import { CreatorMetadata } from './utils/localStorage';
import { isSuperUser, shouldEnableSuperUserFeatures } from './utils/devSuperUser';

type AppState = 'wallet-connection' | 'creator-setup' | 'tip-jar-created';

// Custom hook for persisted state in localStorage
function usePersistedState<T>(key: string, defaultValue: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Fail silently
    }
  }, [key, state]);

  return [state, setState] as const;
}

function CreateTipJar() {
  const [currentState, setCurrentState] = usePersistedState<AppState>('tipJarAppState', 'wallet-connection');
  const [walletConnection, setWalletConnection] = usePersistedState<WalletConnection | null>('tipJarWalletConn', null);
  const [creatorMetadata, setCreatorMetadata] = usePersistedState<CreatorMetadata | null>('tipJarCreatorMeta', null);
  const [storageId, setStorageId] = usePersistedState<string>('tipJarStorageId', '');

  const handleWalletConnected = (connection: WalletConnection) => {
    setWalletConnection(connection);
    setCurrentState('creator-setup');
  };

  const handleSetupComplete = (metadata: CreatorMetadata, id: string) => {
    setCreatorMetadata(metadata);
    setStorageId(id);
    setCurrentState('tip-jar-created');
  };

  if (currentState === 'wallet-connection') {
    return <WalletConnector onWalletConnected={handleWalletConnected} />;
  }

  if (currentState === 'creator-setup' && walletConnection) {
    return (
      <CreatorSetup 
        walletConnection={walletConnection}
        onSetupComplete={handleSetupComplete}
      />
    );
  }

  if (currentState === 'tip-jar-created' && createdMetadata) {
    return (
      <TipJarCreated 
        metadata={creatorMetadata}
        storageId={storageId}
      />
    );
  }

  // Fallback UI for unexpected state
  return <div className="p-4 text-center">Loading...</div>;
}

function App() {
  const [showSuperUserPanel, setShowSuperUserPanel] = useState(false);
  const [currentWalletAddress, setCurrentWalletAddress] = useState<string | null>(null);

  // Check for super user access
  const isCurrentUserSuperUser = currentWalletAddress ? isSuperUser(currentWalletAddress) : false;
  const superUserFeaturesEnabled = shouldEnableSuperUserFeatures();

  // Super user panel trigger (Ctrl+Shift+S)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'S' && superUserFeaturesEnabled) {
        event.preventDefault();
        setShowSuperUserPanel(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [superUserFeaturesEnabled]);

  return (
    <Router>
      <div className="relative min-h-screen">
        {/* Navigation */}
        <div className="fixed top-0 left-0 right-0 z-40">
          <Navigation 
            className="m-4"
            showSuperUserIndicator={isCurrentUserSuperUser}
            walletAddress={currentWalletAddress}
          />
        </div>

        {/* Main Content */}
        <div className="pt-20">
          <Routes>
            <Route path="/" element={<CreateTipJar />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/creator/:walletAddress" element={<CreatorProfileManager />} />
            <Route path="/tip/:walletAddress" element={<TipJarViewer />} />
            <Route path="/demo" element={<TipButtonDemo />} />
            <Route path="/dashboard" element={<CreatorDashboard />} />
            {/* Shortlink redirect route */}
            <Route path="/@:slug" element={<ShortlinkRedirect />} />

            {/* Catch-all 404 page */}
            <Route path="*" element={
              <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-red-400 mb-4">404</h1>
                  <p className="text-slate-300 mb-6">Page not found</p>
                  <button 
                    onClick={() => window.location.href = '/'}
                    className="btn-primary px-6 py-2"
                  >
                    Go Home
                  </button>
                </div>
              </div>
            } />
          </Routes>
        </div>

        {/* Admin Access Trigger */}
        <AdminTrigger className="fixed top-4 right-4" />

        {/* Super User Panel */}
        {superUserFeaturesEnabled && (
          <SuperUserPanel 
            isVisible={showSuperUserPanel}
            onClose={() => setShowSuperUserPanel(false)}
            currentWalletAddress={currentWalletAddress}
          />
        )}

        {/* Super User Trigger Hint (Development only) */}
        {superUserFeaturesEnabled && process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 left-4 text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded">
            Press Ctrl+Shift+S for Super User Panel
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;