/**
 * Pro Wallet Address Checker Utility
 * 
 * This utility checks if a connected wallet address is in a predefined list
 * of Pro wallet addresses. This provides a simple way to grant Pro access
 * to specific wallets without requiring database lookups.
 */

// Predefined list of Pro wallet addresses
// Add wallet addresses here to grant them Pro access
const PRO_WALLET_ADDRESSES: Set<string> = new Set([
  'ALGORAND_WALLET_ADDRESS_1_HERE',
  'ALGORAND_WALLET_ADDRESS_2_HERE',
  'ALGORAND_WALLET_ADDRESS_3_HERE',
  'DEVWALLET123456789ABCDEF',
  'TESTWALLET987654321FEDCBA',
]);

export interface ProWalletConfig {
  caseSensitive?: boolean;
  enableLogging?: boolean;
  fallbackToDatabase?: boolean;
}

export interface ProWalletCheckResult {
  isPro: boolean;
  source: 'predefined_list' | 'database' | 'not_found';
  walletAddress: string;
  error?: string;
}

class ProWalletChecker {
  private config: ProWalletConfig;
  private proWallets: Set<string>;

  constructor(config: ProWalletConfig = {}) {
    this.config = {
      caseSensitive: true,
      enableLogging: false,
      fallbackToDatabase: false,
      ...config,
    };

    this.proWallets = new Set(
      Array.from(PRO_WALLET_ADDRESSES).map(addr =>
        this.config.caseSensitive ? addr : addr.toLowerCase()
      )
    );
  }

  async isProWallet(walletAddress: string): Promise<ProWalletCheckResult> {
    if (!walletAddress || typeof walletAddress !== 'string') {
      return {
        isPro: false,
        source: 'not_found',
        walletAddress: walletAddress || '',
        error: 'Invalid wallet address provided',
      };
    }

    const normalizedAddress = this.config.caseSensitive
      ? walletAddress.trim()
      : walletAddress.trim().toLowerCase();

    const isInPredefinedList = this.proWallets.has(normalizedAddress);

    if (this.config.enableLogging) {
      console.log(
        `Pro wallet check for ${walletAddress}: ${
          isInPredefinedList ? 'FOUND' : 'NOT FOUND'
        } in predefined list`
      );
    }

    if (isInPredefinedList) {
      return { isPro: true, source: 'predefined_list', walletAddress };
    }

    if (this.config.fallbackToDatabase) {
      try {
        const { checkProStatus } = await import('./checkProStatus');
        const dbResult = await checkProStatus(walletAddress);

        if (this.config.enableLogging) {
          console.log(
            `Pro wallet database fallback for ${walletAddress}: ${
              dbResult ? 'PRO' : 'FREE'
            }`
          );
        }

        return { isPro: dbResult, source: 'database', walletAddress };
      } catch (dbError) {
        if (this.config.enableLogging) {
          console.error('Database fallback failed:', dbError);
        }
        return {
          isPro: false,
          source: 'not_found',
          walletAddress,
          error: 'Database fallback failed',
        };
      }
    }

    return { isPro: false, source: 'not_found', walletAddress };
  }

  addProWallet(walletAddress: string): boolean {
    if (!walletAddress || typeof walletAddress !== 'string') {
      return false;
    }
    const normalizedAddress = this.config.caseSensitive
      ? walletAddress.trim()
      : walletAddress.trim().toLowerCase();

    this.proWallets.add(normalizedAddress);

    if (this.config.enableLogging) {
      console.log(`Added ${walletAddress} to Pro wallet list`);
    }

    return true;
  }

  removeProWallet(walletAddress: string): boolean {
    if (!walletAddress || typeof walletAddress !== 'string') {
      return false;
    }
    const normalizedAddress = this.config.caseSensitive
      ? walletAddress.trim()
      : walletAddress.trim().toLowerCase();

    const removed = this.proWallets.delete(normalizedAddress);

    if (this.config.enableLogging) {
      console.log(
        `${removed ? 'Removed' : 'Failed to remove'} ${walletAddress} from Pro wallet list`
      );
    }

    return removed;
  }

  getProWallets(): string[] {
    return Array.from(this.proWallets);
  }

  getProWalletCount(): number {
    return this.proWallets.size;
  }

  async checkMultipleWallets(
    walletAddresses: string[]
  ): Promise<Record<string, ProWalletCheckResult>> {
    const results: Record<string, ProWalletCheckResult> = {};
    for (const address of walletAddresses) {
      results[address] = await this.isProWallet(address);
    }
    return results;
  }

