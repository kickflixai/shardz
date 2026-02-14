---
phase: 06-creator-dashboard
plan: 02
subsystem: api, ui
tags: [mux, direct-upload, supabase-storage, react, server-actions, mux-uploader]

# Dependency graph
requires:
  - phase: 06-creator-dashboard
    provides: "Database schema (episodes, seasons, series), Mux client singleton, webhook handler, episodeSchema validation, CreatorFormState type"
  - phase: 03-video-player
    provides: "Mux client (src/lib/mux/client.ts), webhook handler (src/app/api/webhooks/mux/route.ts)"
provides:
  - "createDirectUpload helper for Mux Direct Upload URL generation"
  - "POST /api/upload endpoint with auth + ownership verification"
  - "ThumbnailUpload component for Supabase Storage image uploads"
  - "EpisodeUploadForm with two-step flow (metadata then MuxUploader)"
  - "createEpisode server action with role and ownership checks"
  - "Episode upload page at /dashboard/series/[seriesId]/seasons/[seasonId]/episodes/new"
affects: [06-creator-dashboard, 07-admin]

# Tech tracking
tech-stack:
  added: []
  patterns: [mux-direct-upload-with-passthrough, two-step-upload-form, thumbnail-supabase-storage]

key-files:
  created:
    - "src/lib/mux/uploads.ts"
    - "src/app/api/upload/route.ts"
    - "src/components/creator/thumbnail-upload.tsx"
    - "src/components/creator/episode-upload-form.tsx"
    - "src/modules/creator/actions/episodes.ts"
    - "src/app/(creator)/dashboard/series/[seriesId]/seasons/[seasonId]/episodes/new/page.tsx"
  modified: []

key-decisions:
  - "Used playback_policies (plural) instead of deprecated playback_policy in Mux SDK v12.8"
  - "Two-step upload form: metadata first creates episode row, then MuxUploader uploads video"
  - "Thumbnail images use unoptimized Next.js Image (avoids remotePatterns config for Supabase Storage URLs)"
  - "Episode ID passed via Mux passthrough field; existing webhook handler automatically links processed asset"

patterns-established:
  - "Mux Direct Upload: server generates URL with episodeId passthrough, browser uploads via MuxUploader"
  - "Two-step form: create DB row first, then upload media (ensures episode exists before video processing)"
  - "Supabase Storage thumbnail path convention: {user_id}/{entityId}/{timestamp}.{ext}"

# Metrics
duration: 5min
completed: 2026-02-14
---

# Phase 6 Plan 2: Content Upload Pipeline Summary

**Mux Direct Upload with passthrough episode linking, Supabase Storage thumbnail uploads, and two-step episode creation form using MuxUploader**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-14T21:31:19Z
- **Completed:** 2026-02-14T21:36:24Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Mux Direct Upload URL generation with episodeId passthrough for automatic webhook asset linking
- Authenticated upload API route with ownership verification (episode -> season -> series -> creator_id chain)
- Two-step episode upload form: metadata entry with validation, then MuxUploader video upload
- Thumbnail upload component using Supabase Storage with file type and size validation
- Server action for episode creation with auth, creator role, and series ownership checks

## Task Commits

Each task was committed atomically:

1. **Task 1: Mux Direct Upload helper and API route** - `d76b463` (feat)
2. **Task 2: Episode upload form, thumbnail upload, and upload page** - `174fed4` (feat)

## Files Created/Modified
- `src/lib/mux/uploads.ts` - createDirectUpload helper generating Mux Direct Upload URLs with episodeId passthrough
- `src/app/api/upload/route.ts` - POST endpoint: auth, ownership check, status update, URL generation
- `src/components/creator/thumbnail-upload.tsx` - ThumbnailUpload component with Supabase Storage upload, file validation, preview
- `src/components/creator/episode-upload-form.tsx` - Two-step EpisodeUploadForm: metadata form then MuxUploader
- `src/modules/creator/actions/episodes.ts` - createEpisode server action with Zod validation and ownership checks
- `src/app/(creator)/dashboard/series/[seriesId]/seasons/[seasonId]/episodes/new/page.tsx` - Server component page with auth gate, role check, next episode number computation

## Decisions Made
- Used `playback_policies` (plural, current) instead of `playback_policy` (deprecated) in Mux SDK v12.8 -- research code used the deprecated form
- Two-step form approach: episode row must exist before video upload so MuxUploader's endpoint function can reference a valid episodeId
- Thumbnail preview uses `unoptimized` prop on Next.js Image to avoid needing remotePatterns config for dynamic Supabase Storage URLs
- Input validation on episodeId in the upload route (type check + required) as a Rule 2 auto-fix for input validation

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added input validation for episodeId in upload route**
- **Found during:** Task 1 (API route implementation)
- **Issue:** Plan did not specify validation of the episodeId request body parameter
- **Fix:** Added type check (`typeof episodeId !== "string"`) and required check with 400 response
- **Files modified:** src/app/api/upload/route.ts
- **Verification:** TypeScript compiles, route returns 400 for missing/invalid episodeId
- **Committed in:** d76b463 (Task 1 commit)

**2. [Rule 1 - Bug] Used playback_policies instead of deprecated playback_policy**
- **Found during:** Task 1 (Mux upload helper)
- **Issue:** Research code used `playback_policy` which is deprecated in Mux SDK v12.8; TypeScript would not accept it
- **Fix:** Used `playback_policies` (the current, non-deprecated field name)
- **Files modified:** src/lib/mux/uploads.ts
- **Verification:** TypeScript compiles clean
- **Committed in:** d76b463 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 missing critical, 1 bug fix)
**Impact on plan:** Both fixes necessary for correctness. No scope creep.

## Issues Encountered
None

## User Setup Required
None - Mux and Supabase are already configured from prior phases.

## Next Phase Readiness
- Upload pipeline complete: episode creation -> video upload -> webhook asset linking
- ThumbnailUpload component reusable for series thumbnails in Plan 03
- createEpisode server action established pattern for remaining CRUD actions
- EpisodeUploadForm ready for integration into content management flows

## Self-Check: PASSED

All 6 created files verified on disk. Both task commits (d76b463, 174fed4) found in git log.

---
*Phase: 06-creator-dashboard*
*Completed: 2026-02-14*
