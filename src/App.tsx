import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletConnector } from './components/WalletConnector';
import { CreatorSetup } from './components/CreatorSetup';
import { TipJarCreated } from './components/TipJarCreated';
import { TipJarViewer } from './components/TipJarViewer';
import { TipButtonDemo } from './components/TipButtonDemo';
import { CreatorProfileManager } from './components/CreatorProfileManager';
import { AdminTrigger } from './components/AdminTrigger';
import { WalletConnection } from './utils/walletConnection';
import { CreatorMetadata } from './utils/localStorage';

type AppState = 'wallet-connection' | 'creator-setup' | 'tip-jar-created';

function CreateTipJar() {
  const [currentState, setCurrentState] = useState<AppState>('wallet-connection');
  const [walletConnection, setWalletConnection] = useState<WalletConnection | null>(null);
  const [creatorMetadata, setCreatorMetadata] = useState<CreatorMetadata | null>(null);
  const [storageId, setStorageId] = useState<string>('');

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

  return null;
}

function App() {
  return (
    <Router>
      <div className="relative">
        <Routes>
          <Route path="/" element={<CreateTipJar />} />
          <Route path="/creator/:walletAddress" element={<CreatorProfileManager />} />
          <Route path="/tip/:walletAddress" element={<TipJarViewer />} />
          <Route path="/demo" element={<TipButtonDemo />} />
        </Routes>
        
        {/* Admin Access Trigger */}
        <AdminTrigger className="fixed top-4 right-4" />
      </div>
    </Router>
  );
}

export default App;