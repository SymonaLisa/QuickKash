import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  Crown, 
  TrendingUp, 
  Eye, 
  EyeOff, 
  Save, 
  Loader2, 
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Share2,
  Copy,
  Palette,
  Image,
  Type,
  Globe,
  BarChart3,
  LogOut,
  Shield,
  Link,
  Zap
} from 'lucide-react';
import { connectPera, disconnectPera } from '../utils/walletConnection';
import { supabaseManager } from '../utils/supabase';
import { checkProStatus } from '../utils/checkProStatus';
import { TipHistory } from './TipHistory';
import { PremiumContentManager } from './PremiumContentManager';
import { ProBrandingCustomizer } from './ProBrandingCustomizer';
import { ShortlinkManager } from './ShortlinkManager';
import { QuickKashLogo } from './QuickKashLogo';
import { isSuperUser, shouldEnableSuperUserFeatures } from '../utils/devSuperUser';

interface CreatorProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  profile_image_url?: string;
  is_pro: boolean;
  custom_primary_color?: string;
  custom_secondary_color?: string;
  custom_logo_url?: string;
  custom_font?: string;
  brand_name?: string;
  branding_enabled?: boolean;
  created_at: string;
}

export const CreatorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'branding' | 'content' | 'analytics' | 'shortlinks'>('profile');
  const [isProfileLive, setIsProfileLive] = useState(false);
  const [tipStats, setTipStats] = useState({ total: 0, count: 0, premiumCount: 0 });
  const [copied, setCopied] = useState(false);
  const [connectionAttempted, setConnectionAttempted] = useState(false);
  const [isSuperUserMode, setIsSuperUserMode] = useState(false);
  const [superUserWallet, setSuperUserWallet] = useState('');

  const superUserFeaturesEnabled = shouldEnableSuperUserFeatures();

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    setLoading(true);
    setError(null);
    setConnectionAttempted(true);

    try {
      // First try to connect wallet normally
      const address = await connectPera();
      if (address) {
        setWalletAddress(address);
        await loadProfile(address);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.log('Normal wallet connection failed, checking for super user mode...');
    }

    // If normal connection fails and super user features are enabled, show super user option
    if (superUserFeaturesEnabled) {
      setLoading(false);
      // Don't redirect, show super user option instead
      return;
    }

    // If no super user features, redirect to homepage
    navigate('/');
  };

  const handleSuperUserAccess = async () => {
    if (!superUserWallet.trim()) {
      setError('Please enter a wallet address for super user access');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Add to super user list if not already there
      const { devUtils } = await import('../utils/devSuperUser');
      devUtils.addSuperUser(superUserWallet.trim());
      
      setWalletAddress(superUserWallet.trim());
      setIsSuperUserMode(true);
      await loadProfile(superUserWallet.trim());
    } catch (err) {
      setError('Failed to enable super user access');
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async (address: string) => {
    try {
      // Load creator profile
      const creator = await supabaseManager.getCreatorByWallet(address);
      
      if (creator) {
        setProfile(creator);
        setIsProfileLive(true);
        
        // Load tip statistics
        const stats = await supabaseManager.getTotalTips(address);
        setTipStats(stats);
      } else {
        setIsProfileLive(false);
        // For super users, create a default profile if none exists
        if (isSuperUser(address)) {
          setProfile({
            id: address,
            name: 'Super User Demo',
            email: `${address.slice(0, 8)}@demo.com`,
            bio: 'Demo profile with full Pro access for testing purposes',
            is_pro: true,
            created_at: new Date().toISOString()
          });
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const handleSaveProfile = async () => {
    if (!walletAddress || !profile) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await supabaseManager.createOrUpdateCreator(walletAddress, {
        name: profile.name,
        email: profile.email,
        paypal_username: walletAddress,
        bio: profile.bio,
        profile_image_url: profile.profile_image_url
      });

      if (result.success) {
        setSuccess('Profile saved successfully!');
        setIsProfileLive(true);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Failed to save profile');
      }
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleProfileChange = (field: keyof CreatorProfile, value: string) => {
    if (!profile) return;
    
    setProfile(prev => prev ? { ...prev, [field]: value } : null);
    
    // Clear messages when user starts editing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleDisconnectWallet = async () => {
    try {
      if (!isSuperUserMode) {
        await disconnectPera();
      }
      setWalletAddress(null);
      setProfile(null);
      setIsSuperUserMode(false);
      setSuperUserWallet('');
      navigate('/');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const getProfileUrl = () => {
    if (!walletAddress) return '';
    return `${window.location.origin}/creator/${walletAddress}`;
  };

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
    const title = `${profile?.name || 'Creator'}'s QuickKash Tip Jar`;
    const text = `Support ${profile?.name || 'this creator'} with ALGO tips!`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (error) {
        console.error('Share failed:', error);
        handleCopyUrl();
      }
    } else {
      handleCopyUrl();
    }
  };

  // Show loading screen during initial connection attempt
  if (loading && !connectionAttempted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-secondary">Connecting wallet and loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show connection required screen if wallet connection failed
  if (!walletAddress && connectionAttempted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-card p-8 text-center">
          <Shield className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-primary mb-2">Dashboard Access</h1>
          <p className="text-secondary mb-6">
            Connect your Pera Wallet or use Super User access to view the creator dashboard.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={initializeDashboard}
              className="w-full btn-primary py-3"
            >
              Connect Pera Wallet
            </button>

            {superUserFeaturesEnabled && (
              <>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-px bg-slate-600"></div>
                  <span className="text-xs text-muted">OR</span>
                  <div className="flex-1 h-px bg-slate-600"></div>
                </div>

                <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center space-x-2 mb-3">
                    <Zap className="w-5 h-5 text-red-400" />
                    <span className="font-semibold text-red-300">Super User Access</span>
                  </div>
                  <p className="text-red-200 text-sm mb-3">
                    For demo purposes - bypass wallet connection with any address
                  </p>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={superUserWallet}
                      onChange={(e) => setSuperUserWallet(e.target.value)}
                      placeholder="Enter any wallet address..."
                      className="input-field text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && handleSuperUserAccess()}
                    />
                    <button
                      onClick={handleSuperUserAccess}
                      disabled={loading || !superUserWallet.trim()}
                      className="w-full flex items-center justify-center space-x-2 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Shield className="w-4 h-4" />
                      )}
                      <span>{loading ? 'Enabling...' : 'Enable Super User'}</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            <button
              onClick={() => navigate('/')}
              className="w-full btn-secondary py-3"
            >
              Go Home
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900 to-slate-900"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 accent-gradient rounded-xl flex items-center justify-center">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <QuickKashLogo size="small" showIcon={false} />
                  <span className="text-slate-400">Dashboard</span>
                  {isSuperUserMode && (
                    <div className="flex items-center space-x-1 px-2 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-medium border border-red-500/30">
                      <Zap className="w-3 h-3" />
                      <span>Super User</span>
                    </div>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-primary">
                  {profile?.name || 'Creator Dashboard'}
                </h1>
                <p className="text-secondary">
                  {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-8)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Profile Status */}
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                isProfileLive 
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                  : 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20'
              }`}>
                {isProfileLive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span>{isProfileLive ? 'Live' : 'Draft'}</span>
              </div>

              {/* Pro Badge */}
              {(profile?.is_pro || isSuperUser(walletAddress || '')) && (
                <div className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-300 rounded-full text-sm font-medium border border-purple-500/20">
                  <Crown className="w-4 h-4" />
                  <span>Pro</span>
                </div>
              )}

              {/* Disconnect Button */}
              <button
                onClick={handleDisconnectWallet}
                className="flex items-center space-x-2 px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-lg transition-colors text-sm"
                title={isSuperUserMode ? "Exit Super User Mode" : "Disconnect Wallet"}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{isSuperUserMode ? 'Exit' : 'Disconnect'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {isProfileLive && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-emerald-400">{tipStats.total.toFixed(2)}</p>
                  <p className="text-sm text-muted">ALGO Received</p>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-500" />
              </div>
            </div>
            
            <div className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-400">{tipStats.count}</p>
                  <p className="text-sm text-muted">Total Tips</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-purple-400">{tipStats.premiumCount}</p>
                  <p className="text-sm text-muted">Premium Unlocks</p>
                </div>
                <Crown className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="glass-card p-2 mb-6">
          <div className="flex space-x-2 overflow-x-auto">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'shortlinks', label: 'Shortlinks', icon: Link },
              { id: 'branding', label: 'Branding', icon: Palette },
              { id: 'content', label: 'Content', icon: Settings },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-primary">Profile Settings</h3>
                {isProfileLive && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleShare}
                      className="flex items-center space-x-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                    
                    <button
                      onClick={handleCopyUrl}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        copied 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300'
                      }`}
                    >
                      <Copy className="w-4 h-4" />
                      <span>{copied ? 'Copied!' : 'Copy URL'}</span>
                    </button>
                  </div>
                )}
              </div>

              {!profile && (
                <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-300 text-sm backdrop-blur-sm">
                  <p className="font-medium mb-1">Create Your Profile</p>
                  <p>Fill out the form below to create your public creator profile and start receiving tips.</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={profile?.name || ''}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    className="input-field"
                    placeholder="Your name or brand"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    className="input-field"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Bio ({(profile?.bio || '').length}/500 characters)
                  </label>
                  <textarea
                    value={profile?.bio || ''}
                    onChange={(e) => handleProfileChange('bio', e.target.value)}
                    className="input-field resize-none"
                    rows={4}
                    placeholder="Tell your audience about yourself and what you do..."
                    maxLength={500}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Profile Image URL (optional)
                  </label>
                  <input
                    type="url"
                    value={profile?.profile_image_url || ''}
                    onChange={(e) => handleProfileChange('profile_image_url', e.target.value)}
                    className="input-field"
                    placeholder="https://example.com/your-photo.jpg"
                  />
                </div>

                {/* Messages */}
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm backdrop-blur-sm">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-sm backdrop-blur-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>{success}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSaveProfile}
                  disabled={saving || !profile?.name || !profile?.email}
                  className="flex items-center space-x-2 px-6 py-3 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  <span>{saving ? 'Saving...' : isProfileLive ? 'Update Profile' : 'Create Profile'}</span>
                </button>

                {isProfileLive && (
                  <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center space-x-2 mb-2">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      <span className="font-medium text-emerald-300">Your Profile is Live!</span>
                    </div>
                    <p className="text-emerald-200 text-sm mb-2">
                      Your public profile is available at:
                    </p>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 text-xs bg-slate-800/50 px-2 py-1 rounded text-slate-300">
                        {getProfileUrl()}
                      </code>
                      <a
                        href={getProfileUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Shortlinks Tab */}
          {activeTab === 'shortlinks' && walletAddress && profile && (
            <ShortlinkManager 
              walletAddress={walletAddress}
              creatorName={profile.name}
            />
          )}

          {/* Branding Tab */}
          {activeTab === 'branding' && walletAddress && (
            <ProBrandingCustomizer 
              walletAddress={walletAddress}
              onBrandingChange={() => {
                // Refresh profile data when branding changes
                if (walletAddress) {
                  loadProfile(walletAddress);
                }
              }}
            />
          )}

          {/* Content Tab */}
          {activeTab === 'content' && walletAddress && (
            <div className="space-y-6">
              <PremiumContentManager 
                creatorAddress={walletAddress}
                onContentAdded={() => {
                  // Refresh stats when content is added
                  if (walletAddress) {
                    supabaseManager.getTotalTips(walletAddress).then(setTipStats);
                  }
                }}
              />
              
              {!isProfileLive && (
                <div className="glass-card p-6 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 border border-yellow-500/20">
                  <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-primary mb-2">Profile Required</h3>
                    <p className="text-secondary mb-4">
                      Create your public profile first to start adding premium content.
                    </p>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className="btn-primary px-6 py-2"
                    >
                      Create Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && walletAddress && (
            <div className="space-y-6">
              <TipHistory walletAddress={walletAddress} />
              
              {!isProfileLive && (
                <div className="glass-card p-6 bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-blue-500/20">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-primary mb-2">Analytics Coming Soon</h3>
                    <p className="text-secondary mb-4">
                      Create your profile and start receiving tips to see detailed analytics.
                    </p>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className="btn-primary px-6 py-2"
                    >
                      Create Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};