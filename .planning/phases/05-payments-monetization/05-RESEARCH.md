# Phase 5: Payments + Monetization - Research

**Researched:** 2026-02-14
**Domain:** Stripe Checkout, Stripe Connect, payment webhooks, purchase access control
**Confidence:** HIGH

## Summary

Phase 5 adds the business model: users pay to unlock full seasons via Stripe Checkout, purchases are recorded in Supabase and unlock episode access, and creators accumulate revenue that they can withdraw via Stripe Connect when ready. The core architecture uses **separate charges and transfers** -- the platform collects payments directly (no Connect account needed at purchase time), records purchases in a `purchases` table, and transfers the creator's 80% share later when the creator completes Stripe Connect onboarding.

The existing codebase is well-prepared: `checkEpisodeAccess` in `src/lib/access.ts` already accepts a `hasPurchased` parameter and returns `payment_required` for episodes 4+. The `seasons` table already has a `price_cents` column. The episode list item component already shows lock icons on non-free episodes. The webhook pattern from the Mux integration (`src/app/api/webhooks/mux/route.ts`) provides a proven template for the Stripe webhook handler.

**Primary recommendation:** Use Stripe Checkout with `payment_intent_data` for one-time payments on the platform account. Record purchases via the `checkout.session.completed` webhook. Use Stripe Connect Express accounts with deferred onboarding -- creators connect only when they want to withdraw accumulated revenue. Transfer funds via `stripe.transfers.create` with `source_transaction` linking back to original charges.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Paywall shows both the specific locked episode AND the full season value ("Unlock all X episodes of Season Y")
- One-click to Stripe Checkout -- no intermediate confirmation modal before redirect
- Unauthenticated users see the paywall first (value before account) -- login/signup prompted only when they click unlock
- Existing free tier (episodes 1-3) remains the gate threshold
- Price tiers -- creators pick from preset tier options (not free-form pricing)
- Season + series bundle -- individual season unlock plus optional "Unlock all seasons" at a discount
- No free seasons -- first 3 episodes are the free tier; all full seasons require payment
- USD only -- Stripe handles currency conversion for international buyers
- 80/20 revenue split (creator 80%, platform 20%)
- Stripe Connect required only at withdrawal -- creators can publish, sell, and accumulate revenue without connecting Stripe upfront; Connect onboarding triggered when they want to extract money
- Completed payouts only -- no pending/in-transit pipeline visibility
- Admin-only refunds -- no self-serve refund flow; handled case-by-case through admin panel (Phase 7)
- Brief "Season unlocked!" confirmation screen with episode list, then user taps to play
- Lock icons on locked episodes -- unlocked episodes look normal (no special indicator needed)
- Stripe's default receipt email -- no custom branded receipt
- "Purchased" badge replaces price/unlock CTA on owned seasons in series page

### Claude's Discretion
- Gate style: Claude picks the paywall presentation style (full-screen gate vs inline overlay vs preview teaser)

### Deferred Ideas (OUT OF SCOPE)
- None -- discussion stayed within phase scope
</user_constraints>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `stripe` | ^20.3.x | Stripe Node.js SDK -- Checkout sessions, webhooks, Connect, transfers | Official SDK, comprehensive TypeScript types, handles auth/retry/pagination |
| `@supabase/supabase-js` | ^2.95.x (existing) | Database for purchases, creator payouts, price tiers | Already in stack, RLS policies for access control |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Stripe CLI | latest | Local webhook testing, event triggering | Development only -- `stripe listen --forward-to` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Stripe Checkout (hosted) | Stripe Elements (embedded) | Checkout is simpler, PCI-compliant out of the box, handles email receipts -- Elements gives more UI control but adds complexity |
| Separate charges + transfers | Destination charges | Destination charges require connected account at payment time -- incompatible with "Connect at withdrawal" decision |
| Pre-created Stripe Price objects | Inline `price_data` | Pre-created Prices are reusable and linkable from the `price_tiers` table; inline is throwaway |

**Installation:**
```bash
pnpm add stripe
```

