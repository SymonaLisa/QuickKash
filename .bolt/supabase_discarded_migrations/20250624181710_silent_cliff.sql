/*
  # Fix shortlinks table with correct UUID foreign key

  1. New Tables
    - `shortlinks`
      - `slug` (text, primary key) - The custom shortlink slug
      - `wallet_address` (uuid) - Foreign key to creators.id
      - `created_at` (timestamp)
      - `is_active` (boolean) - Enable/disable shortlinks
      - `click_count` (integer) - Track analytics

  2. Security
    - Enable RLS on `shortlinks` table
    - Add policies for public read access to active shortlinks
    - Add policies for creators to manage their own shortlinks

  3. Functions
    - `increment_shortlink_clicks` - Atomic click counting
*/

-- Drop existing table if it exists (to fix the type mismatch)
DROP TABLE IF EXISTS shortlinks CASCADE;

-- Create shortlinks table with correct UUID type
CREATE TABLE IF NOT EXISTS shortlinks (
  slug text PRIMARY KEY,
  wallet_address uuid NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  click_count integer DEFAULT 0
);

-- Add slug format constraint (3 to 20 characters, alphanumeric, underscore, dash)
ALTER TABLE shortlinks
  ADD CONSTRAINT valid_slug CHECK (slug ~ '^[a-zA-Z0-9_-]{3,20}$');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shortlinks_wallet_address ON shortlinks(wallet_address);
CREATE INDEX IF NOT EXISTS idx_shortlinks_active ON shortlinks(is_active) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE shortlinks ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active shortlinks (for redirects)
CREATE POLICY "Anyone can read active shortlinks"
  ON shortlinks
  FOR SELECT
  TO public
  USING (is_active = true);

-- Policy: Creators can view their own shortlinks
CREATE POLICY "Creators can view own shortlinks"
  ON shortlinks
  FOR SELECT
  TO public
  USING (wallet_address::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Creators can create their own shortlinks
CREATE POLICY "Creators can create own shortlinks"
  ON shortlinks
  FOR INSERT
  TO public
  WITH CHECK (wallet_address::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Creators can update their own shortlinks
CREATE POLICY "Creators can update own shortlinks"
  ON shortlinks
  FOR UPDATE
  TO public
  USING (wallet_address::text = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (wallet_address::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Creators can delete their own shortlinks
CREATE POLICY "Creators can delete own shortlinks"
  ON shortlinks
  FOR DELETE
  TO public
  USING (wallet_address::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Function to increment click count atomically
CREATE OR REPLACE FUNCTION increment_shortlink_clicks(shortlink_slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE shortlinks
  SET click_count = click_count + 1
  WHERE slug = shortlink_slug AND is_active = true;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION increment_shortlink_clicks(text) TO public;
