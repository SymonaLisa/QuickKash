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
  Loader2,
  Palette,
  Star,
  Gift
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
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'demo' | 'admin'>('overview');
  const [superUsers, setSuperUsers] = useState<string[]>([]);
  const [newSuperUser, setNewSuperUser] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoWallet, setDemoWallet] = useState('');

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

  const handleAddDemoWallet = () => {
    const address = demoWallet.trim();
    if (!address) return;

    if (devUtils.addSuperUser(address)) {
      setDemoWallet('');
      loadSuperUsers();
      alert(`Demo wallet ${address.slice(0, 8)}... added! This wallet now has full Pro access for demo purposes.`);
    }
  };

  const generateDemoWallet = () => {
    const demoAddress = `DEMO${Date.now().toString().slice(-10)}${'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.slice(0, 44)}`;
    setDemoWallet(demoAddress);
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
                <p className="text-secondary text-sm">Enhanced admin access and demo controls</p>
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
              { id: 'demo', label: 'Demo Setup', icon: Star },
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="font-medium text-primary">Demo Mode</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-400">Ready</div>
                  <div className="text-sm text-muted">Pro features unlocked</div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <h3 className="font-medium text-primary mb-3">Super User Capabilities</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Automatic Pro access',
                    'Custom branding features',
                    'Premium content management',
                    'Advanced analytics',
                    'Admin panel access',
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

          {activeTab === 'demo' && (
            <div className="space-y-6">
              {/* Demo Setup Instructions */}
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center space-x-2 mb-4">
                  <Star className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-xl font-bold text-primary">Demo Video Setup</h3>
                </div>
                <p className="text-secondary mb-4">
                  Set up mock Pro access for demo purposes. Any wallet address added here will have full Pro features enabled.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Palette className="w-4 h-4 text-emerald-400" />
                    <span>Custom branding & themes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Gift className="w-4 h-4 text-purple-400" />
                    <span>Premium content features</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Crown className="w-4 h-4 text-yellow-400" />
                    <span>Pro badge & indicators</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Settings className="w-4 h-4 text-blue-400" />
                    <span>Advanced dashboard features</span>
                  </div>
                </div>
              </div>

              {/* Quick Demo Wallet Setup */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <h3 className="font-medium text-primary mb-3">Quick Demo Wallet Setup</h3>
                <div className="space-y-3">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={demoWallet}
                      onChange={(e) => setDemoWallet(e.target.value)}
                      placeholder="Enter wallet address for demo..."
                      className="input-field flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddDemoWallet()}
                    />
                    <button
                      onClick={generateDemoWallet}
                      className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-colors"
                    >
                      Generate
                    </button>
                    <button
                      onClick={handleAddDemoWallet}
                      disabled={!demoWallet.trim()}
                      className="flex items-center space-x-2 px-4 py-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Demo</span>
                    </button>
                  </div>
                  <p className="text-xs text-muted">
                    Add any wallet address to grant it temporary Pro access for demo purposes. 
                    This bypasses all Pro checks and enables all premium features.
                  </p>
                </div>
              </div>

              {/* Demo Instructions */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <h3 className="font-medium text-primary mb-3">Demo Video Instructions</h3>
                <div className="space-y-3 text-sm text-secondary">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">1</div>
                    <div>
                      <p className="font-medium text-primary">Add your demo wallet above</p>
                      <p>This will give your wallet full Pro access for the demo</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">2</div>
                    <div>
                      <p className="font-medium text-primary">Navigate to the dashboard</p>
                      <p>You'll see all Pro features unlocked including branding customization</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">3</div>
                    <div>
                      <p className="font-medium text-primary">Showcase Pro features</p>
                      <p>Custom branding, premium content, advanced analytics, and more</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">4</div>
                    <div>
                      <p className="font-medium text-primary">Remove demo access when done</p>
                      <p>Clean up by removing the wallet from the super user list</p>
                    </div>
                  </div>
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
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted">Super User</span>
                              <Crown className="w-3 h-3 text-yellow-400" />
                              <span className="text-xs text-yellow-300">Pro Access</span>
                            </div>
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