No `@stripe/stripe-js` client-side SDK is needed -- Stripe Checkout is a hosted redirect flow, not an embedded form.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   └── stripe/
│       ├── client.ts              # Stripe SDK singleton (like mux/client.ts pattern)
│       ├── webhooks.ts            # Webhook verification + event types (like mux/webhooks.ts)
│       ├── checkout.ts            # createCheckoutSession helper
│       ├── connect.ts             # Connect account creation, account links, transfers
│       └── prices.ts              # Price tier constants + helpers
├── app/
│   └── api/
│       └── webhooks/
│           └── stripe/
│               └── route.ts       # POST handler for Stripe webhooks
│   └── (browse)/
│       └── series/[slug]/
│           └── unlock/
│               └── route.ts       # Server action: create checkout session + redirect
│   └── (auth)/                    # Existing -- login redirect flow
│   └── checkout/
│       ├── success/page.tsx       # Post-purchase confirmation ("Season unlocked!")
│       └── cancel/page.tsx        # Cancelled checkout return
│   └── (creator)/
│       └── dashboard/
│           └── payouts/           # Connect onboarding + payout history (Phase 6 expanded)
├── modules/
│   └── purchases/
│       ├── queries/
│       │   ├── get-user-purchases.ts     # Check if user owns a season
│       │   └── get-season-purchases.ts   # Revenue data for a season
│       └── types.ts               # Purchase, PayoutRecord types
├── components/
│   └── paywall/
│       ├── season-paywall.tsx     # The paywall gate component
│       └── unlock-button.tsx      # CTA that triggers checkout
supabase/
└── migrations/
    └── 00000000000003_purchases_and_pricing.sql  # purchases table, price_tiers, payout_records
```

### Pattern 1: Separate Charges and Transfers (Deferred Connect)
**What:** Platform collects payment directly via Stripe Checkout. No connected account needed at charge time. When a creator later connects their Stripe account, the platform creates transfers using `source_transaction` to link back to original charges.
**When to use:** When the seller (creator) doesn't need a Stripe account to start selling -- exactly our "Connect at withdrawal" decision.
**Example:**
```typescript
// Source: https://docs.stripe.com/connect/separate-charges-and-transfers

// Step 1: Charge happens on platform account (no Connect needed)
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: [{
    price: 'price_tier_499',  // Pre-created Price object
    quantity: 1,
  }],
  metadata: {
    season_id: seasonId,
    user_id: userId,
    creator_id: creatorId,
  },
  success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${appUrl}/series/${slug}`,
});

// Step 2: After webhook confirms payment, record purchase in Supabase
// (see webhook pattern below)

// Step 3: Later, when creator connects Stripe, transfer their share
const transfer = await stripe.transfers.create({
  amount: Math.round(purchaseAmountCents * 0.80),  // 80% creator share
  currency: 'usd',
  destination: creatorStripeAccountId,
  source_transaction: originalChargeId,  // Links to the original payment
  transfer_group: `season_${seasonId}`,
});
```

### Pattern 2: Stripe Checkout Session Creation (Server Action / Route Handler)
**What:** A server-side route creates a Stripe Checkout session and returns the URL for client-side redirect.
**When to use:** When user clicks "Unlock Season" -- the button calls this route, which creates the session and redirects.
**Example:**
```typescript
// Source: https://docs.stripe.com/api/checkout/sessions/create
// app/api/checkout/route.ts

import { stripe } from '@/lib/stripe/client';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { seasonId, seriesSlug } = await request.json();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // Fetch season with price info
  const { data: season } = await supabase
    .from('seasons')
    .select('id, title, price_cents, series_id, series!inner(title, slug, creator_id)')
    .eq('id', seasonId)
    .single();

  if (!season || !season.price_cents) {
    return NextResponse.json({ error: 'Season not found or no price set' }, { status: 404 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: user.email,
    line_items: [{
      price_data: {
        currency: 'usd',
        unit_amount: season.price_cents,
        product_data: {
          name: `${season.series.title} - ${season.title || 'Full Season'}`,
          description: `Unlock all episodes`,
        },
      },
      quantity: 1,
    }],
    metadata: {
      season_id: seasonId,
      series_id: season.series_id,
      user_id: user.id,
      creator_id: season.series.creator_id,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/series/${seriesSlug}`,
  });

  return NextResponse.json({ url: session.url });
}
```

### Pattern 3: Webhook-Driven Fulfillment (Purchase Recording)
**What:** Stripe sends `checkout.session.completed` to our webhook endpoint. We verify the signature, extract metadata, and insert a purchase record into Supabase. This is the **only** reliable way to record purchases.
**When to use:** Always -- webhooks are the source of truth for payment completion.
**Example:**
```typescript
// Source: https://docs.stripe.com/checkout/fulfillment
// app/api/webhooks/stripe/route.ts

