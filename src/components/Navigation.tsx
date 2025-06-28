import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  User, 
  Settings, 
  BarChart3, 
  Crown, 
  ExternalLink,
  Zap,
  Shield
} from 'lucide-react';
import { QuickKashLogo } from './QuickKashLogo';

interface NavigationProps {
  className?: string;
  showSuperUserIndicator?: boolean;
  walletAddress?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  className = '', 
  showSuperUserIndicator = false,
  walletAddress 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/',
      description: 'QuickKash homepage'
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Settings,
      path: '/dashboard',
      description: 'Creator dashboard'
    },
    {
      id: 'demo',
      label: 'Demo',
      icon: Zap,
      path: '/demo',
      description: 'TipButton demo'
    }
  ];

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={`bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 shadow-xl ${className}`}>
      <div className="flex items-center justify-between">
        {/* Logo with enhanced visibility */}
        <div 
          className="cursor-pointer hover:scale-105 transition-transform group"
          onClick={() => navigate('/')}
        >
          <div className="relative">
            {/* Background glow for better visibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-xl blur-sm group-hover:blur-md transition-all"></div>
            
            {/* Logo container with solid background */}
            <div className="relative bg-slate-800/90 backdrop-blur-sm rounded-xl px-4 py-2 border border-emerald-500/30 group-hover:border-emerald-400/50 transition-all">
              <QuickKashLogo size="small" />
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center space-x-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);
            
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                }`}
                title={item.description}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-2">
          {/* Super User Indicator */}
          {showSuperUserIndicator && walletAddress && (
            <div className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-full text-red-300 text-sm font-medium">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Super User</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};