import { supabase } from './supabase';

export interface ProStatusUpdateResult {
  success: boolean;
  error?: string;
  previousStatus?: boolean;
  newStatus?: boolean;
}

export interface AdminProManagerConfig {
  adminKey?: string; // Optional admin key for additional security
  requireAuth?: boolean; // Whether to require authentication
}

/**
 * Admin function to update Pro status for a creator
 * This should only be used by authorized administrators
 */
export class AdminProManager {
  private config: AdminProManagerConfig;

  constructor(config: AdminProManagerConfig = {}) {
    this.config = {
      requireAuth: true,
      ...config
    };
  }

  /**
   * Set Pro status for a creator by wallet address
   * @param walletAddress - The creator's wallet address
   * @param isPro - Whether to grant or revoke Pro status
   * @param adminNote - Optional note about the change
   * @returns Promise with operation result
   */
  async setProStatus(
    walletAddress: string,
    isPro: boolean,
    adminNote?: string
  ): Promise<ProStatusUpdateResult> {
    try {
      // Validate input
      if (!walletAddress || typeof walletAddress !== 'string') {
        return {
          success: false,
          error: 'Invalid wallet address provided'
        };
      }

      if (typeof isPro !== 'boolean') {
        return {
          success: false,
          error: 'isPro must be a boolean value'
        };
      }

      // Get current status first
      const { data: currentData, error: fetchError } = await supabase
        .from('creators')
        .select('is_pro')
        .eq('id', walletAddress)
        .single();

      let previousStatus: boolean | undefined;
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        // Error other than "not found"
        return {
          success: false,
          error: `Failed to fetch current status: ${fetchError.message}`
        };
      }

      if (currentData) {
        previousStatus = Boolean(currentData.is_pro);
      }

      // If creator doesn't exist, we need to create them first
      if (fetchError?.code === 'PGRST116') {
        // Creator doesn't exist, create with minimal required fields
        const { error: createError } = await supabase
          .from('creators')
          .insert({
            id: walletAddress,
            name: 'Unknown Creator',
            email: `${walletAddress}@placeholder.com`,
            paypal_username: walletAddress,
            is_pro: isPro,
            created_at: new Date().toISOString()
          });

        if (createError) {
          return {
            success: false,
            error: `Failed to create creator: ${createError.message}`
          };
        }

        // Log the admin action
        await this.logAdminAction(walletAddress, undefined, isPro, adminNote);

        return {
          success: true,
          previousStatus: undefined,
          newStatus: isPro
        };
      }

      // Update existing creator
      const { error: updateError } = await supabase
        .from('creators')
        .update({ 
          is_pro: isPro,
          // Optionally update a last_modified timestamp
          updated_at: new Date().toISOString()
        })
        .eq('id', walletAddress);

      if (updateError) {
        return {
          success: false,
          error: `Failed to update Pro status: ${updateError.message}`
        };
      }

      // Log the admin action
      await this.logAdminAction(walletAddress, previousStatus, isPro, adminNote);

      return {
        success: true,
        previousStatus,
        newStatus: isPro
      };

    } catch (error) {
      console.error('Unexpected error in setProStatus:', error);
      return {
        success: false,
        error: 'Unexpected error occurred'
      };
    }
  }

  /**
   * Toggle Pro status for a creator
   * @param walletAddress - The creator's wallet address
   * @param adminNote - Optional note about the change
   * @returns Promise with operation result
   */
  async toggleProStatus(
    walletAddress: string,
    adminNote?: string
  ): Promise<ProStatusUpdateResult> {
    try {
      // Get current status
      const { data, error } = await supabase
        .from('creators')
        .select('is_pro')
        .eq('id', walletAddress)
        .single();

      if (error && error.code !== 'PGRST116') {
        return {
          success: false,
          error: `Failed to fetch current status: ${error.message}`
        };
      }

      const currentStatus = data?.is_pro || false;
      const newStatus = !currentStatus;

      return await this.setProStatus(walletAddress, newStatus, adminNote);

    } catch (error) {
      console.error('Unexpected error in toggleProStatus:', error);
      return {
        success: false,
        error: 'Unexpected error occurred'
      };
    }
  }

  /**
   * Get Pro status for a creator
   * @param walletAddress - The creator's wallet address
   * @returns Promise with Pro status information
   */
  async getProStatus(walletAddress: string): Promise<{
    success: boolean;
    isPro?: boolean;
    creatorExists?: boolean;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('creators')
        .select('is_pro, name, email')
        .eq('id', walletAddress)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: true,
            isPro: false,
            creatorExists: false
          };
        }
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        isPro: Boolean(data.is_pro),
        creatorExists: true
      };

    } catch (error) {
      console.error('Unexpected error in getProStatus:', error);
      return {
        success: false,
        error: 'Unexpected error occurred'
      };
    }
  }

  /**
   * Get all Pro creators
   * @param limit - Maximum number of results to return
   * @returns Promise with list of Pro creators
   */
  async getProCreators(limit: number = 50): Promise<{
    success: boolean;
    creators?: Array<{
      id: string;
      name: string;
      email: string;
      is_pro: boolean;
      created_at: string;
    }>;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('creators')
        .select('id, name, email, is_pro, created_at')
        .eq('is_pro', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        creators: data || []
      };

    } catch (error) {
      console.error('Unexpected error in getProCreators:', error);
      return {
        success: false,
        error: 'Unexpected error occurred'
      };
    }
  }

  /**
   * Batch update Pro status for multiple creators
   * @param updates - Array of wallet addresses and their new Pro status
   * @param adminNote - Optional note about the batch change
   * @returns Promise with batch operation results
   */
  async batchUpdateProStatus(
    updates: Array<{ walletAddress: string; isPro: boolean }>,
    adminNote?: string
  ): Promise<{
    success: boolean;
    results?: Array<{ walletAddress: string; success: boolean; error?: string }>;
    error?: string;
  }> {
    try {
      const results = [];

      for (const update of updates) {
        const result = await this.setProStatus(
          update.walletAddress,
          update.isPro,
          `${adminNote} (Batch operation)`
        );

        results.push({
          walletAddress: update.walletAddress,
          success: result.success,
          error: result.error
        });
      }

      return {
        success: true,
        results
      };

    } catch (error) {
      console.error('Unexpected error in batchUpdateProStatus:', error);
      return {
        success: false,
        error: 'Unexpected error occurred'
      };
    }
  }

  /**
   * Log admin actions for audit trail
   * @private
   */
  private async logAdminAction(
    walletAddress: string,
    previousStatus: boolean | undefined,
    newStatus: boolean,
    adminNote?: string
  ): Promise<void> {
    try {
      // This would typically log to an admin_actions table
      // For now, we'll just console log
      const logEntry = {
        timestamp: new Date().toISOString(),
        action: 'pro_status_update',
        target_wallet: walletAddress,
        previous_status: previousStatus,
        new_status: newStatus,
        admin_note: adminNote,
        admin_user: 'system' // In a real app, you'd get this from auth context
      };

      console.log('Admin Action Log:', logEntry);

      // Optionally, insert into an admin_logs table if it exists
      // await supabase.from('admin_logs').insert(logEntry);

    } catch (error) {
      console.error('Failed to log admin action:', error);
      // Don't throw here - logging failure shouldn't break the main operation
    }
  }

  /**
   * Validate admin permissions (placeholder for real auth)
   * @private
   */
  private async validateAdminPermissions(): Promise<boolean> {
    // In a real application, you would:
    // 1. Check if user is authenticated
    // 2. Verify admin role/permissions
    // 3. Validate admin key if using one
    
    if (this.config.requireAuth) {
      // Placeholder - implement your auth logic here
      return true;
    }

    return true;
  }
}

// Export a default instance
export const adminProManager = new AdminProManager();

// Export convenience functions
export const setCreatorProStatus = (walletAddress: string, isPro: boolean, adminNote?: string) =>
  adminProManager.setProStatus(walletAddress, isPro, adminNote);

export const toggleCreatorProStatus = (walletAddress: string, adminNote?: string) =>
  adminProManager.toggleProStatus(walletAddress, adminNote);

export const getCreatorProStatus = (walletAddress: string) =>
  adminProManager.getProStatus(walletAddress);

export const getAllProCreators = (limit?: number) =>
  adminProManager.getProCreators(limit);