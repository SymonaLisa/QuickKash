import { supabase } from './supabase';

export interface Shortlink {
  slug: string;
  wallet_address: string;
  created_at: string;
  is_active: boolean;
  click_count: number;
}

export interface ShortlinkResult {
  success: boolean;
  data?: Shortlink;
  error?: string;
}

class ShortlinkManager {
  /**
   * Create a new shortlink for a creator
   */
  async createShortlink(
    walletAddress: string, 
    slug: string
  ): Promise<ShortlinkResult> {
    try {
      // Validate slug format
      if (!this.isValidSlug(slug)) {
        return {
          success: false,
          error: 'Slug must be 3-20 characters long and contain only letters, numbers, hyphens, and underscores'
        };
      }

      // Check if slug is already taken
      const { data: existing } = await supabase
        .from('shortlinks')
        .select('slug')
        .eq('slug', slug.toLowerCase())
        .single();

      if (existing) {
        return {
          success: false,
          error: 'This shortlink is already taken. Please choose a different one.'
        };
      }

      // Create the shortlink
      const { data, error } = await supabase
        .from('shortlinks')
        .insert({
          slug: slug.toLowerCase(),
          wallet_address: walletAddress,
          is_active: true,
          click_count: 0
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Failed to create shortlink:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create shortlink'
      };
    }
  }

  /**
   * Get shortlink by slug
   */
  async getShortlink(slug: string): Promise<ShortlinkResult> {
    try {
      const { data, error } = await supabase
        .from('shortlinks')
        .select('*')
        .eq('slug', slug.toLowerCase())
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: 'Shortlink not found'
          };
        }
        throw error;
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Failed to get shortlink:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get shortlink'
      };
    }
  }

  /**
   * Get all shortlinks for a creator
   */
  async getCreatorShortlinks(walletAddress: string): Promise<{
    success: boolean;
    data?: Shortlink[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('shortlinks')
        .select('*')
        .eq('wallet_address', walletAddress)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Failed to get creator shortlinks:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get shortlinks'
      };
    }
  }

  /**
   * Update shortlink status
   */
  async updateShortlink(
    slug: string, 
    updates: { is_active?: boolean }
  ): Promise<ShortlinkResult> {
    try {
      const { data, error } = await supabase
        .from('shortlinks')
        .update(updates)
        .eq('slug', slug.toLowerCase())
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Failed to update shortlink:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update shortlink'
      };
    }
  }

  /**
   * Delete a shortlink
   */
  async deleteShortlink(slug: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('shortlinks')
        .delete()
        .eq('slug', slug.toLowerCase());

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to delete shortlink:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete shortlink'
      };
    }
  }

  /**
   * Increment click count for a shortlink
   */
  async incrementClickCount(slug: string): Promise<void> {
    try {
      await supabase.rpc('increment_shortlink_clicks', {
        shortlink_slug: slug.toLowerCase()
      });
    } catch (error) {
      console.error('Failed to increment click count:', error);
    }
  }

  /**
   * Resolve shortlink to wallet address
   */
  async resolveShortlink(slug: string): Promise<{
    success: boolean;
    walletAddress?: string;
    error?: string;
  }> {
    try {
      const result = await this.getShortlink(slug);
      
      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'Shortlink not found'
        };
      }

      // Increment click count
      await this.incrementClickCount(slug);

      return {
        success: true,
        walletAddress: result.data.wallet_address
      };
    } catch (error) {
      console.error('Failed to resolve shortlink:', error);
      return {
        success: false,
        error: 'Failed to resolve shortlink'
      };
    }
  }

  /**
   * Validate slug format
   */
  private isValidSlug(slug: string): boolean {
    // 3-20 characters, alphanumeric, hyphens, and underscores only
    const slugRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    return slugRegex.test(slug);
  }

  /**
   * Generate suggested slugs based on creator name
   */
  generateSuggestedSlugs(creatorName: string): string[] {
    const suggestions: string[] = [];
    const baseName = creatorName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 15);

    if (baseName.length >= 3) {
      suggestions.push(baseName);
      suggestions.push(`${baseName}tips`);
      suggestions.push(`${baseName}jar`);
      suggestions.push(`tip${baseName}`);
    }

    // Add some random variations
    const randomSuffix = Math.floor(Math.random() * 999);
    suggestions.push(`${baseName}${randomSuffix}`);
    suggestions.push(`creator${randomSuffix}`);

    return suggestions.filter(slug => this.isValidSlug(slug));
  }

  /**
   * Check if slug is available
   */
  async isSlugAvailable(slug: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('shortlinks')
        .select('slug')
        .eq('slug', slug.toLowerCase())
        .single();

      return !data; // Available if no data found
    } catch (error) {
      // If error is "not found", slug is available
      return true;
    }
  }

  /**
   * Get shortlink URL
   */
  getShortlinkUrl(slug: string): string {
    return `${window.location.origin}/@${slug}`;
  }

  /**
   * Get analytics for shortlinks
   */
  async getShortlinkAnalytics(walletAddress: string): Promise<{
    success: boolean;
    data?: {
      totalClicks: number;
      totalShortlinks: number;
      topShortlinks: Array<{ slug: string; click_count: number }>;
    };
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('shortlinks')
        .select('slug, click_count')
        .eq('wallet_address', walletAddress)
        .eq('is_active', true);

      if (error) {
        throw error;
      }

      const shortlinks = data || [];
      const totalClicks = shortlinks.reduce((sum, link) => sum + link.click_count, 0);
      const topShortlinks = shortlinks
        .sort((a, b) => b.click_count - a.click_count)
        .slice(0, 5);

      return {
        success: true,
        data: {
          totalClicks,
          totalShortlinks: shortlinks.length,
          topShortlinks
        }
      };
    } catch (error) {
      console.error('Failed to get shortlink analytics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get analytics'
      };
    }
  }
}

export const shortlinkManager = new ShortlinkManager();