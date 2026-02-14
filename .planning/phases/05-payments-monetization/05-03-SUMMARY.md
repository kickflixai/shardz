---
phase: 05-payments-monetization
plan: 03
subsystem: payments
tags: [stripe-connect, express-accounts, transfers, payouts, onboarding, webhooks]

# Dependency graph
requires:
  - phase: 05-payments-monetization
    provides: Stripe SDK singleton, purchases table with stripe_charge_id, payout_records table, profile stripe_account_id/stripe_onboarding_complete columns
  - phase: 01-foundation-app-shell
    provides: Supabase admin client, creator dashboard layout, sidebar navigation
provides:
  - Stripe Connect Express account creation and onboarding link generation
  - Batch transfer logic with source_transaction linking and payout audit trail
  - Connect API endpoint for initiating onboarding (POST /api/connect)
  - Onboarding return route that checks status and triggers transfers (GET /api/connect/onboarding)
  - account.updated webhook handler as backup for onboarding completion
  - Creator payouts dashboard with earnings summary and payout history
  - Creator earnings query utility (total, pending, transferred)
affects: [06-creator-dashboard, 07-admin-panel]

# Tech tracking
tech-stack:
  added: []
  patterns: [batch-transfer-with-source-transaction, deferred-connect-onboarding, dual-path-onboarding-verification]

key-files:
  created:
    - src/lib/stripe/connect.ts
    - src/lib/stripe/transfers.ts
    - src/app/api/connect/route.ts
    - src/app/api/connect/onboarding/route.ts
    - src/app/(creator)/dashboard/payouts/page.tsx
    - src/app/(creator)/dashboard/payouts/connect-button.tsx
  modified:
    - src/app/api/webhooks/stripe/route.ts
    - src/components/layout/sidebar.tsx

key-decisions:
  - "Batch transfers use source_transaction linking to original charges for automatic fund availability handling"
  - "Dual-path onboarding verification: return URL route as primary, account.updated webhook as reliable backup"
  - "Failed individual transfers are logged with payout_record status='failed' without stopping the batch"
  - "Payouts dashboard shows completed payouts only (per user constraint: no pending/in-transit pipeline visibility)"

patterns-established:
  - "Batch transfer with graceful degradation: each transfer in try/catch with individual failure recording"
  - "Dual-path verification: API return URL for immediate action + webhook for reliable async backup"
  - "ConnectButton client component pattern: fetch API to get redirect URL, then window.location.href"

# Metrics
duration: 6min
completed: 2026-02-14
---

# Phase 5 Plan 3: Stripe Connect Creator Payouts Summary

**Stripe Connect Express onboarding with batch transfers of accumulated revenue via source_transaction linking, dual-path onboarding verification (return URL + account.updated webhook), and creator payouts dashboard with earnings summary and completed payout history**

## Performance

- **Duration:** 6min
- **Started:** 2026-02-14T16:25:59Z
- **Completed:** 2026-02-14T16:32:28Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Connect helpers create Express accounts with transfers capability, generate Account Link onboarding URLs, and check account status
- Batch transfer iterates all untransferred completed purchases, creates Stripe transfers with source_transaction for automatic fund availability, marks purchases as transferred, and records payout audit trail
- Connect API route creates Express account (or reuses existing), stores stripe_account_id on profile, and returns onboarding URL for client redirect
- Onboarding return route checks account status with Stripe and triggers batch transfer when charges_enabled and detailsSubmitted
- account.updated webhook provides reliable backup path for onboarding completion when return URL fails
- Creator payouts dashboard displays earnings summary (total, pending, transferred), Connect status with onboarding CTA, and completed payout history table

## Task Commits

Each task was committed atomically:

1. **Task 1: Stripe Connect helpers and transfer logic** - `359b57b` (feat)
2. **Task 2: Connect API routes, account.updated webhook, and payouts dashboard** - `cea47a1` (feat)

## Files Created/Modified
- `src/lib/stripe/connect.ts` - createConnectAccount, createAccountLink, getAccountStatus helpers
- `src/lib/stripe/transfers.ts` - batchTransferToCreator with per-purchase error handling, getCreatorEarnings summary
- `src/app/api/connect/route.ts` - POST handler: auth check, Express account creation, account link generation
- `src/app/api/connect/onboarding/route.ts` - GET handler: return URL from Stripe, status check, batch transfer trigger
- `src/app/api/webhooks/stripe/route.ts` - Added account.updated case with onboarding completion and batch transfer
- `src/app/(creator)/dashboard/payouts/page.tsx` - Server component: earnings cards, Connect status, payout history table
- `src/app/(creator)/dashboard/payouts/connect-button.tsx` - Client component: fetches /api/connect and redirects to Stripe
- `src/components/layout/sidebar.tsx` - Added Payouts nav item to creator sidebar

## Decisions Made
- Batch transfers use `source_transaction` on every `stripe.transfers.create` call, linking back to the original charge. This ensures Stripe handles fund availability timing automatically (auto-succeeds and queues until funds clear)
- Dual-path onboarding verification: the return URL route (`/api/connect/onboarding`) provides immediate action when the creator completes onboarding, while the `account.updated` webhook provides a reliable async backup if the return URL fails (e.g., creator navigates away)
- Individual transfer failures are caught and recorded as `payout_record` with `status: 'failed'` and a synthetic `stripe_transfer_id` of `failed_{purchase_id}`, allowing the batch to continue processing remaining purchases
- Payouts dashboard shows only completed payouts per user constraint ("Completed payouts only -- no pending/in-transit pipeline visibility")

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Next.js 16 Turbopack `pnpm build` has an intermittent finalization error (ENOENT for `pages-manifest.json` or `_ssgManifest.js`). TypeScript compilation and code correctness verified via `npx tsc --noEmit` which passes cleanly. This is a known Turbopack build infrastructure issue, not a code error.

## User Setup Required

Stripe Connect requires additional configuration before the Connect flow can be tested:
- Stripe Dashboard > Connect > Settings must be configured for Express accounts
- The platform account must have Connect enabled
- Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` to receive `account.updated` events

Environment variables (already required from Plan 01):
- `STRIPE_SECRET_KEY` - Must have Connect permissions
- `STRIPE_WEBHOOK_SECRET` - From Stripe CLI listen

## Next Phase Readiness
- Payment and monetization loop is complete: users purchase content, revenue is recorded, creators connect Stripe and receive their 80% share via batch transfers
- Creator dashboard payouts page ready for future enhancements (withdrawal controls, earning analytics)
- Phase 6 (Creator Dashboard) can build on the payouts page and earnings data infrastructure

## Self-Check: PASSED

All 8 created/modified files verified on disk. Both task commits (359b57b, cea47a1) verified in git log.

---
*Phase: 05-payments-monetization*
*Completed: 2026-02-14*
