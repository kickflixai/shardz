---
phase: 05-payments-monetization
plan: 01
subsystem: payments
tags: [stripe, checkout, webhooks, purchases, pricing, supabase, rls]

# Dependency graph
requires:
  - phase: 01-foundation-app-shell
    provides: Supabase schema, admin client, content hierarchy tables
  - phase: 02-authentication-access
    provides: Auth middleware, user sessions, checkEpisodeAccess with hasPurchased param
provides:
  - Stripe SDK singleton (lazy-initialized)
  - Database schema for purchases, price_tiers, payout_records tables
  - Stripe webhook handler for checkout.session.completed
  - Checkout API for single-season and bundle purchases
  - Purchase query utilities (hasUserPurchasedSeason, getUserSeasonPurchases)
  - Price tier constants and utility functions
affects: [05-02-paywall-ui, 05-03-connect-payouts, 06-creator-dashboard]

# Tech tracking
tech-stack:
  added: [stripe@20.3.1]
  patterns: [lazy-singleton-via-proxy, webhook-idempotency, proportional-bundle-distribution]

key-files:
  created:
    - src/lib/stripe/client.ts
    - src/lib/stripe/checkout.ts
    - src/lib/stripe/prices.ts
    - src/app/api/webhooks/stripe/route.ts
    - src/app/api/checkout/route.ts
    - src/modules/purchases/types.ts
    - src/modules/purchases/queries/get-user-purchases.ts
    - supabase/migrations/00000000000003_purchases_and_pricing.sql
  modified:
    - src/db/types.ts
    - src/db/schema.sql
    - package.json

key-decisions:
  - "Stripe client uses Proxy-based lazy initialization to avoid build-time errors when STRIPE_SECRET_KEY is not set"
  - "Bundle purchases use proportional price distribution across seasons based on individual price ratios"
  - "Webhook stores unique stripe_session_id per season in bundles (session_id + underscore + season_id) for idempotency"
  - "Platform fee is 20% with creator receiving remaining 80% (subtraction-based to avoid rounding loss)"

patterns-established:
  - "Lazy singleton via Proxy: defers SDK initialization until first method call, avoiding build-time env var requirements"
  - "Webhook idempotency: check for existing records by stripe_session_id before inserting"
  - "PaymentIntent expansion: retrieve with expand=['latest_charge'] to capture charge_id for future Connect transfers"

# Metrics
duration: 4min
completed: 2026-02-14
---

# Phase 5 Plan 1: Stripe Payment Infrastructure Summary

**Stripe SDK with lazy-initialized singleton, purchases/pricing database schema with RLS, webhook handler for checkout fulfillment, checkout API for single and bundle purchases, and purchase query utilities for access control**

## Performance

- **Duration:** 4min
- **Started:** 2026-02-14T16:18:21Z
- **Completed:** 2026-02-14T16:22:59Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- Stripe SDK installed and configured as lazy-initialized Proxy singleton that defers construction until first use
- Database migration creates purchases, price_tiers, and payout_records tables with RLS policies, indexes, seed data, and profile/season/series column additions
- Webhook handler at /api/webhooks/stripe processes checkout.session.completed events with idempotency, bundle support, and charge_id retrieval
- Checkout API at /api/checkout creates Stripe sessions for single-season and bundle purchases with auth, duplicate guards, and bundle discount calculation
- Purchase query utilities ready for episode access control integration in Plan 02

## Task Commits

Each task was committed atomically:

1. **Task 1: Stripe SDK, database migration, and TypeScript types** - `07b99aa` (feat)
2. **Task 2: Stripe webhook handler, checkout API, and purchase queries** - `83d7651` (feat)

## Files Created/Modified
- `src/lib/stripe/client.ts` - Stripe SDK lazy-initialized singleton via Proxy pattern
- `src/lib/stripe/checkout.ts` - createSeasonCheckoutSession and createBundleCheckoutSession helpers
- `src/lib/stripe/prices.ts` - PRICE_TIERS constants, formatPrice, calculateBundlePrice utilities
- `src/app/api/webhooks/stripe/route.ts` - Stripe webhook POST handler with signature verification and purchase recording
- `src/app/api/checkout/route.ts` - Checkout POST route with auth, duplicate guards, single and bundle support
- `src/modules/purchases/types.ts` - Purchase, PriceTier, PayoutRecord interfaces
- `src/modules/purchases/queries/get-user-purchases.ts` - hasUserPurchasedSeason, getUserSeasonPurchases query functions
- `supabase/migrations/00000000000003_purchases_and_pricing.sql` - Creates 3 tables, alters 3 tables, adds RLS and indexes
- `src/db/types.ts` - Added Purchase, PriceTier, PayoutRecord types with insert/update aliases; updated Profile, Season, Series
- `src/db/schema.sql` - Mirror of migration appended to schema documentation
- `package.json` - Added stripe@20.3.1 dependency

## Decisions Made
- Stripe client uses Proxy-based lazy initialization instead of top-level `new Stripe()` to avoid build-time errors when STRIPE_SECRET_KEY is unavailable during `next build` static page collection
- Bundle purchases store a composite stripe_session_id per season (`sessionId_seasonId`) to maintain the unique constraint while allowing one Stripe session to generate multiple purchase records
- Creator share calculated as `amount - platformFee` (not `amount * 0.8`) to avoid double rounding and ensure cents always sum correctly
- PaymentIntent retrieved with `expand: ['latest_charge']` in webhook to capture the charge_id needed for future Stripe Connect transfers via `source_transaction`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Lazy-initialized Stripe client to fix build failure**
- **Found during:** Task 2 (build verification)
- **Issue:** Top-level `new Stripe(process.env.STRIPE_SECRET_KEY!)` caused build failure because env var is not available during `next build` static page collection
- **Fix:** Replaced with Proxy-based lazy initialization that defers Stripe constructor until first method call at runtime
- **Files modified:** src/lib/stripe/client.ts
- **Verification:** `pnpm build` passes successfully
- **Committed in:** 83d7651 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential fix for build compatibility. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviation above.

## User Setup Required

This plan requires Stripe configuration before the payment flow can be tested. Environment variables needed:
- `STRIPE_SECRET_KEY` - From Stripe Dashboard > Developers > API keys > Secret key (use test mode `sk_test_...`)
- `STRIPE_WEBHOOK_SECRET` - From running `stripe listen --forward-to localhost:3000/api/webhooks/stripe` (copies `whsec_...`)

## Next Phase Readiness
- Payment infrastructure is complete and ready for paywall UI integration (Plan 02)
- Purchase query functions (`hasUserPurchasedSeason`, `getUserSeasonPurchases`) can be wired into `checkEpisodeAccess` in Plan 02
- Checkout API is ready for the unlock button to call
- Connect payout infrastructure (Plan 03) can use stored `stripe_charge_id` for transfers

## Self-Check: PASSED

All 10 created/modified files verified on disk. Both task commits (07b99aa, 83d7651) verified in git log.

---
*Phase: 05-payments-monetization*
*Completed: 2026-02-14*
