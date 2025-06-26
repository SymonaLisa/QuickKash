import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Crown, 
  Search, 
  Check, 
  X, 
  Loader2, 
  AlertTriangle,
  Users,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  adminProManager, 
  ProStatusUpdateResult,
  setCreatorProStatus,
  getCreatorProStatus,
  getAllProCreators
} from '../utils/adminProManager';

interface AdminProPanelProps {
  isVisible?: boolean;
  onClose?: () => void;
}

interface CreatorProStatus {
  walletAddress: string;
  isPro: boolean;
  creatorExists: boolean;
  name?: string;
  email?: string;
}

interface Creator {
  id: string;
  name?: string;
  email?: string;
  created_at: string;
}

export const AdminProPanel: React.FC<AdminProPanelProps> = ({ 
  isVisible = true, 
  onClose 
}) => {
  const [searchWallet, setSearchWallet] = useState('');
  const [searchResult, setSearchResult] = useState<CreatorProStatus | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateResult, setUpdateResult] = useState<ProStatusUpdateResult | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [proCreators, setProCreators] = useState<Creator[]>([]);
  const [isLoadingProCreators, setIsLoadingProCreators] = useState(false);
  const [showProCreators, setShowProCreators] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (showProCreators) {
      loadProCreators();
    }
  }, [showProCreators]);

  const handleSearch = async () => {
    const wallet = searchWallet.trim().toLowerCase();
    if (!wallet) {
      setError('Please enter a wallet address');
      return;
    }

    setIsSearching(true);
    setError(null);
    setSearchResult(null);
    setUpdateResult(null);

    try {
      const result = await getCreatorProStatus(wallet);
      
      if (result.success) {
        setSearchResult({
          walletAddress: wallet,
          isPro: result.isPro || false,
          creatorExists: result.creatorExists || false,
          name: result.name,
          email: result.email,
        });
      } else {
        setError(result.error || 'Failed to search creator');
      }
    } catch {
      setError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleUpdateProStatus = async (newStatus: boolean) => {
    if (!searchResult) return;

    setIsUpdating(true);
    setError(null);
    setUpdateResult(null);

    try {
      const result = await setCreatorProStatus(
        searchResult.walletAddress,
        newStatus,
        adminNote.trim() || undefined
      );

      setUpdateResult(result);
      
      if (result.success) {
        setSearchResult(prev => prev ? { ...prev, isPro: newStatus } : null);
        setAdminNote('');
        if (showProCreators) loadProCreators();
      } else {
        setError(result.error || 'Failed to update Pro status');
      }
    } catch {
      setError('Update failed. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const loadProCreators = async () => {
    setIsLoadingProCreators(true);
    try {
      const result = await getAllProCreators(100);
      if (result.success) {
        setProCreators(result.creators || []);
      } else {
        setError(result.error || 'Failed to load Pro creators');
      }
    } catch {
      setError('Failed to load Pro creators');
    } finally {
      setIsLoadingProCreators(false);
    }
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="adminProPanelTitle"
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
                <h2 id="adminProPanelTitle" className="text-2xl font-bold text-primary">
                  Admin Pro Panel
                </h2>
                <p className="text-secondary text-sm">Manage Pro status for creators</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                aria-label="Close admin panel"
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            )}
          </div>

          {/* Warning Banner */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="font-semibold text-red-300">Admin Access Required</span>
            </div>
            <p className="text-red-200 text-sm">
              This panel allows direct modification of Pro status in the database. 
              Use with caution and ensure proper authorization.
            </p>
          </div>

          {/* Search Section */}
          <div className="bg-slate-800/50 rounded-xl p-6 mb-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Search Creator
            </h3>
            
            <div className="space-y-4">
              <div className="flex space-x-3">
                <input
                  type="text"
                  aria-label="Wallet address"
                  value={searchWallet}
                  onChange={(e) => setSearchWallet(e.target.value)}
                  placeholder="Enter wallet address..."
                  className="input-field flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  aria-label="Search creator"
                  className="px-6 py-3 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Search Result */}
              {searchResult && (
                <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium text-primary">
                        {formatWalletAddress(searchResult.walletAddress)}
                      </p>
                      <p className="text-sm text-secondary">
                        {searchResult.creatorExists ? 'Creator exists' : 'Creator not found in database'}
                      </p>
                      {searchResult.name && (
                        <p className="text-sm text-secondary">Name: {searchResult.name}</p>
                      )}
                      {searchResult.email && (
                        <p className="text-sm text-secondary">Email: {searchResult.email}</p>
                      )}
                    </div>
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                      searchResult.isPro 
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        : 'bg-slate-700/50 text-slate-400 border border-slate-600/50'
                    }`}>
                      <Crown className="w-4 h-4" />
                      <span>{searchResult.isPro ? 'Pro' : 'Free'}</span>
                    </div>
                  </div>

                  {/* Admin Note Input */}
                  <div className="mb-4">
                    <label htmlFor="adminNote" className="block text-sm font-medium text-secondary mb-2">
                      Admin Note (optional)
                    </label>
                    <input
                      id="adminNote"
                      type="text"
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Reason for Pro status change..."
                      className="input-field"
                      maxLength={200}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleUpdateProStatus(true)}
                      disabled={isUpdating || searchResult.isPro}
                      aria-label="Grant Pro status"
                      className="flex-1 flex items-center justify-center space-x-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="w-5 h-5" />
                      <span>Grant Pro</span>
                    </button>
                    
                    <button
                      onClick={() => handleUpdateProStatus(false)}
                      disabled={isUpdating || !searchResult.isPro}
                      aria-label="Revoke Pro status"
                      className="flex-1 flex items-center justify-center space-x-2 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-5 h-5" />
                      <span>Revoke Pro</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Update Result */}
              {updateResult && (
                <div className={`p-4 rounded-xl border backdrop-blur-sm ${
                  updateResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    : 'bg-red-500/10 border-red-500/20 text-red-300'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {updateResult.success ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <X className="w-5 h-5" />
                    )}
                    <span className="font-semibold">
                      {updateResult.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  <p className="text-sm">
                    {updateResult.success 
                      ? `Pro status updated: ${updateResult.previousStatus} → ${updateResult.newStatus}`
                      : updateResult.error
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pro Creators List */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Pro Creators
              </h3>
              <button
                onClick={() => setShowProCreators(!showProCreators)}
                aria-pressed={showProCreators}
                aria-label={showProCreators ? "Hide Pro creators" : "Show Pro creators"}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors"
              >
                {showProCreators ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="text-sm">{showProCreators ? 'Hide' : 'Show'}</span>
              </button>
            </div>

            {showProCreators && (
              <div>
                {isLoadingProCreators ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mr-3" />
                    <span className="text-secondary">Loading Pro creators...</span>
                  </div>
                ) : proCreators.length > 0 ? (
                  <div className="space-y-3">
                    {proCreators.map((creator) => (
                      <div
                        key={creator.id}
                        className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-primary">{creator.name ?? 'Unnamed Creator'}</p>
                            <p className="text-sm text-secondary">
                              {formatWalletAddress(creator.id)}
                            </p>
                            {creator.email && (
                              <p className="text-xs text-muted">{creator.email}</p>
                            )}
                            <p className="text-xs text-muted">
                              Created: {new Date(creator.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 text-emerald-300 rounded-full text-sm font-medium border border-emerald-500/20">
                            <Crown className="w-4 h-4" />
                            <span>Pro</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Crown className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-secondary">No Pro creators found</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm backdrop-blur-sm" role="alert">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
