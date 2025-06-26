import React, { useState, useEffect } from 'react';
import { 
  Link, 
  Plus, 
  Copy, 
  Eye, 
  EyeOff, 
  Trash2, 
  ExternalLink,
  Save,
  Loader2,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Hash
} from 'lucide-react';
import { shortlinkManager, Shortlink } from '../utils/shortlinks';

interface ShortlinkManagerProps {
  walletAddress: string;
  creatorName: string;
}

export const ShortlinkManager: React.FC<ShortlinkManagerProps> = ({
  walletAddress,
  creatorName
}) => {
  const [shortlinks, setShortlinks] = useState<Shortlink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSlug, setNewSlug] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<{
    totalClicks: number;
    totalShortlinks: number;
    topShortlinks: Array<{ slug: string; click_count: number }>;
  } | null>(null);

  useEffect(() => {
    loadShortlinks();
    loadAnalytics();
  }, [walletAddress]);

  const loadShortlinks = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await shortlinkManager.getCreatorShortlinks(walletAddress);
      if (result.success) {
        setShortlinks(result.data || []);
      } else {
        setError(result.error || 'Failed to load shortlinks');
      }
    } catch (err) {
      setError('Failed to load shortlinks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const result = await shortlinkManager.getShortlinkAnalytics(walletAddress);
      if (result.success) {
        setAnalytics(result.data || null);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  };

  const handleCreateShortlink = async () => {
    if (!newSlug.trim()) {
      setError('Please enter a shortlink slug');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const result = await shortlinkManager.createShortlink(walletAddress, newSlug.trim());
      if (result.success) {
        setSuccess('Shortlink created successfully!');
        setNewSlug('');
        setShowCreateForm(false);
        await loadShortlinks();
        await loadAnalytics();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Failed to create shortlink');
      }
    } catch (err) {
      setError('Failed to create shortlink');
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (slug: string, isActive: boolean) => {
    setError(null);
    try {
      const result = await shortlinkManager.updateShortlink(slug, { is_active: !isActive });
      if (result.success) {
        await loadShortlinks();
        setSuccess(`Shortlink ${!isActive ? 'activated' : 'deactivated'}`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Failed to update shortlink');
      }
    } catch (err) {
      setError('Failed to update shortlink');
      console.error(err);
    }
  };

  const handleDeleteShortlink = async (slug: string) => {
    setError(null);
    if (!confirm(`Are you sure you want to delete the shortlink "@${slug}"?`)) {
      return;
    }

    try {
      const result = await shortlinkManager.deleteShortlink(slug);
      if (result.success) {
        await loadShortlinks();
        await loadAnalytics();
        setSuccess('Shortlink deleted successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Failed to delete shortlink');
      }
    } catch (err) {
      setError('Failed to delete shortlink');
      console.error(err);
    }
  };

  const handleCopyUrl = async (slug: string) => {
    try {
      const url = shortlinkManager.getShortlinkUrl(slug);
      await navigator.clipboard.writeText(url);
      setCopied(slug);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const getSuggestedSlugs = () => {
    return shortlinkManager.generateSuggestedSlugs(creatorName);
  };

  if (loading) {
    return (
      <div className="glass-card p-6" role="status" aria-live="polite">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mr-3" />
          <span className="text-secondary">Loading shortlinks...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics */}
      {analytics && (
        <div className="glass-card p-6" aria-label="Shortlink Analytics">
          <h3 className="text-lg font-bold text-primary mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-emerald-500" />
            Shortlink Analytics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="text-2xl font-bold text-emerald-400">{analytics.totalClicks}</div>
              <div className="text-sm text-muted">Total Clicks</div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="text-2xl font-bold text-blue-400">{analytics.totalShortlinks}</div>
              <div className="text-sm text-muted">Active Shortlinks</div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="text-2xl font-bold text-purple-400">
                {analytics.topShortlinks[0]?.click_count || 0}
              </div>
              <div className="text-sm text-muted">Top Shortlink Clicks</div>
            </div>
          </div>
        </div>
      )}

      {/* Shortlinks Management */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-primary flex items-center">
            <Link className="w-5 h-5 mr-2 text-emerald-500" />
            Custom Shortlinks
          </h3>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center space-x-2 px-4 py-2 btn-primary"
            aria-expanded={showCreateForm}
            aria-controls="create-shortlink-form"
          >
            <Plus className="w-4 h-4" />
            <span>Create Shortlink</span>
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div
            id="create-shortlink-form"
            className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
          >
            <h4 className="font-medium text-primary mb-3">Create New Shortlink</h4>

            <div className="space-y-4">
              <div>
                <label htmlFor="newSlug" className="block text-sm font-medium text-secondary mb-2">
                  Custom Slug
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 text-sm">quickkash.app/@</span>
                  <input
                    id="newSlug"
                    type="text"
                    value={newSlug}
                    onChange={(e) =>
                      setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))
                    }
                    className="input-field flex-1"
                    placeholder="yourname"
                    maxLength={20}
                    pattern="[a-zA-Z0-9_-]{3,20}"
                    aria-describedby="slugHelp"
                  />
                </div>
                <p id="slugHelp" className="text-xs text-muted mt-1">
                  3-20 characters, letters, numbers, hyphens, and underscores only
                </p>
              </div>

              {/* Suggested Slugs */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Suggestions</label>
                <div className="flex flex-wrap gap-2">
                  {getSuggestedSlugs().slice(0, 4).map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setNewSlug(suggestion)}
                      className="px-3 py-1 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg text-sm transition-colors"
                      type="button"
                    >
                      @{suggestion}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleCreateShortlink}
                  disabled={creating || !newSlug.trim()}
                  className="flex items-center space-x-2 px-4 py-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{creating ? 'Creating...' : 'Create'}</span>
                </button>

                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewSlug('');
                    setError(null);
                  }}
                  className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div
            className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm backdrop-blur-sm"
            role="alert"
          >
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div
            className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-sm backdrop-blur-sm"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>{success}</span>
            </div>
          </div>
        )}

        {/* Shortlinks List */}
        {shortlinks.length === 0 ? (
          <div className="text-center py-8">
            <Hash className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-secondary mb-2">No shortlinks created yet</p>
            <p className="text-sm text-muted">
              Create custom shortlinks to make your profile easier to share
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {shortlinks.map((shortlink) => (
              <div
                key={shortlink.slug}
                className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-primary">@{shortlink.slug}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          shortlink.is_active
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                            : 'bg-slate-700/50 text-slate-400'
                        }`}
                      >
                        {shortlink.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-muted">
                      <span>{shortlink.click_count} clicks</span>
                      <span>Created {new Date(shortlink.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="mt-2">
                      <code className="text-xs bg-slate-700/50 px-2 py-1 rounded text-slate-300">
                        {shortlinkManager.getShortlinkUrl(shortlink.slug)}
                      </code>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleCopyUrl(shortlink.slug)}
                      className={`p-2 rounded-lg transition-colors ${
                        copied === shortlink.slug
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300'
                      }`}
                      title="Copy URL"
                      aria-label={`Copy URL for @${shortlink.slug}`}
                    >
                      {copied === shortlink.slug ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => handleToggleActive(shortlink.slug, shortlink.is_active)}
                      className="p-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg transition-colors"
                      title={shortlink.is_active ? 'Deactivate' : 'Activate'}
                      aria-pressed={shortlink.is_active}
                    >
                      {shortlink.is_active ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>

                    <a
                      href={shortlinkManager.getShortlinkUrl(shortlink.slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg transition-colors"
                      title="Open shortlink"
                      aria-label={`Open shortlink @${shortlink.slug}`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => handleDeleteShortlink(shortlink.slug)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                      title="Delete shortlink"
                      aria-label={`Delete shortlink @${shortlink.slug}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-700">
          <p className="text-xs text-muted">
            Shortlinks redirect to your creator profile and help track engagement. 
            Use them in social media, business cards, or anywhere you want to share your tip jar.
          </p>
        </div>
      </div>
    </div>
  );
};
