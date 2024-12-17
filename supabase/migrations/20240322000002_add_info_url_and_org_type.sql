-- Add info_url and organization_type columns to leads table
alter table leads
add column if not exists info_url text,
add column if not exists organization_type text;

-- Create indexes for better performance
create index if not exists idx_leads_organization_type on leads(organization_type);
