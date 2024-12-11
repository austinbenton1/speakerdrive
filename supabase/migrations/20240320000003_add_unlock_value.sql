-- Add unlock_value column to leads table
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS unlock_value TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_unlock_value ON leads(unlock_value);