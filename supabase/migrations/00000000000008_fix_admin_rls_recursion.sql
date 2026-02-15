-- Migration: 00000000000008_fix_admin_rls_recursion
-- Fix: infinite recursion in admin RLS policies on profiles table.
-- The "Admins can manage all profiles" policy queries profiles to check role,
-- which triggers RLS on profiles again → infinite loop.
-- Solution: SECURITY DEFINER function bypasses RLS for the admin check.

-- ============================================================================
-- HELPER FUNCTION (bypasses RLS via SECURITY DEFINER)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- DROP AND RECREATE ADMIN POLICIES USING is_admin()
-- ============================================================================

-- Profiles
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- Series
DROP POLICY IF EXISTS "Admins can manage all series" ON public.series;
CREATE POLICY "Admins can manage all series"
  ON public.series FOR ALL
  USING (public.is_admin());

-- Seasons
DROP POLICY IF EXISTS "Admins can manage all seasons" ON public.seasons;
CREATE POLICY "Admins can manage all seasons"
  ON public.seasons FOR ALL
  USING (public.is_admin());

-- Episodes
DROP POLICY IF EXISTS "Admins can manage all episodes" ON public.episodes;
CREATE POLICY "Admins can manage all episodes"
  ON public.episodes FOR ALL
  USING (public.is_admin());

-- Purchases
DROP POLICY IF EXISTS "Admins can view all purchases" ON public.purchases;
CREATE POLICY "Admins can view all purchases"
  ON public.purchases FOR SELECT
  USING (public.is_admin());

-- Community posts
DROP POLICY IF EXISTS "Admins can manage all community posts" ON public.community_posts;
CREATE POLICY "Admins can manage all community posts"
  ON public.community_posts FOR ALL
  USING (public.is_admin());

-- Editorial picks (admin write policy)
DROP POLICY IF EXISTS "Admins can manage editorial picks" ON public.editorial_picks;
CREATE POLICY "Admins can manage editorial picks"
  ON public.editorial_picks FOR ALL
  USING (public.is_admin());