import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('[stripe-webhook] Signature verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status === 'paid') {
        const { season_id, user_id, creator_id } = session.metadata!;

        // Idempotency: check if purchase already recorded
        const { data: existing } = await supabase
          .from('purchases')
          .select('id')
          .eq('stripe_session_id', session.id)
          .single();

        if (!existing) {
          await supabase.from('purchases').insert({
            user_id,
            season_id,
            creator_id,
            stripe_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent as string,
            amount_cents: session.amount_total!,
            platform_fee_cents: Math.round(session.amount_total! * 0.20),
            creator_share_cents: Math.round(session.amount_total! * 0.80),
            status: 'completed',
          });
        }
      }
      break;
    }
  }

  return new Response('OK', { status: 200 });
}
```

### Pattern 4: Stripe Connect Express Onboarding (Deferred)
**What:** When a creator wants to withdraw earnings, they trigger Connect onboarding. The platform creates an Express account, generates an account link, and redirects them to Stripe's hosted onboarding.
**When to use:** Creator clicks "Connect Stripe" or "Withdraw Earnings" in their dashboard.
**Example:**
```typescript
// Source: https://docs.stripe.com/connect/express-accounts

// Create Express connected account
const account = await stripe.accounts.create({
  type: 'express',
  country: 'US',
  email: creatorEmail,
  capabilities: {
    transfers: { requested: true },
  },
  business_profile: {
    url: `${appUrl}/creator/${creatorUsername}`,
  },
});

// Store account.id in profiles table: stripe_account_id

// Generate onboarding link
const accountLink = await stripe.accountLinks.create({
  account: account.id,
  type: 'account_onboarding',
  return_url: `${appUrl}/dashboard/payouts?onboarding=complete`,
  refresh_url: `${appUrl}/dashboard/payouts?onboarding=refresh`,
});

// Redirect creator to accountLink.url
```

### Pattern 5: Pre-Created Price Tiers
**What:** Instead of free-form pricing, creators choose from preset tiers. These map to pre-created Stripe Price objects for consistency and reusability. A `price_tiers` table stores the options.
**When to use:** When creating/editing a season -- creator picks a tier, the `price_tier_id` and `price_cents` are stored on the season.
**Example:**
```sql
-- Price tiers table
CREATE TABLE public.price_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,                -- "Budget", "Standard", "Premium"
  price_cents INTEGER NOT NULL,       -- 299, 499, 799, 999, 1499
  stripe_price_id TEXT,               -- Stripe Price object ID (created via API or Dashboard)
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Recommended initial tiers:
| Label | Price | Use Case |
|-------|-------|----------|
| Budget | $2.99 | Short seasons, new creators |
| Standard | $4.99 | Most content |
| Premium | $7.99 | High-production, popular series |
| Deluxe | $9.99 | Premium flagship series |
| Blockbuster | $14.99 | Major series with large episode counts |

