---
phase: 04-content-browsing-sharing
plan: 01
subsystem: ui
tags: [nuqs, supabase, server-components, genre-filter, series-card, shadcn, url-state]

# Dependency graph
requires:
  - phase: 01-foundation-app-shell
    provides: "(browse) route group, layout, shadcn/ui Card, Supabase client, Tailwind config"
  - phase: 01-foundation-app-shell
    provides: "Database schema with genre enum, series table, profiles table"
provides:
  - "Genre-filtered browse page at /browse with URL-based genre state"
  - "SeriesCard component (thumbnail, title, genre badge, creator, episode count)"
  - "SeriesGrid responsive grid layout with empty state"
  - "GENRE_CONFIG single source of truth for genre display names"
  - "getSeriesByGenre Supabase query for published series with creator join"
  - "SeriesWithCreator composite type for browse/grid display"
  - "NuqsAdapter wired into root layout for URL query state"
affects: [04-content-browsing-sharing, 05-payments-monetization, 08-mock-data-seeding]

# Tech tracking
tech-stack:
  added: [nuqs 2.8.8, shadcn badge, shadcn skeleton, shadcn aspect-ratio]
  patterns: [Server Component data fetching with Client Component filter, nuqs URL state, genre config single source of truth]

key-files:
  created:
    - src/config/genres.ts
    - src/modules/content/types.ts
    - src/modules/content/queries/get-series-by-genre.ts
    - src/app/(browse)/browse/genre-filter.tsx
    - src/components/series/series-card.tsx
    - src/components/series/series-grid.tsx
    - src/components/ui/badge.tsx
    - src/components/ui/skeleton.tsx
    - src/components/ui/aspect-ratio.tsx
  modified:
    - src/app/layout.tsx
    - src/app/(browse)/browse/page.tsx
    - package.json

key-decisions:
  - "nuqs with history: push for genre filter so browser back button navigates genre changes"
  - "Supabase inner join on profiles for creator display name -- requires series to have valid creator_id"
  - "Episode count computed by flattening seasons->episodes nested arrays from Supabase response"
  - "Genre filter uses null (clears param) for 'All' instead of setting genre=all in URL"

patterns-established:
  - "Server Component page reads searchParams, calls data query, passes to Client Component filter + grid"
  - "GENRE_CONFIG as single source of truth -- all genre display labels derived from src/config/genres.ts"
  - "modules/content/queries pattern for Supabase data fetching with typed returns"
  - "SeriesWithCreator composite type maps Supabase join response to flattened app-level type"

# Metrics
duration: 3min
completed: 2026-02-14
---

# Phase 4 Plan 1: Genre Browse Page Summary

**Genre-filtered browse page with nuqs URL state, series card grid, and Supabase query layer for published series with creator joins**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-14T15:24:46Z
- **Completed:** 2026-02-14T15:27:55Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments
- Genre-filtered browse page at /browse with 11 genre pills plus "All" filter
- SeriesCard component displaying thumbnail, title, genre badge, creator name, and episode count
- getSeriesByGenre Supabase query with inner join on profiles and nested season/episode count
- NuqsAdapter integrated into root layout for URL-based query state across the app

## Task Commits

Each task was committed atomically:

1. **Task 1: Install deps, add shadcn components, create genre config and data query layer** - `264cd99` (feat)
2. **Task 2: Build genre filter, series card/grid, and wire browse page** - `52ddbfb` (feat)

## Files Created/Modified
- `src/config/genres.ts` - Single source of truth for genre enum display names (GENRE_CONFIG, ALL_GENRES, getGenreLabel)
- `src/modules/content/types.ts` - SeriesWithCreator composite type for browse grid display
- `src/modules/content/queries/get-series-by-genre.ts` - Supabase query for published series with genre filter, creator join, episode count
- `src/app/(browse)/browse/genre-filter.tsx` - Client Component genre filter pills with nuqs URL state
- `src/app/(browse)/browse/page.tsx` - Server Component browse page wiring filter + grid with data query
- `src/components/series/series-card.tsx` - Series card with thumbnail, title, genre badge, creator, episodes
- `src/components/series/series-grid.tsx` - Responsive grid layout with empty state
- `src/components/ui/badge.tsx` - shadcn Badge component for genre labels
- `src/components/ui/skeleton.tsx` - shadcn Skeleton component for loading states
- `src/components/ui/aspect-ratio.tsx` - shadcn AspectRatio component for thumbnail containers
- `src/app/layout.tsx` - Added NuqsAdapter wrapping children inside SerwistProvider
- `package.json` - Added nuqs dependency

## Decisions Made
- Used nuqs `history: "push"` option so browser back button navigates through genre filter changes (better UX than replace)
- Genre filter clears the URL param entirely for "All" (no `?genre=all`) to keep clean URLs when unfiltered
- Supabase query uses `profiles!inner` join which means series without a valid creator_id are excluded (correct for published content)
- Episode count computed client-side by flattening the nested seasons.episodes arrays from the Supabase response rather than using a database aggregate
- SeriesCard uses a simple play icon SVG placeholder instead of a heavy image component when no thumbnail exists

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Browse page is fully functional with genre filtering and series grid
- SeriesCard links to /series/{slug} -- series detail page (04-02) can now be built
- GENRE_CONFIG and SeriesWithCreator types are available for reuse in series detail and other content pages
- NuqsAdapter is globally available for URL state in any page

## Self-Check: PASSED

All 11 created files verified on disk. Both task commits (264cd99, 52ddbfb) verified in git log. Build passes with zero TypeScript errors.

---
*Phase: 04-content-browsing-sharing*
*Completed: 2026-02-14*