  updateConfig(newConfig: Partial<ProWalletConfig>): void {
    const oldCaseSensitive = this.config.caseSensitive;
    this.config = { ...this.config, ...newConfig };

    if (
      newConfig.caseSensitive !== undefined &&
      newConfig.caseSensitive !== oldCaseSensitive
    ) {
      // Rebuild proWallets with proper case normalization
      const oldWallets = Array.from(this.proWallets);
      this.proWallets.clear();
      oldWallets.forEach(address => {
        const normalized = this.config.caseSensitive
          ? address
          : address.toLowerCase();
        this.proWallets.add(normalized);
      });
    }
  }
}

export const proWalletChecker = new ProWalletChecker({
  caseSensitive: true,
  enableLogging: false,
  fallbackToDatabase: true,
});

export const isProWallet = (walletAddress: string): Promise<ProWalletCheckResult> =>
  proWalletChecker.isProWallet(walletAddress);

export const isProWalletSimple = async (walletAddress: string): Promise<boolean> => {
  const result = await proWalletChecker.isProWallet(walletAddress);
  return result.isPro;
};

export const addProWallet = (walletAddress: string): boolean =>
  proWalletChecker.addProWallet(walletAddress);

export const removeProWallet = (walletAddress: string): boolean =>
  proWalletChecker.removeProWallet(walletAddress);

export const getProWallets = (): string[] => proWalletChecker.getProWallets();

export const getProWalletCount = (): number => proWalletChecker.getProWalletCount();

export { ProWalletChecker };

export const isValidAlgorandAddress = (address: string): boolean => {
  if (!address || typeof address !== 'string') return false;
  const trimmed = address.trim();
  return trimmed.length === 58 && /^[A-Z2-7]+$/.test(trimmed);
};

export const batchProWalletOperations = {
  addMultiple: (walletAddresses: string[]): { success: string[]; failed: string[] } => {
    const success: string[] = [];
    const failed: string[] = [];

    walletAddresses.forEach(address => {
      if (proWalletChecker.addProWallet(address)) success.push(address);
      else failed.push(address);
    });

    return { success, failed };
  },

  removeMultiple: (walletAddresses: string[]): { success: string[]; failed: string[] } => {
    const success: string[] = [];
    const failed: string[] = [];

    walletAddresses.forEach(address => {
      if (proWalletChecker.removeProWallet(address)) success.push(address);
      else failed.push(address);
    });

    return { success, failed };
  },

  areAllPro: async (walletAddresses: string[]): Promise<boolean> => {
    const results = await proWalletChecker.checkMultipleWallets(walletAddresses);
    return Object.values(results).every(result => result.isPro);
  },

  getSummary: async (walletAddresses: string[]): Promise<{
    total: number;
    pro: number;
    free: number;
    errors: number;
  }> => {
    const results = await proWalletChecker.checkMultipleWallets(walletAddresses);
    const values = Object.values(results);

    return {
      total: values.length,
      pro: values.filter(r => r.isPro).length,
      free: values.filter(r => !r.isPro && !r.error).length,
      errors: values.filter(r => r.error).length,
    };
  },
};


  /**
   * Add a wallet address to the Pro list (runtime only)
   * @param walletAddress - The wallet address to add
   * @returns boolean - Success status
   */
  addProWallet(walletAddress: string): boolean {
    try {
      if (!walletAddress || typeof walletAddress !== 'string') {
        return false;
      }

      const normalizedAddress = this.config.caseSensitive 
        ? walletAddress.trim()
        : walletAddress.trim().toLowerCase();

      this.proWallets.add(normalizedAddress);
      
      if (this.config.enableLogging) {
        console.log(`Added ${walletAddress} to Pro wallet list`);
      }

      return true;
    } catch (error) {
      console.error('Failed to add Pro wallet:', error);
      return false;
    }
  }

  /**
   * Remove a wallet address from the Pro list (runtime only)
   * @param walletAddress - The wallet address to remove
   * @returns boolean - Success status
   */
  removeProWallet(walletAddress: string): boolean {
    try {
      if (!walletAddress || typeof walletAddress !== 'string') {
        return false;
      }

      const normalizedAddress = this.config.caseSensitive 
        ? walletAddress.trim()
        : walletAddress.trim().toLowerCase();

      const removed = this.proWallets.delete(normalizedAddress);
      
      if (this.config.enableLogging) {
        console.log(`${removed ? 'Removed' : 'Failed to remove'} ${walletAddress} from Pro wallet list`);
      }

      return removed;
    } catch (error) {
      console.error('Failed to remove Pro wallet:', error);
      return false;
    }
  }

  /**
   * Get all Pro wallet addresses
   * @returns string[] - Array of Pro wallet addresses
   */
  getProWallets(): string[] {
    return Array.from(this.proWallets);
  }

  /**
   * Get count of Pro wallets
   * @returns number - Number of Pro wallets
   */
  getProWalletCount(): number {
    return this.proWallets.size;
  }

  /**
   * Check multiple wallet addresses at once
   * @param walletAddresses - Array of wallet addresses to check
   * @returns Promise<Record<string, ProWalletCheckResult>> - Results for each wallet
   */
  async checkMultipleWallets(walletAddresses: string[]): Promise<Record<string, ProWalletCheckResult>> {
    const results: Record<string, ProWalletCheckResult> = {};

    for (const address of walletAddresses) {
      results[address] = await this.isProWallet(address);
    }

    return results;
  }

  /**
   * Update configuration
   * @param newConfig - New configuration options
   */
  updateConfig(newConfig: Partial<ProWalletConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Rebuild wallet set if case sensitivity changed
    if (newConfig.caseSensitive !== undefined) {
      const oldWallets = Array.from(this.proWallets);
      this.proWallets.clear();
      
      oldWallets.forEach(address => {
        this.proWallets.add(
          this.config.caseSensitive ? address : address.toLowerCase()
        );
      });
    }
  }
}

