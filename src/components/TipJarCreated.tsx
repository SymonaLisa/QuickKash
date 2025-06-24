import React, { useState } from 'react';
import { CheckCircle, Copy, Share2, ExternalLink } from 'lucide-react';
import { CreatorMetadata } from '../utils/localStorage';
import { QuickKashLogo } from './QuickKashLogo';

interface TipJarCreatedProps {
  metadata: CreatorMetadata;
  storageId: string;
}

export const TipJarCreated: React.FC<TipJarCreatedProps> = ({ metadata, storageId }) => {
  const [copied, setCopied] = useState(false);
  
  const tipJarUrl = `${window.location.origin}/creator/${metadata.walletAddress}`;
  
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(tipJarUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${metadata.displayName}'s QuickKash Tip Jar`,
          text: `Support ${metadata.displayName} with ALGO tips!`,
          url: tipJarUrl,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      handleCopyUrl();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900 to-slate-900"></div>
      
      <div className="max-w-2xl w-full relative z-10">
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="accent-gradient rounded-2xl p-4 shadow-xl">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="flex justify-center mb-4">
              <QuickKashLogo size="large" />
            </div>
            <h1 className="text-3xl font-bold text-primary mb-3">
              🎉 Your Tip Jar is Live!
            </h1>
            <p className="text-secondary leading-relaxed mb-4">
              Your audience can now send you ALGO tips using the link below
            </p>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-emerald-300 text-sm font-medium">
                🌐 Decentralized • No logins • No tracking • 100% yours
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-2xl p-6 mb-6 border border-slate-600/50 backdrop-blur-sm">
            <div className="flex items-center space-x-4 mb-4">
              {metadata.avatarUrl && (
                <img 
                  src={metadata.avatarUrl} 
                  alt={metadata.displayName}
                  className="w-16 h-16 rounded-xl object-cover shadow-md"
                />
              )}
              <div>
                <h3 className="text-xl font-bold text-primary">{metadata.displayName}</h3>
                <p className="text-secondary">{metadata.bio}</p>
                {metadata.goal && (
                  <p className="text-emerald-400 font-medium mt-1">🎯 {metadata.goal}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Your QuickKash Tip Jar URL
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={tipJarUrl}
                  readOnly
                  className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-300 text-sm"
                />
                <button
                  onClick={handleCopyUrl}
                  className={`px-4 py-3 rounded-xl transition-all duration-200 ${
                    copied 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {copied && (
                <p className="text-emerald-400 text-sm mt-1">✓ URL copied to clipboard!</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center space-x-2 py-3 btn-primary"
              >
                <Share2 className="w-4 h-4" />
                <span>Share QuickKash</span>
              </button>
              
              <a
                href={tipJarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-4 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-emerald-400">{metadata.walletAddress.slice(0, 8)}...</p>
                <p className="text-sm text-muted">Wallet Address</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">{storageId.slice(8, 16)}...</p>
                <p className="text-sm text-muted">Profile ID</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};