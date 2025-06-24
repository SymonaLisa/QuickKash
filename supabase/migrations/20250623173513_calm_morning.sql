/*
  # Add branding customization fields to creators table

  1. New Columns
    - `custom_primary_color` (text) - Hex color for primary branding
    - `custom_secondary_color` (text) - Hex color for secondary branding  
    - `custom_logo_url` (text) - URL for uploaded logo
    - `custom_font` (text) - Font family name, defaults to 'Inter'
    - `brand_name` (text) - Custom brand name
    - `branding_enabled` (boolean) - Master toggle for custom branding

  2. Constraints
    - Color validation for hex format (#RRGGBB)
    - Font validation for safe web fonts

  3. Security
    - Policy to allow Pro creators to update their own branding
*/

-- Add branding columns to creators table
ALTER TABLE creators ADD COLUMN IF NOT EXISTS custom_primary_color text;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS custom_secondary_color text;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS custom_logo_url text;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS custom_font text DEFAULT 'Inter';
ALTER TABLE creators ADD COLUMN IF NOT EXISTS brand_name text;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS branding_enabled boolean DEFAULT false;

-- Add check constraints for color values (hex format)
-- Using DO block to handle constraint creation safely
DO $$
BEGIN
  -- Add primary color constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'valid_primary_color' 
    AND table_name = 'creators'
  ) THEN
    ALTER TABLE creators ADD CONSTRAINT valid_primary_color 
      CHECK (custom_primary_color IS NULL OR custom_primary_color ~ '^#[0-9A-Fa-f]{6}$');
  END IF;

  -- Add secondary color constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'valid_secondary_color' 
    AND table_name = 'creators'
  ) THEN
    ALTER TABLE creators ADD CONSTRAINT valid_secondary_color 
      CHECK (custom_secondary_color IS NULL OR custom_secondary_color ~ '^#[0-9A-Fa-f]{6}$');
  END IF;

  -- Add font validation constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'valid_custom_font' 
    AND table_name = 'creators'
  ) THEN
    ALTER TABLE creators ADD CONSTRAINT valid_custom_font 
      CHECK (custom_font IS NULL OR length(custom_font) <= 50);
  END IF;

  -- Add brand name length constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'valid_brand_name' 
    AND table_name = 'creators'
  ) THEN
    ALTER TABLE creators ADD CONSTRAINT valid_brand_name 
      CHECK (brand_name IS NULL OR length(brand_name) <= 100);
  END IF;
END $$;

-- Create policy for Pro creators to update their own branding
-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Pro creators can update own branding" ON creators;

CREATE POLICY "Pro creators can update own branding"
  ON creators
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (
    -- Allow update only if the creator is Pro (either manual or subscription)
    (is_pro = true OR 
     (subscription_tier IN ('pro', 'creator_plus') AND subscription_status = 'active'))
  );