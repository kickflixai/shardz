# Phase 5: Payments + Monetization - Context

**Gathered:** 2026-02-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can pay to unlock full seasons and creators receive their revenue share. This phase delivers the complete purchase flow: paywall, Stripe Checkout, unlock persistence, and creator payout via Stripe Connect. Creator dashboard UI and content upload are separate phases (Phase 6). Admin refund tools are separate (Phase 7).

</domain>

<decisions>
## Implementation Decisions

### Paywall experience
- Paywall shows both the specific locked episode AND the full season value ("Unlock all X episodes of Season Y")
- One-click to Stripe Checkout — no intermediate confirmation modal before redirect
- Unauthenticated users see the paywall first (value before account) — login/signup prompted only when they click unlock
- Existing free tier (episodes 1-3) remains the gate threshold

### Claude's Discretion: Gate style
- Claude picks the paywall presentation style (full-screen gate vs inline overlay vs preview teaser)

### Pricing & unlock model
- Price tiers — creators pick from preset tier options (not free-form pricing)
- Season + series bundle — individual season unlock plus optional "Unlock all seasons" at a discount
- No free seasons — first 3 episodes are the free tier; all full seasons require payment
- USD only — Stripe handles currency conversion for international buyers

### Creator payout flow
- 80/20 revenue split (creator 80%, platform 20%)
- Stripe Connect required only at withdrawal — creators can publish, sell, and accumulate revenue without connecting Stripe upfront; Connect onboarding triggered when they want to extract money
- Completed payouts only — no pending/in-transit pipeline visibility
- Admin-only refunds — no self-serve refund flow; handled case-by-case through admin panel (Phase 7)

### Post-purchase experience
- Brief "Season unlocked!" confirmation screen with episode list, then user taps to play
- Lock icons on locked episodes — unlocked episodes look normal (no special indicator needed)
- Stripe's default receipt email — no custom branded receipt
- "Purchased" badge replaces price/unlock CTA on owned seasons in series page

</decisions>

<specifics>
## Specific Ideas

- Stripe Connect onboarding is deferred until creator wants to withdraw — revenue accumulates on platform side, minimizing friction for new creators to start selling
- The paywall should show value before asking for commitment (see price and what you get before being asked to log in)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-payments-monetization*
*Context gathered: 2026-02-14*
