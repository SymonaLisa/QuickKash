/*
  # Create shortlinks table for custom creator URLs

  1. New Tables
    - `shortlinks`
      - `slug` (text, primary key) - The custom short URL slug (e.g., "alice", "bob")
      - `wallet_address` (uuid, not null) - The creator's wallet address (matches `creators.id`)
      - `created_at` (timestamp) - When the shortlink was created
      - `is_active` (boolean) - Whether the shortlink is active
      - `click_count` (integer) - Number of times the shortlink has been used

  2. Security
    - Enable RLS on `shortlinks` table
    - Add policy for public read access to active shortlinks
    - Add policy for authenticated creators to manage their own shortlinks

  3. Constraints
    - Unique slug constraint
    - Slug format validation (alphanumeric, 3-20 characters)
    - Foreign key reference to creators table
*/

-- Create shortlinks table
CREATE TABLE IF NOT EXISTS shortlinks (
  slug text PRIMARY KEY,
  wallet_address uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  click_count integer DEFAULT 0,
  CONSTRAINT valid_slug CHECK (slug ~ '^[a-zA-Z0-9_-]{3,20}$'),
  CONSTRAINT fk_wallet_address FOREIGN KEY (wallet_address) REFERENCES creators(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE shortlinks ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shortlinks_wallet_address ON shortlinks(wallet_address);
CREATE INDEX IF NOT EXISTS idx_shortlinks_active ON shortlinks(is_active) WHERE is_active = true;

-- RLS Policies

-- Allow public read access to active shortlinks (e.g., for redirects)
CREATE POLICY "Public can read active shortlinks"
  ON shortlinks
  FOR SELECT
  TO public
  USING (is_active = true);

-- Allow authenticated users to view their own shortlinks
CREATE POLICY "Creators can view own shortlinks"
  ON shortlinks
  FOR SELECT
  TO authenticated
  USING (wallet_address = auth.uid());

-- Allow authenticated users to create shortlinks for themselves
CREATE POLICY "Creators can create own shortlinks"
  ON shortlinks
  FOR INSERT
  TO authenticated
  WITH CHECK (wallet_address = auth.uid());

-- Allow authenticated users to update their own shortlinks
CREATE POLICY "Creators can update own shortlinks"
  ON shortlinks
  FOR UPDATE
  TO authenticated
  USING (wallet_address = auth.uid())
  WITH CHECK (wallet_address = auth.uid());

-- Allow authenticated users to delete their own shortlinks
CREATE POLICY "Creators can delete own shortlinks"
  ON shortlinks
  FOR DELETE
  TO authenticated
  USING (wallet_address = auth.uid());

-- Create function to increment click count
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

-- Grant public execute permission on the function
GRANT EXECUTE ON FUNCTION increment_shortlink_clicks(text) TO public;
