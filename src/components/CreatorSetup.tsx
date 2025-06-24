import React, { useState } from 'react';
import { User, MessageCircle, Image, Target, CheckCircle, Sparkles, Crown } from 'lucide-react';
import { CreatorMetadata, localStorageManager } from '../utils/localStorage';
import { WalletConnection } from '../utils/walletConnection';
import { PremiumContentManager } from './PremiumContentManager';
import { ProBrandingCustomizer } from './ProBrandingCustomizer';
import { QuickKashLogo } from './QuickKashLogo';
import { checkProStatus } from '../utils/checkProStatus';

interface CreatorSetupProps {
  walletConnection: WalletConnection;
  onSetupComplete: (metadata: CreatorMetadata, id: string) => void;
}

export const CreatorSetup: React.FC<CreatorSetupProps> = ({ walletConnection, onSetupComplete }) => {
  const [currentStep, setCurrentStep] = useState<'profile' | 'branding' | 'content'>('profile');
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    avatarUrl: '',
    goal: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdMetadata, setCreatedMetadata] = useState<CreatorMetadata | null>(null);
  const [storageId, setStorageId] = useState<string>('');
  const [isPro, setIsPro] = useState(false);

  React.useEffect(() => {
    checkProStatusAndLoad();
  }, [walletConnection.address]);

  const checkProStatusAndLoad = async () => {
    try {
      const proStatus = await checkProStatus(walletConnection.address);
      setIsPro(proStatus);
    } catch (error) {
      console.error('Failed to check Pro status:', error);
      setIsPro(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }
    
    if (!formData.bio.trim()) {
      newErrors.bio = 'Bio is required';
    } else if (formData.bio.length > 280) {
      newErrors.bio = 'Bio must be 280 characters or less';
    }
    
    if (formData.avatarUrl && !isValidUrl(formData.avatarUrl)) {
      newErrors.avatarUrl = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const metadata: CreatorMetadata = {
        displayName: formData.displayName.trim(),
        bio: formData.bio.trim(),
        avatarUrl: formData.avatarUrl.trim() || undefined,
        goal: formData.goal.trim() || undefined,
        walletAddress: walletConnection.address,
        createdAt: new Date().toISOString()
      };
      
      const id = localStorageManager.saveCreatorMetadata(metadata);
      setCreatedMetadata(metadata);
      setStorageId(id);
      
      // Move to branding step if Pro, otherwise skip to content
      setCurrentStep(isPro ? 'branding' : 'content');
    } catch (error) {
      console.error('Setup failed:', error);
      setErrors({ submit: 'Failed to save profile. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFinishSetup = () => {
    if (createdMetadata && storageId) {
      onSetupComplete(createdMetadata, storageId);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 'branding') {
      setCurrentStep('content');
    }
  };

  if (currentStep === 'branding' && createdMetadata && isPro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900 to-slate-900"></div>
        
        <div className="max-w-2xl w-full relative z-10">
          <div className="glass-card p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="accent-gradient rounded-2xl p-4 shadow-xl">
                    <Crown className="w-10 h-10 text-white" />
                  </div>
                  <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-emerald-400 animate-pulse" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-primary mb-3">
                Customize Your Branding
              </h1>
              <p className="text-secondary leading-relaxed mb-4">
                Personalize your tip jar with custom colors, fonts, and branding
              </p>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-emerald-300 text-sm font-medium">
                  👑 Pro Feature - Make your tip jar uniquely yours
                </p>
              </div>
            </div>

            <ProBrandingCustomizer 
              walletAddress={walletConnection.address}
              onBrandingChange={() => {}}
            />

            <div className="mt-8 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleNextStep}
                className="flex-1 py-4 btn-primary"
              >
                Continue to Premium Content
              </button>
              
              <button
                onClick={handleNextStep}
                className="px-6 py-4 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-colors border border-slate-600"
              >
                Skip for Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'content' && createdMetadata) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900 to-slate-900"></div>
        
        <div className="max-w-2xl w-full relative z-10">
          <div className="glass-card p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="accent-gradient rounded-2xl p-4 shadow-xl">
                    <Target className="w-10 h-10 text-white" />
                  </div>
                  <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-emerald-400 animate-pulse" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-primary mb-3">
                Add Premium Content
              </h1>
              <p className="text-secondary leading-relaxed mb-4">
                Set up exclusive content that unlocks when supporters tip 10+ ALGO
              </p>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-emerald-300 text-sm font-medium">
                  💎 Premium content creates incentive for larger tips and provides real value to your supporters
                </p>
              </div>
            </div>

            <PremiumContentManager 
              creatorAddress={walletConnection.address}
              onContentAdded={() => {}}
            />

            <div className="mt-8 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleFinishSetup}
                className="flex-1 py-4 btn-primary"
              >
                Complete Setup
              </button>
              
              <button
                onClick={handleFinishSetup}
                className="px-6 py-4 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-colors border border-slate-600"
              >
                Skip for Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900 to-slate-900"></div>
      
      <div className="max-w-2xl w-full relative z-10">
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="accent-gradient rounded-2xl p-4 shadow-xl">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div className="flex justify-center mb-4">
              <QuickKashLogo size="medium" showIcon={false} />
            </div>
            <h1 className="text-2xl font-bold text-primary mb-3">
              Set Up Your Profile
            </h1>
            <p className="text-secondary leading-relaxed">
              Create your profile and start receiving ALGO tips with premium content rewards
            </p>
            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl backdrop-blur-sm">
              <p className="text-sm text-emerald-300 font-medium">
                Connected: {walletConnection.address.slice(0, 8)}...{walletConnection.address.slice(-8)}
                {isPro && (
                  <span className="ml-2 inline-flex items-center">
                    <Crown className="w-4 h-4 mr-1" />
                    Pro
                  </span>
                )}
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Display Name *
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                className={`input-field ${
                  errors.displayName ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''
                }`}
                placeholder="Your name or brand"
                maxLength={50}
              />
              {errors.displayName && (
                <p className="mt-1 text-sm text-red-400">{errors.displayName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                <MessageCircle className="w-4 h-4 inline mr-2" />
                Bio * ({280 - formData.bio.length} characters left)
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className={`input-field resize-none ${
                  errors.bio ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''
                }`}
                placeholder="Tell your audience about yourself and what you do..."
                rows={4}
                maxLength={280}
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-red-400">{errors.bio}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                <Image className="w-4 h-4 inline mr-2" />
                Avatar URL (optional)
              </label>
              <input
                type="url"
                value={formData.avatarUrl}
                onChange={(e) => handleInputChange('avatarUrl', e.target.value)}
                className={`input-field ${
                  errors.avatarUrl ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''
                }`}
                placeholder="https://example.com/your-avatar.jpg"
              />
              {errors.avatarUrl && (
                <p className="mt-1 text-sm text-red-400">{errors.avatarUrl}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                <Target className="w-4 h-4 inline mr-2" />
                Goal (optional)
              </label>
              <input
                type="text"
                value={formData.goal}
                onChange={(e) => handleInputChange('goal', e.target.value)}
                className="input-field"
                placeholder="e.g., Help me raise 50 ALGO for new equipment"
                maxLength={100}
              />
            </div>

            {errors.submit && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm backdrop-blur-sm">
                {errors.submit}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? 'Creating Profile...' : 
                isPro ? 'Continue to Branding' : 'Continue to Premium Content'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};