### Anti-Patterns to Avoid
- **Client-side purchase verification:** Never trust the client to confirm a purchase happened. Always use the webhook as source of truth.
- **Destination charges with deferred Connect:** Destination charges require a connected account at payment time. Since our creators don't connect until withdrawal, this would break.
- **Storing Stripe secrets in NEXT_PUBLIC_ env vars:** Stripe secret key and webhook secret are server-only. Never prefix with NEXT_PUBLIC_.
- **Polling for payment status:** Don't poll Stripe from the success page. Use the webhook to write to the DB, then read from the DB on the success page.
- **Skipping idempotency in webhooks:** Stripe may send the same event multiple times. Always check for existing records before inserting.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Payment form UI | Custom credit card form | Stripe Checkout (hosted) | PCI compliance, 3DS/SCA, payment methods handled automatically |
| Email receipts | Custom receipt emails | Stripe's default receipt | Stripe sends receipt automatically when email is on the session |
| Webhook signature verification | Custom HMAC verification | `stripe.webhooks.constructEvent()` | Handles timing-safe comparison, header parsing, replay protection |
| Connected account onboarding | Custom KYC/identity form | Stripe Connect Express hosted onboarding | Legal compliance, identity verification, bank account linking |
| Currency conversion | Custom FX logic | Stripe handles automatically | USD-only pricing, Stripe converts for international cards |
| Refund processing | Custom refund flow | Stripe Refunds API (Phase 7) | Handles partial refunds, Connect fee reversals, balance management |

**Key insight:** Stripe handles the hardest parts of payments (PCI compliance, fraud detection, SCA/3DS, currency, receipts, identity verification). Every custom solution in this domain introduces liability and maintenance burden.

## Common Pitfalls

### Pitfall 1: Raw Body Parsing in Next.js App Router
**What goes wrong:** Stripe webhook signature verification requires the raw request body. If the body is parsed as JSON first, the signature won't match.
**Why it happens:** Next.js App Router route handlers can auto-parse request bodies.
**How to avoid:** Use `await request.text()` (not `request.json()`) in the webhook route handler. This returns the raw string body that Stripe needs for signature verification.
**Warning signs:** Webhook returns 400 with "No signatures found matching the expected signature" error.

### Pitfall 2: Fulfillment Race Condition
**What goes wrong:** User lands on success page before the webhook fires. The page shows "no purchase found" because the webhook hasn't inserted the record yet.
**Why it happens:** The redirect to `success_url` can arrive before Stripe sends the webhook.
**How to avoid:** On the success page, retrieve the Checkout Session directly from Stripe using the session_id URL param and check `payment_status === 'paid'`. Also trigger fulfillment from the success page as a backup (with the same idempotency guard as the webhook).
**Warning signs:** Users see "purchase not found" briefly after completing payment.

### Pitfall 3: Missing Metadata on Checkout Session
**What goes wrong:** The webhook fires but `session.metadata` is empty, so you can't determine which season/user to unlock.
**Why it happens:** Metadata was forgotten when creating the session, or metadata keys were misspelled.
**How to avoid:** Always pass `season_id`, `user_id`, `creator_id`, and `series_id` in session metadata. Validate metadata exists in the webhook handler before processing.
**Warning signs:** Webhook logs show null metadata values.

### Pitfall 4: Double-Charging via Duplicate Sessions
**What goes wrong:** User clicks "Unlock" multiple times quickly, creating multiple Checkout Sessions for the same season.
**Why it happens:** No guard against creating duplicate sessions for the same user+season.
**How to avoid:** Before creating a session, check if the user already has a completed purchase for this season. Also check if there's a pending (unpaid) session and reuse it. Add a unique constraint on `(user_id, season_id)` in the purchases table with status='completed'.
**Warning signs:** Same user has multiple charges for the same season.

### Pitfall 5: Connect Transfer Timing
**What goes wrong:** Transfer fails because the source charge's funds aren't available yet.
**Why it happens:** Stripe holds funds for ~2 business days before they become available. Transfers with `source_transaction` auto-succeed but won't execute until funds clear.
**How to avoid:** Use `source_transaction` on every transfer (not just `transfer_group`). This ensures the transfer auto-succeeds and Stripe queues it until funds are available. Don't try to transfer from raw platform balance.
**Warning signs:** "Insufficient funds" errors when creating transfers.

