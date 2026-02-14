-- MicroShort Purchases & Pricing Schema
-- Migration: 00000000000003_purchases_and_pricing
-- Creates: price_tiers, purchases, payout_records tables
-- Alters: seasons (price_tier_id), profiles (stripe fields), series (bundle_discount_percent)
-- Business rules: RLS policies, indexes, seed data for price tiers

-- ============================================================================
-- PRICE TIERS
-- ============================================================================

CREATE TABLE public.price_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents > 0),
  stripe_price_id TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.price_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active price tiers are visible to everyone"
  ON public.price_tiers FOR SELECT
  USING (is_active = true);

-- Seed initial price tiers
INSERT INTO public.price_tiers (label, price_cents, sort_order) VALUES
  ('Budget',      299, 1),
  ('Standard',    499, 2),
  ('Premium',     799, 3),
  ('Deluxe',      999, 4),
  ('Blockbuster', 1499, 5);

-- ============================================================================
-- ALTER EXISTING TABLES
-- ============================================================================

-- Seasons: link to price tiers
ALTER TABLE public.seasons
  ADD COLUMN price_tier_id UUID REFERENCES public.price_tiers(id);

-- Profiles: Stripe Connect fields
ALTER TABLE public.profiles
  ADD COLUMN stripe_account_id TEXT,
  ADD COLUMN stripe_onboarding_complete BOOLEAN NOT NULL DEFAULT false;

-- Series: bundle discount percentage
ALTER TABLE public.series
  ADD COLUMN bundle_discount_percent INTEGER DEFAULT 15
    CHECK (bundle_discount_percent IS NULL OR (bundle_discount_percent >= 0 AND bundle_discount_percent <= 50));

-- ============================================================================
-- PURCHASES
-- ============================================================================

CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  season_id UUID NOT NULL REFERENCES public.seasons(id),
  creator_id UUID NOT NULL REFERENCES public.profiles(id),
  stripe_session_id TEXT UNIQUE NOT NULL,
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  amount_cents INTEGER NOT NULL,
  platform_fee_cents INTEGER NOT NULL,
  creator_share_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed'
    CHECK (status IN ('completed', 'refunded')),
  transferred BOOLEAN NOT NULL DEFAULT false,
  stripe_transfer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Prevent duplicate purchases of the same season
  UNIQUE (user_id, season_id)
);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases"
  ON public.purchases FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

-- Creators can view purchases of their content (for dashboard)
CREATE POLICY "Creators can view purchases of their content"
  ON public.purchases FOR SELECT
  USING ((SELECT auth.uid()) = creator_id);

-- Indexes for common queries
CREATE INDEX idx_purchases_user ON public.purchases(user_id);
CREATE INDEX idx_purchases_season ON public.purchases(season_id);
CREATE INDEX idx_purchases_creator ON public.purchases(creator_id);
CREATE INDEX idx_purchases_untransferred ON public.purchases(creator_id)
  WHERE transferred = false;

-- ============================================================================
-- PAYOUT RECORDS
-- ============================================================================

CREATE TABLE public.payout_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id),
  purchase_id UUID NOT NULL REFERENCES public.purchases(id),
  stripe_transfer_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed'
    CHECK (status IN ('completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payout_records ENABLE ROW LEVEL SECURITY;

-- Creators can view their own payouts
CREATE POLICY "Creators can view own payouts"
  ON public.payout_records FOR SELECT
  USING ((SELECT auth.uid()) = creator_id);

CREATE INDEX idx_payouts_creator ON public.payout_records(creator_id);
