-- Add topic column to leads table
alter table leads
add column if not exists topic text
generated always as (
  split_part(coalesce(keywords, ''), ',', 1)
) stored;

-- Create index for better performance
create index if not exists idx_leads_topic on leads(topic);