### Pitfall 6: Webhook Endpoint Excluded from Auth Middleware
**What goes wrong:** Stripe webhook POST requests are rejected by auth middleware because they don't have a user session.
**Why it happens:** The middleware matcher catches `/api/webhooks/stripe` and tries to check auth.
**How to avoid:** The existing middleware matcher in `src/middleware.ts` already catches all routes except static files. However, the webhook route doesn't need auth protection -- it uses Stripe signature verification instead. The current middleware only redirects `/dashboard` and `/admin` prefixed routes, so `/api/webhooks/stripe` will pass through without issue. Verify this during implementation.
**Warning signs:** Webhook returns 307 redirect instead of processing.

### Pitfall 7: Separate Charges Transfer Window
**What goes wrong:** Transfers fail because the original charge is too old.
**Why it happens:** Stripe has regional limits on how long funds can be held: US allows up to 2 years, most other regions 90 days.
**How to avoid:** For US-based platform (our case), the 2-year window is generous. Track `created_at` on purchases and implement a dashboard warning if a creator hasn't connected Stripe and has old unpaid earnings. Consider a periodic job to remind creators to connect.
**Warning signs:** Transfer creation fails with "source_transaction is too old" error.

## Code Examples

Verified patterns from official sources:

### Stripe Client Singleton
```typescript
// src/lib/stripe/client.ts
// Source: https://docs.stripe.com/sdks
// Pattern: matches existing mux/client.ts singleton approach

import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});
```

### Purchase Check for Episode Access
```typescript
// Integrates with existing src/lib/access.ts
// Source: existing codebase pattern

import { createClient } from '@/lib/supabase/server';

export async function hasUserPurchasedSeason(
  userId: string,
  seasonId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('season_id', seasonId)
    .eq('status', 'completed')
    .limit(1)
    .single();

  return !!data;
}
```

### Updated Episode Page Integration Point
```typescript
// In src/app/(browse)/series/[slug]/episode/[episodeNumber]/page.tsx
// The existing code passes hasPurchased=false:
//   const access = checkEpisodeAccess(episodeNumber, user, false);
//
// Phase 5 changes this to:
//   const hasPurchased = user
//     ? await hasUserPurchasedSeason(user.id, episode.season_id)
//     : false;
//   const access = checkEpisodeAccess(episodeNumber, user, hasPurchased);
```

### Database Schema: Purchases Table
```sql
-- Source: designed for this project based on Stripe Checkout metadata pattern

CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  season_id UUID NOT NULL REFERENCES public.seasons(id),
  creator_id UUID NOT NULL REFERENCES public.profiles(id),
  stripe_session_id TEXT UNIQUE NOT NULL,      -- Checkout Session ID (idempotency key)
  stripe_payment_intent_id TEXT,               -- PaymentIntent ID (for transfers)
  stripe_charge_id TEXT,                       -- Charge ID (source_transaction for transfers)
  amount_cents INTEGER NOT NULL,
  platform_fee_cents INTEGER NOT NULL,         -- 20% of amount
  creator_share_cents INTEGER NOT NULL,        -- 80% of amount
  status TEXT NOT NULL DEFAULT 'completed'
    CHECK (status IN ('completed', 'refunded')),
  transferred BOOLEAN NOT NULL DEFAULT false,  -- Has creator share been transferred?
  stripe_transfer_id TEXT,                     -- Transfer ID once executed
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Prevent duplicate purchases of the same season
  UNIQUE (user_id, season_id)
);

-- RLS: users can see their own purchases
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

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
```

### Database Schema: Price Tiers Table
```sql
CREATE TABLE public.price_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents > 0),
  stripe_price_id TEXT,              -- Optional: pre-created Stripe Price
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.price_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Price tiers are visible to everyone"
  ON public.price_tiers FOR SELECT
  USING (is_active = true);

-- Seed initial tiers
INSERT INTO public.price_tiers (label, price_cents, sort_order) VALUES
  ('Budget',      299, 1),
  ('Standard',    499, 2),
  ('Premium',     799, 3),
  ('Deluxe',      999, 4),
  ('Blockbuster', 1499, 5);
```

