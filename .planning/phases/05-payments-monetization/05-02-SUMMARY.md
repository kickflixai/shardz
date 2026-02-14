---
phase: 05-payments-monetization
plan: 02
subsystem: payments
tags: [paywall, stripe-checkout, purchase-check, unlock-button, bundle-pricing, supabase]

# Dependency graph
requires:
  - phase: 05-payments-monetization
    provides: Stripe checkout API, purchase query utilities, price tier constants
  - phase: 02-authentication-access
    provides: checkEpisodeAccess with hasPurchased param, FREE_EPISODE_LIMIT
  - phase: 04-content-browsing-sharing
    provides: SeriesDetail, SeasonTabs, EpisodeListItem components, series detail page
provides:
  - SeasonPaywall inline overlay component with blurred thumbnail background
  - UnlockButton client component handling auth redirect and checkout flow
  - Checkout success page with backup fulfillment for webhook race condition
  - Checkout cancel page with try-again and back-to-browsing links
  - Real purchase checks on episode pages (replaces Phase 5 placeholder)
  - Purchased badge display on series page for owned seasons
  - Bundle pricing section on series page for multi-season series
  - Lock icon removal for purchased episodes in episode list
affects: [05-03-connect-payouts, 06-creator-dashboard, 07-admin-panel]

# Tech tracking
tech-stack:
  added: []
  patterns: [value-before-account-paywall, backup-fulfillment-on-success-page, inline-overlay-gate]

key-files:
  created:
    - src/components/paywall/season-paywall.tsx
    - src/components/paywall/unlock-button.tsx
    - src/app/checkout/success/page.tsx
    - src/app/checkout/cancel/page.tsx
  modified:
    - src/app/(browse)/series/[slug]/episode/[episodeNumber]/page.tsx
    - src/app/(browse)/series/[slug]/page.tsx
    - src/components/series/series-detail.tsx
    - src/components/series/season-tabs.tsx
    - src/components/series/episode-list-item.tsx

key-decisions:
  - "Value before account: both auth_required and payment_required show the SeasonPaywall, with UnlockButton handling login redirect for unauthenticated users"
  - "Backup fulfillment on success page: retrieves Stripe session directly and inserts purchase if webhook has not fired yet (handles race condition)"
  - "Bundle section appears on series page only when 2+ unpurchased seasons exist with prices set"
  - "Episode page restructured with early metadata fetch so season_id is available for both purchase check and paywall rendering"

patterns-established:
  - "Value before account: show the full value proposition (paywall) before asking users to create an account"
  - "Backup fulfillment: success page mirrors webhook logic with same idempotency guards"
  - "Inline overlay gate: blurred thumbnail background with centered card containing unlock CTA"

# Metrics
duration: 5min
completed: 2026-02-14
---

# Phase 5 Plan 2: Paywall UI and Purchase Integration Summary

**Inline overlay paywall with blurred thumbnail background, unlock button with auth/checkout redirect, checkout success page with backup fulfillment, and real purchase checks integrated into episode and series pages**

## Performance

- **Duration:** 5min
- **Started:** 2026-02-14T16:25:58Z
- **Completed:** 2026-02-14T16:31:25Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Paywall overlay component with blurred thumbnail, season value proposition, price display, and unlock CTA -- renders on episodes 4+ when user has not purchased the season
- Unlock button handles three flows: unauthenticated users redirected to login, already-purchased users shown toast, new purchases redirected to Stripe Checkout
- Checkout success page retrieves Stripe session directly and performs backup fulfillment (inserts purchase if webhook has not fired yet), then shows "Season Unlocked!" confirmation with link to start watching
- Episode page restructured to fetch metadata first for episodes beyond the free limit, check purchase status via hasUserPurchasedSeason, and render paywall for both unauthenticated and unpurchased users (value before account pattern)
- Series page now checks user purchases and passes ownership state to SeriesDetail, which shows bundle pricing for multi-season series and passes purchase state to SeasonTabs
- Season tabs display "Purchased" badge on owned seasons and price with unlock button on unowned seasons
- Episode list items hide lock icon for purchased episodes (clean unlocked appearance)

## Task Commits

Each task was committed atomically:

1. **Task 1: Paywall component, unlock button, and checkout success/cancel pages** - `ec7de1c` (feat)
2. **Task 2: Integrate purchase checks into episode page and update series page with pricing** - `50363b5` (feat)

## Files Created/Modified
- `src/components/paywall/season-paywall.tsx` - Inline overlay paywall with blurred thumbnail background, season info, price, and unlock CTA
- `src/components/paywall/unlock-button.tsx` - Client component handling auth redirect (401), already-purchased toast (409), and Stripe Checkout redirect
- `src/app/checkout/success/page.tsx` - Post-purchase confirmation page with backup fulfillment for webhook race condition
- `src/app/checkout/cancel/page.tsx` - Checkout cancellation page with try-again and browse links
- `src/app/(browse)/series/[slug]/episode/[episodeNumber]/page.tsx` - Restructured with early metadata fetch, real purchase checks via hasUserPurchasedSeason, and SeasonPaywall for locked episodes
- `src/app/(browse)/series/[slug]/page.tsx` - Added auth check and getUserSeasonPurchases for ownership display
- `src/components/series/series-detail.tsx` - Added purchasedSeasonIds prop, bundle pricing section, and price_cents to season interface
- `src/components/series/season-tabs.tsx` - Added purchasedSeasonIds prop, SeasonPricing component showing Purchased badge or price/unlock button
- `src/components/series/episode-list-item.tsx` - Added isPurchased prop, hides lock icon when season is purchased

## Decisions Made
- Value before account: for episodes 4+ when user is not logged in, the paywall is shown instead of a generic signup prompt. The UnlockButton handles the login redirect when clicked, so users see the season value proposition before being asked to create an account.
- Backup fulfillment on success page: the success page retrieves the Stripe Checkout session directly and inserts the purchase record if the webhook has not yet fired. Uses the same idempotency guards (check existing by stripe_session_id) as the webhook handler. This handles the race condition documented in the research (Pitfall 2).
- Episode page restructuring: for episodes beyond the free limit, metadata is fetched before the access check so season_id, price_cents, and episode count are available for paywall rendering. Free episodes (1-3) keep the simpler original flow.
- Bundle offer threshold: the "Unlock All Seasons" section only appears when a series has multiple seasons and at least 2 remain unpurchased. If only 1 season is unpurchased, individual purchase is sufficient.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Stale `.next` build cache caused spurious type errors on first build attempt after clean. Removing `.next` directory and rebuilding resolved the issue (Next.js 16 Turbopack build cache artifact).

## User Setup Required

This plan requires Stripe configuration from Plan 01 to be in place before the full payment flow can be tested end-to-end. See 05-01-SUMMARY.md for environment variable requirements.

## Next Phase Readiness
- Complete payment flow is now wired: paywall -> checkout -> Stripe -> webhook/backup fulfillment -> purchase recorded -> access granted
- Connect payout infrastructure (Plan 03) can proceed independently -- creator payout pages and transfer logic
- All purchase query utilities from Plan 01 are now integrated into the UI

## Self-Check: PASSED

All 4 created files verified on disk. All 5 modified files verified. Both task commits (ec7de1c, 50363b5) verified in git log.

---
*Phase: 05-payments-monetization*
*Completed: 2026-02-14*
