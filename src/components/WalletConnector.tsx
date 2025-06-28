import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Shield, Zap, Sparkles, AlertTriangle, Users, Crown, TrendingUp, Globe, ArrowRight, ExternalLink, Eye, Palette, Share2, X, Download, Smartphone } from 'lucide-react';
import { walletManager, WalletConnection } from '../utils/walletConnection';
import { QuickKashLogo } from './QuickKashLogo';

interface WalletConnectorProps {
  onWalletConnected: (connection: WalletConnection) => void;
}

export const WalletConnector: React.FC<WalletConnectorProps> = ({ onWalletConnected }) => {
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);

  const handleWalletConnect = async () => {
    setIsConnecting(true);
    setError(null);
    setShowConnectionModal(true);

    try {
      const connection = await walletManager.connectPera();
      onWalletConnected(connection);
      setShowConnectionModal(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection failed';
      setError(errorMessage);
      setShowConnectionModal(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCancelConnection = () => {
    setIsConnecting(false);
    setShowConnectionModal(false);
    setError(null);
    // Disconnect any pending connection
    try {
      walletManager.disconnectPera();
    } catch (error) {
      console.log('No active connection to disconnect');
    }
  };

  const isPeraWalletError = error && error.includes("Couldn't open Pera Wallet");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900 to-slate-900"></div>
      
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="max-w-4xl w-full">
            <div className="text-center mb-12">
              {/* Prominent QuickKash Logo */}
              <div className="flex justify-center mb-12">
                <div className="relative transform hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-3xl blur-xl"></div>
                  <div className="relative bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-xl rounded-3xl p-8 border border-emerald-500/20 shadow-2xl">
                    <QuickKashLogo size="large" />
                    <div className="absolute -top-3 -right-3">
                      <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
                    </div>
                    <div className="absolute -bottom-2 -left-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6 leading-tight">
                Decentralized Tip Jars
                <br />
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Powered by Algorand
                </span>
              </h1>
              
              <p className="text-xl text-secondary leading-relaxed mb-8 max-w-3xl mx-auto">
                Create your own tip jar, receive ALGO payments directly to your wallet, 
                and reward supporters with premium content. No middlemen, no tracking, 100% yours.
              </p>
              
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-sm mb-8">
                <div className="flex flex-wrap items-center justify-center gap-6 text-emerald-300 text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4" />
                    <span>Decentralized</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>No Logins</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>No Tracking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>100% Yours</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="glass-card p-6 text-center">
                <div className="w-16 h-16 accent-gradient rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">Instant Tips</h3>
                <p className="text-secondary text-sm">
                  Receive ALGO tips directly to your wallet with instant confirmation on the Algorand blockchain
                </p>
              </div>

              <div className="glass-card p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">Premium Content</h3>
                <p className="text-secondary text-sm">
                  Reward supporters with exclusive content when they tip 10+ ALGO. Build loyalty and value
                </p>
              </div>

              <div className="glass-card p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">Analytics & Growth</h3>
                <p className="text-secondary text-sm">
                  Track your tips, analyze supporter behavior, and grow your audience with detailed insights
                </p>
              </div>
            </div>

            {/* Main CTA */}
            <div className="glass-card p-8 text-center">
              <h2 className="text-2xl font-bold text-primary mb-4">
                Ready to Start Receiving Tips?
              </h2>
              <p className="text-secondary mb-6">
                Connect your Pera Wallet to create your personalized tip jar in minutes
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm backdrop-blur-sm">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <p className="font-medium mb-1">Connection Failed</p>
                      <p className="mb-3">{error}</p>
                      
                      {isPeraWalletError && (
                        <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3 mt-3">
                          <p className="font-medium mb-2 text-red-200">Troubleshooting Tips:</p>
                          <ul className="text-xs space-y-1 text-red-300">
                            <li className="flex items-start space-x-2">
                              <Download className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <span>Make sure Pera Wallet browser extension is installed and enabled</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <Smartphone className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <span>If using mobile, ensure Pera Wallet app is open and connected</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <span>
                                <a 
                                  href="https://perawallet.app/" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-red-200 hover:text-red-100 underline"
                                >
                                  Download Pera Wallet
                                </a>
                              </span>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={handleWalletConnect}
                  disabled={isConnecting}
                  className="w-full flex items-center justify-center space-x-3 p-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
                >
                  <Shield className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span className="font-semibold">
                    {isConnecting ? 'Connecting...' : 'Connect with Pera Wallet'}
                  </span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-700">
                <p className="text-xs text-muted text-center leading-relaxed mb-4">
                  Your wallet will be used to receive tips. We don't store your private keys.
                </p>
                
                {/* Quick Links */}
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  <button
                    onClick={() => navigate('/demo')}
                    className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <span>View Demo</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <span>Creator Dashboard</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                How QuickKash Works
              </h2>
              <p className="text-xl text-secondary max-w-2xl mx-auto">
                Simple, secure, and decentralized. Get started in three easy steps.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                  1
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">Connect Pera Wallet</h3>
                <p className="text-secondary">
                  Connect your Pera Wallet to get started. Your wallet address becomes your unique creator ID.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                  2
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">Create Profile</h3>
                <p className="text-secondary">
                  Set up your public profile with bio, avatar, and premium content. Customize branding with Pro features.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                  3
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">Share & Earn</h3>
                <p className="text-secondary">
                  Share your unique tip jar URL and start receiving ALGO tips directly to your wallet. No middlemen!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 px-4 bg-slate-800/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                Powerful Features
              </h2>
              <p className="text-xl text-secondary max-w-2xl mx-auto">
                Everything you need to monetize your content and build a loyal audience
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="glass-card p-6">
                <div className="w-12 h-12 accent-gradient rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">Decentralized</h3>
                <p className="text-secondary text-sm">
                  Built on Algorand blockchain. No central authority, no censorship, complete ownership.
                </p>
              </div>

              <div className="glass-card p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">Premium Content</h3>
                <p className="text-secondary text-sm">
                  Unlock exclusive content for supporters who tip 10+ ALGO. Videos, PDFs, downloads, and more.
                </p>
              </div>

              <div className="glass-card p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">Custom Branding</h3>
                <p className="text-secondary text-sm">
                  Pro creators can customize colors, fonts, logos, and branding to match their style.
                </p>
              </div>

              <div className="glass-card p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">Real-time Analytics</h3>
                <p className="text-secondary text-sm">
                  Track tips, supporter engagement, and premium content unlocks with detailed analytics.
                </p>
              </div>

              <div className="glass-card p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mb-4">
                  <Share2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">Easy Sharing</h3>
                <p className="text-secondary text-sm">
                  QR codes, shareable links, and social media integration make it easy to promote your tip jar.
                </p>
              </div>

              <div className="glass-card p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">Secure & Private</h3>
                <p className="text-secondary text-sm">
                  No personal data collection, no tracking cookies, no surveillance. Your privacy is protected.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="py-12 px-4 border-t border-slate-700">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <QuickKashLogo size="medium" />
            </div>
            <p className="text-secondary mb-4">
              Empowering creators with decentralized monetization on Algorand
            </p>
            <div className="flex justify-center space-x-6 text-sm text-muted">
              <span>Built with ❤️ for creators</span>
              <span>•</span>
              <span>Powered by Algorand</span>
              <span>•</span>
              <span>Open Source</span>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Modal */}
      {showConnectionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-primary">Connecting to Pera Wallet</h3>
              <button
                onClick={handleCancelConnection}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                aria-label="Cancel connection"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <div className="text-center py-6">
              <div className="w-16 h-16 accent-gradient rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <p className="text-secondary mb-4">
                Please check your Pera Wallet app to approve the connection.
              </p>
              <p className="text-sm text-muted">
                If you don't see a prompt, open your Pera Wallet app manually.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCancelConnection}
                className="flex-1 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Retry connection
                  handleWalletConnect();
                }}
                className="flex-1 py-3 btn-primary"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};