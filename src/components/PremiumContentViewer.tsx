import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Video, FileText, Link, Download, ExternalLink, Star } from 'lucide-react';
import { supabaseManager, PremiumContent } from '../utils/supabase';

interface PremiumContentViewerProps {
  creatorAddress: string;
  tipperAddress?: string;
  hasAccess: boolean;
}

export const PremiumContentViewer: React.FC<PremiumContentViewerProps> = ({ 
  creatorAddress, 
  tipperAddress, 
  hasAccess 
}) => {
  const [content, setContent] = useState<PremiumContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPremiumContent();
  }, [creatorAddress]);

  const loadPremiumContent = async () => {
    setLoading(true);
    try {
      const premiumContent = await supabaseManager.getPremiumContent(creatorAddress);
      setContent(premiumContent);
    } catch (error) {
      console.error('Failed to load premium content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'pdf': return FileText;
      case 'link': return Link;
      case 'download': return Download;
      default: return FileText;
    }
  };

  const openContent = (contentItem: PremiumContent) => {
    if (hasAccess) {
      window.open(contentItem.content_url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-20 bg-slate-700 rounded"></div>
            <div className="h-20 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (content.length === 0) {
    return (
      <div className="glass-card p-6">
        <div className="text-center py-8">
          <Lock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-secondary">No premium content available yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-primary flex items-center">
          {hasAccess ? (
            <Unlock className="w-5 h-5 mr-2 text-emerald-500" />
          ) : (
            <Lock className="w-5 h-5 mr-2 text-slate-400" />
          )}
          Premium Content
        </h3>
        {hasAccess && (
          <div className="flex items-center space-x-1 px-3 py-1 bg-emerald-500/10 text-emerald-300 rounded-full text-sm font-medium border border-emerald-500/20">
            <Star className="w-4 h-4" />
            <span>Unlocked</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {content.map((item) => {
          const Icon = getContentIcon(item.content_type);
          const canAccess = hasAccess && tipperAddress;
          
          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border-2 transition-all duration-200 backdrop-blur-sm ${
                canAccess
                  ? 'border-emerald-500/20 bg-emerald-500/5 hover:shadow-md cursor-pointer hover:border-emerald-500/30'
                  : 'border-slate-700/50 bg-slate-800/30'
              }`}
              onClick={() => canAccess && openContent(item)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    canAccess ? 'bg-emerald-500' : 'bg-slate-600'
                  }`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={`font-semibold mb-1 ${
                      canAccess ? 'text-primary' : 'text-muted'
                    }`}>
                      {item.title}
                    </h4>
                    <p className={`text-sm mb-2 ${
                      canAccess ? 'text-secondary' : 'text-muted'
                    }`}>
                      {item.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs">
                      <span className={`px-2 py-1 rounded-full ${
                        canAccess ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-slate-700/50 text-muted'
                      }`}>
                        {item.content_type.toUpperCase()}
                      </span>
                      <span className={canAccess ? 'text-secondary' : 'text-muted'}>
                        Min: {item.minimum_tip} ALGO
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {canAccess ? (
                    <ExternalLink className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Lock className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>
              
              {!canAccess && (
                <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg backdrop-blur-sm">
                  <p className="text-sm text-yellow-300 font-medium">
                    🔒 Tip {item.minimum_tip} ALGO or more to unlock this content
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!hasAccess && (
        <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-2">
            <Star className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-emerald-300">Unlock Premium Content</span>
          </div>
          <p className="text-sm text-emerald-200">
            Tip 10 ALGO or more to get instant access to all premium content including exclusive videos, 
            documents, and downloadable rewards!
          </p>
        </div>
      )}
    </div>
  );
};