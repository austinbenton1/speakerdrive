-- Add event_format column to leads table
alter table leads
add column if not exists event_format text;
