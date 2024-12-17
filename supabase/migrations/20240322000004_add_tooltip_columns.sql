-- Add tooltip columns to leads table
alter table leads
add column if not exists tooltip_location text,
add column if not exists tooltip_industry_category text,
add column if not exists tooltip_event_format text,
add column if not exists tooltip_organization text,
add column if not exists tooltip_organization_type text;
