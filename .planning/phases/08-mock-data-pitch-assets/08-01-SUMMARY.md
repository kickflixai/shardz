---
phase: 08-mock-data-pitch-assets
plan: 01
subsystem: database
tags: [seed-script, mock-data, supabase, mux, fal-ai, tsx]

# Dependency graph
requires:
  - phase: 01-foundation-app-shell
    provides: "Supabase client patterns, database schema, content hierarchy types"
  - phase: 06-creator-dashboard
    provides: "Full content model (series, seasons, episodes, profiles, social_links, followers)"
provides:
  - "Standalone Supabase admin client for seed scripts"
  - "Standalone Mux SDK client for seed scripts"
  - "Storage upload helper for thumbnail seeding"
  - "fal.ai thumbnail generation script"
  - "12 creator personas with full profiles"
  - "20 series definitions across all 11 genres"
  - "Engagement data generators (views, purchases, followers)"
affects: [08-02-PLAN, 08-03-PLAN]

# Tech tracking
tech-stack:
  added: [tsx, "@fal-ai/client"]
  patterns: ["standalone seed script helpers (not importing from Next.js app)", "seeded PRNG for deterministic mock data", "mock_ prefix convention for cleanup"]

key-files:
  created:
    - scripts/seed/lib/supabase.ts
    - scripts/seed/lib/mux.ts
    - scripts/seed/lib/storage.ts
    - scripts/seed/generate-thumbnails.ts
    - scripts/seed/data/creators.ts
    - scripts/seed/data/series.ts
    - scripts/seed/data/engagement.ts
    - scripts/seed/assets/thumbnails/.gitkeep
  modified:
    - package.json
    - pnpm-lock.yaml

key-decisions:
  - "12 creator personas with mock_ username prefix and @mock.microshort.dev emails for deterministic idempotency"
  - "20 series across all 11 genres with SIGNAL LOST as sole sci-fi hero demo series"
  - "Seeded PRNG in engagement data for consistent results across runs"
  - "Seed scripts are standalone TypeScript (not importing from src/) to avoid Next.js coupling"

patterns-established:
  - "mock_ prefix on usernames and mock- prefix on slugs for easy identification and cleanup"
  - "creatorIndex references into MOCK_CREATORS array for FK linking during seed execution"
  - "Pure TypeScript data definitions with no side effects consumed by execution scripts"

# Metrics
duration: 8min
completed: 2026-02-15
---

# Phase 8 Plan 1: Seed Script Infrastructure Summary

**Standalone seed helpers (Supabase admin, Mux, Storage) with 20 series across all 11 genres, 12 creator personas, and fal.ai thumbnail generation**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-15T11:32:23Z
- **Completed:** 2026-02-15T11:40:37Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- Seed script infrastructure with standalone Supabase admin, Mux SDK, and Storage upload helpers
- 20 believable series definitions spanning all 11 genre categories with 8+ episodes per season
- 12 unique creator personas with distinct voices, bios, and social links
- fal.ai thumbnail generation script for one-time AI image creation
- Deterministic engagement data generators using seeded PRNG

## Task Commits

Each task was committed atomically:

1. **Task 1: Create seed script helpers and install dependencies** - `a65b9fd` (feat)
2. **Task 2: Create comprehensive mock data definitions** - `df96098` (feat)

## Files Created/Modified
- `scripts/seed/lib/supabase.ts` - Standalone Supabase admin client for seed scripts
- `scripts/seed/lib/mux.ts` - Standalone Mux SDK client for seed scripts
- `scripts/seed/lib/storage.ts` - Thumbnail upload + public URL helper
- `scripts/seed/generate-thumbnails.ts` - fal.ai Flux thumbnail generation script
- `scripts/seed/data/creators.ts` - 12 creator persona definitions with full profiles
- `scripts/seed/data/series.ts` - 20 series across all 11 genres with seasons and episodes
- `scripts/seed/data/engagement.ts` - View count, purchase, and follower generators
- `scripts/seed/assets/thumbnails/.gitkeep` - Directory placeholder for generated thumbnails
- `package.json` - Added tsx (devDep) and @fal-ai/client dependencies
- `pnpm-lock.yaml` - Lock file updated

## Decisions Made
- **12 creators (not 10 or 15):** Sweet spot for covering all genre categories while keeping each persona distinct and memorable
- **20 series (not 18 or 25):** Covers all 11 genres with 1-2 series each, giving enough variety without bloating seed time
- **SIGNAL LOST as hero series:** Sci-fi generates the most visually striking AI thumbnails and has abundant royalty-free stock footage available
- **Seeded PRNG for engagement:** Deterministic random numbers ensure consistent data across seed runs without requiring stored seeds
- **Standalone seed helpers:** Seed scripts import Supabase/Mux directly, not from src/lib/, to avoid Next.js runtime dependencies in CLI scripts

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Extended pricing range to match plan requirements**
- **Found during:** Task 2 (mock data definitions)
- **Issue:** Initial pricing only spanned $1.99-$5.99, but plan specified $0.99-$7.99 range
- **Fix:** Adjusted Awkward Exits to $0.99 and SIGNAL LOST S2 to $7.99
- **Files modified:** scripts/seed/data/series.ts
- **Verification:** tsx validation confirmed 7 unique price points from $0.99-$7.99
- **Committed in:** df96098 (Task 2 commit)

**2. [Rule 2 - Missing Critical] Added 2 additional series for comprehensive coverage**
- **Found during:** Task 2 (mock data definitions)
- **Issue:** Initial 18 series left Horror and Documentary with only 1 series each; plan recommended 18-22 with even coverage
- **Fix:** Added "Sleep Study" (horror) and "Micro Giants" (documentary) to reach 20 series with better genre balance
- **Files modified:** scripts/seed/data/series.ts
- **Verification:** tsx validation confirmed 20 series, all 11 genres covered
- **Committed in:** df96098 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 missing critical)
**Impact on plan:** Both fixes improve data quality and plan compliance. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required for data definitions. FAL_KEY will be needed when running the thumbnail generation script (documented in generate-thumbnails.ts).

## Next Phase Readiness
- All data definitions ready for the seed execution script (08-02) to consume
- Helper utilities (Supabase admin, Mux, Storage) ready for database operations
- Thumbnail generation script ready to run once FAL_KEY is configured
- scripts/seed/assets/thumbnails/ directory exists for generated images

## Self-Check: PASSED

All 9 created files verified on disk. Both task commits (a65b9fd, df96098) verified in git log.

---
*Phase: 08-mock-data-pitch-assets*
*Completed: 2026-02-15*
