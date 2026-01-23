-- Migration: Create evaluation_income_property table
-- This table stores evaluation data specific to income properties (immeubles à revenus)

CREATE TABLE IF NOT EXISTS evaluation_income_property (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  
  -- Informations sur l'immeuble (Étape 1)
  units_count INTEGER,
  occupation_type TEXT, -- 'proprietaire-occupant', '100-loue', 'partiellement-loue'
  
  -- Revenus locatifs (pour 4 logements et moins)
  rent_unit_1 TEXT,
  rent_unit_2 TEXT,
  rent_unit_3 TEXT,
  rent_unit_4 TEXT,
  
  -- Revenus locatifs (pour 5+ logements)
  gross_monthly_revenue TEXT,
  rented_units_count INTEGER,
  
  -- Inclus dans les loyers
  rent_includes_heating BOOLEAN DEFAULT FALSE,
  rent_includes_electricity BOOLEAN DEFAULT FALSE,
  rent_includes_internet BOOLEAN DEFAULT FALSE,
  rent_includes_other BOOLEAN DEFAULT FALSE,
  rent_includes_other_details TEXT,
  
  -- Baux
  has_active_leases TEXT, -- 'oui', 'non'
  lease_renewal_date TEXT,
  
  -- Caractéristiques
  parking_info TEXT,
  basement_info TEXT,
  recent_renovations TEXT, -- 'oui', 'non', 'ne-sais-pas'
  renovations_details TEXT,
  
  -- Objectif et contexte (Étape 2)
  evaluation_reason TEXT,
  sale_planned TEXT, -- 'oui-certainement', 'possiblement', 'non-curiosite', 'ne-sais-pas'
  sale_horizon TEXT, -- '3-mois', '6-mois-1-an', 'plus-1-an', 'selon-opportunites'
  owner_estimated_value TEXT,
  
  -- Dépenses annuelles
  municipal_taxes TEXT,
  school_taxes TEXT,
  insurance TEXT,
  snow_maintenance TEXT,
  utilities_if_owner_paid TEXT,
  
  -- Notes
  important_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one evaluation per lead
  CONSTRAINT unique_income_property_per_lead UNIQUE (lead_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_evaluation_income_property_lead_id ON evaluation_income_property(lead_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_income_property_created_at ON evaluation_income_property(created_at DESC);

-- Create updated_at trigger
CREATE TRIGGER update_evaluation_income_property_updated_at
  BEFORE UPDATE ON evaluation_income_property
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE evaluation_income_property ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role can do everything on evaluation_income_property"
  ON evaluation_income_property
  FOR ALL
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE evaluation_income_property IS 'Stores evaluation form data for income properties (immeubles à revenus)';
