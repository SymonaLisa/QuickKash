import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Image, 
  Type, 
  Crown, 
  Lock, 
  Save, 
  Eye, 
  Upload,
  Sparkles,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { checkProStatus } from '../utils/checkProStatus';

interface ProBrandingCustomizerProps {
  walletAddress: string;
  onBrandingChange?: (branding: BrandingSettings) => void;
}

export interface BrandingSettings {
  customPrimaryColor?: string;
  customSecondaryColor?: string;
  customLogoUrl?: string;
  customFont: string;
  brandName?: string;
  brandingEnabled: boolean;
}

export const ProBrandingCustomizer: React.FC<ProBrandingCustomizerProps> = ({ 
  walletAddress, 
  onBrandingChange 
}) => {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [branding, setBranding] = useState<BrandingSettings>({
    customPrimaryColor: '#10b981',
    customSecondaryColor: '#14b8a6',
    customLogoUrl: '',
    customFont: 'Inter',
    brandName: '',
    brandingEnabled: false
  });

  useEffect(() => {
    checkProStatusAndLoadBranding();
  }, [walletAddress]);

  const checkProStatusAndLoadBranding = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check Pro status
      const proStatus = await checkProStatus(walletAddress);
      setIsPro(proStatus);
      
      if (proStatus) {
        // Load existing branding settings
        await loadBrandingSettings();
      }
    } catch (err) {
      setError('Failed to load branding settings');
      console.error('Error loading branding:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadBrandingSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('creators')
        .select(`
          custom_primary_color,
          custom_secondary_color,
          custom_logo_url,
          custom_font,
          brand_name,
          branding_enabled
        `)
        .eq('id', walletAddress)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setBranding({
          customPrimaryColor: data.custom_primary_color || '#10b981',
          customSecondaryColor: data.custom_secondary_color || '#14b8a6',
          customLogoUrl: data.custom_logo_url || '',
          customFont: data.custom_font || 'Inter',
          brandName: data.brand_name || '',
          brandingEnabled: data.branding_enabled || false
        });
      }
    } catch (err) {
      console.error('Failed to load branding settings:', err);
    }
  };

  const handleBrandingUpdate = (updates: Partial<BrandingSettings>) => {
    const newBranding = { ...branding, ...updates };
    setBranding(newBranding);
    
    if (onBrandingChange) {
      onBrandingChange(newBranding);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be smaller than 2MB');
      return;
    }

    setUploadingLogo(true);
    setError(null);

    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${walletAddress}_logo_${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('creator-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('creator-logos')
        .getPublicUrl(fileName);

      if (urlData?.publicUrl) {
        handleBrandingUpdate({ customLogoUrl: urlData.publicUrl });
        setSuccess('Logo uploaded successfully!');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Failed to upload logo. Please try again.');
      console.error('Logo upload error:', err);
    } finally {
      setUploadingLogo(false);
    }
  };

  const saveBrandingSettings = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase
        .from('creators')
        .upsert({
          id: walletAddress,
          custom_primary_color: branding.customPrimaryColor,
          custom_secondary_color: branding.customSecondaryColor,
          custom_logo_url: branding.customLogoUrl || null,
          custom_font: branding.customFont,
          brand_name: branding.brandName || null,
          branding_enabled: branding.brandingEnabled,
          // Include required fields with defaults if creating new record
          name: 'Creator',
          email: `${walletAddress}@placeholder.com`,
          paypal_username: walletAddress
        }, {
          onConflict: 'id'
        });

      if (error) {
        throw error;
      }

      setSuccess('Branding settings saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
      if (onBrandingChange) {
        onBrandingChange(branding);
      }
    } catch (err) {
      setError('Failed to save branding settings');
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const colorPresets = [
    { name: 'Emerald', primary: '#10b981', secondary: '#14b8a6' },
    { name: 'Blue', primary: '#3b82f6', secondary: '#06b6d4' },
    { name: 'Purple', primary: '#8b5cf6', secondary: '#a855f7' },
    { name: 'Rose', primary: '#f43f5e', secondary: '#e11d48' },
    { name: 'Amber', primary: '#f59e0b', secondary: '#eab308' },
    { name: 'Teal', primary: '#14b8a6', secondary: '#06b6d4' }
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
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mr-3" />
          <span className="text-secondary">Loading branding settings...</span>
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
        </div>
      </div>

      <div className="space-y-6">
        {/* Enable Branding Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div>
            <h4 className="font-medium text-primary">Enable Custom Branding</h4>
            <p className="text-sm text-secondary">Apply your custom branding to your tip jar</p>
          </div>
          <button
            onClick={() => handleBrandingUpdate({ brandingEnabled: !branding.brandingEnabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              branding.brandingEnabled ? 'bg-emerald-600' : 'bg-slate-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                branding.brandingEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

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

        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            <Image className="w-4 h-4 inline mr-2" />
            Logo Upload
          </label>
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
                disabled={uploadingLogo}
              />
              <label
                htmlFor="logo-upload"
                className={`flex items-center space-x-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl transition-colors cursor-pointer ${
                  uploadingLogo ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {uploadingLogo ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {uploadingLogo ? 'Uploading...' : 'Choose Logo'}
                </span>
              </label>
              
              {branding.customLogoUrl && (
                <div className="flex items-center space-x-2">
                  <img 
                    src={branding.customLogoUrl} 
                    alt="Logo preview" 
                    className="w-8 h-8 rounded object-cover"
                  />
                  <button
                    onClick={() => handleBrandingUpdate({ customLogoUrl: '' })}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-muted">
              Upload a logo image (max 2MB). Supported formats: JPG, PNG, GIF, WebP
            </p>
          </div>
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
                  customPrimaryColor: preset.primary,
                  customSecondaryColor: preset.secondary
                })}
                className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                  branding.customPrimaryColor === preset.primary
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
                </div>
                <span className="text-sm font-medium text-slate-300">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Primary Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={branding.customPrimaryColor}
                onChange={(e) => handleBrandingUpdate({ customPrimaryColor: e.target.value })}
                className="w-12 h-10 rounded-lg border border-slate-600 bg-slate-700"
              />
              <input
                type="text"
                value={branding.customPrimaryColor}
                onChange={(e) => handleBrandingUpdate({ customPrimaryColor: e.target.value })}
                className="input-field flex-1 text-sm"
                placeholder="#10b981"
                pattern="^#[0-9A-Fa-f]{6}$"
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
                value={branding.customSecondaryColor}
                onChange={(e) => handleBrandingUpdate({ customSecondaryColor: e.target.value })}
                className="w-12 h-10 rounded-lg border border-slate-600 bg-slate-700"
              />
              <input
                type="text"
                value={branding.customSecondaryColor}
                onChange={(e) => handleBrandingUpdate({ customSecondaryColor: e.target.value })}
                className="input-field flex-1 text-sm"
                placeholder="#14b8a6"
                pattern="^#[0-9A-Fa-f]{6}$"
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
              background: branding.brandingEnabled 
                ? `linear-gradient(135deg, ${branding.customPrimaryColor}20, ${branding.customSecondaryColor}20)`
                : 'linear-gradient(135deg, #10b98120, #14b8a620)',
              borderColor: branding.brandingEnabled 
                ? `${branding.customPrimaryColor}40`
                : '#10b98140',
              fontFamily: branding.brandingEnabled ? branding.customFont : 'Inter'
            }}
          >
            <div className="flex items-center space-x-3 mb-4">
              {branding.customLogoUrl && branding.brandingEnabled ? (
                <img 
                  src={branding.customLogoUrl} 
                  alt="Logo" 
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ 
                    backgroundColor: branding.brandingEnabled 
                      ? branding.customPrimaryColor 
                      : '#10b981' 
                  }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h4 
                  className="font-bold text-lg"
                  style={{ 
                    color: branding.brandingEnabled 
                      ? branding.customPrimaryColor 
                      : '#10b981' 
                  }}
                >
                  {(branding.brandName && branding.brandingEnabled) || 'Your Brand'}
                </h4>
                <p className="text-sm text-slate-400">Tip Jar Preview</p>
              </div>
            </div>
            
            <button 
              className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-200"
              style={{ 
                background: branding.brandingEnabled 
                  ? `linear-gradient(135deg, ${branding.customPrimaryColor}, ${branding.customSecondaryColor})`
                  : 'linear-gradient(135deg, #10b981, #14b8a6)'
              }}
            >
              Send Tip
            </button>
            
            <div className="mt-3 flex justify-center">
              <span 
                className="text-sm font-medium px-3 py-1 rounded-full"
                style={{ 
                  backgroundColor: branding.brandingEnabled 
                    ? `${branding.customPrimaryColor}20`
                    : '#10b98120',
                  color: branding.brandingEnabled 
                    ? branding.customPrimaryColor 
                    : '#10b981',
                  border: branding.brandingEnabled 
                    ? `1px solid ${branding.customPrimaryColor}40`
                    : '1px solid #10b98140'
                }}
              >
                {branding.brandingEnabled ? 'Custom Branding' : 'Default Theme'}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-sm backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4" />
              <span>{success}</span>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex space-x-3">
          <button
            onClick={saveBrandingSettings}
            disabled={saving}
            className="flex-1 flex items-center justify-center space-x-2 py-3 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>{saving ? 'Saving...' : 'Save Branding'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};