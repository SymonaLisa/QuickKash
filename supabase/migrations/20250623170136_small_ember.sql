/*
  # Add is_pro field to creators table

  1. Changes
    - Add `is_pro` boolean field to `creators` table with default value `false`
    - This field will be used to manually toggle premium features like custom branding
    - Allows for manual control over premium access independent of RevenueCat subscriptions

  2. Security
    - Field is added with proper default value
    - Existing RLS policies will continue to work
    - Manual toggle capability for admin control

  3. Usage
    - Set `is_pro = true` to unlock premium features for specific users
    - Can be used alongside or instead of RevenueCat subscription checks
    - Provides flexibility for promotional access, testing, or manual upgrades
*/

-- Add is_pro field to creators table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creators' AND column_name = 'is_pro'
  ) THEN
    ALTER TABLE creators ADD COLUMN is_pro boolean DEFAULT false;
  END IF;
END $$;

-- Add comment to document the field purpose
COMMENT ON COLUMN creators.is_pro IS 'Manual toggle for premium features like custom branding. Can be set independently of subscription status.';