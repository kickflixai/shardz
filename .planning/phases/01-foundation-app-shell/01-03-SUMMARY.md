---
phase: 01-foundation-app-shell
plan: 03
subsystem: ui
tags: [next.js, app-router, route-groups, pwa, serwist, service-worker, layouts, responsive, middleware]

# Dependency graph
requires:
  - phase: 01-01
    provides: "Next.js 16 project with ThemeProvider, Supabase clients, cinematic theme, Serwist Turbopack wrapper"
provides:
  - "5 route group layouts (public, auth, browse, creator, admin) with distinct UX patterns"
  - "7 placeholder pages for all major routes (/, /login, /signup, /browse, /series/[slug], /dashboard, /admin)"
  - "Loading spinners in every route group (6 total)"
  - "Error boundary, global error handler, and 404 page"
  - "Responsive header with mobile hamburger menu and desktop nav"
  - "Sidebar component with creator and admin nav variants"
  - "PWA manifest at /manifest.webmanifest with MicroShort branding"
  - "Serwist service worker with precaching, runtime caching, and offline fallback"
  - "Offline fallback page at /~offline"
  - "Next.js middleware for Supabase session refresh"
affects: [01-02, 02-auth, 03-content, 04-creator, 05-payments, 07-admin]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Route group layouts: (public) and (browse) use Header+Footer, (auth) uses centered card, (creator) and (admin) use Sidebar"
    - "Serwist route handler requires swSrc and useNativeEsbuild options"
    - "createSerwistRoute imported from @serwist/turbopack main export (not /route subpath)"
    - "Loading states: centered spinner with border-primary animation"
    - "Global error boundary uses inline styles (CSS may not load if root layout errors)"

key-files:
  created:
    - "src/app/(public)/layout.tsx"
    - "src/app/(public)/page.tsx"
    - "src/app/(auth)/layout.tsx"
    - "src/app/(auth)/login/page.tsx"
    - "src/app/(auth)/signup/page.tsx"
    - "src/app/(browse)/layout.tsx"
    - "src/app/(browse)/browse/page.tsx"
    - "src/app/(browse)/series/[slug]/page.tsx"
    - "src/app/(creator)/layout.tsx"
    - "src/app/(creator)/dashboard/page.tsx"
    - "src/app/(admin)/layout.tsx"
    - "src/app/(admin)/admin/page.tsx"
    - "src/app/error.tsx"
    - "src/app/global-error.tsx"
    - "src/app/not-found.tsx"
    - "src/app/manifest.ts"
    - "src/app/sw.ts"
    - "src/app/serwist/[path]/route.ts"
    - "src/app/~offline/page.tsx"
    - "src/components/layout/header.tsx"
    - "src/components/layout/footer.tsx"
    - "src/components/layout/mobile-nav.tsx"
    - "src/components/layout/sidebar.tsx"
    - "src/components/providers/serwist-provider.tsx"
    - "src/middleware.ts"
    - "public/icon-192x192.png"
    - "public/icon-512x512.png"
  modified:
    - "src/app/layout.tsx"

key-decisions:
  - "createSerwistRoute uses main @serwist/turbopack import, not /route subpath (docs incorrect)"
  - "createSerwistRoute requires {swSrc, useNativeEsbuild} options (not zero-arg as research showed)"
  - "Sidebar uses SVG path icons inline (no additional icon library dependency for nav)"
  - "Global error boundary uses inline styles to survive root layout failures"

patterns-established:
  - "Route group convention: (public)/(browse) = Header+Footer, (auth) = centered card, (creator)/(admin) = Sidebar"
  - "Sidebar variant prop pattern: variant='creator'|'admin' for different nav items"
  - "Loading spinner: div.animate-spin.border-primary.border-t-transparent"
  - "Error boundary: 'use client' with reset() callback on retry button"
  - "Placeholder page: heading + muted description + 'Coming in Phase N' text"

# Metrics
duration: 6min
completed: 2026-02-14
---

# Phase 1 Plan 3: App Shell Summary

**App shell with 5 route group layouts, 7 placeholder pages, PWA manifest+service worker via Serwist, responsive header/sidebar, and loading/error states**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-14T13:25:29Z
- **Completed:** 2026-02-14T13:31:35Z
- **Tasks:** 2
- **Files modified:** 35

## Accomplishments
- Built navigable app shell with 5 distinct route group layouts serving different user audiences
- Created responsive header with mobile hamburger menu and sidebar with creator/admin variants
- Set up PWA with Serwist service worker (26 precache entries, runtime caching, offline fallback)
- Added loading spinners, error boundaries, 404 page, and Supabase session middleware

## Task Commits

Each task was committed atomically:

1. **Task 1: Create route groups, layouts, placeholder pages, and loading/error states** - `8389d59` (feat)
2. **Task 2: Set up PWA manifest, service worker, offline page, and app icons** - `7c50a17` (feat)

