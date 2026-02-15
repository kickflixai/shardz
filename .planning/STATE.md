# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-14)

**Core value:** Creators can monetize short-form video content with minimal friction -- upload a series, set a price, and earn revenue from a platform purpose-built for microshorts.
**Current focus:** Phase 8 - Mock Data + Pitch Assets

## Current Position

Phase: 8 of 9 (Mock Data + Pitch Assets)
Plan: 6 of 6 in current phase
Status: In Progress
Last activity: 2026-02-15 -- 08-05 brand and advisor pitch pages complete

Progress: [▓▓▓▓▓▓▓▓▓░] 90%

## Performance Metrics

**Velocity:**
- Total plans completed: 29
- Average duration: 4min
- Total execution time: 2.0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation-app-shell | 3 | 16min | 5min |
| 02-authentication-access | 3 | 8min | 3min |
| 03-video-player | 3 | 9min | 3min |
| 04-content-browsing-sharing | 3 | 10min | 3min |
| 05-payments-monetization | 3 | 15min | 5min |
| 06-creator-dashboard | 6 | 23min | 4min |
| 07-admin-panel | 4 | 21min | 5min |
| 08-mock-data-pitch-assets | 4 | 15min | 4min |

**Recent Trend:**
- Last 5 plans: 5min, 4min, 8min, 5min, 4min
- Trend: stable

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: Research recommends Next.js 16 + Supabase + Mux + Stripe stack (HIGH confidence)
- [Roadmap]: iOS PWA video playback freeze must be solved in Phase 3 (blob URL workaround)
- [Roadmap]: Mock data seeding deferred to Phase 8 (needs functional platform first)
- [Roadmap]: Live reactions use Supabase Realtime; start with accumulated-only in Phase 9
- [01-01]: Used named import { withSerwist } from @serwist/turbopack (not default import as research docs suggest)
- [01-01]: Disabled noNonNullAssertion lint rule for Supabase env vars (standard Supabase pattern)
- [01-01]: Enabled tailwindDirectives in Biome CSS parser for Tailwind v4 support
- [01-01]: pnpm.onlyBuiltDependencies for @swc/core and esbuild build script approval
- [01-02]: Supabase CLI installed via npx (Homebrew blocked by Xcode CLT version mismatch)
- [01-02]: Docker unavailable for local DB validation; migration SQL manually verified
- [01-03]: createSerwistRoute uses main @serwist/turbopack import, not /route subpath (research docs incorrect)
- [01-03]: createSerwistRoute requires {swSrc, useNativeEsbuild} options (not zero-arg as research showed)
- [01-03]: Global error boundary uses inline styles to survive root layout failures
- [02-01]: Zod v4 API differs from v3: z.email(), .check() with ctx.issues.push(), standalone z.flattenError()
- [02-01]: Mobile nav receives user prop from header instead of own auth listener (avoids duplicate subscriptions)
- [02-01]: FieldError children pattern used for string[] from Zod flattenError (instead of errors prop)
- [02-02]: Episode access gate is application-level (UI gating), not RLS -- RLS already makes published episodes visible
- [02-02]: checkEpisodeAccess is a synchronous pure function for testability and Phase 5 payment integration
- [02-02]: Auth redirect includes next query param for future post-login redirect enhancement
- [02-03]: Anti-enumeration: forgot-password always returns success message regardless of whether email exists
- [02-03]: Recovery email template includes next=/reset-password param so auth callback redirects to password form
- [03-01]: Mux SDK v12.8 signPlaybackId is async (returns Promise<string>), not sync as commonly documented
- [03-01]: Used SDK built-in mux.webhooks.unwrap() for webhook verification instead of hand-rolling HMAC-SHA256
- [03-01]: Created Supabase admin client (service role) for webhook handler -- cookies-based server client cannot work in webhook context
- [03-01]: Mux constructor auto-reads all env vars (MUX_TOKEN_ID, MUX_TOKEN_SECRET, MUX_SIGNING_KEY, MUX_PRIVATE_KEY, MUX_WEBHOOK_SECRET)
- [03-02]: MuxPlayer onContextMenu not in props -- right-click prevention moved to wrapping div container
- [03-02]: Used MuxPlayerCSSProperties type (not React.CSSProperties cast) for type-safe --media-object-fit custom property
- [03-02]: signPlaybackToken calls use Promise.all for parallel token generation (playback + thumbnail)
- [03-02]: Episode data fetched via Supabase join: episodes -> seasons!inner -> series!inner for slug matching
- [03-03]: AutoContinue uses SVG ring countdown animation with pure Tailwind/CSS -- no external animation libraries
- [03-03]: Client-side navigation via router.push() for seamless episode transition without full page reload
- [03-03]: Next episode title fetched in same query as next episode detection -- single additional select column
- [04-01]: nuqs with history: push for genre filter so browser back button navigates genre changes
- [04-01]: Supabase inner join on profiles for creator display name -- series without valid creator_id excluded
- [04-01]: Episode count computed by flattening seasons->episodes nested arrays from Supabase response
- [04-01]: Genre filter clears URL param for "All" (no ?genre=all) to keep clean unfiltered URLs
- [04-02]: Exported FREE_EPISODE_LIMIT from access module for cross-component usage (was unexported const)
- [04-02]: Single-season series skip tab bar -- episodes show directly without unnecessary tabs
- [04-02]: View count formatted with K/M suffixes (1.2K, 3.5M) for compact header display
- [04-03]: generateStaticParams uses direct Supabase client (not cookies-based) since it runs at build time outside request scope
- [04-03]: OG image uses Node.js runtime (not edge) to avoid Supabase client cookie context issues
- [04-03]: SeriesDetail uses generateShareUrl for UTM-tracked share links instead of raw URL construction
- [05-01]: Stripe client uses Proxy-based lazy initialization to avoid build-time errors when STRIPE_SECRET_KEY is not set
- [05-01]: Bundle purchases use proportional price distribution across seasons based on individual price ratios
- [05-01]: Webhook stores composite stripe_session_id per season in bundles (sessionId_seasonId) for idempotency with unique constraint
- [05-01]: Platform fee calculated as 20% with creator receiving remainder (subtraction-based to avoid rounding loss)
- [05-02]: Value before account: both auth_required and payment_required show SeasonPaywall; UnlockButton handles login redirect for unauthenticated users
- [05-02]: Backup fulfillment on checkout success page handles webhook race condition with same idempotency guards
- [05-02]: Episode page restructured with early metadata fetch for episodes beyond free limit to support paywall rendering
- [05-02]: Bundle offer section on series page only shows when 2+ unpurchased seasons exist
- [05-03]: Batch transfers use source_transaction linking to original charges for automatic fund availability handling
- [05-03]: Dual-path onboarding verification: return URL route as primary, account.updated webhook as reliable backup
- [05-03]: Failed individual transfers recorded with payout_record status='failed' without stopping the batch
- [05-03]: Payouts dashboard shows completed payouts only (per user constraint: no pending/in-transit pipeline visibility)
- [06-01]: Social links parsed as comma-separated URLs or JSON; stored as JSONB keyed by hostname
- [06-01]: Rejected applicants can reapply (old application deleted, new one inserted to maintain UNIQUE constraint)
- [06-01]: Follower count denormalized via database trigger (increment/decrement) to avoid COUNT queries on profile pages
- [06-01]: Textarea component added to shadcn UI set (was missing, needed for multi-line form fields)
- [06-02]: Used playback_policies (plural, current) instead of deprecated playback_policy in Mux SDK v12.8
- [06-02]: Two-step upload form: metadata creates episode row first, then MuxUploader uploads video
- [06-02]: Thumbnail images use unoptimized Next.js Image to avoid remotePatterns config for dynamic Supabase Storage URLs
- [06-02]: Episode ID passed via Mux passthrough field; existing webhook handler automatically links processed asset
- [06-04]: Analytics computed from existing tables (series.view_count, purchases) -- no separate analytics tables
- [06-04]: Per-series breakdown maps purchases through seasons to parent series for aggregation
- [06-04]: Dashboard home is role-aware: viewer gets apply CTA, creator/admin gets overview stats
- [06-04]: Both analytics queries wrapped in React.cache for request-level deduplication
- [06-06]: Social links stored as JSONB keyed by hostname (twitter.com, instagram.com, etc.) for structured display
- [06-06]: FollowButton uses React 19 useOptimistic for instant toggle without server roundtrip wait
- [06-06]: Social platform icons as inline SVGs for brand-accurate logos (not generic lucide-react icons)
- [06-06]: Profile settings uses individual URL fields per platform (not free-text) for better validation
- [06-05]: Supabase Realtime subscription on community_posts filtered by series_id for live feed updates
- [06-05]: One-vote-per-user enforced both application-level (check before insert) and DB-level (UNIQUE constraint)
- [06-05]: Trailers use playback_policies: ["public"] for shareable promotional content (no signed tokens)
- [06-05]: trailer_ passthrough prefix distinguishes trailer from episode uploads in Mux webhook handler
- [06-05]: Trailer playback ID stored as mux:{playbackId} format in series.trailer_url column
- [06-03]: Slug generation uses random 4-char hex suffix with single retry on collision for uniqueness
- [06-03]: Delete form actions wrapped in inline "use server" functions for void return type compatibility
- [06-03]: Episode reorder uses move-up/move-down buttons (no DnD library) with useTransition
- [06-03]: Mux asset cleanup on episode delete; non-critical failure silently caught
- [06-03]: Season price_cents synced from price_tiers table at create/update time
- [07-01]: requireAdmin() checks auth + role in server components/actions, not middleware (keeps middleware simple)
- [07-01]: Admin panel uses createAdminClient() for cross-user data access; admin RLS policies are defense-in-depth only
- [07-01]: ApplicationReviewForm uses useTransition + toast pattern instead of useActionState (simpler for two-button approve/reject flow)
- [07-02]: Supabase untyped admin client FK joins typed with 'as unknown as' casts to match runtime shape (objects not arrays)
- [07-02]: AdminSearch uses form submission pattern (not real-time debounce) for simplicity and server component compatibility
- [07-02]: Content moderation uses status change to 'archived' (soft delete) rather than hard delete, preserving data for compliance
- [07-02]: Revenue page computes summary metrics client-side from query results rather than separate aggregate queries
- [07-03]: FeaturedCard and PickCard built inline in homepage (not reusing SeriesCard) because query shapes differ from SeriesWithCreator type
- [07-03]: Editorial picks 'featured' section excluded from homepage display (already covered by getFeaturedSeries section)
- [07-03]: Next.js Image with unoptimized flag for dynamic Supabase Storage thumbnail URLs (avoids remotePatterns config)
- [07-04]: Platform metrics use 8 parallel Supabase queries with head:true count optimization for minimal latency
- [07-04]: Revenue figures derived from completed purchases sum (amount_cents, platform_fee_cents, creator_share_cents)
- [07-04]: Supabase untyped admin client FK joins require 'as unknown as' double cast for correct TS types
- [08-03]: Used (pitch) route group instead of (public) to avoid Header/Footer on pitch pages
- [08-03]: Remotion compositions use inline styles (not Tailwind) for iframe rendering compatibility
- [08-03]: FeatureSection uses next/dynamic with ssr:false to prevent Remotion Player SSR issues
- [08-03]: Excluded scripts/ from tsconfig to prevent seed script build errors in Next.js type checking
- [08-01]: Seed scripts use standalone Supabase/Mux clients (not importing from src/) to avoid Next.js coupling
- [08-01]: 12 creator personas with mock_ username prefix and @mock.microshort.dev emails for idempotency
- [08-01]: 20 series across all 11 genres with SIGNAL LOST as sole sci-fi hero demo series
- [08-01]: Seeded PRNG in engagement data generators for deterministic results across runs
- [08-04]: Investor page market stats are industry-level data (4.5B viewers, Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: Research recommends Next.js 16 + Supabase + Mux + Stripe stack (HIGH confidence)
- [Roadmap]: iOS PWA video playback freeze must be solved in Phase 3 (blob URL workaround)
- [Roadmap]: Mock data seeding deferred to Phase 8 (needs functional platform first)
- [Roadmap]: Live reactions use Supabase Realtime; start with accumulated-only in Phase 9
- [01-01]: Used named import { withSerwist } from @serwist/turbopack (not default import as research docs suggest)
- [01-01]: Disabled noNonNullAssertion lint rule for Supabase env vars (standard Supabase pattern)
- [01-01]: Enabled tailwindDirectives in Biome CSS parser for Tailwind v4 support
- [01-01]: pnpm.onlyBuiltDependencies for @swc/core and esbuild build script approval
- [01-02]: Supabase CLI installed via npx (Homebrew blocked by Xcode CLT version mismatch)
- [01-02]: Docker unavailable for local DB validation; migration SQL manually verified
- [01-03]: createSerwistRoute uses main @serwist/turbopack import, not /route subpath (research docs incorrect)
- [01-03]: createSerwistRoute requires {swSrc, useNativeEsbuild} options (not zero-arg as research showed)
- [01-03]: Global error boundary uses inline styles to survive root layout failures
- [02-01]: Zod v4 API differs from v3: z.email(), .check() with ctx.issues.push(), standalone z.flattenError()
- [02-01]: Mobile nav receives user prop from header instead of own auth listener (avoids duplicate subscriptions)
- [02-01]: FieldError children pattern used for string[] from Zod flattenError (instead of errors prop)
- [02-02]: Episode access gate is application-level (UI gating), not RLS -- RLS already makes published episodes visible
- [02-02]: checkEpisodeAccess is a synchronous pure function for testability and Phase 5 payment integration
- [02-02]: Auth redirect includes next query param for future post-login redirect enhancement
- [02-03]: Anti-enumeration: forgot-password always returns success message regardless of whether email exists
- [02-03]: Recovery email template includes next=/reset-password param so auth callback redirects to password form
- [03-01]: Mux SDK v12.8 signPlaybackId is async (returns Promise<string>), not sync as commonly documented
- [03-01]: Used SDK built-in mux.webhooks.unwrap() for webhook verification instead of hand-rolling HMAC-SHA256
- [03-01]: Created Supabase admin client (service role) for webhook handler -- cookies-based server client cannot work in webhook context
- [03-01]: Mux constructor auto-reads all env vars (MUX_TOKEN_ID, MUX_TOKEN_SECRET, MUX_SIGNING_KEY, MUX_PRIVATE_KEY, MUX_WEBHOOK_SECRET)
- [03-02]: MuxPlayer onContextMenu not in props -- right-click prevention moved to wrapping div container
- [03-02]: Used MuxPlayerCSSProperties type (not React.CSSProperties cast) for type-safe --media-object-fit custom property
- [03-02]: signPlaybackToken calls use Promise.all for parallel token generation (playback + thumbnail)
- [03-02]: Episode data fetched via Supabase join: episodes -> seasons!inner -> series!inner for slug matching
- [03-03]: AutoContinue uses SVG ring countdown animation with pure Tailwind/CSS -- no external animation libraries
- [03-03]: Client-side navigation via router.push() for seamless episode transition without full page reload
- [03-03]: Next episode title fetched in same query as next episode detection -- single additional select column
- [04-01]: nuqs with history: push for genre filter so browser back button navigates genre changes
- [04-01]: Supabase inner join on profiles for creator display name -- series without valid creator_id excluded
- [04-01]: Episode count computed by flattening seasons->episodes nested arrays from Supabase response
- [04-01]: Genre filter clears URL param for "All" (no ?genre=all) to keep clean unfiltered URLs
- [04-02]: Exported FREE_EPISODE_LIMIT from access module for cross-component usage (was unexported const)
- [04-02]: Single-season series skip tab bar -- episodes show directly without unnecessary tabs
- [04-02]: View count formatted with K/M suffixes (1.2K, 3.5M) for compact header display
- [04-03]: generateStaticParams uses direct Supabase client (not cookies-based) since it runs at build time outside request scope
- [04-03]: OG image uses Node.js runtime (not edge) to avoid Supabase client cookie context issues
- [04-03]: SeriesDetail uses generateShareUrl for UTM-tracked share links instead of raw URL construction
- [05-01]: Stripe client uses Proxy-based lazy initialization to avoid build-time errors when STRIPE_SECRET_KEY is not set
- [05-01]: Bundle purchases use proportional price distribution across seasons based on individual price ratios
- [05-01]: Webhook stores composite stripe_session_id per season in bundles (sessionId_seasonId) for idempotency with unique constraint
- [05-01]: Platform fee calculated as 20% with creator receiving remainder (subtraction-based to avoid rounding loss)
- [05-02]: Value before account: both auth_required and payment_required show SeasonPaywall; UnlockButton handles login redirect for unauthenticated users
- [05-02]: Backup fulfillment on checkout success page handles webhook race condition with same idempotency guards
- [05-02]: Episode page restructured with early metadata fetch for episodes beyond free limit to support paywall rendering
- [05-02]: Bundle offer section on series page only shows when 2+ unpurchased seasons exist
- [05-03]: Batch transfers use source_transaction linking to original charges for automatic fund availability handling
- [05-03]: Dual-path onboarding verification: return URL route as primary, account.updated webhook as reliable backup
- [05-03]: Failed individual transfers recorded with payout_record status='failed' without stopping the batch
- [05-03]: Payouts dashboard shows completed payouts only (per user constraint: no pending/in-transit pipeline visibility)
- [06-01]: Social links parsed as comma-separated URLs or JSON; stored as JSONB keyed by hostname
- [06-01]: Rejected applicants can reapply (old application deleted, new one inserted to maintain UNIQUE constraint)
- [06-01]: Follower count denormalized via database trigger (increment/decrement) to avoid COUNT queries on profile pages
- [06-01]: Textarea component added to shadcn UI set (was missing, needed for multi-line form fields)
- [06-02]: Used playback_policies (plural, current) instead of deprecated playback_policy in Mux SDK v12.8
- [06-02]: Two-step upload form: metadata creates episode row first, then MuxUploader uploads video
- [06-02]: Thumbnail images use unoptimized Next.js Image to avoid remotePatterns config for dynamic Supabase Storage URLs
- [06-02]: Episode ID passed via Mux passthrough field; existing webhook handler automatically links processed asset
- [06-04]: Analytics computed from existing tables (series.view_count, purchases) -- no separate analytics tables
- [06-04]: Per-series breakdown maps purchases through seasons to parent series for aggregation
- [06-04]: Dashboard home is role-aware: viewer gets apply CTA, creator/admin gets overview stats
- [06-04]: Both analytics queries wrapped in React.cache for request-level deduplication
- [06-06]: Social links stored as JSONB keyed by hostname (twitter.com, instagram.com, etc.) for structured display
- [06-06]: FollowButton uses React 19 useOptimistic for instant toggle without server roundtrip wait
- [06-06]: Social platform icons as inline SVGs for brand-accurate logos (not generic lucide-react icons)
- [06-06]: Profile settings uses individual URL fields per platform (not free-text) for better validation
- [06-05]: Supabase Realtime subscription on community_posts filtered by series_id for live feed updates
- [06-05]: One-vote-per-user enforced both application-level (check before insert) and DB-level (UNIQUE constraint)
- [06-05]: Trailers use playback_policies: ["public"] for shareable promotional content (no signed tokens)
- [06-05]: trailer_ passthrough prefix distinguishes trailer from episode uploads in Mux webhook handler
- [06-05]: Trailer playback ID stored as mux:{playbackId} format in series.trailer_url column
- [06-03]: Slug generation uses random 4-char hex suffix with single retry on collision for uniqueness
- [06-03]: Delete form actions wrapped in inline "use server" functions for void return type compatibility
- [06-03]: Episode reorder uses move-up/move-down buttons (no DnD library) with useTransition
- [06-03]: Mux asset cleanup on episode delete; non-critical failure silently caught
- [06-03]: Season price_cents synced from price_tiers table at create/update time
- [07-01]: requireAdmin() checks auth + role in server components/actions, not middleware (keeps middleware simple)
- [07-01]: Admin panel uses createAdminClient() for cross-user data access; admin RLS policies are defense-in-depth only
- [07-01]: ApplicationReviewForm uses useTransition + toast pattern instead of useActionState (simpler for two-button approve/reject flow)
- [07-02]: Supabase untyped admin client FK joins typed with 'as unknown as' casts to match runtime shape (objects not arrays)
- [07-02]: AdminSearch uses form submission pattern (not real-time debounce) for simplicity and server component compatibility
- [07-02]: Content moderation uses status change to 'archived' (soft delete) rather than hard delete, preserving data for compliance
- [07-02]: Revenue page computes summary metrics client-side from query results rather than separate aggregate queries
- [07-03]: FeaturedCard and PickCard built inline in homepage (not reusing SeriesCard) because query shapes differ from SeriesWithCreator type
- [07-03]: Editorial picks 'featured' section excluded from homepage display (already covered by getFeaturedSeries section)
- [07-03]: Next.js Image with unoptimized flag for dynamic Supabase Storage thumbnail URLs (avoids remotePatterns config)
- [07-04]: Platform metrics use 8 parallel Supabase queries with head:true count optimization for minimal latency
- [07-04]: Revenue figures derived from completed purchases sum (amount_cents, platform_fee_cents, creator_share_cents)
- [07-04]: Supabase untyped admin client FK joins require 'as unknown as' double cast for correct TS types
- [08-03]: Used (pitch) route group instead of (public) to avoid Header/Footer on pitch pages
- [08-03]: Remotion compositions use inline styles (not Tailwind) for iframe rendering compatibility
- [08-03]: FeatureSection uses next/dynamic with ssr:false to prevent Remotion Player SSR issues
- [08-03]: Excluded scripts/ from tsconfig to prevent seed script build errors in Next.js type checking
- [08-01]: Seed scripts use standalone Supabase/Mux clients (not importing from src/) to avoid Next.js coupling
- [08-01]: 12 creator personas with mock_ username prefix and @mock.microshort.dev emails for idempotency
- [08-01]: 20 series across all 11 genres with SIGNAL LOST as sole sci-fi hero demo series
- [08-01]: Seeded PRNG in engagement data generators for deterministic results across runs
- [08-02]: Skip purchase records in seed (requires real Stripe session IDs); view/follower counts sufficient for demo
- [08-02]: Individual Mux assets per episode even with same placeholder source for realistic cleanup and management
- [08-04]: Investor page market stats are industry-level data (4.5B viewers, $250B economy) not fake MicroShort traction
- [08-04]: Creator economics uses visual CPM comparison ($0.02 ad vs $4.99 MicroShort) with concrete math example
- [08-05]: Brand page uses inline AdProductVisual sub-components instead of Remotion compositions (avoids ssr:false in Server Component)
- [08-05]: Advisor page uses flowing narrative with pull-quotes instead of bullet-point format for storytelling tone
- [08-05]: Brand page does not import FeatureSection (avoids ssr:false dynamic import in server component context)

### Pending Todos

None yet.

### Blockers/Concerns

- [RESOLVED]: Serwist Turbopack (@serwist/turbopack v9.5.6) works with Turbopack -- confirmed in 01-01 execution
- [RESOLVED]: Stripe Connect Express accounts configured for US with transfers capability -- cross-border handled by Stripe
- [Research]: Meta Conversions API requires domain verification -- start approval process early

## Session Continuity

Last session: 2026-02-15
Stopped at: Completed 08-05-PLAN.md (brand and advisor pitch pages)
Resume file: .planning/phases/08-mock-data-pitch-assets/08-05-SUMMARY.md
