---
phase: 07-admin-panel
plan: 02
subsystem: admin
tags: [next.js, supabase, admin-panel, search, server-actions, crud]

# Dependency graph
requires:
  - phase: 07-admin-panel/01
    provides: requireAdmin() guard, createAdminClient pattern, admin sidebar navigation, admin RLS policies
provides:
  - Admin entity queries (creators, series, users, revenue) via createAdminClient
  - Entity browse pages with search for creators, content, users
  - Entity detail pages for creators, content, users
  - User role management (viewer/creator/admin) via updateUserRole action
  - Content moderation via archiveSeries/restoreSeries actions
  - Revenue overview page with summary cards and purchase history
  - AdminSearch shared component for URL-based search
affects: [07-03, 07-04]

# Tech tracking
tech-stack:
  added: []
  patterns: [admin entity browse page with AdminSearch, admin detail page with admin client, content moderation via status change actions, role management with client-side select + server action]

key-files:
  created:
    - src/modules/admin/queries/get-admin-entities.ts
    - src/modules/admin/actions/users.ts
    - src/modules/admin/actions/content.ts
    - src/app/(admin)/admin/_components/admin-search.tsx
    - src/app/(admin)/admin/creators/page.tsx
    - src/app/(admin)/admin/creators/[id]/page.tsx
    - src/app/(admin)/admin/content/page.tsx
    - src/app/(admin)/admin/content/[id]/page.tsx
    - src/app/(admin)/admin/content/[id]/content-actions.tsx
    - src/app/(admin)/admin/users/page.tsx
    - src/app/(admin)/admin/users/[id]/page.tsx
    - src/app/(admin)/admin/users/[id]/role-form.tsx
    - src/app/(admin)/admin/revenue/page.tsx
  modified:
    - src/modules/admin/queries/get-homepage-data.ts
    - src/modules/admin/queries/get-platform-metrics.ts
    - src/app/(admin)/admin/page.tsx
    - src/db/types.ts

key-decisions:
  - "Supabase untyped admin client FK joins typed with 'as unknown as' casts to match runtime shape (objects not arrays)"
  - "AdminSearch uses form submission pattern (not real-time debounce) for simplicity and server component compatibility"
  - "Content moderation uses status change to 'archived' (soft delete) rather than hard delete, preserving data for compliance"
  - "Revenue page computes summary metrics client-side from query results rather than separate aggregate queries"

patterns-established:
  - "Admin browse page: requireAdmin() + query with optional search + table with linked rows"
  - "Admin detail page: requireAdmin() + createAdminClient() single fetch + inline related data"
  - "Admin client action pattern: useTransition + server action + toast + router.refresh()"

# Metrics
duration: 8min
completed: 2026-02-15
---

# Phase 7 Plan 2: Entity Management Pages Summary

**Admin CRUD pages for creators, content, users, and revenue with search, detail views, role management, and content moderation actions**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-15T10:21:46Z
- **Completed:** 2026-02-15T10:30:09Z
- **Tasks:** 2
- **Files modified:** 17

## Accomplishments
- Four entity browse pages (creators, content, users, revenue) with search filtering via shared AdminSearch component
- Four entity detail pages showing related data: creator's series, content seasons/episodes, user purchases, revenue breakdowns
- User role management: admin can change any user's role between viewer, creator, and admin
- Content moderation: admin can archive published/draft series and restore archived ones back to draft status
- Revenue overview: summary cards for total revenue, platform fees, and creator payouts computed from completed purchases

## Task Commits

Each task was committed atomically:

1. **Task 1: Admin entity queries and user management actions** - `203c716` (feat)
2. **Task 2: Entity browse and detail pages** - `2837662` (feat)

