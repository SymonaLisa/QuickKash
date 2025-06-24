import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreatorProfile } from './CreatorProfile';
import { CreatorProfileSetup } from './CreatorProfileSetup';
import { supabaseManager } from '../utils/supabase';
import { Loader2 } from 'lucide-react';

export const CreatorProfileManager: React.FC = () => {
  const { walletAddress } = useParams<{ walletAddress: string }>();
  const navigate = useNavigate();
  
  const [profileExists, setProfileExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (walletAddress) {
      checkProfileExists();
    } else {
      navigate('/');
    }
  }, [walletAddress, navigate]);

  const checkProfileExists = async () => {
    if (!walletAddress) return;
    
    setLoading(true);
    
    try {
      const creator = await supabaseManager.getCreatorByWallet(walletAddress);
      setProfileExists(!!creator);
    } catch (error) {
      console.error('Failed to check profile:', error);
      setProfileExists(false);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileCreated = (profileData: any) => {
    setProfileExists(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!walletAddress) {
    return null;
  }

  if (profileExists === false) {
    return (
      <CreatorProfileSetup 
        walletAddress={walletAddress}
        onProfileCreated={handleProfileCreated}
      />
    );
  }

  return <CreatorProfile />;
};