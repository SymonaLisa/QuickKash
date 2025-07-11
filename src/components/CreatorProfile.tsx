import React, { useState, useEffect, useCallback } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Share2, 
  Copy, 
  Star,
  Gift,
  TrendingUp,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  Crown,
  Sparkles,
  QrCode
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { TipButton } from './TipButton';
import { TipHistory } from './TipHistory';
import { PremiumContentViewer } from './PremiumContentViewer';
import { QuickKashLogo } from './QuickKashLogo';
import { supabaseManager } from '../utils/supabase';
import { brandingManager } from '../utils/brandingManager';
import { checkProStatus } from '../utils/checkProStatus';

interface CreatorProfileData {
  id: string;
  name: string;
  bio?: string;
  profile_image_url?: string;
  created_at: string;
  is_pro: boolean;
  custom_primary_color?: string;
  custom_secondary_color?: string;
  custom_logo_url?: string;
  custom_font?: string;
  brand_name?: string;
  branding_enabled?: boolean;
}

export const CreatorProfile: React.FC = () => {
  const { walletAddress } = useParams<{ walletAddress: string }>();
  const navigate = useNavigate();
  
  const [creator, setCreator] = useState<CreatorProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showPremiumContent, setShowPremiumContent] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tipStats, setTipStats] = useState({ total: 0, count: 0, premiumCount: 0 });
  const [lastTip, setLastTip] = useState<{ txId: string; amount: number } | null>(null);

  const applyCustomBranding = useCallback(() => {
    if (!creator?.branding_enabled) return;

    brandingManager.applyBrandingToDOM({
      customPrimaryColor: creator.custom_primary_color,
      customSecondaryColor: creator.custom_secondary_color,
      customLogoUrl: creator.custom_logo_url,
      customFont: creator.custom_font || 'Inter',
      brandName: creator.brand_name,
      brandingEnabled: creator.branding_enabled
    });
  }, [creator]);

  useEffect(() => {
    if (walletAddress) {
      loadCreatorProfile();
    }
  }, [walletAddress]);

  useEffect(() => {
    if (creator?.branding_enabled) {
      applyCustomBranding();
    }
    return () => {
      brandingManager.resetBrandingToDefault();
    };
  }, [creator, applyCustomBranding]);

  const loadCreatorProfile = async () => {
    if (!walletAddress) {
      setError('Invalid wallet address');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const creatorData = await supabaseManager.getCreatorByWallet(walletAddress);
      if (!creatorData) {
        setError('Creator profile not found');
        setLoading(false);
        return;
      }

      const isProStatus = await checkProStatus(walletAddress);
      setCreator({ ...creatorData, is_pro: isProStatus });

      const stats = await supabaseManager.getTotalTips(walletAddress);
      setTipStats(stats);

    } catch (err) {
      console.error('Failed to load creator profile:', err);
      setError('Failed to load creator profile');
    } finally {
      setLoading(false);
    }
  };

  const getProfileUrl = () => window.location.href;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(getProfileUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleShare = async () => {
    const url = getProfileUrl();
    const title = `${creator?.name || 'Creator'}'s QuickKash Tip Jar`;
    const text = `Support ${creator?.name || 'this creator'} with ALGO tips!`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        handleCopyUrl();
      }
    } else {
      handleCopyUrl();
    }
  };

  const handleTipSuccess = (txId: string, amount: number) => {
    setLastTip({ txId, amount });
    if (walletAddress) {
      supabaseManager.getTotalTips(walletAddress).then(setTipStats);
    }
  };

  const getBrandColors = () => {
    if (creator?.branding_enabled) {
      return {
        primary: creator.custom_primary_color || '#10b981',
        secondary: creator.custom_secondary_color || '#14b8a6',
        font: creator.custom_font || 'Inter'
      };
    }
    return {
      primary: '#10b981',
      secondary: '#14b8a6',
      font: 'Inter'
    };
  };

  const formatWalletAddress = (address: string) =>
    `${address.slice(0, 8)}...${address.slice(-8)}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-secondary">Loading creator profile...</p>
        </div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-card p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-primary mb-2">Creator Not Found</h1>
          <p className="text-secondary mb-4">{error}</p>
          <button onClick={() => navigate('/')} className="btn-primary px-6 py-2">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const brandColors = getBrandColors();
  const displayName = (creator.branding_enabled && creator.brand_name) || creator.name;
  const logoUrl = (creator.branding_enabled && creator.custom_logo_url) || creator.profile_image_url;
  const profileUrl = getProfileUrl();

  return (
    <div
      className="min-h-screen p-4"
      style={{
        background: creator.branding_enabled
          ? `linear-gradient(135deg, ${brandColors.primary}10, ${brandColors.secondary}10)`
          : 'linear-gradient(135deg, #10b98110, #14b8a610)',
        fontFamily: brandColors.font
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900 to-slate-900"></div>
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="grid gap-6">
          {/* Header */}
          <div
            className={`glass-card p-6 sm:p-8 ${
              creator.is_pro ? 'border-4 border-yellow-400/30 shadow-2xl animate-pulse' : ''
            }`}
          >
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <QuickKashLogo size="medium" />
              </div>

              {/* Pro Badge */}
              {creator.is_pro && (
                <div className="mb-4">
                  <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-400/20 to-yellow-500/20 border border-yellow-400/40 rounded-full text-yellow-300 font-semibold text-sm animate-pulse">
                    <Crown className="w-4 h-4" />
                    <span>✨ This creator is a QuickKash Pro member</span>
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
              )}

              {/* Avatar or Logo */}
              <div className="relative mb-6">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={displayName}
                    className={`w-24 h-24 rounded-2xl object-cover mx-auto shadow-lg ${
                      creator.is_pro ? 'ring-4 ring-yellow-400/50' : ''
                    }`}
                  />
                ) : (
                  <div
                    className={`w-24 h-24 rounded-2xl flex items-center justify-center mx-auto shadow-lg ${
                      creator.is_pro ? 'ring-4 ring-yellow-400/50' : ''
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})`
                    }}
                  >
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}
                {creator.is_pro && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                    <Star className="w-4 h-4 text-yellow-900" />
                  </div>
                )}
              </div>

              {/* Name & Bio */}
              <h1 className="text-2xl font-bold mb-2" style={{ color: brandColors.primary }}>
                {displayName}
              </h1>
              {creator.bio && <p className="text-secondary leading-relaxed mb-4">{creator.bio}</p>}

              {/* Wallet Address */}
              <div className="flex items-center justify-center space-x-2 text-sm text-muted mb-4">
                <MapPin className="w-4 h-4" />
                <span>{formatWalletAddress(walletAddress!)}</span>
              </div>

              {/* Member Since */}
              <div className="flex items-center justify-center space-x-2 text-sm text-muted mb-6">
                <Calendar className="w-4 h-4" />
                <span>Member since {new Date(creator.created_at).toLocaleDateString()}</span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: brandColors.primary }}>
                    {tipStats.total.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted">ALGO Received</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: brandColors.primary }}>
                    {tipStats.count}
                  </div>
                  <div className="text-xs text-muted">Total Tips</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: brandColors.primary }}>
                    {tipStats.premiumCount}
                  </div>
                  <div className="text-xs text-muted">Premium Unlocks</div>
                </div>
              </div>

              {/* Share Section */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mb-4">
                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center space-x-2 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share Profile</span>
                  </button>
                  <button
                    onClick={handleCopyUrl}
                    className={`flex items-center justify-center px-4 py-2 rounded-xl transition-colors ${
                      copied ? 'bg-emerald-500 text-white' : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300'
                    }`}
                  >
                    {copied ? <Star className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setShowQRCode(!showQRCode)}
                    className="flex items-center justify-center px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>

                {/* QR Code */}
                {showQRCode && (
                  <div className="bg-white p-4 rounded-xl inline-block">
                    <QRCode value={profileUrl} size={128} />
                    <p className="text-center text-xs text-gray-600 mt-2">
                      📤 Share your link: <br />
                      <code className="text-xs break-all">{profileUrl}</code>
                    </p>
                  </div>
                )}
              </div>

              {/* Premium Content Info */}
              <div
                className="rounded-xl p-4 mb-6 backdrop-blur-sm"
                style={{
                  background: `${brandColors.primary}10`,
                  border: `1px solid ${brandColors.primary}20`
                }}
              >
                <div className="flex items-center justify-center mb-2">
                  <Gift className="w-5 h-5 mr-2" style={{ color: brandColors.primary }} />
                  <span className="font-semibold" style={{ color: brandColors.primary }}>
                    Unlock Premium Rewards!
                  </span>
                </div>
                <div className="text-sm space-y-1" style={{ color: brandColors.secondary }}>
                  <p>⭐ Tip 10+ ALGO → Get instant access to exclusive content</p>
                  <p>📁 Download premium rewards and bonus materials!</p>
                  <p>💡 2% platform fee supports QuickKash development</p>
                </div>
              </div>
            </div>

            {/* Tip Button */}
            <TipButton
              creatorWallet={walletAddress!}
              creatorName={displayName}
              onTipSuccess={handleTipSuccess}
              onTipError={(error) => console.error('Tip failed:', error)}
            />

            {/* Last Tip Success */}
            {lastTip && (
              <div
                className="mt-4 p-4 rounded-xl backdrop-blur-sm"
                style={{
                  background: `${brandColors.primary}10`,
                  border: `1px solid ${brandColors.primary}20`
                }}
              >
                <p className="font-medium" style={{ color: brandColors.primary }}>
                  ✅ Tip of {lastTip.amount} ALGO sent successfully!
                </p>
                <a
                  href={`https://allo.info/tx/${lastTip.txId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline mt-1 inline-flex items-center space-x-1"
                  style={{ color: brandColors.secondary }}
                >
                  <span>View Transaction</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Toggle Buttons */}
            <div className="mt-6 pt-6 border-t border-slate-700">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
                <p className="text-xs text-muted">
                  Tips are sent directly to the creator's wallet on Algorand (98% to creator, 2% platform fee)
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-sm font-medium transition-colors"
                    style={{ color: brandColors.primary }}
                  >
                    {showHistory ? (
                      <span className="flex items-center space-x-1">
                        <EyeOff className="w-4 h-4" />
                        <span>Hide History</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>Show History</span>
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setShowPremiumContent(!showPremiumContent)}
                    className="text-sm font-medium transition-colors"
                    style={{ color: brandColors.primary }}
                  >
                    {showPremiumContent ? (
                      <span className="flex items-center space-x-1">
                        <EyeOff className="w-4 h-4" />
                        <span>Hide Premium</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>Show Premium</span>
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Content */}
          {showPremiumContent && (
            <PremiumContentViewer
              creatorAddress={walletAddress!}
              hasAccess={tipStats.total >= 10}
            />
          )}

          {/* Tip History */}
          {showHistory && <TipHistory walletAddress={walletAddress!} />}
        </div>
      </div>
    </div>
  );
};

