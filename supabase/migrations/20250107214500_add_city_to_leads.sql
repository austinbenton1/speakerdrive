-- Add city column to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS city text;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_leads_city ON leads(city);
