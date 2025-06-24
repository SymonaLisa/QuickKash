import Purchases, { 
  CustomerInfo, 
  PurchasesOffering, 
  PurchasesPackage,
  PurchasesEntitlementInfo 
} from '@revenuecat/purchases-js';
import { supabaseManager } from './supabase';

export interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  features: string[];
  price: string;
  packageId: string;
}

export interface SubscriptionStatus {
  isActive: boolean;
  tier: 'free' | 'pro' | 'creator_plus';
  expiresAt?: Date;
  customerId?: string;
}

class RevenueCatManager {
  private isConfigured = false;
  private currentCustomerId: string | null = null;

  /**
   * Initialize RevenueCat with the connected wallet address as user ID
   */
  async configure(walletAddress: string): Promise<void> {
    try {
      if (this.isConfigured && this.currentCustomerId === walletAddress) {
        return; // Already configured for this user
      }

      await Purchases.configure({
        apiKey: import.meta.env.VITE_REVENUECAT_PUBLIC_API_KEY || '',
        appUserID: walletAddress
      });

      this.isConfigured = true;
      this.currentCustomerId = walletAddress;
      
      console.log('RevenueCat configured for user:', walletAddress);
    } catch (error) {
      console.error('Failed to configure RevenueCat:', error);
      throw new Error('Subscription service unavailable');
    }
  }

  /**
   * Get available subscription offerings
   */
  async getOfferings(): Promise<SubscriptionTier[]> {
    try {
      if (!this.isConfigured) {
        throw new Error('RevenueCat not configured');
      }

      const offerings = await Purchases.getOfferings();
      const currentOffering = offerings.current;

      if (!currentOffering) {
        return this.getDefaultTiers();
      }

      return this.mapOfferingToTiers(currentOffering);
    } catch (error) {
      console.error('Failed to get offerings:', error);
      return this.getDefaultTiers();
    }
  }

  /**
   * Get current subscription status
   */
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      if (!this.isConfigured) {
        return { isActive: false, tier: 'free' };
      }

