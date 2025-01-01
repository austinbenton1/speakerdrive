-- Add subtext column to leads table
alter table leads
add column if not exists subtext text;

-- Create index for better performance
create index if not exists idx_leads_subtext on leads(subtext);