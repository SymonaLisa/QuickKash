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
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-2 shadow-lg">
            <Zap className={`${iconSizes[size]} text-white`} />
          </div>
          <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full p-1">
            <DollarSign className="w-3 h-3 text-white" />
          </div>
        </div>
      )}
      <span
        className={`${sizeClasses[size]} font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent select-none`}
      >
        QuickKash
      </span>
    </div>
  );
};
