-- Add foreign key constraint to unlocked_leads table
alter table unlocked_leads
add constraint fk_unlocked_leads_lead_id
foreign key (lead_id)
references leads(id)
on delete cascade;

-- Create index for the foreign key
create index if not exists idx_unlocked_leads_lead_fk on unlocked_leads(lead_id);