### Database Schema: Payout Records Table
```sql
-- Tracks completed transfers to creator Connect accounts
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

CREATE POLICY "Creators can view own payouts"
  ON public.payout_records FOR SELECT
  USING ((SELECT auth.uid()) = creator_id);

CREATE INDEX idx_payouts_creator ON public.payout_records(creator_id);
```

### Profile Table Extension for Connect
```sql
-- Add Stripe Connect fields to existing profiles table
ALTER TABLE public.profiles
  ADD COLUMN stripe_account_id TEXT,
  ADD COLUMN stripe_onboarding_complete BOOLEAN NOT NULL DEFAULT false;
```

### Seasons Table: Link to Price Tiers
```sql
-- Add price_tier_id to existing seasons table
-- (price_cents already exists, this adds the tier reference)
ALTER TABLE public.seasons
  ADD COLUMN price_tier_id UUID REFERENCES public.price_tiers(id);
```

### Environment Variables Required
```bash
# .env.local additions for Phase 5
STRIPE_SECRET_KEY=sk_test_...          # Server-only
STRIPE_WEBHOOK_SECRET=whsec_...        # Server-only (from Stripe CLI or Dashboard)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Not strictly needed for Checkout redirect, but good to have
```

## Claude's Discretion: Gate Style Recommendation

**Recommendation: Inline overlay with preview teaser**

After researching paywall patterns for mobile-first video streaming apps, the **inline overlay** approach is the strongest fit for MicroShort's architecture:

**How it works:**
- When a user navigates to a locked episode (4+), the episode page renders with the series thumbnail/artwork visible behind a frosted/blurred overlay
- The overlay shows: episode title, season info, price, episode count remaining ("Unlock all X episodes of Season Y"), and the "Unlock Season" CTA button
- If the user is unauthenticated, clicking the CTA prompts login/signup first (per the "value before account" decision)
- After authentication, clicking the CTA creates a Checkout session and redirects to Stripe

**Why this approach over alternatives:**

| Style | Pros | Cons | Verdict |
|-------|------|------|---------|
| Full-screen gate | Maximum urgency, blocks navigation | Feels aggressive for content discovery, user can't see what they're missing | Too aggressive |
| Preview teaser (play 30s) | Shows actual content value | Requires Mux token for locked content, complex access control, user may feel baited | Overengineered |
| **Inline overlay** | Shows value (artwork, metadata), feels like natural part of the page, non-aggressive, easy to implement | Less urgency than full-screen | **Best balance** |

The inline overlay also works naturally with the existing episode page structure -- it replaces the "payment_required" block in `src/app/(browse)/series/[slug]/episode/[episodeNumber]/page.tsx` without restructuring the page.

**Additionally on the series detail page:** The season tabs component (`src/components/series/season-tabs.tsx`) should show pricing and an unlock button per season. Locked episodes retain their existing lock icon. Purchased seasons show a "Purchased" badge.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Stripe Charges API | Payment Intents + Checkout | 2019 | Checkout handles SCA/3DS, mobile optimization |
| Custom hosted payment pages | Stripe Checkout (hosted) | Ongoing | PCI compliance offloaded to Stripe |
| OAuth for Connect onboarding | Account Links API | 2020 | Express accounts use Account Links, not OAuth |
| `stripe.webhooks.constructEvent` | Same, no change | Stable | Still the standard for webhook verification |
| Connect account `type: 'express'` | Still current, with new controller properties | 2025 | New `controller` properties for account creation, but `type: 'express'` still works |

**Deprecated/outdated:**
- `stripe.charges.create()` for new integrations -- use Payment Intents or Checkout instead
- OAuth-based Connect onboarding -- use Account Links API for Express accounts
- Stripe API version pinning via constructor is optional -- SDK defaults to compatible version

## Open Questions

