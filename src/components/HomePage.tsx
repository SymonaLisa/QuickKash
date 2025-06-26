import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Crown, 
  TrendingUp, 
  Globe, 
  Shield, 
  Users, 
  ArrowRight, 
  ExternalLink,
  Sparkles,
  Eye,
  Share2,
  Palette
} from 'lucide-react';
import { QuickKashLogo } from './QuickKashLogo';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900 to-slate-900"></div>
      
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="max-w-4xl w-full">
            <div className="text-center mb-12">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <QuickKashLogo size="large" />
                  <div className="absolute -top-2 -right-2">
                    <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
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

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <button
                  onClick={() => navigate('/setup')}
                  aria-label="Create your tip jar"
                  className="flex items-center justify-center space-x-2 px-8 py-4 btn-primary text-lg font-semibold group"
                >
                  <span>Create Your Tip Jar</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button
                  onClick={() => navigate('/demo')}
                  aria-label="View demo"
                  className="flex items-center justify-center space-x-2 px-8 py-4 btn-secondary text-lg font-semibold"
                >
                  <span>View Demo</span>
                  <ExternalLink className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Links */}
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <a
                  href="/dashboard"
                  aria-label="Go to Creator Dashboard"
                  className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <span>Creator Dashboard</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                
                <span className="text-slate-600">•</span>
                
                <a
                  href="https://github.com/your-username/quickkash-tip-jar"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open source repository on GitHub"
                  className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <span>Open Source</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-6">
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
                <h3 className="text-xl font-bold text-primary mb-3">Connect Wallet</h3>
                <p className="text-secondary">
                  Connect your Pera or MyAlgo wallet to get started. Your wallet address becomes your unique creator ID.
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
    </div>
  );
};
