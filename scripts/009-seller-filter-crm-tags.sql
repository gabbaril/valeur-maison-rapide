-- Add CRM tagging fields for seller filter form
-- Migration for transforming evaluation form into seller filter

-- CRM Tagging fields
ALTER TABLE leads ADD COLUMN IF NOT EXISTS niveau_intention TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ouverture_courtier TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS horizon_vente TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS souhaite_contact BOOLEAN;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS consent_courtier BOOLEAN;

-- Create indexes for CRM tag filtering
CREATE INDEX IF NOT EXISTS idx_leads_niveau_intention ON leads(niveau_intention);
CREATE INDEX IF NOT EXISTS idx_leads_ouverture_courtier ON leads(ouverture_courtier);
CREATE INDEX IF NOT EXISTS idx_leads_horizon_vente ON leads(horizon_vente);
CREATE INDEX IF NOT EXISTS idx_leads_souhaite_contact ON leads(souhaite_contact);
