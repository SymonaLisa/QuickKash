import React, { useState, useEffect } from 'react';
import { User, Settings, Crown, TrendingUp } from 'lucide-react';
import { SubscriptionManager } from './SubscriptionManager';
import { TipHistory } from './TipHistory';
import { PremiumContentManager } from './PremiumContentManager';
import { SubscriptionStatus } from '../utils/revenueCat';

interface CreatorDashboardProps {
  walletAddress: string;
  creatorName: string;
}

export const CreatorDashboard: React.FC<CreatorDashboardProps> = ({ 
  walletAddress, 
  creatorName 
}) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({ 
    isActive: false, 
    tier: 'free' 
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'subscription' | 'content'>('overview');

  const handleSubscriptionChange = (status: SubscriptionStatus) => {
    setSubscriptionStatus(status);
  };

  const getSubscriptionBadge = () => {
    if (!subscriptionStatus.isActive) return null;
    
    return (
      <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
        subscriptionStatus.tier === 'creator_plus' 
          ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-300 border border-purple-500/20'
          : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
      }`}>
        <Crown className="w-4 h-4" />
        <span>{subscriptionStatus.tier.replace('_', ' ').toUpperCase()}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900 to-slate-900"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 accent-gradient rounded-xl flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">{creatorName}</h1>
                <p className="text-secondary">
                  {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                </p>
              </div>
            </div>
            {getSubscriptionBadge()}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="glass-card p-2 mb-6">
          <div className="flex space-x-2">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'subscription', label: 'Subscription', icon: Crown },
              { id: 'content', label: 'Premium Content', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
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
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid gap-6">
              <TipHistory walletAddress={walletAddress} />
              
              {/* Subscription Status Card */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-primary mb-4">Subscription Status</h3>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-primary">
                        Current Plan: {subscriptionStatus.tier === 'free' ? 'Free' : subscriptionStatus.tier.replace('_', ' ').toUpperCase()}
                      </p>
                      {subscriptionStatus.expiresAt && (
                        <p className="text-sm text-muted">
                          Expires: {subscriptionStatus.expiresAt.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      subscriptionStatus.isActive 
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                        : 'bg-slate-700/50 text-slate-400'
                    }`}>
                      {subscriptionStatus.isActive ? 'Active' : 'Free Plan'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'subscription' && (
            <SubscriptionManager 
              walletAddress={walletAddress}
              onSubscriptionChange={handleSubscriptionChange}
            />
          )}

          {activeTab === 'content' && (
            <div className="space-y-6">
              <PremiumContentManager 
                creatorAddress={walletAddress}
                onContentAdded={() => {}}
              />
              
              {/* Subscription-gated features */}
              {subscriptionStatus.tier === 'free' && (
                <div className="glass-card p-6 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border border-emerald-500/20">
                  <div className="text-center">
                    <Crown className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-primary mb-2">Unlock Premium Features</h3>
                    <p className="text-secondary mb-4">
                      Upgrade to Pro or Creator Plus to access advanced content management, 
                      custom branding, and detailed analytics.
                    </p>
                    <button
                      onClick={() => setActiveTab('subscription')}
                      className="btn-primary px-6 py-2"
                    >
                      View Subscription Plans
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};