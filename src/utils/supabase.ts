import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are properly configured
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

// Check if the URL is still a placeholder
if (supabaseUrl === 'your_supabase_url_here' || supabaseAnonKey === 'your_supabase_anon_key_here') {
  throw new Error('Supabase environment variables are not configured. Please replace the placeholder values in your .env file with your actual Supabase project URL and anon key.');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error(`Invalid Supabase URL format: ${supabaseUrl}. Please ensure VITE_SUPABASE_URL is a valid URL (e.g., https://your-project-ref.supabase.co)`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface TipRecord {
  id: string;
  tipper_address: string;
  creator_address: string;
  amount: number;
  transaction_id: string;
  timestamp: string;
  note?: string;
  premium_unlocked: boolean;
}

export interface PremiumContent {
  id: string;
  creator_address: string;
  title: string;
  description: string;
  content_type: 'video' | 'pdf' | 'link' | 'download';
  content_url: string;
  download_filename?: string;
  minimum_tip: number;
  created_at: string;
}

export interface CreatorSubscription {
  tier: 'free' | 'pro' | 'creator_plus';
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  expiresAt?: Date;
  revenueCatCustomerId?: string;
}

export interface CreatorProfile {
  id: string;
  name: string;
  email: string;
  paypal_username: string;
  profile_image_url?: string;
  bio?: string;
  is_pro: boolean;
  subscription_tier: string;
  subscription_status: string;
  subscription_expires_at?: string;
  revenuecat_customer_id?: string;
  created_at: string;
}

// Simple function that matches your provided signature
export async function logTip(wallet: string, amount: number) {
  const { data, error } = await supabase.from('tips').insert([
    { 
      creator_address: wallet,
      tipper_address: 'anonymous', // Default for simple logging
      amount: amount,
      transaction_id: `tip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID
      premium_unlocked: amount >= 10,
      timestamp: new Date().toISOString()
    }
  ]);

  if (error) {
    console.error('Error logging tip:', error);
  } else {
    console.log('Tip logged:', data);
  }
}

class SupabaseManager {
  async recordTip(
    tipperAddress: string,
    creatorAddress: string,
    amount: number,
    transactionId: string,
    note?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const premiumUnlocked = amount >= 10;
      
      const { error } = await supabase
        .from('tips')
        .insert({
          tipper_address: tipperAddress,
          creator_address: creatorAddress,
          amount,
          transaction_id: transactionId,
          note,
          premium_unlocked: premiumUnlocked,
          timestamp: new Date().toISOString()
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Failed to record tip:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to record tip' 
      };
    }
  }

  async checkPremiumAccess(
    tipperAddress: string,
    creatorAddress: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('tips')
        .select('premium_unlocked')
        .eq('tipper_address', tipperAddress)
        .eq('creator_address', creatorAddress)
        .eq('premium_unlocked', true)
        .limit(1);

      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      console.error('Failed to check premium access:', error);
      return false;
    }
  }

  async getTipHistory(creatorAddress: string, limit: number = 10): Promise<TipRecord[]> {
    try {
      const { data, error } = await supabase
        .from('tips')
        .select('*')
        .eq('creator_address', creatorAddress)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get tip history:', error);
      return [];
    }
  }

  async getTotalTips(creatorAddress: string): Promise<{ total: number; count: number; premiumCount: number }> {
    try {
      const { data, error } = await supabase
        .from('tips')
        .select('amount, premium_unlocked')
        .eq('creator_address', creatorAddress);

      if (error) throw error;
      
      const total = data?.reduce((sum, tip) => sum + tip.amount, 0) || 0;
      const count = data?.length || 0;
      const premiumCount = data?.filter(tip => tip.premium_unlocked).length || 0;

      return { total, count, premiumCount };
    } catch (error) {
      console.error('Failed to get total tips:', error);
      return { total: 0, count: 0, premiumCount: 0 };
    }
  }

  async getPremiumContent(creatorAddress: string): Promise<PremiumContent[]> {
    try {
      const { data, error } = await supabase
        .from('premium_content')
        .select('*')
        .eq('creator_address', creatorAddress)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get premium content:', error);
      return [];
    }
  }

  async addPremiumContent(content: Omit<PremiumContent, 'id' | 'created_at'>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('premium_content')
        .insert({
          ...content,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Failed to add premium content:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add content' 
      };
    }
  }

  async createOrUpdateCreator(
    walletAddress: string,
    creatorData: {
      name: string;
      email: string;
      paypal_username: string;
      profile_image_url?: string;
      bio?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('creators')
        .upsert({
          id: walletAddress, // Use wallet address as the primary key
          ...creatorData,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Failed to create/update creator:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save creator data' 
      };
    }
  }

  async updateCreatorSubscription(
    walletAddress: string,
    subscription: CreatorSubscription
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('creators')
        .update({
          subscription_tier: subscription.tier,
          subscription_status: subscription.status,
          subscription_expires_at: subscription.expiresAt?.toISOString(),
          revenuecat_customer_id: subscription.revenueCatCustomerId
        })
        .eq('id', walletAddress); // Use wallet address (id) as the identifier

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Failed to update creator subscription:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update subscription' 
      };
    }
  }

  async getCreatorSubscription(walletAddress: string): Promise<CreatorSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('creators')
        .select('subscription_tier, subscription_status, subscription_expires_at, revenuecat_customer_id')
        .eq('id', walletAddress) // Use wallet address (id) as the identifier
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No creator found, return default free subscription
          return {
            tier: 'free',
            status: 'active',
            expiresAt: undefined,
            revenueCatCustomerId: undefined
          };
        }
        throw error;
      }
      
      if (!data) return null;

      return {
        tier: data.subscription_tier as 'free' | 'pro' | 'creator_plus',
        status: data.subscription_status as 'active' | 'inactive' | 'cancelled' | 'expired',
        expiresAt: data.subscription_expires_at ? new Date(data.subscription_expires_at) : undefined,
        revenueCatCustomerId: data.revenuecat_customer_id
      };
    } catch (error) {
      console.error('Failed to get creator subscription:', error);
      return {
        tier: 'free',
        status: 'active',
        expiresAt: undefined,
        revenueCatCustomerId: undefined
      };
    }
  }

  async getCreatorByWallet(walletAddress: string): Promise<CreatorProfile | null> {
    try {
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .eq('id', walletAddress)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Creator not found
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to get creator by wallet:', error);
      return null;
    }
  }

  /**
   * Check if a creator has Pro access (either through manual toggle or subscription)
   */
  async checkProAccess(walletAddress: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('creators')
        .select('is_pro, subscription_tier, subscription_status')
        .eq('id', walletAddress)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return false; // Creator not found
        }
        throw error;
      }

      // Check manual Pro toggle first
      if (data.is_pro === true) {
        return true;
      }

      // Check subscription status
      const hasActiveProSubscription = 
        (data.subscription_tier === 'pro' || data.subscription_tier === 'creator_plus') &&
        data.subscription_status === 'active';

      return hasActiveProSubscription;
    } catch (error) {
      console.error('Failed to check Pro access:', error);
      return false;
    }
  }

  /**
   * Manually toggle Pro status for a creator (admin function)
   */
  async toggleProStatus(
    walletAddress: string, 
    isPro: boolean
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('creators')
        .update({ is_pro: isPro })
        .eq('id', walletAddress);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Failed to toggle Pro status:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update Pro status' 
      };
    }
  }

  /**
   * Get Pro status details for a creator
   */
  async getProStatusDetails(walletAddress: string): Promise<{
    isPro: boolean;
    isManualPro: boolean;
    hasActiveSubscription: boolean;
    subscriptionTier?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('creators')
        .select('is_pro, subscription_tier, subscription_status')
        .eq('id', walletAddress)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            isPro: false,
            isManualPro: false,
            hasActiveSubscription: false
          };
        }
        throw error;
      }

      const isManualPro = data.is_pro === true;
      const hasActiveSubscription = 
        (data.subscription_tier === 'pro' || data.subscription_tier === 'creator_plus') &&
        data.subscription_status === 'active';
      
      const isPro = isManualPro || hasActiveSubscription;

      return {
        isPro,
        isManualPro,
        hasActiveSubscription,
        subscriptionTier: data.subscription_tier
      };
    } catch (error) {
      console.error('Failed to get Pro status details:', error);
      return {
        isPro: false,
        isManualPro: false,
        hasActiveSubscription: false
      };
    }
  }
}

export const supabaseManager = new SupabaseManager();