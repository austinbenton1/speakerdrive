-- Create unlocked_leads table
create table if not exists unlocked_leads (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  lead_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, lead_id)
);

-- Enable RLS
alter table unlocked_leads enable row level security;

-- Allow users to insert their own unlocks
create policy "Users can insert their own unlocks"
on unlocked_leads for insert
with check (auth.uid() = user_id);

-- Allow users to view their own unlocks
create policy "Users can view their own unlocks"
on unlocked_leads for select
using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists idx_unlocked_leads_user_id on unlocked_leads(user_id);
create index if not exists idx_unlocked_leads_lead_id on unlocked_leads(lead_id);
create index if not exists idx_unlocked_leads_user_lead on unlocked_leads(user_id, lead_id);