1. **Series bundle pricing**
   - What we know: The user wants "individual season unlock plus optional 'Unlock all seasons' at a discount"
   - What's unclear: How to calculate the bundle discount (percentage off sum of individual seasons? Fixed discount? Separate tier?). Where does the bundle CTA appear (series page only, or also on episode paywall)?
   - Recommendation: For v1, implement a simple "sum of remaining seasons minus X%" approach. The bundle CTA should appear on the series detail page when multiple seasons exist. Store the bundle discount as a percentage on the series table (e.g., `bundle_discount_percent INTEGER DEFAULT 15`). The planner can decide the exact discount model.

2. **Retrieving charge_id from Checkout Session**
   - What we know: `checkout.session.completed` gives us `payment_intent` ID. For `source_transaction` on transfers, we need the `charge_id`.
   - What's unclear: The charge ID is nested -- you need to expand or retrieve the PaymentIntent to get the latest charge.
   - Recommendation: After getting the session in the webhook, retrieve the PaymentIntent with `expand: ['latest_charge']` to get the charge ID. Store it in the `purchases.stripe_charge_id` column for future transfers.

3. **When to execute transfers**
   - What we know: Creators connect Stripe only at withdrawal time. Revenue accumulates on the platform.
   - What's unclear: Should transfers happen automatically when a creator connects, or should the creator manually trigger a "withdraw" action?
   - Recommendation: Automatic batch transfer when creator completes Connect onboarding (all untransferred purchases get transferred). Future manual withdrawals can be added later. Keep it simple for v1.

## Sources

### Primary (HIGH confidence)
- `/stripe/stripe-node` (Context7) - Checkout session creation, webhook verification, Connect operations, transfers
- `/llmstxt/stripe_llms_txt` (Context7) - Connect account creation, Account Links API, controller properties
- [Stripe Destination Charges docs](https://docs.stripe.com/connect/destination-charges) - Fund flow mechanics, application_fee_amount
- [Stripe Express Accounts docs](https://docs.stripe.com/connect/express-accounts) - Complete onboarding flow
- [Stripe Separate Charges and Transfers docs](https://docs.stripe.com/connect/separate-charges-and-transfers) - Deferred transfer pattern
- [Stripe Connect Charge Types](https://docs.stripe.com/connect/charges) - Comparison of destination vs direct vs separate
- [Stripe Checkout Fulfillment](https://docs.stripe.com/checkout/fulfillment) - Webhook-driven fulfillment pattern
- [Stripe Checkout Sessions API](https://docs.stripe.com/api/checkout/sessions/create) - Session creation parameters
- [Stripe Transfers API](https://docs.stripe.com/api/transfers/create?lang=node) - Transfer creation with source_transaction

### Secondary (MEDIUM confidence)
- [Stripe + Next.js 15 Guide](https://www.pedroalonso.net/blog/stripe-nextjs-complete-guide-2025/) - App Router webhook patterns
- [Next.js Stripe Webhook Discussion](https://github.com/vercel/next.js/issues/60002) - Raw body handling in App Router
- [Stripe CLI listen docs](https://docs.stripe.com/cli/listen) - Local webhook testing

### Tertiary (LOW confidence)
- Paywall design research from [paywallscreens.com](https://www.paywallscreens.com/), [RevenueCat](https://www.revenuecat.com/blog/growth/video-paywalls/) - Informed gate style recommendation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Stripe Node.js SDK is the only viable choice; version verified via npm registry (v20.3.x current)
- Architecture: HIGH - Separate charges and transfers is the documented Stripe pattern for deferred Connect; webhook fulfillment is standard Stripe guidance
- Pitfalls: HIGH - Raw body parsing, idempotency, and race conditions are well-documented in Stripe docs and community
- Gate style recommendation: MEDIUM - Based on general paywall UX research, not video-specific A/B testing data
- Database schema: MEDIUM - Custom design informed by Stripe's data model; may need iteration

**Research date:** 2026-02-14
**Valid until:** 2026-03-14 (Stripe SDK releases frequently but APIs are stable)
