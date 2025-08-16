-- Fix foreign key constraints to reference auth.users instead of profiles
-- for tables that use auth.uid() in RLS policies

-- Drop existing foreign key constraints
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_user_id_fkey;
ALTER TABLE shopping_lists DROP CONSTRAINT IF EXISTS shopping_lists_user_id_fkey;

-- Add new foreign key constraints referencing auth.users
ALTER TABLE meal_plans 
ADD CONSTRAINT meal_plans_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE shopping_lists 
ADD CONSTRAINT shopping_lists_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;