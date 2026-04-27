-- Fix the default role value in profiles table

-- Update the default value to 'sales_rep' instead of 'user'
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'sales_rep';

-- Update any existing profiles that might have 'user' role
UPDATE profiles SET role = 'admin' WHERE role = 'user' OR role IS NULL;