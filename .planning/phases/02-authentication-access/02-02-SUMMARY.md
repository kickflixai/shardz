---
phase: 02-authentication-access
plan: 02
subsystem: auth
tags: [middleware-route-protection, episode-access-gate, free-content-model, discriminated-union]

# Dependency graph
requires:
  - phase: 02-authentication-access
    plan: 01
    provides: "Supabase auth middleware with getUser session refresh, login/signup pages, server Supabase client"
provides:
  - "Middleware-level route protection for /dashboard and /admin (redirect to /login)"
  - "Middleware redirect of authenticated users away from /login and /signup"
  - "checkEpisodeAccess pure function with discriminated union return type"
  - "Episode detail page with free/auth/payment access gating"
  - "FREE_EPISODE_LIMIT constant (3) for free-tier policy"
affects: [02-03, 03-video-player, 04-creator-dashboard, 05-payments]

# Tech tracking
tech-stack:
  added: []
  patterns: [middleware-route-protection, discriminated-union-access-result, application-level-access-gating]

key-files:
  created:
    - src/lib/access.ts
    - src/app/(browse)/series/[slug]/episode/[episodeNumber]/page.tsx
  modified:
    - src/lib/supabase/middleware.ts

key-decisions:
  - "Episode access gate is application-level (UI gating), not RLS-level -- RLS already makes published episodes visible"
  - "checkEpisodeAccess is synchronous pure function for easy testability and Phase 5 payment integration"
  - "Auth redirect for /login includes next query param for future post-login redirect enhancement"

patterns-established:
  - "Route protection pattern: protectedPrefixes array checked after getUser() in middleware"
  - "Access check pattern: discriminated union return type (allowed + reason) for type-safe conditional rendering"
  - "Free content pattern: FREE_EPISODE_LIMIT constant governs free-tier boundary"

# Metrics
duration: 2min
completed: 2026-02-14
---

# Phase 2 Plan 2: Route Protection + Episode Access Summary

**Middleware route protection for /dashboard and /admin with episode-level access gating using a discriminated union access check (episodes 1-3 free, 4+ require auth)**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-14T14:07:09Z
- **Completed:** 2026-02-14T14:08:52Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Middleware-level route protection redirecting unauthenticated users from /dashboard and /admin to /login (with next param)
- Middleware redirect of authenticated users away from /login and /signup to /
- Pure checkEpisodeAccess function with discriminated union for free/purchased/auth_required/payment_required states
- Episode detail page at /series/[slug]/episode/[episodeNumber] with three access states rendered appropriately

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend middleware with route protection and create episode access utility** - `f78a8a6` (feat)
2. **Task 2: Create episode page with access gating** - `8476356` (feat)

## Files Created/Modified

- `src/lib/supabase/middleware.ts` - Extended with protectedPrefixes redirect and authPaths redirect for authenticated users
- `src/lib/access.ts` - Pure function checkEpisodeAccess with EpisodeAccessResult discriminated union type
- `src/app/(browse)/series/[slug]/episode/[episodeNumber]/page.tsx` - Episode detail page with free/auth/payment access gating

## Decisions Made

- **Application-level access gating:** The episode access check is UI-level, not database-level. RLS policies from Phase 1 already make published episodes visible to all users. The access gate determines what UI to render (content vs signup prompt vs payment placeholder), not what data to return from the database.
- **Pure function for access check:** checkEpisodeAccess is synchronous with no side effects, making it trivially testable and easy for Phase 5 to extend with hasPurchased from a real payment check.
- **next query param on login redirect:** Protected route redirects include `?next=/path` so the login flow can redirect back after authentication (login action currently redirects to `/`, but the param is ready for future enhancement).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. Uses existing Supabase auth infrastructure from Phase 1 and Plan 02-01.

## Next Phase Readiness

- Route protection is active for /dashboard and /admin -- future dashboard and admin pages are protected automatically
- Episode access gate is in place -- Phase 3 video player will render inside the access-granted state
- checkEpisodeAccess accepts hasPurchased parameter -- Phase 5 payments will pass actual purchase status
- FREE_EPISODE_LIMIT constant is centralized and ready for configuration changes

## Self-Check: PASSED

- All 3 source files verified present on disk
- Commit f78a8a6 verified in git log
- Commit 8476356 verified in git log
- pnpm build passes cleanly

---
*Phase: 02-authentication-access*
*Completed: 2026-02-14*
