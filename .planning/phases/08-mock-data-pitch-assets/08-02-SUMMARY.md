---
phase: 08-mock-data-pitch-assets
plan: 02
subsystem: database
tags: [seed-script, mock-data, supabase, mux, tsx, idempotent]

# Dependency graph
requires:
  - phase: 08-mock-data-pitch-assets
    plan: 01
    provides: "Standalone Supabase/Mux clients, 12 creator definitions, 20 series definitions, engagement generators, storage helper"
  - phase: 01-foundation-app-shell
    provides: "Database schema with series/seasons/episodes/profiles tables and FK constraints"
  - phase: 06-creator-dashboard
    provides: "Full content model including social_links, follower_count, community_posts, followers table"
provides:
  - "pnpm seed command that populates platform with 12 creators, 20 series, thumbnails, Mux video, and engagement"
  - "pnpm seed:clear command that removes all mock data (Mux, Storage, DB, auth users)"
  - "Idempotent seed execution via upsert with onConflict"
  - "Mux asset polling helper for seed-time video readiness"
affects: [08-03-PLAN, 08-04-PLAN, 08-05-PLAN, 08-06-PLAN]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Six-step orchestrated seed with strict FK ordering", "Episode-before-season publish for trigger compliance", "Batch Mux polling with parallel Promise.all", "Reverse-order cleanup for FK-safe deletion"]

key-files:
  created:
    - scripts/seed/index.ts
    - scripts/seed/clear.ts
  modified:
    - package.json

key-decisions:
  - "Skip purchase records in seed -- purchases table requires real Stripe session IDs (UNIQUE NOT NULL) that can't be meaningfully mocked"
  - "Leave duration_seconds NULL on seeded episodes to avoid CHECK constraint (60-180s) with stock footage of arbitrary length"
  - "Create individual Mux assets per episode (even for non-hero with same source) for realistic asset management and cleanup"
  - "Feature 5 series across 5 genres (sci-fi, thriller, drama, action, music) for homepage variety"

patterns-established:
  - "Seed FK ordering: auth users -> profiles -> series -> seasons -> episodes -> Mux -> engagement -> featured"
  - "Episodes published before seasons to satisfy check_season_episode_count trigger (8+ published episodes required)"
  - "Clear reverse ordering: Mux assets -> Storage files -> DB records (CASCADE) -> auth users"
  - "Batch Mux polling: 10 assets per batch with 120s timeout and 5s interval"

# Metrics
duration: 3min
completed: 2026-02-15
---

# Phase 8 Plan 2: Seed Execution and Clear Scripts Summary

**Full platform seed orchestration (auth users, series hierarchy, Mux video, engagement) with idempotent upserts and reverse-order clear script**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-15T11:43:18Z
- **Completed:** 2026-02-15T11:46:50Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Main seed script orchestrating 6-step platform population with strict FK ordering and DB trigger compliance
- Clear script with 5-step reverse-order cleanup of Mux assets, Storage files, DB records, and auth users
- Package.json commands: pnpm seed, pnpm seed:clear, pnpm seed:thumbnails
- Idempotent operations throughout using upsert with onConflict for safe re-runs

## Task Commits

Each task was committed atomically:

1. **Task 1: Create main seed script with full orchestration** - `70ae5dc` (feat)
2. **Task 2: Create clear script for mock data removal** - `df8a087` (feat)

## Files Created/Modified
- `scripts/seed/index.ts` - Main seed entry point: auth users, profiles, thumbnails, series/seasons/episodes, Mux video, engagement, featured flags
- `scripts/seed/clear.ts` - Complete cleanup: identifies mock content, deletes Mux assets, Storage files, DB records, auth users
- `package.json` - Added seed, seed:clear, seed:thumbnails scripts

## Decisions Made
- **Skip mock purchases:** The purchases table requires a real `stripe_session_id` (UNIQUE NOT NULL) that can't be meaningfully generated without Stripe. View counts and follower counts are sufficient for demo/pitch display.
- **NULL duration_seconds:** Stock footage clips are arbitrary lengths, not 60-180 seconds. Leaving NULL avoids the CHECK constraint while Mux still ingests and plays the video normally.
- **Individual Mux assets per episode:** Even for non-hero series using the same placeholder source, each episode gets its own Mux asset. This provides realistic asset management, proper cleanup, and avoids sharing playback_ids across episodes.
- **5 featured series:** Selected SIGNAL LOST (hero), Dead Drop (thriller), Fractured Glass (drama), Flashpoint (action), and Resonance (music) for genre variety on the homepage.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - seed and clear scripts use existing .env.local credentials (Supabase service role key, Mux token). These were configured in earlier phases.

## Next Phase Readiness
- `pnpm seed` ready to populate the platform once Supabase and Mux services are running
- `pnpm seed:clear` ready to wipe mock data for fresh state
- Thumbnail generation (pnpm seed:thumbnails from 08-01) should be run before seeding for thumbnail uploads
- All 20 series, 12 creators, and engagement metrics ready for pitch asset generation in 08-03+

## Self-Check: PASSED

All 2 created files verified on disk. Both task commits (70ae5dc, df8a087) verified in git log.

---
*Phase: 08-mock-data-pitch-assets*
*Completed: 2026-02-15*
