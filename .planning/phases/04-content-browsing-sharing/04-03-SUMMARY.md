---
phase: 04-content-browsing-sharing
plan: 03
subsystem: seo
tags: [next-metadata, opengraph, json-ld, isr, structured-data, og-image, twitter-cards, utm-tracking]

# Dependency graph
requires:
  - phase: 04-content-browsing-sharing plan 02
    provides: "Series detail page, getSeriesBySlug React.cache query, ShareButton component"
  - phase: 01-foundation-app-shell
    provides: "(browse) route group, series/[slug] scaffold, Supabase client infrastructure"
provides:
  - "generateMetadata with full OG tags, Twitter cards, and canonical URLs for series pages"
  - "Dynamic OG image generation (1200x630 PNG) via opengraph-image.tsx"
  - "JSON-LD structured data (TVSeries schema with nested seasons/episodes)"
  - "ISR with generateStaticParams for SEO-optimized series pages"
  - "generateShareUrl utility for UTM-tracked share links"
  - "generateSeriesJsonLd utility for Schema.org structured data"
  - "NEXT_PUBLIC_APP_URL environment config via env.app.url"
affects: [05-payments, seo-optimization]

# Tech tracking
tech-stack:
  added: []
  patterns: [next-generateMetadata, opengraph-image-route, json-ld-structured-data, isr-generateStaticParams, utm-share-links]

key-files:
  created:
    - src/lib/seo/structured-data.ts
    - src/lib/seo/share.ts
    - src/app/(browse)/series/[slug]/opengraph-image.tsx
  modified:
    - src/config/env.ts
    - src/app/(browse)/series/[slug]/page.tsx
    - src/components/series/series-detail.tsx

key-decisions:
  - "generateStaticParams uses direct Supabase client (not cookies-based server client) since it runs at build time outside request scope"
  - "OG image uses Node.js runtime (not edge) to avoid Supabase client cookie context issues"
  - "SeriesDetail uses generateShareUrl for UTM-tracked share links instead of raw URL construction"

patterns-established:
  - "Build-time Supabase pattern: use createClient from @supabase/supabase-js directly (no cookies) for generateStaticParams and other build-time operations"
  - "JSON-LD rendering pattern: JSON.stringify with XSS protection via replace(/</g, '\\u003c') in dangerouslySetInnerHTML"
  - "OG image pattern: opengraph-image.tsx with ImageResponse, direct Supabase query, dark branded layout"

# Metrics
duration: 3min
completed: 2026-02-14
---

# Phase 4 Plan 3: SEO & Social Sharing Summary

**Full SEO metadata (OG tags, Twitter cards), dynamic OG images, JSON-LD TVSeries structured data, ISR pre-rendering, and UTM-tracked share links for series pages**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-14T15:31:31Z
- **Completed:** 2026-02-14T15:34:37Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Series pages export generateMetadata with full Open Graph (og:title, og:description, og:type video.tv_show, og:image, og:url, og:site_name, og:locale) and Twitter card (summary_large_image) metadata
- Dynamic 1200x630 PNG OG images generated per series with title, genre, and creator name on dark branded background
- JSON-LD structured data using Schema.org TVSeries type with nested TVSeason and TVEpisode objects including duration in ISO 8601 format
- ISR enabled via generateStaticParams (pre-renders published series) + revalidate = 60 seconds
- Share links now include UTM tracking parameters (utm_source=share, utm_medium=social) via generateShareUrl utility

## Task Commits

Each task was committed atomically:

1. **Task 1: Create SEO utilities, add NEXT_PUBLIC_APP_URL, and build OG image generator** - `8c7afb9` (feat)
2. **Task 2: Add generateMetadata, JSON-LD, ISR, and generateStaticParams to series page** - `31c9e0e` (feat)

## Files Created/Modified
- `src/lib/seo/structured-data.ts` - generateSeriesJsonLd function for TVSeries JSON-LD with nested seasons and episodes
- `src/lib/seo/share.ts` - generateShareUrl function with UTM parameter construction
- `src/app/(browse)/series/[slug]/opengraph-image.tsx` - Dynamic OG image with dark gradient, series title (64px), genre + creator (28px yellow), microshort.tv branding
- `src/config/env.ts` - Added env.app.url with NEXT_PUBLIC_APP_URL and localhost fallback
- `src/app/(browse)/series/[slug]/page.tsx` - Added generateMetadata, generateStaticParams, revalidate=60, JSON-LD script tag
- `src/components/series/series-detail.tsx` - Updated to use generateShareUrl for UTM-tracked share links

## Decisions Made
- **Direct Supabase client for generateStaticParams:** The cookies-based server client (createClient from @/lib/supabase/server) throws "cookies was called outside a request scope" during build-time static generation. Used createClient from @supabase/supabase-js directly with the publishable key for this build-time-only query.
- **Node.js runtime for OG image:** Kept default Node.js runtime (not edge) for opengraph-image.tsx to avoid Supabase client cookie context issues in edge runtime.
- **UTM share links via generateShareUrl:** Replaced inline URL construction in SeriesDetail with generateShareUrl utility that appends utm_source and utm_medium parameters for analytics tracking.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed generateStaticParams cookies() error at build time**
- **Found during:** Task 2 (adding generateStaticParams)
- **Issue:** Plan specified using `createClient` from `@/lib/supabase/server` for generateStaticParams, but this calls cookies() which is unavailable at build time
- **Fix:** Used direct `createClient` from `@supabase/supabase-js` with the publishable key (public read-only query, no auth needed)
- **Files modified:** `src/app/(browse)/series/[slug]/page.tsx`
- **Verification:** `pnpm build` passes, series pages show as SSG in build output
- **Committed in:** `31c9e0e` (Task 2 commit)

**2. [Rule 1 - Bug] Fixed Supabase profiles type assertion in OG image handler**
- **Found during:** Task 1 (creating opengraph-image.tsx)
- **Issue:** Supabase inner join returns profiles as array type, initial type assertion as single object caused TypeScript error
- **Fix:** Added union type assertion handling both array and object shapes with Array.isArray check
- **Files modified:** `src/app/(browse)/series/[slug]/opengraph-image.tsx`
- **Verification:** TypeScript compilation passes, build succeeds
- **Committed in:** `8c7afb9` (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both fixes necessary for correctness. No scope creep.

## Issues Encountered
- None beyond the auto-fixed deviations above.

## User Setup Required
None - no external service configuration required. NEXT_PUBLIC_APP_URL defaults to http://localhost:3000 in development; set to production URL when deploying.

## Next Phase Readiness
- Phase 4 complete: browse page (04-01), series detail (04-02), and SEO/sharing (04-03) all shipped
- Series pages fully SEO-optimized with OG tags, Twitter cards, JSON-LD, and ISR
- Share links include UTM tracking ready for analytics integration
- Ready for Phase 5 (Payments) -- series pages provide the content discovery foundation

## Self-Check: PASSED

All 6 created/modified files verified on disk. Both task commits (8c7afb9, 31c9e0e) confirmed in git history.

---
*Phase: 04-content-browsing-sharing*
*Completed: 2026-02-14*
