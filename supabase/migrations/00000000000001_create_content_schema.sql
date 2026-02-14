-- MicroShort Content Hierarchy Schema
-- Migration: 00000000000001_create_content_schema
-- Creates: Series > Seasons > Episodes content hierarchy with profiles
-- Business rules enforced at database level via CHECK constraints and triggers

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Genres enum for consistent categorization
CREATE TYPE genre AS ENUM (
  'drama', 'comedy', 'thriller', 'sci-fi', 'horror',
  'romance', 'action', 'documentary', 'behind-the-scenes',
  'music', 'sports'
);

-- Content status workflow
CREATE TYPE content_status AS ENUM (
  'draft', 'processing', 'ready', 'published', 'archived'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Series: top-level content entity
CREATE TABLE public.series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  genre genre NOT NULL,
  thumbnail_url TEXT,
  trailer_url TEXT,
  creator_id UUID NOT NULL,  -- FK added after profiles table exists
  status content_status NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seasons: ordered groupings within a series
CREATE TABLE public.seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL,
  title TEXT,
  description TEXT,
  price_cents INTEGER,  -- creator-set price (NULL = free)
  status content_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Enforce unique season numbers within a series
  UNIQUE (series_id, season_number),

  -- Price must be positive if set
  CHECK (price_cents IS NULL OR price_cents > 0)
);

-- Episodes: individual video content
CREATE TABLE public.episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_seconds INTEGER,  -- set by Mux webhook when asset is ready
  mux_asset_id TEXT,
  mux_playback_id TEXT,
  thumbnail_url TEXT,
  subtitle_url TEXT,          -- WebVTT file URL
  status content_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Enforce unique episode numbers within a season
  UNIQUE (season_id, episode_number),

  -- Episodes must be 1-3 minutes (60-180 seconds) when duration is known
  CHECK (duration_seconds IS NULL OR (duration_seconds >= 60 AND duration_seconds <= 180))
);

-- Profiles: user accounts (extends Supabase Auth)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'creator', 'admin')),
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- FOREIGN KEYS (added after dependent tables exist)
-- ============================================================================

-- Add foreign key for series.creator_id now that profiles exists
ALTER TABLE public.series
  ADD CONSTRAINT fk_series_creator
  FOREIGN KEY (creator_id) REFERENCES public.profiles(id);

-- ============================================================================
-- TRIGGER FUNCTIONS
-- ============================================================================

-- Season episode count enforcement via trigger
-- (8-70 episodes per season -- enforced on publish, not on insert)
CREATE OR REPLACE FUNCTION check_season_episode_count()
RETURNS TRIGGER AS $$
DECLARE
  episode_count INTEGER;
BEGIN
  IF NEW.status = 'published' THEN
    SELECT COUNT(*) INTO episode_count
    FROM public.episodes
    WHERE season_id = NEW.id AND status = 'published';

    IF episode_count < 8 OR episode_count > 70 THEN
      RAISE EXCEPTION 'Published seasons must have 8-70 published episodes (found %)', episode_count;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_season_episode_count
  BEFORE UPDATE ON public.seasons
  FOR EACH ROW
  WHEN (NEW.status = 'published')
  EXECUTE FUNCTION check_season_episode_count();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all content tables
CREATE TRIGGER series_updated_at BEFORE UPDATE ON public.series
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER seasons_updated_at BEFORE UPDATE ON public.seasons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER episodes_updated_at BEFORE UPDATE ON public.episodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all content tables
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Published series are visible to everyone"
  ON public.series FOR SELECT
  USING (status = 'published');

CREATE POLICY "Published seasons are visible to everyone"
  ON public.seasons FOR SELECT
  USING (status = 'published');

CREATE POLICY "Published episodes are visible to everyone"
  ON public.episodes FOR SELECT
  USING (status = 'published');

CREATE POLICY "Profiles are visible to everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Creators can manage their own series
CREATE POLICY "Creators can manage own series"
  ON public.series FOR ALL
  USING ((SELECT auth.uid()) = creator_id);

-- Creators can manage seasons/episodes in their series
CREATE POLICY "Creators can manage own seasons"
  ON public.seasons FOR ALL
  USING (
    series_id IN (
      SELECT id FROM public.series WHERE creator_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Creators can manage own episodes"
  ON public.episodes FOR ALL
  USING (
    season_id IN (
      SELECT s.id FROM public.seasons s
      JOIN public.series sr ON s.series_id = sr.id
      WHERE sr.creator_id = (SELECT auth.uid())
    )
  );

-- Users can manage their own profile
CREATE POLICY "Users can manage own profile"
  ON public.profiles FOR ALL
  USING ((SELECT auth.uid()) = id);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_series_genre ON public.series(genre) WHERE status = 'published';
CREATE INDEX idx_series_creator ON public.series(creator_id);
CREATE INDEX idx_series_featured ON public.series(is_featured) WHERE status = 'published';
CREATE INDEX idx_seasons_series ON public.seasons(series_id);
CREATE INDEX idx_episodes_season ON public.episodes(season_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
