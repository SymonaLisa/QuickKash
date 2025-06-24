import React, { useState } from 'react';
import { User, Mail, Image, FileText, Save, Loader2, CheckCircle } from 'lucide-react';
import { supabaseManager } from '../utils/supabase';

interface CreatorProfileSetupProps {
  walletAddress: string;
  onProfileCreated: (profileData: any) => void;
}

interface ProfileFormData {
  name: string;
  email: string;
  bio: string;
  profileImageUrl: string;
}

export const CreatorProfileSetup: React.FC<CreatorProfileSetupProps> = ({
  walletAddress,
  onProfileCreated
}) => {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    bio: '',
    profileImageUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.bio.trim()) {
      newErrors.bio = 'Bio is required';
    } else if (formData.bio.length > 500) {
      newErrors.bio = 'Bio must be 500 characters or less';
    }
    
    if (formData.profileImageUrl && !isValidUrl(formData.profileImageUrl)) {
      newErrors.profileImageUrl = 'Please enter a valid URL';
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

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await supabaseManager.createOrUpdateCreator(walletAddress, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        paypal_username: walletAddress, // Use wallet address as PayPal username placeholder
        bio: formData.bio.trim(),
        profile_image_url: formData.profileImageUrl.trim() || undefined
      });

      if (result.success) {
        onProfileCreated({
          id: walletAddress,
          name: formData.name.trim(),
          email: formData.email.trim(),
          bio: formData.bio.trim(),
          profile_image_url: formData.profileImageUrl.trim() || null,
          created_at: new Date().toISOString()
        });
      } else {
        setErrors({ submit: result.error || 'Failed to create profile' });
      }
    } catch (error) {
      console.error('Profile creation failed:', error);
      setErrors({ submit: 'Failed to create profile. Please try again.' });
    } finally {
      setIsSubmitting(false);
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
                <User className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-primary mb-3">
              Create Your Public Profile
            </h1>
            <p className="text-secondary leading-relaxed">
              Set up your creator profile to start receiving tips and building your audience
            </p>
            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl backdrop-blur-sm">
              <p className="text-sm text-emerald-300 font-medium">
                Wallet: {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Display Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`input-field ${
                  errors.name ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''
                }`}
                placeholder="Your name or brand"
                maxLength={100}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`input-field ${
                  errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''
                }`}
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Bio * ({500 - formData.bio.length} characters left)
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className={`input-field resize-none ${
                  errors.bio ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''
                }`}
                placeholder="Tell your audience about yourself and what you do..."
                rows={4}
                maxLength={500}
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-red-400">{errors.bio}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                <Image className="w-4 h-4 inline mr-2" />
                Profile Image URL (optional)
              </label>
              <input
                type="url"
                value={formData.profileImageUrl}
                onChange={(e) => handleInputChange('profileImageUrl', e.target.value)}
                className={`input-field ${
                  errors.profileImageUrl ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''
                }`}
                placeholder="https://example.com/your-photo.jpg"
              />
              {errors.profileImageUrl && (
                <p className="mt-1 text-sm text-red-400">{errors.profileImageUrl}</p>
              )}
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
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating Profile...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Save className="w-5 h-5" />
                  <span>Create Public Profile</span>
                </div>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-xs text-muted text-center leading-relaxed">
              Your profile will be publicly accessible at /creator/{walletAddress.slice(0, 8)}...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};