-- Migration: Enable RLS and add RBAC policies
-- Description: Secures the users table and enforces role-based access.

-- 1. Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Policy: Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
USING (auth.uid() = id);

-- 3. Policy: Admins can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
CREATE POLICY "Admins can view all profiles"
ON public.users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 4. Policy: Admins can update all profiles (e.g. promoting users)
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.users;
CREATE POLICY "Admins can update all profiles"
ON public.users
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 5. Policy: Authenticated users can update certain fields of their own profile (optional, e.g. avatar, name)
-- RESTRICTED: Users CANNOT update their role or balance.
-- For now, we'll keep it simple and handle profile updates via specific admin functions or separate policies if needed.
-- But we MUST ensure users cannot update their own role.
-- Using a separate policy for self-update if needed in future.

-- 6. Ensure handle_new_user trigger bypasses RLS (It is already SECURITY DEFINER, so this is fine)
