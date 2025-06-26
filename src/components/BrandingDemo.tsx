import React, { useState, useEffect } from 'react';
import { ProBrandingCustomizer } from './ProBrandingCustomizer';
import { checkProStatus } from '../utils/checkProStatus';

interface BrandingDemoProps {
  walletAddress: string;
}

export const BrandingDemo: React.FC<BrandingDemoProps> = ({ walletAddress }) => {
  const [showBranding, setShowBranding] = useState(false);
  const [isPro, setIsPro] = useState<boolean | null>(null); // null means loading
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    checkProStatus(walletAddress)
      .then(status => {
        if (isMounted) setIsPro(status);
      })
      .catch(() => {
        if (isMounted) setError('Failed to check Pro status');
      });
    return () => { isMounted = false; };
  }, [walletAddress]);

  const toggleBranding = () => {
    if (isPro) {
      setShowBranding(!showBranding);
    } else {
      alert('Branding customization is available for Pro users only.');
    }
  };

  if (error) return <div className="text-red-500">{error}</div>;
  if (isPro === null) return <div>Checking Pro status...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <button
          onClick={toggleBranding}
          className="px-6 py-3 btn-primary"
        >
          {showBranding ? 'Hide' : 'Show'} Branding Customizer
        </button>
      </div>

      {showBranding && <ProBrandingCustomizer 
        walletAddress={walletAddress}
        onBrandingChange={(branding) => {
          console.log('Branding updated:', branding);
        }}
      />}
    </div>
  );
};
