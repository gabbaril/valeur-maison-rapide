-- Add CRM tagging fields for seller filter form
-- Migration for transforming evaluation form into seller filter

-- CRM Tagging fields
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ouverture_courtier TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS horizon_vente TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS consent_courtier BOOLEAN;

-- Create indexes for CRM tag filtering
CREATE INDEX IF NOT EXISTS idx_leads_ouverture_courtier ON leads(ouverture_courtier);
CREATE INDEX IF NOT EXISTS idx_leads_horizon_vente ON leads(horizon_vente);
