-- Create a trigger function to ensure contacts have dedup_value = 2
CREATE OR REPLACE FUNCTION set_contact_dedup_value()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.lead_type = 'Contact' THEN
        NEW.dedup_value := 2;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS ensure_contact_dedup_value ON leads;
CREATE TRIGGER ensure_contact_dedup_value
    BEFORE INSERT OR UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION set_contact_dedup_value();

-- Update existing contacts to have correct dedup_value
UPDATE leads 
SET dedup_value = 2
WHERE lead_type = 'Contact';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_leads_lead_type_dedup ON leads(lead_type, dedup_value);