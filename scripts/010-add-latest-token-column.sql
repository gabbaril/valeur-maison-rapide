-- Add latest_token column to leads table
-- This column stores the most recent token from lead_access_tokens for quick access

-- Step 1: Add the column
ALTER TABLE leads ADD COLUMN IF NOT EXISTS latest_token TEXT;

-- Step 2: Create index for the new column
CREATE INDEX IF NOT EXISTS idx_leads_latest_token ON leads(latest_token);

-- Step 3: Populate existing leads with their latest token
UPDATE leads l
SET latest_token = (
  SELECT token
  FROM lead_access_tokens lat
  WHERE lat.lead_id = l.id
  ORDER BY lat.created_at DESC
  LIMIT 1
);

-- Step 4: Create a trigger function to auto-update latest_token when a new token is inserted
CREATE OR REPLACE FUNCTION update_lead_latest_token()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE leads
  SET latest_token = NEW.token
  WHERE id = NEW.lead_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create the trigger on lead_access_tokens
DROP TRIGGER IF EXISTS trigger_update_lead_latest_token ON lead_access_tokens;
CREATE TRIGGER trigger_update_lead_latest_token
  AFTER INSERT ON lead_access_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_latest_token();
