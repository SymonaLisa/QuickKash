import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertTriangle } from 'lucide-react';
import { shortlinkManager } from '../utils/shortlinks';

export const ShortlinkRedirect: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      resolveShortlink(slug);
    } else {
      navigate('/', { replace: true });
    }
  }, [slug, navigate]);

  const resolveShortlink = async (shortlinkSlug: string) => {
    try {
      const result = await shortlinkManager.resolveShortlink(shortlinkSlug);

      if (result.success && result.walletAddress) {
        // Redirect to the creator profile
        navigate(`/creator/${result.walletAddress}`, { replace: true });
      } else {
        setError(result.error || 'Shortlink not found');
      }
    } catch (err) {
      setError('Failed to resolve shortlink');
      console.error(err);
    }
  };

  if (error) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4"
        role="alert"
        aria-live="assertive"
      >
        <div className="max-w-md w-full glass-card p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-primary mb-2">Shortlink Not Found</h1>
          <p className="text-secondary mb-4">{error}</p>
          <p className="text-sm text-muted mb-6">
            The shortlink <strong>@{slug}</strong> doesn't exist or has been deactivated.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary px-6 py-2"
            aria-label="Go back to homepage"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
        <p className="text-secondary">Redirecting to @{slug}...</p>
      </div>
    </div>
  );
};
