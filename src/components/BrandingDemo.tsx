import React, { useState } from 'react';
import { ProBrandingCustomizer } from './ProBrandingCustomizer';
import { checkProStatus } from '../utils/checkProStatus';

interface BrandingDemoProps {
  walletAddress: string;
}

export const BrandingDemo: React.FC<BrandingDemoProps> = ({ walletAddress }) => {
  const [showBranding, setShowBranding] = useState(false);

  return (
    <div className="space-y-6">
      {/* Toggle Button */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowBranding(!showBranding)}
          className="px-6 py-3 btn-primary"
        >
          {showBranding ? 'Hide' : 'Show'} Branding Customizer
        </button>
      </div>

      {/* Branding Component */}
      {showBranding && (
        <ProBrandingCustomizer 
          walletAddress={walletAddress}
          onBrandingChange={(branding) => {
            console.log('Branding updated:', branding);
          }}
        />
      )}
    </div>
  );
};