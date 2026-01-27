-- Add CRM tagging fields for seller filter form
-- Migration for transforming evaluation form into seller filter

-- CRM Tagging fields
ALTER TABLE leads ADD COLUMN IF NOT EXISTS open_to_broker TEXT;

-- Create indexes for CRM tag filtering
CREATE INDEX IF NOT EXISTS idx_leads_open_to_broker ON leads(open_to_broker);
