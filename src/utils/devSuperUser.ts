/**
 * Dev Super User System
 * 
 * This utility provides enhanced admin access for development and testing.
 * Super users get access to all Pro features and admin panels.
 */

// List of dev super user wallet addresses (using valid Algorand address format)
const DEV_SUPER_USER_ADDRESSES: Set<string> = new Set([
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // Demo wallet 1
  'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB', // Demo wallet 2
  'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC', // Demo wallet 3
  'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD', // Demo wallet 4
  // Add more valid Algorand addresses here (58 characters, base32 format)
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
   * Validates that the address is in proper Algorand format
   */
  addSuperUser(walletAddress: string): boolean {
    if (!walletAddress || typeof walletAddress !== 'string') {
      return false;
    }
    
    const trimmedAddress = walletAddress.trim();
    
    // Validate Algorand address format (58 characters, base32)
    if (!this.isValidAlgorandAddress(trimmedAddress)) {
      console.warn(`Invalid Algorand address format: ${trimmedAddress}`);
      return false;
    }
    
    DEV_SUPER_USER_ADDRESSES.add(trimmedAddress);
    console.log(`Added ${trimmedAddress} to dev super user list`);
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
   * Validate Algorand address format
   */
  private isValidAlgorandAddress(address: string): boolean {
    // Algorand addresses are 58 characters long and use base32 encoding (A-Z, 2-7)
    const algorandAddressRegex = /^[A-Z2-7]{58}$/;
    return algorandAddressRegex.test(address);
  }

  /**
   * Generate a valid demo Algorand address for testing
   */
  generateDemoAddress(prefix: string = 'DEMO'): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = prefix.toUpperCase().slice(0, 10).padEnd(10, 'A');
    
    // Fill remaining characters to make 58 total
    for (let i = result.length; i < 58; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
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
  generateDemoAddress: (prefix?: string) => devSuperUserManager.generateDemoAddress(prefix),
  logActivity: (walletAddress: string, action: string, details?: any) => 
    devSuperUserManager.logSuperUserActivity(walletAddress, action, details)
};