---
phase: 06-creator-dashboard
plan: 03
subsystem: api, ui
tags: [server-actions, zod, react, supabase, crud, forms, useActionState, mux]

# Dependency graph
requires:
  - phase: 06-creator-dashboard
    provides: "Database schema (series/seasons/episodes), Zod validation schemas, CreatorFormState type, ThumbnailUpload component, createEpisode action"
  - phase: 03-video-player
    provides: "Mux client singleton for asset cleanup on episode delete"
provides:
  - "createSeries, updateSeries, deleteSeries server actions"
  - "createSeason, updateSeason, deleteSeason server actions"
  - "updateEpisode, deleteEpisode, reorderEpisodes server actions"
  - "getCreatorSeries query with season/episode counts"
  - "Series catalog list page at /dashboard/series"
  - "Create/edit series pages with SeriesForm component"
  - "Create/edit season pages with SeasonForm component"
  - "Season management page with EpisodeListManager"
  - "Episode reorder via sort_order (no episode_number mutation)"
affects: [06-creator-dashboard, 07-admin]

# Tech tracking
tech-stack:
  added: []
  patterns: [server-action-bind-for-id, inline-server-action-for-delete, move-up-down-reorder]

key-files:
  created:
    - "src/modules/creator/actions/series.ts"
    - "src/modules/creator/actions/seasons.ts"
    - "src/modules/creator/queries/get-creator-series.ts"
    - "src/app/(creator)/dashboard/series/page.tsx"
    - "src/app/(creator)/dashboard/series/new/page.tsx"
    - "src/app/(creator)/dashboard/series/[seriesId]/page.tsx"
    - "src/app/(creator)/dashboard/series/[seriesId]/seasons/new/page.tsx"
    - "src/app/(creator)/dashboard/series/[seriesId]/seasons/[seasonId]/page.tsx"
    - "src/components/creator/series-form.tsx"
    - "src/components/creator/season-form.tsx"
    - "src/components/creator/episode-list-manager.tsx"
  modified:
    - "src/modules/creator/actions/episodes.ts"

key-decisions:
  - "Slug generation uses random 4-char hex suffix with retry on collision for uniqueness"
  - "Delete actions wrapped in inline server actions to match form action void return type"
  - "Episode reorder uses move-up/move-down buttons (no DnD library needed)"
  - "Mux asset cleanup on episode delete via mux.video.assets.delete()"
  - "Season price_cents synced from price_tiers table at create/update time"

patterns-established:
  - "Server action .bind(null, id) for passing entity IDs to update actions"
  - "Inline 'use server' async functions for delete form actions (void return)"
  - "Move-up/move-down reorder with useTransition and optimistic state"

# Metrics
duration: 6min
completed: 2026-02-14
---

# Phase 6 Plan 3: Series/Season/Episode Management Summary

**Full CRUD server actions for series/seasons/episodes with catalog UI, price tier selection, release strategy config, and sort_order-based episode reordering**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-14T21:39:41Z
- **Completed:** 2026-02-14T21:46:02Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Complete server actions for series, season, and episode CRUD with auth + ownership checks at every level
- Series catalog list page with grid layout, thumbnails, status/genre badges, and season/episode counts
- Create/edit forms for series (with thumbnail upload and genre select) and seasons (with price tier and release strategy)
- Season management page with episode list, move-up/move-down reorder, and publish warning for episode count constraints
- Episode delete cleans up Mux video assets; reorder uses sort_order to avoid unique constraint issues

## Task Commits

Each task was committed atomically:

1. **Task 1: Server Actions for series, season, and episode CRUD** - `ac7ed7f` (feat)
2. **Task 2: Series catalog pages and management UI** - `7775d5e` (feat)

## Files Created/Modified
- `src/modules/creator/actions/series.ts` - createSeries, updateSeries, deleteSeries with slug generation and retry
- `src/modules/creator/actions/seasons.ts` - createSeason, updateSeason, deleteSeason with price tier sync
- `src/modules/creator/actions/episodes.ts` - Added updateEpisode, deleteEpisode (with Mux cleanup), reorderEpisodes
- `src/modules/creator/queries/get-creator-series.ts` - React.cache query returning series with season/episode counts
- `src/app/(creator)/dashboard/series/page.tsx` - Series catalog grid with empty state
- `src/app/(creator)/dashboard/series/new/page.tsx` - Create series page wrapping SeriesForm
- `src/app/(creator)/dashboard/series/[seriesId]/page.tsx` - Series detail with edit form, season list, delete zone
- `src/app/(creator)/dashboard/series/[seriesId]/seasons/new/page.tsx` - Create season with price tiers
- `src/app/(creator)/dashboard/series/[seriesId]/seasons/[seasonId]/page.tsx` - Season management with episode list
- `src/components/creator/series-form.tsx` - Client form with useActionState, genre select, ThumbnailUpload
- `src/components/creator/season-form.tsx` - Client form with price tier select, release strategy radios, drip interval
- `src/components/creator/episode-list-manager.tsx` - Move-up/down reorder, status badges, delete with Mux cleanup

## Decisions Made
- Slug generation uses random 4-char hex suffix (e.g., "my-series-a3f9") with single retry on collision to ensure uniqueness without database round-trip
- Delete actions wrapped in inline "use server" async functions because form actions must return void, but our server actions return CreatorFormState
- Episode reorder uses simple move-up/move-down buttons with useTransition for non-blocking UI (no drag-and-drop library needed for v1)
- Mux video assets are cleaned up on episode delete via mux.video.assets.delete() with try/catch for non-critical failure
- Season price_cents is synced from the price_tiers table at create/update time, keeping it co-located with the season row

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Delete server action return type incompatible with form action**
- **Found during:** Task 2 (Series detail page, Season detail page)
- **Issue:** deleteSeries/deleteSeason return CreatorFormState (Promise<CreatorFormState>) but form action expects void return. TypeScript error TS2322.
- **Fix:** Wrapped delete calls in inline "use server" async functions that await the action without returning the result
- **Files modified:** src/app/(creator)/dashboard/series/[seriesId]/page.tsx, src/app/(creator)/dashboard/series/[seriesId]/seasons/[seasonId]/page.tsx
- **Verification:** TypeScript compiles clean
- **Committed in:** 7775d5e (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Type-safety fix required for Next.js form action pattern. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Full CRUD pipeline for series/seasons/episodes complete
- Series catalog accessible from sidebar navigation via /dashboard/series
- Season management with price tiers and release strategy ready for viewer-facing publish flow
- Episode list manager ready for integration with upload pipeline from Plan 02
- All forms reuse established patterns (useActionState, CreatorFormState, ThumbnailUpload)

## Self-Check: PASSED

All 12 created/modified files verified on disk. Both task commits (ac7ed7f, 7775d5e) found in git log.

---
*Phase: 06-creator-dashboard*
*Completed: 2026-02-14*
