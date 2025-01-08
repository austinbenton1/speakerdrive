-- Add keywords column to leads table
alter table leads
add column if not exists keywords text;