// Create default instance
export const proWalletChecker = new ProWalletChecker({
  caseSensitive: true,
  enableLogging: false,
  fallbackToDatabase: true
});

// Convenience functions for easy usage
export const isProWallet = (walletAddress: string): Promise<ProWalletCheckResult> =>
  proWalletChecker.isProWallet(walletAddress);

export const isProWalletSimple = async (walletAddress: string): Promise<boolean> => {
  const result = await proWalletChecker.isProWallet(walletAddress);
  return result.isPro;
};

export const addProWallet = (walletAddress: string): boolean =>
  proWalletChecker.addProWallet(walletAddress);

export const removeProWallet = (walletAddress: string): boolean =>
  proWalletChecker.removeProWallet(walletAddress);

export const getProWallets = (): string[] =>
  proWalletChecker.getProWallets();

export const getProWalletCount = (): number =>
  proWalletChecker.getProWalletCount();

// Export the class for advanced usage
export { ProWalletChecker };

/**
 * Utility function to validate Algorand wallet address format
 * @param address - The address to validate
 * @returns boolean - Whether the address is valid format
 */
export const isValidAlgorandAddress = (address: string): boolean => {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Algorand addresses are 58 characters long and base32 encoded
  const trimmed = address.trim();
  return trimmed.length === 58 && /^[A-Z2-7]+$/.test(trimmed);
};

/**
 * Batch Pro wallet operations
 */
export const batchProWalletOperations = {
  /**
   * Add multiple wallets to Pro list
   */
  addMultiple: (walletAddresses: string[]): { success: string[]; failed: string[] } => {
    const success: string[] = [];
    const failed: string[] = [];

    walletAddresses.forEach(address => {
      if (proWalletChecker.addProWallet(address)) {
        success.push(address);
      } else {
        failed.push(address);
      }
    });

    return { success, failed };
  },

  /**
   * Remove multiple wallets from Pro list
   */
  removeMultiple: (walletAddresses: string[]): { success: string[]; failed: string[] } => {
    const success: string[] = [];
    const failed: string[] = [];

    walletAddresses.forEach(address => {
      if (proWalletChecker.removeProWallet(address)) {
        success.push(address);
      } else {
        failed.push(address);
      }
    });

    return { success, failed };
  },

  /**
   * Check if all provided wallets are Pro
   */
  areAllPro: async (walletAddresses: string[]): Promise<boolean> => {
    const results = await proWalletChecker.checkMultipleWallets(walletAddresses);
    return Object.values(results).every(result => result.isPro);
  },

  /**
   * Get Pro status summary for multiple wallets
   */
  getSummary: async (walletAddresses: string[]): Promise<{
    total: number;
    pro: number;
    free: number;
    errors: number;
  }> => {
    const results = await proWalletChecker.checkMultipleWallets(walletAddresses);
    const values = Object.values(results);

    return {
      total: values.length,
      pro: values.filter(r => r.isPro).length,
      free: values.filter(r => !r.isPro && !r.error).length,
      errors: values.filter(r => r.error).length
    };
  }
};
