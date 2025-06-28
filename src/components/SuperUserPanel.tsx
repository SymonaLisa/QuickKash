import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Crown, 
  Settings, 
  Users, 
  Database,
  Zap,
  AlertTriangle,
  CheckCircle,
  X,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Loader2
} from 'lucide-react';
import { devSuperUserManager, devUtils, getSuperUserStatus } from '../utils/devSuperUser';
import { AdminProPanel } from './AdminProPanel';

interface SuperUserPanelProps {
  isVisible?: boolean;
  onClose?: () => void;
  currentWalletAddress?: string;
}

export const SuperUserPanel: React.FC<SuperUserPanelProps> = ({ 
  isVisible = true, 
  onClose,
  currentWalletAddress 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'admin'>('overview');
  const [superUsers, setSuperUsers] = useState<string[]>([]);
  const [newSuperUser, setNewSuperUser] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      loadSuperUsers();
    }
  }, [isVisible]);

  const loadSuperUsers = () => {
    setSuperUsers(devUtils.getSuperUsers());
  };

  const handleAddSuperUser = () => {
    const address = newSuperUser.trim();
    if (!address) return;

    if (devUtils.addSuperUser(address)) {
      setNewSuperUser('');
      loadSuperUsers();
    }
  };

  const handleRemoveSuperUser = (address: string) => {
    if (confirm(`Remove ${address} from super user list?`)) {
      devUtils.removeSuperUser(address);
      loadSuperUsers();
    }
  };

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(address);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const currentUserStatus = currentWalletAddress ? getSuperUserStatus(currentWalletAddress) : null;

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="superUserPanelTitle"
    >
      <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="glass-card p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 id="superUserPanelTitle" className="text-2xl font-bold text-primary">
                  Super User Panel
                </h2>
                <p className="text-secondary text-sm">Enhanced admin access and controls</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                aria-label="Close super user panel"
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            )}
          </div>

          {/* Current User Status */}
          {currentUserStatus && (
            <div className={`mb-6 p-4 rounded-xl border backdrop-blur-sm ${
              currentUserStatus.isSuperUser
                ? 'bg-emerald-500/10 border-emerald-500/20'
                : 'bg-yellow-500/10 border-yellow-500/20'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold text-emerald-300">Current User Status</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">Super User:</span>
                  <span className={currentUserStatus.isSuperUser ? 'text-emerald-300' : 'text-red-300'}>
                    {currentUserStatus.isSuperUser ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">Pro Access:</span>
                  <span className={currentUserStatus.hasProAccess ? 'text-emerald-300' : 'text-red-300'}>
                    {currentUserStatus.hasProAccess ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">Admin Access:</span>
                  <span className={currentUserStatus.hasAdminAccess ? 'text-emerald-300' : 'text-red-300'}>
                    {currentUserStatus.hasAdminAccess ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex space-x-2 mb-6 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'users', label: 'Super Users', icon: Users },
              { id: 'admin', label: 'Admin Tools', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span className="font-medium text-primary">Super Users</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-400">{superUsers.length}</div>
                  <div className="text-sm text-muted">Active super users</div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-5 h-5 text-emerald-400" />
                    <span className="font-medium text-primary">Features</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">Enabled</div>
                  <div className="text-sm text-muted">Super user features active</div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <h3 className="font-medium text-primary mb-3">Super User Capabilities</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Automatic Pro access',
                    'Admin panel access',
                    'Pro feature testing',
                    'User management',
                    'Database operations',
                    'Debug information'
                  ].map((capability, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-secondary">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>{capability}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Add Super User */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <h3 className="font-medium text-primary mb-3">Add Super User</h3>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newSuperUser}
                    onChange={(e) => setNewSuperUser(e.target.value)}
                    placeholder="Enter wallet address..."
                    className="input-field flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSuperUser()}
                  />
                  <button
                    onClick={handleAddSuperUser}
                    disabled={!newSuperUser.trim()}
                    className="flex items-center space-x-2 px-4 py-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Super Users List */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <h3 className="font-medium text-primary mb-3">Current Super Users</h3>
                {superUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-secondary">No super users configured</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {superUsers.map((address) => (
                      <div
                        key={address}
                        className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600/50"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                            <Shield className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-primary">{formatAddress(address)}</p>
                            <p className="text-xs text-muted">Super User</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleCopyAddress(address)}
                            className={`p-2 rounded-lg transition-colors ${
                              copied === address
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-600/50 hover:bg-slate-500/50 text-slate-300'
                            }`}
                            title="Copy full address"
                          >
                            {copied === address ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleRemoveSuperUser(address)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                            title="Remove super user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <h3 className="font-medium text-primary mb-3">Admin Tools</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowAdminPanel(!showAdminPanel)}
                    className="w-full flex items-center justify-between p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Crown className="w-5 h-5 text-purple-400" />
                      <span className="font-medium text-primary">Pro Status Manager</span>
                    </div>
                    {showAdminPanel ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {showAdminPanel && (
                <AdminProPanel 
                  isVisible={true}
                  onClose={() => setShowAdminPanel(false)}
                />
              )}
            </div>
          )}

          {/* Warning */}
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="font-semibold text-red-300">Development Tool</span>
            </div>
            <p className="text-red-200 text-sm">
              This panel is for development and testing purposes. Super user access bypasses normal 
              authentication and should only be used in development environments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};