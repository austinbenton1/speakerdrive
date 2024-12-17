-- Create requested_leads table
CREATE TABLE IF NOT EXISTS requested_leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  lead TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  status TEXT DEFAULT 'pending'
);

-- Enable RLS
ALTER TABLE requested_leads ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own requests
CREATE POLICY "Users can insert their own requests"
ON requested_leads FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own requests
CREATE POLICY "Users can view their own requests"
ON requested_leads FOR SELECT
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_requested_leads_user_id ON requested_leads(user_id);
CREATE INDEX idx_requested_leads_status ON requested_leads(status);