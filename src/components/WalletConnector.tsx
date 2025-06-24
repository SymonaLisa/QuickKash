import React, { useState } from 'react';
import { Wallet, Shield, Zap, Sparkles, AlertTriangle } from 'lucide-react';
import { walletManager, WalletConnection } from '../utils/walletConnection';
import { QuickKashLogo } from './QuickKashLogo';

interface WalletConnectorProps {
  onWalletConnected: (connection: WalletConnection) => void;
}

export const WalletConnector: React.FC<WalletConnectorProps> = ({ onWalletConnected }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWalletConnect = async (walletType: 'pera' | 'myalgo') => {
    setIsConnecting(true);
    setError(null);

    try {
      let connection: WalletConnection;
      
      if (walletType === 'pera') {
        connection = await walletManager.connectPera();
      } else {
        connection = await walletManager.connectMyAlgo();
      }
      
      onWalletConnected(connection);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900 to-slate-900"></div>
      
      <div className="max-w-lg w-full relative z-10">
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <QuickKashLogo size="large" />
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-primary mb-3">
              Connect Your Wallet
            </h1>
            <p className="text-secondary leading-relaxed mb-6">
              Connect your Algorand wallet to start receiving tips from your audience
            </p>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-emerald-300 text-sm font-medium">
                🌐 Decentralized • No logins • No tracking • 100% yours
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm backdrop-blur-sm">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">Connection Failed</p>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => handleWalletConnect('pera')}
              disabled={isConnecting}
              className="w-full flex items-center justify-center space-x-3 p-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
            >
              <Shield className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="font-semibold">
                {isConnecting ? 'Connecting...' : 'Connect with Pera Wallet'}
              </span>
            </button>

            <button
              onClick={() => handleWalletConnect('myalgo')}
              disabled={isConnecting}
              className="w-full flex items-center justify-center space-x-3 p-4 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
            >
              <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">
                {isConnecting ? 'Connecting...' : 'Connect with MyAlgo'}
              </span>
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-xs text-muted text-center leading-relaxed">
              Your wallet will be used to receive tips. We don't store your private keys.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};