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
import { WalletConnection } from './utils/walletConnection';
import { CreatorMetadata } from './utils/localStorage';

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

  if (currentState === 'tip-jar-created' && creatorMetadata) {
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
  return (
    <Router>
      <div className="relative min-h-screen">
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
          <Route path="*" element={<div className="p-8 text-center text-red-600 font-semibold">404 - Page Not Found</div>} />
        </Routes>

        {/* Admin Access Trigger */}
        <AdminTrigger className="fixed top-4 right-4" />
      </div>
    </Router>
  );
}

export default App;
