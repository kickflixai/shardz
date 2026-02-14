# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-14)

**Core value:** Creators can monetize short-form video content with minimal friction -- upload a series, set a price, and earn revenue from a platform purpose-built for microshorts.
**Current focus:** Phase 3 - Video Player

## Current Position

Phase: 3 of 9 (Video Player)
Plan: 2 of 3 in current phase
Status: In Progress
Last activity: 2026-02-14 -- Completed 03-02-PLAN.md (Video Player & Layout)

Progress: [▓▓▓░░░░░░░] 30%

## Performance Metrics

**Velocity:**
- Total plans completed: 8
- Average duration: 4min
- Total execution time: 0.52 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation-app-shell | 3 | 16min | 5min |
| 02-authentication-access | 3 | 8min | 3min |
| 03-video-player | 2 | 7min | 4min |

**Recent Trend:**
- Last 5 plans: 4min, 2min, 2min, 4min, 3min
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

### Pending Todos

None yet.

### Blockers/Concerns

- [RESOLVED]: Serwist Turbopack (@serwist/turbopack v9.5.6) works with Turbopack -- confirmed in 01-01 execution
- [Research]: Stripe Connect cross-border payout restrictions need research before Phase 5
- [Research]: Meta Conversions API requires domain verification -- start approval process early

## Session Continuity

Last session: 2026-02-14
Stopped at: Completed 03-02-PLAN.md (Video Player & Layout)
Resume file: .planning/phases/03-video-player/03-02-SUMMARY.md
