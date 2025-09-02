-- First, let's drop the existing foreign key constraint that's causing the issue
ALTER TABLE public.recipes DROP CONSTRAINT IF EXISTS recipes_created_by_fkey;

-- Now add the correct foreign key constraint that references auth.users directly
-- This is the recommended approach since auth.users is the primary source of user data
ALTER TABLE public.recipes 
ADD CONSTRAINT recipes_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Also ensure that when we create recipes, we're using the authenticated user's ID
-- Update any existing recipes that might have invalid created_by values
UPDATE public.recipes 
SET created_by = NULL 
WHERE created_by IS NOT NULL 
AND created_by NOT IN (SELECT id FROM auth.users);