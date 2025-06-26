import React, { useState, useEffect } from 'react';
import { Crown, Check, Loader2, Star, Zap, Shield, Settings } from 'lucide-react';
import { revenueCatManager, SubscriptionTier, SubscriptionStatus } from '../utils/revenueCat';

interface SubscriptionManagerProps {
  walletAddress: string;
  onSubscriptionChange?: (status: SubscriptionStatus) => void;
}

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({
  walletAddress,
  onSubscriptionChange,
}): JSX.Element => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    isActive: false,
    tier: 'free',
  });
  const [availableTiers, setAvailableTiers] = useState<SubscriptionTier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeSubscriptions();
  }, [walletAddress]);

  const initializeSubscriptions = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await revenueCatManager.configure(walletAddress);

      const [status, tiers] = await Promise.all([
        revenueCatManager.getSubscriptionStatus(),
        revenueCatManager.getOfferings(),
      ]);

      setSubscriptionStatus(status);
      setAvailableTiers(tiers);

      onSubscriptionChange?.(status);
    } catch (err) {
      setError('Failed to load subscription information');
      console.error('Subscription initialization failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageId: string): Promise<void> => {
    setPurchasing(packageId);
    setError(null);

    try {
      const result = await revenueCatManager.purchasePackage(packageId);

      if (result.success) {
        const newStatus = await revenueCatManager.getSubscriptionStatus();
        setSubscriptionStatus(newStatus);
        onSubscriptionChange?.(newStatus);
      } else {
        setError(result.error ?? 'Purchase failed');
      }
    } catch (err) {
      setError('Purchase failed. Please try again.');
      console.error(err);
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestore = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const result = await revenueCatManager.restorePurchases();

      if (result.success) {
        const newStatus = await revenueCatManager.getSubscriptionStatus();
        setSubscriptionStatus(newStatus);
        onSubscriptionChange?.(newStatus);
      } else {
        setError(result.error ?? 'Restore failed');
      }
    } catch (err) {
      setError('Restore failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'pro':
        return Zap;
      case 'creator_plus':
        return Crown;
      default:
        return Shield;
    }
  };

  const getCurrentTierFeatures = (): string[] => {
    return revenueCatManager.getFeaturesByTier(subscriptionStatus.tier) ?? [];
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mr-3" />
          <span className="text-secondary">Loading subscription information...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-primary flex items-center">
            <Settings className="w-5 h-5 mr-2 text-emerald-500" />
            Subscription
          </h3>
          {subscriptionStatus.isActive && (
            <div className="flex items-center space-x-1 px-3 py-1 bg-emerald-500/10 text-emerald-300 rounded-full text-sm font-medium border border-emerald-500/20">
              <Star className="w-4 h-4" />
              <span>{subscriptionStatus.tier.toUpperCase()}</span>
            </div>
          )}
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-primary">
              Current Plan:{' '}
              {subscriptionStatus.tier === 'free'
                ? 'Free'
                : subscriptionStatus.tier.replace('_', ' ').toUpperCase()}
            </span>
            <span
              className={`text-sm px-2 py-1 rounded-full ${
                subscriptionStatus.isActive
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                  : 'bg-slate-700/50 text-slate-400'
              }`}
            >
              {subscriptionStatus.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          {subscriptionStatus.expiresAt && (
            <p className="text-sm text-muted">
              Expires: {subscriptionStatus.expiresAt.toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Current Plan Features */}
        <div className="mb-4">
          <h4 className="font-medium text-secondary mb-2">Your Features:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {getCurrentTierFeatures().map((feature, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 text-sm text-secondary"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleRestore}
          disabled={loading}
          className="w-full py-2 btn-secondary text-sm"
          aria-label="Restore previous purchases"
        >
          Restore Purchases
        </button>
      </div>

      {/* Available Subscription Tiers */}
      {!subscriptionStatus.isActive && availableTiers.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-primary mb-6">Upgrade Your Plan</h3>

          <div className="grid gap-4">
            {availableTiers.map((tier) => {
              const Icon = getTierIcon(tier.id);
              const isPurchasing = purchasing === tier.packageId;

              return (
                <div
                  key={tier.id}
                  className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          tier.id === 'creator_plus'
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        }`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-primary">{tier.name}</h4>
                        <p className="text-sm text-secondary">{tier.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-400">{tier.price}</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {tier.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 text-sm text-secondary"
                        >
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handlePurchase(tier.packageId)}
                    disabled={isPurchasing}
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                      tier.id === 'creator_plus'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
                        : 'btn-primary'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    aria-label={`Subscribe to ${tier.name} plan`}
                  >
                    {isPurchasing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      `Subscribe to ${tier.name}`
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <div className="glass-card p-4 bg-red-500/10 border border-red-500/20 rounded-xl mt-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

