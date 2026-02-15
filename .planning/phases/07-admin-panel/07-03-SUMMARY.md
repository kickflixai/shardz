---
phase: 07-admin-panel
plan: 03
subsystem: admin
tags: [next.js, supabase, homepage-curation, editorial-picks, featured-series, server-actions]

# Dependency graph
requires:
  - phase: 07-01
    provides: requireAdmin() guard, createAdminClient(), editorial_picks table, featured_sort_order column, admin sidebar with Homepage nav
provides:
  - Homepage curation admin page with featured series toggle and editorial pick management
  - getAllSeriesForCuration, getFeaturedSeries, getEditorialPicks, getEditorialPicksAdmin queries
  - toggleFeatured, updateFeaturedOrder, addEditorialPick, removeEditorialPick server actions
  - Public homepage with admin-curated featured content and editorial pick sections
affects: [07-04, 08-pitch-readiness]

# Tech tracking
tech-stack:
  added: []
  patterns: [featured series toggle with star icon, editorial picks grouped by section, horizontal scroll cards on mobile]

key-files:
  created:
    - src/modules/admin/queries/get-homepage-data.ts
    - src/modules/admin/actions/homepage.ts
    - src/app/(admin)/admin/homepage/page.tsx
    - src/app/(admin)/admin/homepage/featured-toggle.tsx
    - src/app/(admin)/admin/homepage/sort-order-input.tsx
    - src/app/(admin)/admin/homepage/add-pick-form.tsx
    - src/app/(admin)/admin/homepage/remove-pick-button.tsx
  modified:
    - src/app/(public)/page.tsx
    - src/db/types.ts

key-decisions:
  - "FeaturedCard and PickCard built inline in homepage (not reusing SeriesCard) because query shapes differ from SeriesWithCreator type"
  - "Editorial picks 'featured' section excluded from homepage display (already covered by getFeaturedSeries section)"
  - "Next.js Image with unoptimized flag for dynamic Supabase Storage thumbnail URLs (avoids remotePatterns config)"

patterns-established:
  - "Homepage curation: admin toggles is_featured boolean and sets featured_sort_order via star icon toggle"
  - "Editorial picks: upsert with onConflict on (series_id, section) for idempotent add"
  - "Section-based editorial picks: grouped by section, each section renders independently with its own heading"

# Metrics
duration: 5min
completed: 2026-02-15
---

# Phase 7 Plan 3: Homepage Curation and Public Homepage Summary

**Admin homepage curation tools with featured series toggle, editorial picks by section, and public homepage rendering admin-curated content with hero, featured grid, and scrollable pick sections**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-15T10:22:18Z
- **Completed:** 2026-02-15T10:27:59Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Admin can toggle featured status on any published series with a star icon and set display order via inline number input
- Editorial picks management with add form (series dropdown, section selector, sort order) and remove button per pick
- Public homepage replaced: hero section with brand tagline, featured series grid, editorial pick sections (trending, new releases, staff picks), and creator CTA
- Graceful empty state when no content is curated, rendering a browse CTA instead

## Task Commits

Each task was committed atomically:

1. **Task 1: Homepage curation queries, actions, and admin page** - `203c716` (feat)
2. **Task 2: Update public homepage with admin-curated featured content** - `189e727` (feat)

## Files Created/Modified
- `src/modules/admin/queries/get-homepage-data.ts` - Four query functions for curation data (admin and public contexts)
- `src/modules/admin/actions/homepage.ts` - Server actions: toggleFeatured, updateFeaturedOrder, addEditorialPick, removeEditorialPick
- `src/app/(admin)/admin/homepage/page.tsx` - Admin curation page with featured series table and editorial picks by section
- `src/app/(admin)/admin/homepage/featured-toggle.tsx` - Client component: star toggle for featured status
- `src/app/(admin)/admin/homepage/sort-order-input.tsx` - Client component: inline number input for sort order
- `src/app/(admin)/admin/homepage/add-pick-form.tsx` - Client component: form to add series to editorial pick sections
- `src/app/(admin)/admin/homepage/remove-pick-button.tsx` - Client component: remove button for editorial picks
- `src/app/(public)/page.tsx` - Replaced placeholder with full homepage: hero, featured grid, editorial sections, CTA
- `src/db/types.ts` - Added featured_sort_order field to Series type

## Decisions Made
- Built FeaturedCard and PickCard inline in homepage rather than reusing the existing SeriesCard component. The query shapes (FeaturedSeriesItem with profiles.display_name) differ from SeriesWithCreator (creator.display_name, episode_count), making reuse require adapter logic that would be more complex than purpose-built cards.
- Editorial picks with section="featured" are excluded from the public homepage editorial sections since featured series already have their own dedicated section via getFeaturedSeries(). This avoids duplicate display.
- Used Next.js Image with unoptimized flag for thumbnails from Supabase Storage (same pattern established in 06-02) to avoid remotePatterns configuration for dynamic URLs.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added featured_sort_order to Series type in db/types.ts**
- **Found during:** Task 1 (Homepage curation queries)
- **Issue:** The 07-01 migration added `featured_sort_order` column to the series table, but the TypeScript Series type in db/types.ts was not updated to include it
- **Fix:** Added `featured_sort_order: number | null` field to the Series interface
- **Files modified:** src/db/types.ts
- **Verification:** TypeScript compilation passes with featured_sort_order usage in queries and actions
- **Committed in:** 203c716 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential fix for type safety. No scope creep.

## Issues Encountered
- Task 1 files were already committed as part of a prior 07-02 execution (commit 203c716). The 07-02 plan execution included 07-03 Task 1 files alongside its own work. Verified all files matched planned specifications and proceeded with Task 2 only.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Homepage curation complete -- admin can control featured series and editorial picks
- Public homepage renders curated content, ready for pitch readiness phase (Phase 8)
- All Phase 7 admin panel functionality (07-01 through 07-03) is operational
- 07-04 (platform metrics dashboard) is the remaining plan in Phase 7

## Self-Check: PASSED

All 9 created/modified files verified present. Both task commits (203c716, 189e727) verified in git log.

---
*Phase: 07-admin-panel*
*Completed: 2026-02-15*