## Files Created/Modified
- `src/modules/admin/queries/get-admin-entities.ts` - Queries for creators, series, users, and revenue data
- `src/modules/admin/actions/users.ts` - updateUserRole server action for admin user management
- `src/modules/admin/actions/content.ts` - archiveSeries and restoreSeries server actions for content moderation
- `src/app/(admin)/admin/_components/admin-search.tsx` - Shared client search component with URL-based state
- `src/app/(admin)/admin/creators/page.tsx` - Creators browse page with avatar, series count, followers
- `src/app/(admin)/admin/creators/[id]/page.tsx` - Creator detail with profile info, social links, series list
- `src/app/(admin)/admin/content/page.tsx` - Content browse page with status badges and featured indicator
- `src/app/(admin)/admin/content/[id]/page.tsx` - Content detail with seasons, episodes, archive/restore actions
- `src/app/(admin)/admin/content/[id]/content-actions.tsx` - Client component for archive/restore buttons
- `src/app/(admin)/admin/users/page.tsx` - Users browse page with role badges and search
- `src/app/(admin)/admin/users/[id]/page.tsx` - User detail with role management and purchase history
- `src/app/(admin)/admin/users/[id]/role-form.tsx` - Client component for role change dropdown
- `src/app/(admin)/admin/revenue/page.tsx` - Revenue overview with summary cards and purchase table
- `src/modules/admin/queries/get-homepage-data.ts` - Fixed FK join type casts (as unknown as)
- `src/modules/admin/queries/get-platform-metrics.ts` - Fixed FK join type casts (as unknown as)
- `src/app/(admin)/admin/page.tsx` - Fixed purchase title access for array join shape
- `src/db/types.ts` - Added featured_sort_order to Series type

## Decisions Made
- Supabase's untyped admin client (created without generated types) returns FK joins as arrays at the TypeScript level even though at runtime `!inner` on a single FK returns an object. Used `as unknown as` casts to bridge the gap between TypeScript inference and runtime shape. This is consistent with how the creator dashboard handles the same pattern.
- AdminSearch uses form submission (not real-time debounce with onChange) to keep the implementation simple and avoid unnecessary re-renders. The form submits to the same URL with ?search= query param.
- Content moderation uses status='archived' (soft delete) instead of hard delete, matching the existing content_status enum which already includes 'archived'. This preserves content for compliance and audit trails.
- Revenue page computes summary metrics (total, platform fees, creator payouts) from the query results in the server component rather than running separate aggregate queries, reducing database round-trips.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Supabase untyped client FK join type mismatches across admin queries**
- **Found during:** Task 1 (TypeScript verification)
- **Issue:** Supabase admin client (created with `@supabase/supabase-js` directly without generated types) infers FK joins as arrays at the TypeScript level, causing `as Type[]` casts to fail with TS2352 errors. Affected get-admin-entities.ts, get-homepage-data.ts, get-platform-metrics.ts, and admin/page.tsx.
- **Fix:** Changed return casts from `as Type[]` to `as unknown as Type[]` while keeping interface types matching the actual runtime shape (objects for singular FK joins). Also fixed page.tsx to use optional chaining for nested array access.
- **Files modified:** `src/modules/admin/queries/get-admin-entities.ts`, `src/modules/admin/queries/get-homepage-data.ts`, `src/modules/admin/queries/get-platform-metrics.ts`, `src/app/(admin)/admin/page.tsx`
- **Verification:** `pnpm tsc --noEmit` passes clean
- **Committed in:** 203c716 and 2837662

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Type fix was necessary for TypeScript compilation. No scope creep.

## Issues Encountered
- Task 1 files (get-admin-entities.ts, users.ts, content.ts) were not included in the first commit due to a staging issue where biome --write reformatted files and interfered with staged changes. The files were correctly included in the Task 2 commit instead.
- Concurrent commits from parallel agents (07-03, 07-04) appeared between Task 1 and Task 2 commits, but did not cause conflicts since they modified different files.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All admin entity management pages are functional and linked from the sidebar navigation (established in 07-01)
- The archiveSeries/restoreSeries pattern can be extended to other content types if needed
- The AdminSearch component is reusable for any future admin browse pages
- Revenue data queries are available for the platform metrics dashboard (07-04)

## Self-Check: PASSED

All 13 created files verified present. Both task commits (203c716, 2837662) verified in git log.

---
*Phase: 07-admin-panel*
*Completed: 2026-02-15*
