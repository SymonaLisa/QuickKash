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
    <nav className={`glass-card p-4 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div 
          className="cursor-pointer hover:scale-105 transition-transform"
          onClick={() => navigate('/')}
        >
          <QuickKashLogo size="small" />
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

          {/* External Links */}
          <a
            href="https://github.com/your-username/quickkash-tip-jar"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 px-3 py-2 text-slate-400 hover:text-slate-300 rounded-lg transition-colors"
            title="View source code"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">GitHub</span>
          </a>
        </div>
      </div>
    </nav>
  );
};