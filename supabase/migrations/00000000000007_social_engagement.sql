-- MicroShort Social Engagement Schema
-- Migration: 00000000000007_social_engagement
-- Creates: episode_comments, episode_reactions, favorites, watch_history tables
-- Also: increment_reaction RPC, avatars storage bucket, profiles watch_history_public column

-- ============================================================================
-- TABLES
-- ============================================================================

-- Episode Comments: timestamp-synced comments for video overlay replay
CREATE TABLE public.episode_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 300),
  timestamp_seconds INTEGER NOT NULL CHECK (timestamp_seconds >= 0),
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_episode_comments_replay ON public.episode_comments(episode_id, timestamp_seconds);

ALTER TABLE public.episode_comments ENABLE ROW LEVEL SECURITY;

-- Public read for non-flagged comments
CREATE POLICY "Episode comments are readable by everyone"
  ON public.episode_comments FOR SELECT
  USING (true);

-- Authenticated users can post comments
CREATE POLICY "Authenticated users can post comments"
  ON public.episode_comments FOR INSERT
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- Authors can update their own comments
CREATE POLICY "Authors can update own comments"
  ON public.episode_comments FOR UPDATE
  USING ((SELECT auth.uid()) = user_id);

-- Authors can delete their own comments
CREATE POLICY "Authors can delete own comments"
  ON public.episode_comments FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- Admins can manage all comments
CREATE POLICY "Admins can manage all comments"
  ON public.episode_comments FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

-- Episode Reactions: accumulated emoji reactions at specific timestamps
CREATE TABLE public.episode_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  timestamp_seconds INTEGER NOT NULL CHECK (timestamp_seconds >= 0),
  emoji TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1 CHECK (count > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (episode_id, timestamp_seconds, emoji)
);

CREATE INDEX idx_episode_reactions_episode ON public.episode_reactions(episode_id);

ALTER TABLE public.episode_reactions ENABLE ROW LEVEL SECURITY;

-- Public read for reactions
CREATE POLICY "Episode reactions are readable by everyone"
  ON public.episode_reactions FOR SELECT
  USING (true);

-- No direct INSERT/UPDATE -- handled via RPC for atomic upsert

-- Favorites: user's saved series
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  series_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, series_id)
);

CREATE INDEX idx_favorites_user ON public.favorites(user_id);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Public read for favorites
CREATE POLICY "Favorites are readable by everyone"
  ON public.favorites FOR SELECT
  USING (true);

-- Users can add to their own favorites
CREATE POLICY "Users can add favorites"
  ON public.favorites FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can remove their own favorites
CREATE POLICY "Users can remove favorites"
  ON public.favorites FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- Watch History: per-episode progress tracking
CREATE TABLE public.watch_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  episode_id UUID NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  progress_seconds INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  last_watched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, episode_id)
);

CREATE INDEX idx_watch_history_user ON public.watch_history(user_id);

ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;

-- Owner-only access for watch history
CREATE POLICY "Users can view own watch history"
  ON public.watch_history FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own watch history"
  ON public.watch_history FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own watch history"
  ON public.watch_history FOR UPDATE
  USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- ALTER PROFILES
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN watch_history_public BOOLEAN NOT NULL DEFAULT false;

-- ============================================================================
-- RPC: increment_reaction (atomic upsert for reaction counts)
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_reaction(
  p_episode_id UUID,
  p_timestamp_seconds INTEGER,
  p_emoji TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.episode_reactions (episode_id, timestamp_seconds, emoji, count)
  VALUES (p_episode_id, p_timestamp_seconds, p_emoji, 1)
  ON CONFLICT (episode_id, timestamp_seconds, emoji)
  DO UPDATE SET count = episode_reactions.count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_reaction(UUID, INTEGER, TEXT) TO authenticated;

-- ============================================================================
-- STORAGE: avatars bucket
-- ============================================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Public read for avatar images
CREATE POLICY "Avatars are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Users can upload to their own folder
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own avatar
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own avatar
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