## Files Created/Modified
- `src/app/(public)/layout.tsx` - Public layout with Header and Footer
- `src/app/(public)/page.tsx` - Homepage with MicroShort branding and Browse CTA
- `src/app/(auth)/layout.tsx` - Auth layout with centered card
- `src/app/(auth)/login/page.tsx` - Login placeholder with signup link
- `src/app/(auth)/signup/page.tsx` - Signup placeholder with login link
- `src/app/(browse)/layout.tsx` - Browse layout with Header and Footer
- `src/app/(browse)/browse/page.tsx` - Browse by genre placeholder with grid
- `src/app/(browse)/series/[slug]/page.tsx` - Series detail placeholder with dynamic slug
- `src/app/(creator)/layout.tsx` - Creator layout with Sidebar (variant="creator")
- `src/app/(creator)/dashboard/page.tsx` - Creator dashboard placeholder with stat cards
- `src/app/(admin)/layout.tsx` - Admin layout with Sidebar (variant="admin")
- `src/app/(admin)/admin/page.tsx` - Admin dashboard placeholder with stat cards
- `src/app/loading.tsx` - Root loading spinner
- `src/app/error.tsx` - Error boundary with retry button
- `src/app/global-error.tsx` - Global error with inline styles and own html/body
- `src/app/not-found.tsx` - 404 page with home link
- `src/app/manifest.ts` - PWA manifest with MicroShort branding
- `src/app/sw.ts` - Serwist service worker with precaching and offline fallback
- `src/app/serwist/[path]/route.ts` - Serwist route handler for SW serving
- `src/app/~offline/page.tsx` - Offline fallback page
- `src/components/layout/header.tsx` - Responsive header with mobile menu toggle
- `src/components/layout/footer.tsx` - Footer with copyright and nav links
- `src/components/layout/mobile-nav.tsx` - Full-screen mobile navigation overlay
- `src/components/layout/sidebar.tsx` - Dashboard sidebar with creator/admin variants
- `src/components/providers/serwist-provider.tsx` - SerwistProvider re-export
- `src/middleware.ts` - Next.js middleware for Supabase session refresh
- `src/app/layout.tsx` - Updated with SerwistProvider wrapping children
- `public/icon-192x192.png` - Placeholder PWA icon (192x192)
- `public/icon-512x512.png` - Placeholder PWA icon (512x512)
- 6 loading.tsx files across route groups

## Decisions Made
- **Serwist route import:** `createSerwistRoute` is from `@serwist/turbopack` main export, not `/route` subpath (docs/research was incorrect)
- **Serwist route options:** `createSerwistRoute` requires `{swSrc, useNativeEsbuild}` -- not zero-arg as shown in research Pattern 4
- **Inline SVG icons for sidebar:** Used SVG path data directly in sidebar component rather than adding a new icon dependency; lucide-react can replace these later
- **Global error inline styles:** Used inline styles in global-error.tsx since CSS may not load when root layout fails

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Serwist route handler import path**
- **Found during:** Task 2 (service worker route setup)
- **Issue:** Research Pattern 4 showed `import { createSerwistRoute } from "@serwist/turbopack/route"` but the package does not export a `/route` subpath
- **Fix:** Changed import to `from "@serwist/turbopack"` (main export includes createSerwistRoute)
- **Files modified:** src/app/serwist/[path]/route.ts
- **Verification:** `pnpm build` succeeds
- **Committed in:** 7c50a17

**2. [Rule 1 - Bug] Fixed createSerwistRoute required arguments**
- **Found during:** Task 2 (build verification)
- **Issue:** Research showed `createSerwistRoute()` with no args but the function requires `{swSrc: string}` to locate the service worker source
- **Fix:** Added `{swSrc: "src/app/sw.ts", useNativeEsbuild: true}` options
- **Files modified:** src/app/serwist/[path]/route.ts
- **Verification:** `pnpm build` succeeds with 26 precache entries

**3. [Rule 3 - Blocking] Fixed esbuild-wasm dependency resolution**
- **Found during:** Task 2 (build after route fix)
- **Issue:** Build failed with "Cannot find package 'esbuild-wasm'" -- Serwist defaults to esbuild-wasm which is not installed
- **Fix:** Set `useNativeEsbuild: true` since native esbuild is already a project dependency
- **Files modified:** src/app/serwist/[path]/route.ts
- **Verification:** Build succeeds using native esbuild

---

**Total deviations:** 3 auto-fixed (2 bugs, 1 blocking)
**Impact on plan:** All auto-fixes corrected documentation errors in research Pattern 4. No scope creep. The Serwist API differences should be noted for future reference.

## Issues Encountered
- Next.js 16 shows deprecation warning for "middleware" file convention, recommending "proxy" instead. The middleware still works correctly. This can be migrated in a future phase if needed.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All route groups scaffolded and ready for feature implementation
- Auth pages (login/signup) ready for Supabase Auth integration in Phase 2
- Browse pages ready for content display in Phase 3
- Creator dashboard ready for series management in Phase 4
- Admin panel ready for platform administration in Phase 7
- PWA is installable with service worker active in production builds
- Middleware handles Supabase session refresh on every request

## Self-Check: PASSED

All 27 key files verified present. Both task commits (8389d59, 7c50a17) verified in git log.

---
*Phase: 01-foundation-app-shell*
*Completed: 2026-02-14*
