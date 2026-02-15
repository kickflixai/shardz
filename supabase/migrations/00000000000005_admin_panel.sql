-- Migration: 00000000000005_admin_panel
-- Phase 7: Admin Panel - Featured sort order, editorial picks, admin RLS policies

-- ============================================================================
-- SCHEMA CHANGES
-- ============================================================================

-- Featured series sort order for homepage curation
ALTER TABLE public.series
  ADD COLUMN featured_sort_order INTEGER DEFAULT 0;

-- ============================================================================
-- EDITORIAL PICKS TABLE
-- ============================================================================

-- Curated collections for homepage sections
CREATE TABLE public.editorial_picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  section TEXT NOT NULL DEFAULT 'featured'
    CHECK (section IN ('featured', 'trending', 'new_releases', 'staff_picks')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  added_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (series_id, section)
);

ALTER TABLE public.editorial_picks ENABLE ROW LEVEL SECURITY;

-- Public can read editorial picks
CREATE POLICY "Editorial picks are publicly readable"
  ON public.editorial_picks FOR SELECT
  USING (true);

-- Admins can manage editorial picks
CREATE POLICY "Admins can manage editorial picks"
  ON public.editorial_picks FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
  );

CREATE INDEX idx_editorial_picks_section ON public.editorial_picks(section, sort_order);

-- ============================================================================
-- ADMIN RLS POLICIES (defense-in-depth)
-- ============================================================================
-- Note: The admin panel primarily uses createAdminClient() which bypasses RLS,
-- but these policies provide defense-in-depth for any regular client usage.

CREATE POLICY "Admins can manage all series"
  ON public.series FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
  );

CREATE POLICY "Admins can manage all seasons"
  ON public.seasons FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
  );

CREATE POLICY "Admins can manage all episodes"
  ON public.episodes FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
  );

CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
  );

CREATE POLICY "Admins can view all purchases"
  ON public.purchases FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
  );

CREATE POLICY "Admins can manage all community posts"
  ON public.community_posts FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
  );
