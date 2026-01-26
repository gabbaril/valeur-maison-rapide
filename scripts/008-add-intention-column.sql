-- Add intention column to leads table
-- This column stores the lead's intention (e.g., "sell", "buy", etc.)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS intention TEXT;

-- Create index for better performance when filtering by intention
CREATE INDEX IF NOT EXISTS idx_leads_intention ON leads(intention);
