-- Migration: Fix RLS recursion with is_admin function
-- Description: Creates a security definer function to check admin status safely.

-- 1. Create is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update Policies to use is_admin()
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
CREATE POLICY "Admins can view all profiles"
ON public.users
FOR SELECT
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.users;
CREATE POLICY "Admins can update all profiles"
ON public.users
FOR UPDATE
USING (public.is_admin());
