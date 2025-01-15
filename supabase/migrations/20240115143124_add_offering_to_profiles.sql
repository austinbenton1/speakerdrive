-- Add offering column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS offering TEXT;
