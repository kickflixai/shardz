---
phase: 06-creator-dashboard
plan: 05
subsystem: ui, api
tags: [supabase-realtime, community, polls, mux, direct-upload, server-actions, react]

# Dependency graph
requires:
  - phase: 06-creator-dashboard
    provides: "Database schema (community_posts, poll_votes tables), Mux client, webhook handler, CreatorFormState type"
provides:
  - "Server actions: createPost, createPoll, deletePost, pinPost, votePoll"
  - "getCommunityPosts query with author join"
  - "CommunityFeed client component with Supabase Realtime subscription"
  - "PollCreator form with 2-6 dynamic options"
  - "Community management page at /dashboard/series/[seriesId]/community"
  - "POST /api/upload/trailer endpoint with public playback policy"
  - "TrailerUpload client component using MuxUploader"
  - "Mux webhook handler distinguishes trailer vs episode via passthrough prefix"
affects: [07-admin, 08-data-seeding, 09-engagement]

# Tech tracking
tech-stack:
  added: []
  patterns: [supabase-realtime-postgres-changes, trailer-passthrough-prefix, public-playback-policy]

key-files:
  created:
    - "src/modules/creator/actions/community.ts"
    - "src/modules/creator/queries/get-community-posts.ts"
    - "src/components/creator/community-feed.tsx"
    - "src/components/creator/poll-creator.tsx"
    - "src/app/(creator)/dashboard/series/[seriesId]/community/page.tsx"
    - "src/app/api/upload/trailer/route.ts"
    - "src/components/creator/trailer-upload.tsx"
  modified:
    - "src/app/api/webhooks/mux/route.ts"
    - "src/app/(creator)/dashboard/series/[seriesId]/page.tsx"

key-decisions:
  - "Supabase Realtime subscription on community_posts filtered by series_id for live feed updates"
  - "One-vote-per-user enforced both application-level (check before insert) and DB-level (UNIQUE constraint)"
  - "Trailers use playback_policies: ['public'] for shareable promotional content (no signed tokens)"
  - "trailer_ passthrough prefix distinguishes trailer from episode uploads in Mux webhook handler"
  - "Trailer playback ID stored as mux:{playbackId} format in series.trailer_url column"

patterns-established:
  - "Supabase Realtime: channel per entity with INSERT/DELETE/UPDATE handlers for live feed"
  - "Mux passthrough prefix convention: trailer_{entityId} for non-episode uploads"
  - "Public vs signed playback: trailers use public for sharing, episodes use signed for access control"

# Metrics
duration: 6min
completed: 2026-02-14
---

# Phase 6 Plan 5: Community and Trailer Upload Summary

**Real-time community feed with Supabase Realtime (discussions, polls, announcements), poll voting with one-vote-per-user enforcement, and Mux Direct Upload for series trailers with public playback**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-14T21:39:02Z
- **Completed:** 2026-02-14T21:45:18Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Complete community feed with real-time updates via Supabase Realtime postgres_changes subscription
- Server actions for post CRUD: create discussion/announcement/poll, delete, pin/unpin, vote
- Poll creation with 2-6 dynamic options and one-vote-per-user enforcement (DB unique constraint + application check)
- Trailer upload API route with Mux Direct Upload using public playback policy
- Mux webhook handler updated to distinguish trailer vs episode uploads via `trailer_` passthrough prefix
- TrailerUpload component integrated into series detail page

## Task Commits

Each task was committed atomically:

1. **Task 1: Community server actions and real-time feed** - `1fd63ce` (feat)
2. **Task 2: Optional trailer upload via Mux Direct Upload** - `5d1283c` (feat)

## Files Created/Modified
- `src/modules/creator/actions/community.ts` - Server actions: createPost, createPoll, deletePost, pinPost, votePoll
- `src/modules/creator/queries/get-community-posts.ts` - Query with profiles join for author display_name/avatar_url
- `src/components/creator/community-feed.tsx` - Real-time feed with Supabase Realtime, post management, poll voting UI
- `src/components/creator/poll-creator.tsx` - Poll creation form with 2-6 dynamic option inputs
- `src/app/(creator)/dashboard/series/[seriesId]/community/page.tsx` - Community management page with auth/ownership
- `src/app/api/upload/trailer/route.ts` - POST endpoint for trailer Direct Upload with public playback
- `src/components/creator/trailer-upload.tsx` - MuxUploader-based trailer upload component
- `src/app/api/webhooks/mux/route.ts` - Updated to handle trailer_ passthrough prefix for trailer asset linking
- `src/app/(creator)/dashboard/series/[seriesId]/page.tsx` - Added trailer upload and community link sections

## Decisions Made
- Supabase Realtime subscription on `community_posts` table filtered by `series_id=eq.${seriesId}` for INSERT/DELETE/UPDATE events
- One-vote-per-user enforced at two levels: application-side check before insert, plus DB UNIQUE(post_id, user_id) constraint as safety net
- Trailers use `playback_policies: ["public"]` since they are promotional content for sharing (no signed token needed)
- Mux webhook uses `trailer_` prefix on passthrough to route asset-ready events to series.trailer_url vs episodes table
- Trailer playback ID stored as `mux:{playbackId}` format in series.trailer_url for consistent URL parsing

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed deleteSeries form action type error on series detail page**
- **Found during:** Task 2 (Adding trailer section to series detail page)
- **Issue:** Pre-existing type error: `deleteSeries` returns `Promise<CreatorFormState>` but form action expects `void | Promise<void>`
- **Fix:** Wrapped deleteAction in async arrow function that awaits the result
- **Files modified:** src/app/(creator)/dashboard/series/[seriesId]/page.tsx
- **Verification:** `npx tsc --noEmit` passes for this file
- **Committed in:** 5d1283c (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Type fix was necessary for correctness in a file we were modifying. No scope creep.

## Issues Encountered
None

## User Setup Required
None - Mux and Supabase are already configured from prior phases.

## Next Phase Readiness
- Community feed ready for public viewer integration (CommunityFeed with isCreator=false)
- TrailerUpload component reusable in any context
- Mux webhook handler supports both episode and trailer asset processing
- All Phase 6 plans now complete (except 06-03 which has uncommitted files from prior execution)

## Self-Check: PASSED

All 7 created files verified on disk. Both task commits (1fd63ce, 5d1283c) found in git log.

---
*Phase: 06-creator-dashboard*
*Completed: 2026-02-14*
