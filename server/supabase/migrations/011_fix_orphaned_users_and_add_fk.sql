-- Migration: Fix orphaned users and add foreign key
-- Description: Deletes users from public.users that don't exist in auth.users, and adds a FK constraint with cascade delete.

-- 1. Delete orphaned users (exist in public but not in auth)
DELETE FROM public.users
WHERE id NOT IN (SELECT id FROM auth.users);

-- 2. Add Foreign Key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_id_fkey' 
        AND table_name = 'users'
    ) THEN
        ALTER TABLE public.users
        ADD CONSTRAINT users_id_fkey
        FOREIGN KEY (id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE;
    END IF;
END $$;
