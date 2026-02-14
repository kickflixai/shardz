---
phase: 01-foundation-app-shell
plan: 02
subsystem: database
tags: [supabase, postgresql, rls, migrations, typescript, content-hierarchy, check-constraints, triggers]

# Dependency graph
requires:
  - phase: 01-01
    provides: "Next.js 16 project with Supabase client factories and build tooling"
provides:
  - "Supabase CLI initialized with config.toml and migrations directory"
  - "Content hierarchy schema: Series > Seasons > Episodes with profiles"
  - "CHECK constraints for episode duration (60-180s) and positive pricing"
  - "Trigger function enforcing 8-70 published episodes per published season"
  - "RLS policies: public read for published content, creator self-management"
  - "Performance indexes on genre, creator, featured, series/season FKs"
  - "TypeScript types (row, insert, update) for all database tables"
affects: [01-03, 02-auth, 03-video, 04-browse, 05-payments, 06-creator-dashboard, 08-mock-data]

# Tech tracking
tech-stack:
  added: [supabase-cli@2.76.8]
  patterns: ["Supabase migration-based schema management", "Hand-written TypeScript types matching DB schema", "RLS with auth.uid() subqueries for ownership checks", "CHECK constraints for business rule enforcement at DB level", "Trigger functions for cross-table validation on status transitions"]

key-files:
  created:
    - "supabase/config.toml"
    - "supabase/migrations/00000000000001_create_content_schema.sql"
    - "supabase/seed.sql"
    - "src/db/types.ts"
    - "src/db/schema.sql"
  modified: []

key-decisions:
  - "Supabase CLI installed via npx (Homebrew blocked by Xcode version mismatch)"
  - "Docker unavailable for local DB validation; migration SQL manually verified"

patterns-established:
  - "Migration naming: 00000000000001_description.sql (Supabase convention)"
  - "Schema documentation: src/db/schema.sql mirrors migration with source-of-truth header"
  - "TypeScript DB types: Row interface + Insert/Update type aliases using Omit/Partial"
  - "RLS pattern: (SELECT auth.uid()) = owner_column for direct ownership, subquery IN for nested ownership"
  - "Enum types in Postgres: CREATE TYPE for fixed value sets (genre, content_status)"

# Metrics
duration: 3min
completed: 2026-02-14
---

# Phase 1 Plan 2: Database Schema Summary

**Supabase content hierarchy migration with Series > Seasons > Episodes tables, CHECK constraints, season episode count trigger, RLS policies, and TypeScript type definitions**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-14T13:25:26Z
- **Completed:** 2026-02-14T13:29:01Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Created complete content hierarchy migration (series, seasons, episodes, profiles) with proper foreign key ordering
- Enforced business rules at the database level: episode duration 60-180s via CHECK, season episode count 8-70 via trigger, positive pricing via CHECK
- Configured RLS with public read for published content and creator ownership management via auth.uid() subqueries
- Created hand-written TypeScript types with row, insert, and update variants matching the database schema exactly

## Task Commits

Each task was committed atomically:

1. **Task 1: Initialize Supabase and create content hierarchy migration** - `b07c30b` (feat)
2. **Task 2: Create TypeScript types and reference schema documentation** - `c92a854` (feat)

## Files Created/Modified
- `supabase/config.toml` - Supabase CLI project configuration (project_id: MICROSHORT)
- `supabase/migrations/00000000000001_create_content_schema.sql` - Full content hierarchy migration (enums, tables, FK, triggers, RLS, indexes)
- `supabase/seed.sql` - Placeholder seed file for Phase 8
- `supabase/.gitignore` - Supabase-generated gitignore
- `src/db/types.ts` - TypeScript type definitions (Genre, ContentStatus, UserRole enums; Series, Season, Episode, Profile interfaces; Insert/Update types)
- `src/db/schema.sql` - Reference copy of migration SQL with source-of-truth header

## Decisions Made
- **Supabase CLI via npx:** Homebrew installation blocked by Xcode Command Line Tools version mismatch; used `npx supabase` as a reliable alternative
- **No local DB validation:** Docker is not available on this machine; migration SQL was manually reviewed for correctness (table ordering, FK references, constraint syntax). Will validate when pushed to remote Supabase project

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed Supabase CLI via npx instead of Homebrew**
- **Found during:** Task 1 (Supabase initialization)
- **Issue:** `brew install supabase/tap/supabase` failed due to outdated Xcode Command Line Tools
- **Fix:** Used `npx supabase` which downloads and runs the CLI without Homebrew
- **Verification:** `npx supabase init` completed successfully, config.toml created
- **Committed in:** b07c30b

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Minor tooling workaround. No impact on schema quality or output artifacts.

## Issues Encountered
- Docker not available on this machine; `supabase start` and `supabase db reset` cannot be used for local validation. This is a non-blocking issue documented in the plan itself. The migration SQL will be validated when connected to a remote Supabase project.

## User Setup Required
None - no external service configuration required. Schema will be applied when `supabase db push` is run against a linked Supabase project.

## Next Phase Readiness
- Database schema is ready for authentication implementation (profiles table links to auth.users)
- TypeScript types available for use in server actions and API routes
- Content hierarchy supports all CRUD operations needed for browse, player, and creator dashboard features
- RLS policies ensure data security from day one

## Self-Check: PASSED

All 5 key files verified present. Both task commits (b07c30b, c92a854) verified in git log.

---
*Phase: 01-foundation-app-shell*
*Completed: 2026-02-14*
