import React, { useState, useEffect } from 'react';
import { Palette, Image, Type, Crown, Lock, Sparkles, Save, Eye } from 'lucide-react';
import { checkProStatusDetailed } from '../utils/checkProStatus';

interface PremiumBrandingOptionsProps {
  walletAddress: string;
  onBrandingChange?: (branding: BrandingSettings) => void;
}

export interface BrandingSettings {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  customFont: string;
  brandName?: string;
  accentColor: string;
}

export const PremiumBrandingOptions: React.FC<PremiumBrandingOptionsProps> = ({ 
  walletAddress, 
  onBrandingChange 
}) => {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [proStatusDetails, setProStatusDetails] = useState<{
    isPro: boolean;
    isManualPro: boolean;
    hasActiveSubscription: boolean;
    subscriptionTier?: string;
  }>({
    isPro: false,
    isManualPro: false,
    hasActiveSubscription: false
  });
  const [branding, setBranding] = useState<BrandingSettings>({
    primaryColor: '#10b981',
    secondaryColor: '#14b8a6',
    accentColor: '#f59e0b',
    logoUrl: '',
    customFont: 'Inter',
    brandName: ''
  });

  useEffect(() => {
    checkProStatus();
    loadSavedBranding();
  }, [walletAddress]);

  const checkProStatus = async () => {
    setLoading(true);
    try {
      const proDetails = await checkProStatusDetailed(walletAddress);
      setProStatusDetails(proDetails);
      setIsPro(proDetails.isPro);
    } catch (error) {
      console.error('Failed to check Pro status:', error);
      setIsPro(false);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedBranding = () => {
    try {
      const saved = localStorage.getItem(`branding_${walletAddress}`);
      if (saved) {
        setBranding(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load saved branding:', error);
    }
  };

  const handleBrandingUpdate = (updates: Partial<BrandingSettings>) => {
    const newBranding = { ...branding, ...updates };
    setBranding(newBranding);
    
    if (onBrandingChange) {
      onBrandingChange(newBranding);
    }
  };

  const saveBranding = async () => {
    setSaving(true);
    try {
      localStorage.setItem(`branding_${walletAddress}`, JSON.stringify(branding));
      
      if (onBrandingChange) {
        onBrandingChange(branding);
      }
    } catch (error) {
      console.error('Failed to save branding:', error);
    } finally {
      setSaving(false);
    }
  };

  const colorPresets = [
    { name: 'Emerald', primary: '#10b981', secondary: '#14b8a6', accent: '#f59e0b' },
    { name: 'Blue', primary: '#3b82f6', secondary: '#06b6d4', accent: '#8b5cf6' },
    { name: 'Purple', primary: '#8b5cf6', secondary: '#a855f7', accent: '#ec4899' },
    { name: 'Rose', primary: '#f43f5e', secondary: '#e11d48', accent: '#f97316' },
    { name: 'Amber', primary: '#f59e0b', secondary: '#eab308', accent: '#10b981' },
    { name: 'Teal', primary: '#14b8a6', secondary: '#06b6d4', accent: '#6366f1' }
  ];

  const fontOptions = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Poppins',
    'Source Sans Pro',
    'Nunito'
  ];

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-20 bg-slate-700 rounded"></div>
            <div className="h-20 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="glass-card p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-primary mb-2">Premium Branding</h3>
          <p className="text-secondary mb-4">
            Customize your tip jar's appearance with premium branding options
          </p>
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-4 mb-4 backdrop-blur-sm">
            <div className="flex items-center justify-center mb-2">
              <Crown className="w-5 h-5 text-emerald-400 mr-2" />
              <span className="font-semibold text-emerald-300">Pro Feature</span>
            </div>
            <p className="text-sm text-emerald-200">
              Upgrade to Pro by contacting support
            </p>
          </div>
          <button className="btn-primary px-6 py-2">
            Contact Support
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-primary flex items-center">
          <Palette className="w-5 h-5 mr-2 text-emerald-500" />
          Premium Branding
        </h3>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 px-3 py-1 bg-emerald-500/10 text-emerald-300 rounded-full text-sm font-medium border border-emerald-500/20">
            <Crown className="w-4 h-4" />
            <span>Pro</span>
          </div>
          {proStatusDetails.isManualPro && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-blue-500/10 text-blue-300 rounded-full text-xs font-medium border border-blue-500/20">
              <span>Manual</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Brand Name */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            <Type className="w-4 h-4 inline mr-2" />
            Brand Name
          </label>
          <input
            type="text"
            value={branding.brandName}
            onChange={(e) => handleBrandingUpdate({ brandName: e.target.value })}
            className="input-field"
            placeholder="Your Brand Name"
            maxLength={50}
          />
        </div>

        {/* Logo URL */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            <Image className="w-4 h-4 inline mr-2" />
            Logo URL
          </label>
          <input
            type="url"
            value={branding.logoUrl}
            onChange={(e) => handleBrandingUpdate({ logoUrl: e.target.value })}
            className="input-field"
            placeholder="https://example.com/logo.png"
          />
        </div>

        {/* Color Presets */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-3">
            Color Presets
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {colorPresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleBrandingUpdate({
                  primaryColor: preset.primary,
                  secondaryColor: preset.secondary,
                  accentColor: preset.accent
                })}
                className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                  branding.primaryColor === preset.primary
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: preset.primary }}
                  ></div>
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: preset.secondary }}
                  ></div>
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: preset.accent }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-slate-300">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Primary Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={branding.primaryColor}
                onChange={(e) => handleBrandingUpdate({ primaryColor: e.target.value })}
                className="w-12 h-10 rounded-lg border border-slate-600 bg-slate-700"
              />
              <input
                type="text"
                value={branding.primaryColor}
                onChange={(e) => handleBrandingUpdate({ primaryColor: e.target.value })}
                className="input-field flex-1 text-sm"
                placeholder="#10b981"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Secondary Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={branding.secondaryColor}
                onChange={(e) => handleBrandingUpdate({ secondaryColor: e.target.value })}
                className="w-12 h-10 rounded-lg border border-slate-600 bg-slate-700"
              />
              <input
                type="text"
                value={branding.secondaryColor}
                onChange={(e) => handleBrandingUpdate({ secondaryColor: e.target.value })}
                className="input-field flex-1 text-sm"
                placeholder="#14b8a6"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Accent Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={branding.accentColor}
                onChange={(e) => handleBrandingUpdate({ accentColor: e.target.value })}
                className="w-12 h-10 rounded-lg border border-slate-600 bg-slate-700"
              />
              <input
                type="text"
                value={branding.accentColor}
                onChange={(e) => handleBrandingUpdate({ accentColor: e.target.value })}
                className="input-field flex-1 text-sm"
                placeholder="#f59e0b"
              />
            </div>
          </div>
        </div>

        {/* Font Selection */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Custom Font
          </label>
          <select
            value={branding.customFont}
            onChange={(e) => handleBrandingUpdate({ customFont: e.target.value })}
            className="input-field"
          >
            {fontOptions.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </div>

        {/* Preview */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-3">
            <Eye className="w-4 h-4 inline mr-2" />
            Preview
          </label>
          <div 
            className="p-6 rounded-xl border border-slate-600"
            style={{
              background: `linear-gradient(135deg, ${branding.primaryColor}20, ${branding.secondaryColor}20)`,
              borderColor: `${branding.primaryColor}40`,
              fontFamily: branding.customFont
            }}
          >
            <div className="flex items-center space-x-3 mb-4">
              {branding.logoUrl ? (
                <img 
                  src={branding.logoUrl} 
                  alt="Logo" 
                  className="w-12 h-12 rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h4 
                  className="font-bold text-lg"
                  style={{ color: branding.primaryColor }}
                >
                  {branding.brandName || 'Your Brand'}
                </h4>
                <p className="text-sm text-slate-400">Tip Jar Preview</p>
              </div>
            </div>
            
            <button 
              className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-200"
              style={{ 
                background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})` 
              }}
            >
              Send Tip
            </button>
            
            <div className="mt-3 flex justify-center">
              <span 
                className="text-sm font-medium px-3 py-1 rounded-full"
                style={{ 
                  backgroundColor: `${branding.accentColor}20`,
                  color: branding.accentColor,
                  border: `1px solid ${branding.accentColor}40`
                }}
              >
                Premium Feature
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex space-x-3">
          <button
            onClick={saveBranding}
            disabled={saving}
            className="flex-1 flex items-center justify-center space-x-2 py-3 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save Branding'}</span>
          </button>
        </div>

        {/* Pro Status Info */}
        {proStatusDetails.isManualPro && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-blue-300 text-sm font-medium">
              ℹ️ Pro access manually enabled for this account
            </p>
          </div>
        )}
      </div>
    </div>
  );
};