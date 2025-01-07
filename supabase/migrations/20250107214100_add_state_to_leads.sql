-- Add state column to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS state text;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_leads_state ON leads(state);