      const customerInfo = await Purchases.getCustomerInfo();
      return this.parseCustomerInfo(customerInfo);
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      return { isActive: false, tier: 'free' };
    }
  }

  /**
   * Purchase a subscription package
   */
  async purchasePackage(packageId: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.isConfigured) {
        throw new Error('RevenueCat not configured');
      }

      const offerings = await Purchases.getOfferings();
      const currentOffering = offerings.current;

      if (!currentOffering) {
        throw new Error('No subscription packages available');
      }

      const packageToPurchase = currentOffering.availablePackages.find(
        pkg => pkg.identifier === packageId
      );

      if (!packageToPurchase) {
        throw new Error('Subscription package not found');
      }

      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      
      // Update subscription status in Supabase
      await this.syncSubscriptionToSupabase(customerInfo);

      return { success: true };
    } catch (error) {
      console.error('Purchase failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Purchase failed' 
      };
    }
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.isConfigured) {
        throw new Error('RevenueCat not configured');
      }

      const customerInfo = await Purchases.restorePurchases();
      
      // Update subscription status in Supabase
      await this.syncSubscriptionToSupabase(customerInfo);

      return { success: true };
    } catch (error) {
      console.error('Restore failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Restore failed' 
      };
    }
  }

  /**
   * Check if user has specific entitlement
   */
  async hasEntitlement(entitlementId: string): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        return false;
      }

      const customerInfo = await Purchases.getCustomerInfo();
      const entitlement = customerInfo.entitlements.active[entitlementId];
      
      return entitlement?.isActive === true;
    } catch (error) {
      console.error('Failed to check entitlement:', error);
      return false;
    }
  }

  /**
   * Sync subscription status to Supabase
   */
  private async syncSubscriptionToSupabase(customerInfo: CustomerInfo): Promise<void> {
    try {
      if (!this.currentCustomerId) return;

      const status = this.parseCustomerInfo(customerInfo);
      
      await supabaseManager.updateCreatorSubscription(this.currentCustomerId, {
        tier: status.tier,
        status: status.isActive ? 'active' : 'expired',
        expiresAt: status.expiresAt,
        revenueCatCustomerId: customerInfo.originalAppUserId
      });
    } catch (error) {
      console.error('Failed to sync subscription to Supabase:', error);
    }
  }

  /**
   * Parse RevenueCat customer info to our subscription status format
   */
  private parseCustomerInfo(customerInfo: CustomerInfo): SubscriptionStatus {
    const activeEntitlements = customerInfo.entitlements.active;
    
    // Check for Creator Plus subscription
    if (activeEntitlements['creator_plus']?.isActive) {
      return {
        isActive: true,
        tier: 'creator_plus',
        expiresAt: new Date(activeEntitlements['creator_plus'].expirationDate || ''),
        customerId: customerInfo.originalAppUserId
      };
    }
    
    // Check for Pro subscription
    if (activeEntitlements['pro']?.isActive) {
      return {
        isActive: true,
        tier: 'pro',
        expiresAt: new Date(activeEntitlements['pro'].expirationDate || ''),
        customerId: customerInfo.originalAppUserId
      };
    }

    return {
      isActive: false,
      tier: 'free',
      customerId: customerInfo.originalAppUserId
    };
  }

  /**
   * Map RevenueCat offering to our subscription tiers
   */
  private mapOfferingToTiers(offering: PurchasesOffering): SubscriptionTier[] {
    const tiers: SubscriptionTier[] = [];

    offering.availablePackages.forEach(pkg => {
      if (pkg.identifier === 'pro_monthly') {
        tiers.push({
          id: 'pro',
          name: 'Pro',
          description: 'Enhanced features for growing creators',
          features: [
            'Custom branding',
            'Advanced analytics',
            'Priority support',
            'Multiple tip jars'
          ],
          price: pkg.product.priceString,
          packageId: pkg.identifier
        });
      } else if (pkg.identifier === 'creator_plus_monthly') {
        tiers.push({
          id: 'creator_plus',
          name: 'Creator Plus',
          description: 'Premium features for professional creators',
          features: [
            'Everything in Pro',
            'White-label solution',
            'API access',
            'Custom integrations',
            'Dedicated support'
          ],
          price: pkg.product.priceString,
          packageId: pkg.identifier
        });
      }
    });

    return tiers;
  }

  /**
   * Default subscription tiers when RevenueCat is unavailable
   */
  private getDefaultTiers(): SubscriptionTier[] {
    return [
      {
        id: 'pro',
        name: 'Pro',
        description: 'Enhanced features for growing creators',
        features: [
          'Custom branding',
          'Advanced analytics',
          'Priority support',
          'Multiple tip jars'
        ],
        price: '$9.99/month',
        packageId: 'pro_monthly'
      },
      {
        id: 'creator_plus',
        name: 'Creator Plus',
        description: 'Premium features for professional creators',
        features: [
          'Everything in Pro',
          'White-label solution',
          'API access',
          'Custom integrations',
          'Dedicated support'
        ],
        price: '$29.99/month',
        packageId: 'creator_plus_monthly'
      }
    ];
  }

  /**
   * Get subscription features for a specific tier
   */
  getFeaturesByTier(tier: 'free' | 'pro' | 'creator_plus'): string[] {
    const features = {
      free: [
        'Basic tip jar',
        'Algorand payments',
        'Simple analytics'
      ],
      pro: [
        'Everything in Free',
        'Custom branding',
        'Advanced analytics',
        'Priority support',
        'Multiple tip jars'
      ],
      creator_plus: [
        'Everything in Pro',
        'White-label solution',
        'API access',
        'Custom integrations',
        'Dedicated support'
      ]
    };

    return features[tier] || features.free;
  }
}

export const revenueCatManager = new RevenueCatManager();