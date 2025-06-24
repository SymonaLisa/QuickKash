import { supabase } from './supabase';
import { BrandingSettings } from '../components/ProBrandingCustomizer';

export interface CreatorBranding {
  customPrimaryColor?: string;
  customSecondaryColor?: string;
  customLogoUrl?: string;
  customFont: string;
  brandName?: string;
  brandingEnabled: boolean;
}

class BrandingManager {
  /**
   * Load branding settings for a creator
   */
  async loadBrandingSettings(walletAddress: string): Promise<CreatorBranding | null> {
    try {
      const { data, error } = await supabase
        .from('creators')
        .select(`
          custom_primary_color,
          custom_secondary_color,
          custom_logo_url,
          custom_font,
          brand_name,
          branding_enabled
        `)
        .eq('id', walletAddress)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        return null;
      }

      return {
        customPrimaryColor: data.custom_primary_color || undefined,
        customSecondaryColor: data.custom_secondary_color || undefined,
        customLogoUrl: data.custom_logo_url || undefined,
        customFont: data.custom_font || 'Inter',
        brandName: data.brand_name || undefined,
        brandingEnabled: data.branding_enabled || false
      };
    } catch (error) {
      console.error('Failed to load branding settings:', error);
      return null;
    }
  }

  /**
   * Save branding settings for a creator
   */
  async saveBrandingSettings(
    walletAddress: string, 
    branding: BrandingSettings
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('creators')
        .upsert({
          id: walletAddress,
          custom_primary_color: branding.customPrimaryColor || null,
          custom_secondary_color: branding.customSecondaryColor || null,
          custom_logo_url: branding.customLogoUrl || null,
          custom_font: branding.customFont,
          brand_name: branding.brandName || null,
          branding_enabled: branding.brandingEnabled,
          // Include required fields with defaults if creating new record
          name: 'Creator',
          email: `${walletAddress}@placeholder.com`,
          paypal_username: walletAddress
        }, {
          onConflict: 'id'
        });

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to save branding settings:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save branding settings' 
      };
    }
  }

  /**
   * Upload logo to Supabase Storage
   */
  async uploadLogo(
    walletAddress: string, 
    file: File
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        return { success: false, error: 'Please select an image file' };
      }

      if (file.size > 2 * 1024 * 1024) {
        return { success: false, error: 'Image must be smaller than 2MB' };
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${walletAddress}_logo_${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('creator-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('creator-logos')
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      return { success: true, url: urlData.publicUrl };
    } catch (error) {
      console.error('Logo upload failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to upload logo' 
      };
    }
  }

  /**
   * Delete logo from Supabase Storage
   */
  async deleteLogo(logoUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Extract filename from URL
      const urlParts = logoUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];

      const { error } = await supabase.storage
        .from('creator-logos')
        .remove([fileName]);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Logo deletion failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete logo' 
      };
    }
  }

  /**
   * Apply branding to CSS custom properties
   */
  applyBrandingToDOM(branding: CreatorBranding): void {
    if (!branding.brandingEnabled) {
      this.resetBrandingToDefault();
      return;
    }

    const root = document.documentElement;

    if (branding.customPrimaryColor) {
      root.style.setProperty('--brand-primary', branding.customPrimaryColor);
    }

    if (branding.customSecondaryColor) {
      root.style.setProperty('--brand-secondary', branding.customSecondaryColor);
    }

    if (branding.customFont) {
      root.style.setProperty('--brand-font', branding.customFont);
    }
  }

  /**
   * Reset branding to default values
   */
  resetBrandingToDefault(): void {
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', '#10b981');
    root.style.setProperty('--brand-secondary', '#14b8a6');
    root.style.setProperty('--brand-font', 'Inter');
  }

  /**
   * Generate CSS styles for branding
   */
  generateBrandingCSS(branding: CreatorBranding): string {
    if (!branding.brandingEnabled) {
      return '';
    }

    const styles = [];

    if (branding.customPrimaryColor) {
      styles.push(`--brand-primary: ${branding.customPrimaryColor};`);
    }

    if (branding.customSecondaryColor) {
      styles.push(`--brand-secondary: ${branding.customSecondaryColor};`);
    }

    if (branding.customFont) {
      styles.push(`--brand-font: ${branding.customFont};`);
    }

    return styles.length > 0 ? `:root { ${styles.join(' ')} }` : '';
  }

  /**
   * Get branding-aware color values
   */
  getBrandColors(branding: CreatorBranding): {
    primary: string;
    secondary: string;
    font: string;
  } {
    return {
      primary: branding.brandingEnabled && branding.customPrimaryColor 
        ? branding.customPrimaryColor 
        : '#10b981',
      secondary: branding.brandingEnabled && branding.customSecondaryColor 
        ? branding.customSecondaryColor 
        : '#14b8a6',
      font: branding.brandingEnabled && branding.customFont 
        ? branding.customFont 
        : 'Inter'
    };
  }
}

export const brandingManager = new BrandingManager();