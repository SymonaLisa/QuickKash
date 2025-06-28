/**
 * Dev Super User System
 * 
 * This utility provides enhanced admin access for development and testing.
 * Super users get access to all Pro features and admin panels.
 */

// List of dev super user wallet addresses
const DEV_SUPER_USER_ADDRESSES: Set<string> = new Set([
  'DEMO_WALLET_FOR_VIDEO_RECORDING', // Add your demo wallet here
  'SUPER_USER_DEMO_ADDRESS_123456', // Another demo address
  // Add more dev wallet addresses here
]);

export interface DevSuperUserStatus {
  isSuperUser: boolean;
  hasProAccess: boolean;
  hasAdminAccess: boolean;
  walletAddress: string;
}

class DevSuperUserManager {
  /**
   * Check if a wallet address is a dev super user
   */
  isSuperUser(walletAddress: string): boolean {
    if (!walletAddress || typeof walletAddress !== 'string') {
      return false;
    }
    
    return DEV_SUPER_USER_ADDRESSES.has(walletAddress.trim());
  }

  /**
   * Get comprehensive super user status
   */
  getSuperUserStatus(walletAddress: string): DevSuperUserStatus {
    const isSuperUser = this.isSuperUser(walletAddress);
    
    return {
      isSuperUser,
      hasProAccess: isSuperUser, // Super users automatically get Pro access
      hasAdminAccess: isSuperUser, // Super users automatically get admin access
      walletAddress: walletAddress || ''
    };
  }

  /**
   * Add a wallet address to the super user list (runtime only)
   */
  addSuperUser(walletAddress: string): boolean {
    if (!walletAddress || typeof walletAddress !== 'string') {
      return false;
    }
    
    DEV_SUPER_USER_ADDRESSES.add(walletAddress.trim());
    console.log(`Added ${walletAddress} to dev super user list`);
    return true;
  }

  /**
   * Remove a wallet address from the super user list (runtime only)
   */
  removeSuperUser(walletAddress: string): boolean {
    if (!walletAddress || typeof walletAddress !== 'string') {
      return false;
    }
    
    const removed = DEV_SUPER_USER_ADDRESSES.delete(walletAddress.trim());
    if (removed) {
      console.log(`Removed ${walletAddress} from dev super user list`);
    }
    return removed;
  }

  /**
   * Get all super user addresses
   */
  getSuperUsers(): string[] {
    return Array.from(DEV_SUPER_USER_ADDRESSES);
  }

  /**
   * Check if super user features should be enabled
   */
  shouldEnableSuperUserFeatures(): boolean {
    // Enable in development mode or if explicitly enabled
    return process.env.NODE_ENV === 'development' || 
           import.meta.env.VITE_ENABLE_SUPER_USER === 'true';
  }

  /**
   * Enhanced Pro status check that includes super user access
   */
  async checkEnhancedProStatus(walletAddress: string): Promise<boolean> {
    // First check if user is a super user
    if (this.isSuperUser(walletAddress)) {
      return true;
    }

    // Fallback to regular Pro status check
    try {
      const { checkProStatus } = await import('./checkProStatus');
      return await checkProStatus(walletAddress);
    } catch (error) {
      console.error('Failed to check Pro status:', error);
      return false;
    }
  }

  /**
   * Log super user activity for debugging
   */
  logSuperUserActivity(walletAddress: string, action: string, details?: any): void {
    if (this.isSuperUser(walletAddress)) {
      console.log(`[SUPER USER] ${walletAddress.slice(0, 8)}... performed: ${action}`, details);
    }
  }
}

export const devSuperUserManager = new DevSuperUserManager();

// Convenience functions
export const isSuperUser = (walletAddress: string): boolean => 
  devSuperUserManager.isSuperUser(walletAddress);

export const getSuperUserStatus = (walletAddress: string): DevSuperUserStatus => 
  devSuperUserManager.getSuperUserStatus(walletAddress);

export const checkEnhancedProStatus = (walletAddress: string): Promise<boolean> => 
  devSuperUserManager.checkEnhancedProStatus(walletAddress);

export const shouldEnableSuperUserFeatures = (): boolean => 
  devSuperUserManager.shouldEnableSuperUserFeatures();

// Development utilities
export const devUtils = {
  addSuperUser: (walletAddress: string) => devSuperUserManager.addSuperUser(walletAddress),
  removeSuperUser: (walletAddress: string) => devSuperUserManager.removeSuperUser(walletAddress),
  getSuperUsers: () => devSuperUserManager.getSuperUsers(),
  logActivity: (walletAddress: string, action: string, details?: any) => 
    devSuperUserManager.logSuperUserActivity(walletAddress, action, details)
};