import React from 'react';
import { Zap, DollarSign } from 'lucide-react';

interface QuickKashLogoProps {
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

export const QuickKashLogo: React.FC<QuickKashLogoProps> = ({
  size = 'medium',
  showIcon = true
}) => {
  const sizeClasses = {
    small: 'text-xl',
    medium: 'text-3xl',
    large: 'text-4xl'
  };

  const iconSizes = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-10 h-10'
  };

  return (
    <div className="flex items-center space-x-2" aria-label="QuickKash Logo">
      {showIcon && (
        <div className="relative" aria-hidden="true">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-2 shadow-lg">
            <Zap className={`${iconSizes[size]} text-white`} />
          </div>
          <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full p-1">
            <DollarSign className="w-3 h-3 text-white" />
          </div>
        </div>
      )}
      <div className="relative">
        {/* Background for better contrast */}
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-lg px-2 py-1 border border-emerald-500/30"></div>
        
        {/* Main text with enhanced visibility */}
        <span
          className={`${sizeClasses[size]} font-bold text-white relative z-10 px-2 py-1 select-none`}
          style={{
            textShadow: '0 0 10px rgba(16, 185, 129, 0.8), 0 2px 4px rgba(0, 0, 0, 0.8)',
            filter: 'brightness(1.2) contrast(1.2)'
          }}
        >
          <span className="bg-gradient-to-r from-emerald-300 via-emerald-200 to-teal-300 bg-clip-text text-transparent">
            QuickKash
          </span>
        </span>
      </div>
    </div>
  );
};