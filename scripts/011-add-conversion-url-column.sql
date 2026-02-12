-- Add conversion_url column to track the exact page where lead converted
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS conversion_url TEXT;

CREATE INDEX IF NOT EXISTS idx_leads_conversion_url ON leads(conversion_url);
