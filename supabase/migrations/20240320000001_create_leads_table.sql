-- Create leads table
create table if not exists leads (
  id text primary key,
  lead_name text not null,
  focus text,
  industry text,
  image_url text,
  lead_type text,
  unlock_type text,
  domain_type text,
  organization text,
  event_info text,
  event_name text,
  location text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table leads enable row level security;

-- Allow all authenticated users to view leads
create policy "Anyone can view leads"
on leads for select
using (true);

-- Create indexes for better performance
create index if not exists idx_leads_lead_name on leads(lead_name);
create index if not exists idx_leads_industry on leads(industry);
create index if not exists idx_leads_focus on leads(focus);