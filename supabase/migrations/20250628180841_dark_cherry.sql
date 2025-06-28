/*
  # Fix wallet address data types

  1. Schema Changes
    - Change `creators.id` from uuid to text to support Algorand wallet addresses
    - Change `shortlinks.wallet_address` from uuid to text to support Algorand wallet addresses
    - Update foreign key constraints accordingly
    - Preserve all existing data and relationships

  2. Security
    - Maintain existing RLS policies
    - Update policies to work with text-based wallet addresses
    - Ensure data integrity is preserved

  3. Performance
    - Maintain existing indexes
    - Update indexes to work with text columns
*/

-- First, drop the foreign key constraint that references creators.id
ALTER TABLE shortlinks DROP CONSTRAINT IF EXISTS fk_wallet_address;

-- Change creators.id from uuid to text
ALTER TABLE creators ALTER COLUMN id TYPE text;

-- Change shortlinks.wallet_address from uuid to text  
ALTER TABLE shortlinks ALTER COLUMN wallet_address TYPE text;

-- Recreate the foreign key constraint with the new text types
ALTER TABLE shortlinks 
ADD CONSTRAINT fk_wallet_address 
FOREIGN KEY (wallet_address) REFERENCES creators(id) ON DELETE CASCADE;

-- Update RLS policies to work with text-based wallet addresses
-- Note: auth.uid() returns uuid, so we need to cast it to text for comparison

-- Drop existing policies for creators table
DROP POLICY IF EXISTS "Anyone can create creator profile" ON creators;
DROP POLICY IF EXISTS "Anyone can view creators" ON creators;
DROP POLICY IF EXISTS "Creators can update own subscription data" ON creators;
DROP POLICY IF EXISTS "Pro creators can update own branding" ON creators;

-- Recreate creators policies with proper text casting
CREATE POLICY "Anyone can create creator profile"
  ON creators
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can view creators"
  ON creators
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Creators can update own subscription data"
  ON creators
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Pro creators can update own branding"
  ON creators
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (
    (is_pro = true) OR 
    ((subscription_tier = ANY (ARRAY['pro'::text, 'creator_plus'::text])) AND (subscription_status = 'active'::text))
  );

-- Drop existing policies for shortlinks table
DROP POLICY IF EXISTS "Creators can create own shortlinks" ON shortlinks;
DROP POLICY IF EXISTS "Creators can delete own shortlinks" ON shortlinks;
DROP POLICY IF EXISTS "Creators can update own shortlinks" ON shortlinks;
DROP POLICY IF EXISTS "Creators can view own shortlinks" ON shortlinks;
DROP POLICY IF EXISTS "Public can read active shortlinks" ON shortlinks;

-- Recreate shortlinks policies with proper text handling
CREATE POLICY "Creators can create own shortlinks"
  ON shortlinks
  FOR INSERT
  TO authenticated
  WITH CHECK (wallet_address = auth.uid()::text);

CREATE POLICY "Creators can delete own shortlinks"
  ON shortlinks
  FOR DELETE
  TO authenticated
  USING (wallet_address = auth.uid()::text);

CREATE POLICY "Creators can update own shortlinks"
  ON shortlinks
  FOR UPDATE
  TO authenticated
  USING (wallet_address = auth.uid()::text)
  WITH CHECK (wallet_address = auth.uid()::text);

CREATE POLICY "Creators can view own shortlinks"
  ON shortlinks
  FOR SELECT
  TO authenticated
  USING (wallet_address = auth.uid()::text);

CREATE POLICY "Public can read active shortlinks"
  ON shortlinks
  FOR SELECT
  TO public
  USING (is_active = true);

-- Update tips table policies to handle text wallet addresses
-- Drop existing policies for tips table
DROP POLICY IF EXISTS "Delete own tips" ON tips;
DROP POLICY IF EXISTS "Insert tips" ON tips;
DROP POLICY IF EXISTS "Select own tips" ON tips;
DROP POLICY IF EXISTS "Update own tips" ON tips;

-- Recreate tips policies with proper text casting
CREATE POLICY "Delete own tips"
  ON tips
  FOR DELETE
  TO authenticated
  USING (wallet = auth.uid()::text);

CREATE POLICY "Insert tips"
  ON tips
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Select own tips"
  ON tips
  FOR SELECT
  TO authenticated
  USING (wallet = auth.uid()::text);

CREATE POLICY "Update own tips"
  ON tips
  FOR UPDATE
  TO authenticated
  USING (wallet = auth.uid()::text)
  WITH CHECK (wallet = auth.uid()::text);

-- Add validation constraint for Algorand wallet addresses (58 characters, base32)
ALTER TABLE creators 
ADD CONSTRAINT valid_algorand_address 
CHECK (length(id) = 58 AND id ~ '^[A-Z2-7]+$');

ALTER TABLE shortlinks 
ADD CONSTRAINT valid_algorand_wallet_address 
CHECK (length(wallet_address) = 58 AND wallet_address ~ '^[A-Z2-7]+$');

-- Update the increment_shortlink_clicks function if it exists
CREATE OR REPLACE FUNCTION increment_shortlink_clicks(shortlink_slug text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE shortlinks 
  SET click_count = click_count + 1 
  WHERE slug = shortlink_slug AND is_active = true;
END;
$$;