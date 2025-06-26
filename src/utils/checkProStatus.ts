import { supabase } from './supabase';
import { isProWalletSimple } from './proWalletChecker';

/**
 * Enhanced Pro status checker that combines predefined list and database checks
 * @param walletAddress - The wallet address to check
 * @returns Promise<boolean> - true if is_pro is true OR in predefined list, false otherwise
 */
export async function checkProStatus(walletAddress: string): Promise<boolean> {
  try {
    // Validate input
    if (!walletAddress || typeof walletAddress !== 'string') {
      console.warn('Invalid wallet address provided to checkProStatus');
      return false;
    }

    // First check predefined Pro wallet list (faster)
    const isInProList = await isProWalletSimple(walletAddress);
    if (isInProList) {
      return true;
    }

    // Fallback to database check
    const { data, error } = await supabase
      .from('creators')
      .select('is_pro, subscription_tier, subscription_status')
      .eq('id', walletAddress)
      .single();

    // Handle query errors
    if (error) {
      // PGRST116 means no rows found - creator doesn't exist
      if (error.code === 'PGRST116') {
        console.log(`Creator not found for wallet: ${walletAddress}`);
        return false;
      }
      
      // Log other errors but don't throw
      console.error('Error checking Pro status:', error.message);
      return false;
    }

    // Check manual Pro flag
    if (data?.is_pro === true) {
      return true;
    }

    // Check subscription-based Pro access
    const hasActiveProSubscription = 
      (data?.subscription_tier === 'pro' || data?.subscription_tier === 'creator_plus') &&
      data?.subscription_status === 'active';

    return hasActiveProSubscription;

  } catch (error) {
    // Handle any unexpected errors gracefully
    console.error('Unexpected error in checkProStatus:', error);
    return false;
  }
}

/**
 * Checks Pro status with additional details about the source of Pro access
 * @param walletAddress - The wallet address to check
 * @returns Promise with detailed Pro status information
 */
export async function checkProStatusDetailed(walletAddress: string): Promise<{
  isPro: boolean;
  isManualPro: boolean;
  hasActiveSubscription: boolean;
  isInProList: boolean;
  subscriptionTier?: string;
  error?: string;
}> {
  try {
    if (!walletAddress || typeof walletAddress !== 'string') {
      return {
        isPro: false,
        isManualPro: false,
        hasActiveSubscription: false,
        isInProList: false,
        error: 'Invalid wallet address'
      };
    }

    // Check predefined Pro wallet list
    const isInProList = await isProWalletSimple(walletAddress);

    // Check database
    const { data, error } = await supabase
      .from('creators')
      .select('is_pro, subscription_tier, subscription_status')
      .eq('id', walletAddress)
      .single();

    if (error && error.code !== 'PGRST116') {
      return {
        isPro: isInProList,
        isManualPro: false,
        hasActiveSubscription: false,
        isInProList,
        error: error.message
      };
    }

    const isManualPro = Boolean(data?.is_pro);
    const hasActiveSubscription = 
      (data?.subscription_tier === 'pro' || data?.subscription_tier === 'creator_plus') &&
      data?.subscription_status === 'active';
    
    const isPro = isInProList || isManualPro || hasActiveSubscription;

    return {
      isPro,
      isManualPro,
      hasActiveSubscription,
      isInProList,
      subscriptionTier: data?.subscription_tier
    };

  } catch (error) {
    console.error('Unexpected error in checkProStatusDetailed:', error);
    return {
      isPro: false,
      isManualPro: false,
      hasActiveSubscription: false,
      isInProList: false,
      error: 'Unexpected error occurred'
    };
  }
}

/**
 * Batch check Pro status for multiple wallet addresses
 * @param walletAddresses - Array of wallet addresses to check
 * @returns Promise<Record<string, boolean>> - Object mapping wallet addresses to Pro status
 */
export async function checkProStatusBatch(walletAddresses: string[]): Promise<Record<string, boolean>> {
  try {
    if (!Array.isArray(walletAddresses) || walletAddresses.length === 0) {
      return {};
    }

    // Filter out invalid addresses
    const validAddresses = walletAddresses.filter(addr => 
      addr && typeof addr === 'string' && addr.trim().length > 0
    );

    if (validAddresses.length === 0) {
      return {};
    }

    // Check all addresses in parallel for efficiency
    const resultsArray = await Promise.all(
      validAddresses.map(addr => checkProStatus(addr))
    );

    const results: Record<string, boolean> = {};
    validAddresses.forEach((addr, i) => {
      results[addr] = resultsArray[i];
    });

    return results;

  } catch (error) {
    console.error('Unexpected error in checkProStatusBatch:', error);
    return {};
  }
}
