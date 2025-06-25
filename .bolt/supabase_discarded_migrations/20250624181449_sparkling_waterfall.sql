/*
  # Create shortlinks table for custom creator URLs

  1. New Tables
    - `shortlinks`
      - `slug` (text, primary key) - The custom shortlink slug (e.g., "alice")
      - `wallet_address` (text, foreign key) - References creators.id (wallet address)
      - `created_at` (timestamp) - When the shortlink was created
      - `is_active` (boolean) - Whether the shortlink is active
      - `click_count` (integer) - Number of times the shortlink has been clicked

  2. Security
    - Enable RLS on `shortlinks` table
    - Add policies for public read access to active shortlinks
    - Add policies for creators to manage their own shortlinks

  3. Functions
    - Create function to increment click count atomically
*/

-- Create shortlinks table
CREATE TABLE IF NOT EXISTS shortlinks (
  slug text PRIMARY KEY,
  wallet_address text NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  click_count integer DEFAULT 0
);

-- Add constraints
ALTER TABLE shortlinks ADD CONSTRAINT valid_slug 
  CHECK (slug ~ '^[a-zA-Z0-9_-]{3,20}$');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shortlinks_wallet_address ON shortlinks(wallet_address);
CREATE INDEX IF NOT EXISTS idx_shortlinks_active ON shortlinks(is_active) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE shortlinks ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active shortlinks (needed for redirect functionality)
CREATE POLICY "Anyone can read active shortlinks"
  ON shortlinks
  FOR SELECT
  TO public
  USING (is_active = true);

-- Policy: Creators can view all their own shortlinks
CREATE POLICY "Creators can view own shortlinks"
  ON shortlinks
  FOR SELECT
  TO public
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Creators can create shortlinks for themselves
CREATE POLICY "Creators can create own shortlinks"
  ON shortlinks
  FOR INSERT
  TO public
  WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Creators can update their own shortlinks
CREATE POLICY "Creators can update own shortlinks"
  ON shortlinks
  FOR UPDATE
  TO public
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Creators can delete their own shortlinks
CREATE POLICY "Creators can delete own shortlinks"
  ON shortlinks
  FOR DELETE
  TO public
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'sub');

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