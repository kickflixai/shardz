-- Migration: 00000000000004_creator_dashboard
-- Phase 6: Creator Dashboard - New tables, altered columns, storage bucket
-- Creates: creator_applications, community_posts, poll_votes, followers
-- Alters: seasons (release_strategy, drip_interval_days, sort_order),
--         episodes (sort_order, content_warnings, release_date),
--         profiles (social_links, follower_count)

-- ============================================================================
-- CREATOR APPLICATIONS
-- ============================================================================

CREATE TABLE public.creator_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) UNIQUE,
  display_name TEXT NOT NULL,
  bio TEXT NOT NULL,
  portfolio_url TEXT,
  portfolio_description TEXT NOT NULL,
  sample_video_urls TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.creator_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own application"
  ON public.creator_applications FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own application"
  ON public.creator_applications FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Admins can manage all applications"
  ON public.creator_applications FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
  );

CREATE TRIGGER creator_applications_updated_at
  BEFORE UPDATE ON public.creator_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_applications_status ON public.creator_applications(status);
CREATE INDEX idx_applications_user ON public.creator_applications(user_id);

-- ============================================================================
-- SEASONS: RELEASE STRATEGY + SORT ORDER
-- ============================================================================

ALTER TABLE public.seasons
  ADD COLUMN release_strategy TEXT NOT NULL DEFAULT 'all_at_once'
    CHECK (release_strategy IN ('all_at_once', 'drip')),
  ADD COLUMN drip_interval_days INTEGER DEFAULT 7
    CHECK (drip_interval_days IS NULL OR (drip_interval_days >= 1 AND drip_interval_days <= 30)),
  ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

-- ============================================================================
-- EPISODES: SORT ORDER + CONTENT WARNINGS + RELEASE DATE
-- ============================================================================

ALTER TABLE public.episodes
  ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN content_warnings TEXT,
  ADD COLUMN release_date TIMESTAMPTZ;

-- ============================================================================
-- PROFILES: SOCIAL LINKS + FOLLOWER COUNT
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN social_links JSONB DEFAULT '{}',
  ADD COLUMN follower_count INTEGER NOT NULL DEFAULT 0;

-- ============================================================================
-- COMMUNITY POSTS
-- ============================================================================

CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL CHECK (char_length(content) <= 1000),
  post_type TEXT NOT NULL DEFAULT 'discussion'
    CHECK (post_type IN ('discussion', 'poll', 'announcement')),
  poll_options JSONB,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community posts are publicly readable"
  ON public.community_posts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON public.community_posts FOR INSERT
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "Authors can update own posts"
  ON public.community_posts FOR UPDATE
  USING ((SELECT auth.uid()) = author_id);

CREATE POLICY "Authors and series creators can delete posts"
  ON public.community_posts FOR DELETE
  USING (
    (SELECT auth.uid()) = author_id OR
    EXISTS (
      SELECT 1 FROM public.series
      WHERE id = series_id AND creator_id = (SELECT auth.uid())
    )
  );

CREATE TRIGGER community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_community_posts_series ON public.community_posts(series_id);
CREATE INDEX idx_community_posts_author ON public.community_posts(author_id);

-- ============================================================================
-- POLL VOTES
-- ============================================================================

CREATE TABLE public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  option_index INTEGER NOT NULL CHECK (option_index >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Votes are publicly readable"
  ON public.poll_votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote"
  ON public.poll_votes FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE INDEX idx_poll_votes_post ON public.poll_votes(post_id);

-- ============================================================================
-- FOLLOWERS TABLE
-- ============================================================================

CREATE TABLE public.followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (follower_id, creator_id)
);

ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Follows are publicly readable"
  ON public.followers FOR SELECT
  USING (true);

CREATE POLICY "Users can follow creators"
  ON public.followers FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = follower_id);

CREATE POLICY "Users can unfollow"
  ON public.followers FOR DELETE
  USING ((SELECT auth.uid()) = follower_id);

CREATE INDEX idx_followers_creator ON public.followers(creator_id);
CREATE INDEX idx_followers_follower ON public.followers(follower_id);

-- ============================================================================
-- FOLLOWER COUNT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles
    SET follower_count = follower_count + 1
    WHERE id = NEW.creator_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles
    SET follower_count = follower_count - 1
    WHERE id = OLD.creator_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER followers_count_insert
  AFTER INSERT ON public.followers
  FOR EACH ROW EXECUTE FUNCTION update_follower_count();

CREATE TRIGGER followers_count_delete
  AFTER DELETE ON public.followers
  FOR EACH ROW EXECUTE FUNCTION update_follower_count();

-- ============================================================================
-- STORAGE BUCKET FOR THUMBNAILS
-- ============================================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('thumbnails', 'thumbnails', true);

CREATE POLICY "Creators can upload thumbnails"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'thumbnails' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Creators can update own thumbnails"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Creators can delete own thumbnails"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Thumbnails are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'thumbnails');
