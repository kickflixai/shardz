# Phase 7: Admin Panel - Research

**Researched:** 2026-02-15
**Domain:** Admin dashboard, role-based access control, content moderation, homepage curation, platform metrics
**Confidence:** HIGH

## Summary

Phase 7 builds the platform operator tools that complete the two-sided marketplace. The codebase already has substantial infrastructure for this phase: the `(admin)` route group exists with a layout, sidebar, and placeholder dashboard page; the `profiles.role` column supports `'admin'` values; the middleware already protects `/admin` routes requiring authentication; and the `creator_applications` table already has an RLS policy granting admins full access (`"Admins can manage all applications"`). The admin client (`createAdminClient()` using the service role key) is also available for server-side operations that need to bypass RLS.

The primary new work falls into four areas: (1) **Role-gated access** -- upgrading middleware to check admin role (not just auth) and adding RLS policies for admin access to all content tables, (2) **Application review workflow** -- server actions to approve/reject creator applications with feedback and automatic role promotion, (3) **Entity management** -- browse/search/edit pages for all platform entities (users, creators, series, seasons, episodes, purchases) using the admin client for full-table access, (4) **Homepage curation** -- a new `homepage_sections` table (or simpler `editorial_picks` approach using the existing `series.is_featured` boolean plus a new sort order column) to let admins select featured series, and (5) **Platform metrics** -- aggregate queries over existing tables for a metrics dashboard.

No new npm packages are needed. The entire phase is built with the existing stack: Next.js 16 server components and server actions, Supabase queries (some via admin client for cross-user data), Zod v4 validation, and the established UI patterns from the creator dashboard.

**Primary recommendation:** Use the Supabase admin client (`createAdminClient()`) for all admin queries that need cross-user access (bypasses RLS), rather than adding complex RLS policies for every table. Add RLS admin policies only for `creator_applications` (already done) and the new `homepage_sections` table. Enforce admin role checks at the application layer in every server component and server action using a shared `requireAdmin()` helper. Use Next.js 16's `forbidden()` function with `authInterrupts` experimental config for clean 403 handling.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/supabase-js` | ^2.95.3 (installed) | Database queries for all admin data access | Already the core data layer; admin client already exists |
| `@supabase/ssr` | ^0.8.0 (installed) | Server-side Supabase client with cookie-based auth | Already used in middleware and server components |
| `zod` | ^4.3.6 (installed) | Validation schemas for admin forms (application review, content edits) | Existing pattern (`zod/v4` import) used throughout |
| `sonner` | ^2.0.7 (installed) | Toast notifications for admin action feedback | Already integrated in layout |
| `lucide-react` | ^0.564.0 (installed) | Icons for admin navigation and action buttons | Already the project icon library |
| `nuqs` | ^2.8.8 (installed) | URL-synced search/filter state for entity tables | Already used in browse page for genre filter |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `next` | 16.1.6 (installed) | `forbidden()` function for 403 pages, middleware for route protection | New: `authInterrupts` experimental config needed |
| `stripe` | ^20.3.1 (installed) | Revenue data for platform metrics dashboard | Already integrated for payments |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Admin client (service role) for queries | RLS policies for admin on every table | Admin client is simpler, fewer migration files, already exists; RLS policies per-table is more secure but massive migration scope for v1 admin panel |
| `forbidden()` + 403 page | `redirect('/login')` for non-admins | `forbidden()` is semantically correct (403 vs 302), gives better UX ("you're logged in but not authorized") |
| Simple `is_featured` + `featured_sort_order` columns | Separate `homepage_sections` table | Column approach is simpler for v1 with just "featured series"; table approach better if editorial picks need categories/descriptions but over-engineered for now |
| URL search params via `nuqs` for filters | React state for search/filter | URL state survives refresh, enables shareable admin links, consistent with existing browse pattern |

**Installation:**
```bash
# No new packages needed -- everything is already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── (admin)/
│   │   ├── layout.tsx                              # EXISTING: admin layout with sidebar
│   │   ├── loading.tsx                             # EXISTING: loading spinner
│   │   ├── forbidden.tsx                           # NEW: 403 page for non-admin users
│   │   └── admin/
│   │       ├── page.tsx                            # MODIFY: dashboard with platform metrics
│   │       ├── applications/
│   │       │   ├── page.tsx                        # NEW: pending application list
│   │       │   └── [id]/
│   │       │       └── page.tsx                    # NEW: application review detail
│   │       ├── creators/
│   │       │   ├── page.tsx                        # NEW: all creators browse/search
│   │       │   └── [id]/
│   │       │       └── page.tsx                    # NEW: creator detail/edit
│   │       ├── content/
│   │       │   ├── page.tsx                        # NEW: all series browse/search
│   │       │   └── [id]/
│   │       │       └── page.tsx                    # NEW: series detail with seasons/episodes
│   │       ├── users/
│   │       │   ├── page.tsx                        # NEW: all users browse/search
│   │       │   └── [id]/
│   │       │       └── page.tsx                    # NEW: user detail/edit
│   │       ├── revenue/
│   │       │   └── page.tsx                        # NEW: revenue overview with purchases
│   │       └── homepage/
│   │           └── page.tsx                        # NEW: homepage curation (featured series, picks)
├── modules/
│   └── admin/
│       ├── actions/
│       │   ├── applications.ts                     # NEW: approve/reject applications
│       │   ├── content.ts                          # NEW: feature/unfeature, archive, delete content
│       │   ├── users.ts                            # NEW: edit user role, manage profiles
│       │   └── homepage.ts                         # NEW: set featured series, editorial picks
│       └── queries/
│           ├── get-platform-metrics.ts             # NEW: aggregate metrics queries
│           ├── get-applications.ts                 # NEW: list/filter applications
│           ├── get-admin-entities.ts               # NEW: browse/search entities
│           └── get-revenue-data.ts                 # NEW: revenue aggregation
├── lib/
│   └── admin/
│       └── require-admin.ts                        # NEW: shared admin role check utility
```

### Pattern 1: Admin Role Guard (Application Layer)
**What:** A shared `requireAdmin()` utility that verifies the current user has the `admin` role, used at the top of every admin server component and server action.
**When to use:** Every admin page and every admin server action -- no exceptions.
**Example:**
```typescript
// src/lib/admin/require-admin.ts
// Source: Next.js docs - forbidden() function pattern
import { createClient } from "@/lib/supabase/server";
import { forbidden, redirect } from "next/navigation";

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    forbidden();
  }

  return { user, supabase };
}
```

### Pattern 2: Admin Client for Cross-User Data Access
**What:** Use the existing `createAdminClient()` (service role key, bypasses RLS) for admin queries that need to read/write data across all users. The regular `createClient()` is used for auth checks, then `createAdminClient()` for data operations.
**When to use:** Any query that needs to access data belonging to other users (listing all series, all users, all purchases, etc.).
**Example:**
```typescript
// In admin server component or query
import { requireAdmin } from "@/lib/admin/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AllSeriesPage() {
  await requireAdmin(); // Auth + role check

  const adminDb = createAdminClient();
  const { data: series } = await adminDb
    .from("series")
    .select("*, profiles!creator_id(display_name, username)")
    .order("created_at", { ascending: false })
    .range(0, 49);

  // render...
}
```

### Pattern 3: Application Review Workflow
**What:** Admin reviews pending creator applications, approves or rejects with feedback notes. On approval, the user's `profiles.role` is updated from `'viewer'` to `'creator'`, and the application status is set to `'approved'`. On rejection, status is set to `'rejected'` with `reviewer_notes`.
**When to use:** The application review page -- this is the core ADMN-01 workflow.
**Example:**
```typescript
// Server action pattern
"use server";
import { requireAdmin } from "@/lib/admin/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function approveApplication(applicationId: string) {
  const { user } = await requireAdmin();
  const adminDb = createAdminClient();

  // Fetch application
  const { data: app } = await adminDb
    .from("creator_applications")
    .select("user_id, display_name")
    .eq("id", applicationId)
    .single();

  if (!app) return { success: false, message: "Application not found" };

  // Update application status
  await adminDb
    .from("creator_applications")
    .update({
      status: "approved",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", applicationId);

  // Promote user role to creator
  await adminDb
    .from("profiles")
    .update({
      role: "creator",
      display_name: app.display_name,
    })
    .eq("id", app.user_id);

  return { success: true };
}
```

### Pattern 4: Homepage Curation via Featured Series
**What:** Admin selects which series appear as featured on the homepage. The existing `series.is_featured` boolean column and `idx_series_featured` index are already in the schema. Add a `featured_sort_order` column to control display order. Admin toggles `is_featured` and sets sort order.
**When to use:** Homepage curation page (ADMN-03). The public homepage reads `is_featured = true` series ordered by `featured_sort_order`.
**Example:**
```typescript
// Admin sets a series as featured
await adminDb
  .from("series")
  .update({ is_featured: true, featured_sort_order: 1 })
  .eq("id", seriesId);

// Public homepage query
const { data: featured } = await supabase
  .from("series")
  .select("*, profiles!creator_id(display_name, username, avatar_url)")
  .eq("status", "published")
  .eq("is_featured", true)
  .order("featured_sort_order", { ascending: true });
```

### Anti-Patterns to Avoid
- **Exposing admin client to client components:** The service role key must never reach the browser. All admin operations must be server components or server actions. Never import `createAdminClient` in a `"use client"` file.
- **Relying solely on middleware for admin auth:** Middleware can redirect unauthenticated users, but role checks should happen in server components/actions too (defense in depth). Middleware runs on edge and cannot do complex DB lookups reliably.
- **Building a full RBAC system:** For v1, the role is a simple TEXT column with three values. Do not build a permissions table, role hierarchy, or policy engine. A simple `role === 'admin'` check is sufficient.
- **Adding RLS admin policies to every table:** This would require a new migration adding policies to `series`, `seasons`, `episodes`, `profiles`, `purchases`, `payout_records`, `community_posts`, `poll_votes`, and `followers`. The admin client approach (service role) bypasses RLS entirely and is the correct pattern for an admin panel where the admin needs unrestricted access.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Data tables with sort/filter/pagination | Custom table component from scratch | Reuse the existing table pattern from creator dashboard (analytics page) with `nuqs` for URL state | Consistent with existing patterns, URL-persistent filters |
| Admin role authorization | Custom JWT claims or session middleware | `requireAdmin()` utility + Supabase `profiles.role` check | Simple, database-backed, already the pattern for creator role checks |
| 403 Forbidden page | Custom error handling with try/catch | Next.js `forbidden()` + `authInterrupts` experimental config | Official Next.js pattern, renders `forbidden.tsx` automatically |
| Full-text search | pg_trgm or Elasticsearch | Supabase `.ilike()` or `.textSearch()` on indexed columns | Sufficient for admin search at v1 scale, no new infrastructure |
| Charts/graphs for metrics | D3.js, Chart.js, Recharts | Simple metric cards with formatted numbers | The existing pattern (4 stat cards in creator dashboard) is proven; charts are Phase 8 territory for pitch assets |
| Homepage CMS | Headless CMS (Contentful, Sanity) | `series.is_featured` boolean + `featured_sort_order` column | The homepage is a curated list of series, not arbitrary content blocks |

**Key insight:** The admin panel is an internal tool, not a public-facing product. Functionality and correctness matter far more than polish. Use the same card/table/form patterns from the creator dashboard. No need for drag-and-drop, inline editing, or complex data visualizations.

## Common Pitfalls

### Pitfall 1: Admin Client Leaking to Client Components
**What goes wrong:** Importing `createAdminClient` in a `"use client"` component exposes the Supabase service role key to the browser, granting full database access to anyone who inspects network traffic.
**Why it happens:** Easy to accidentally import the wrong client, especially when copying patterns from server components.
**How to avoid:** The `createAdminClient` function is in `src/lib/supabase/admin.ts`. Add a comment and consider using the `server-only` package. All admin operations must be in server components or `"use server"` action files.
**Warning signs:** Any `"use client"` file importing from `@/lib/supabase/admin`.

### Pitfall 2: Race Condition in Application Approval
**What goes wrong:** Admin approves an application, but the role update and application status update are not atomic. If the role update succeeds but the application status update fails, the user becomes a creator but the application still shows as pending.
**Why it happens:** Two separate Supabase calls without a transaction.
**How to avoid:** Either use a Supabase RPC function (database function) that performs both updates atomically, or accept the minor race condition and build the UI to handle inconsistent states (check `profiles.role` as ground truth, not application status). For v1, the latter is acceptable since admin operations are low-volume.
**Warning signs:** Application list showing "pending" for users who already have creator role.

### Pitfall 3: Middleware Doing Too Much
**What goes wrong:** Trying to do the admin role check in middleware by querying the database. This adds latency to every request, middleware runs on the edge (limited runtime), and the Supabase client in middleware doesn't have a reliable way to query the `profiles` table without extra round-trips.
**Why it happens:** Wanting a single place for all auth logic.
**How to avoid:** Keep middleware simple: check authentication only (is the user logged in?). Do role checks in server components and server actions where you have full Node.js runtime and can query the database efficiently. The existing middleware already does this correctly -- it checks for `user` on protected routes, nothing more.
**Warning signs:** Slow admin page loads, edge runtime errors about unsupported APIs.

### Pitfall 4: Forgetting to revalidatePath After Admin Mutations
**What goes wrong:** Admin approves an application, changes a featured series, or edits content, but the admin list page still shows stale data.
**Why it happens:** Next.js caches server component renders. After a server action mutates data, the page cache must be invalidated.
**How to avoid:** Call `revalidatePath('/admin/...')` after every mutation, same as the creator dashboard pattern. Also revalidate public paths when admin changes affect them (e.g., `revalidatePath('/')` after changing featured series).
**Warning signs:** Admin sees stale data after performing actions until they hard-refresh.

### Pitfall 5: N+1 Queries in Entity Management Pages
**What goes wrong:** The "all series" admin page loads each series' creator profile, season count, and episode count in separate queries per row, causing dozens of queries for a single page load.
**Why it happens:** Using a simple `.select('*')` without Supabase joins, then fetching related data in a loop.
**How to avoid:** Use Supabase's join syntax: `.select('*, profiles!creator_id(display_name), seasons(count)')`. Supabase supports aggregated counts via the `count` parameter. For complex aggregations, use a single query with nested selects rather than N+1 queries.
**Warning signs:** Admin pages loading slowly, many database queries in Supabase dashboard logs.

## Code Examples

Verified patterns from official sources and existing codebase:

### Admin Role Check Utility
```typescript
// src/lib/admin/require-admin.ts
// Pattern: matches existing creator role checks in dashboard pages
import { createClient } from "@/lib/supabase/server";
import { forbidden, redirect } from "next/navigation";

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    forbidden();
  }

  return { user, profile, supabase };
}
```

### Application Review Server Action
```typescript
// src/modules/admin/actions/applications.ts
"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/require-admin";

export async function reviewApplication(
  applicationId: string,
  decision: "approved" | "rejected",
  reviewerNotes?: string,
) {
  const { user } = await requireAdmin();
  const adminDb = createAdminClient();

  const { data: app } = await adminDb
    .from("creator_applications")
    .select("user_id, display_name, bio")
    .eq("id", applicationId)
    .eq("status", "pending")
    .single();

  if (!app) {
    return { success: false, message: "Application not found or already reviewed" };
  }

  // Update application
  await adminDb
    .from("creator_applications")
    .update({
      status: decision,
      reviewer_notes: reviewerNotes || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", applicationId);

  // On approval, promote user to creator
  if (decision === "approved") {
    await adminDb
      .from("profiles")
      .update({
        role: "creator",
        display_name: app.display_name,
        bio: app.bio,
      })
      .eq("id", app.user_id);
  }

  revalidatePath("/admin/applications");
  return { success: true, message: `Application ${decision}` };
}
```

### Platform Metrics Query
```typescript
// src/modules/admin/queries/get-platform-metrics.ts
import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";

export const getPlatformMetrics = cache(async () => {
  const adminDb = createAdminClient();

  // Parallel queries for aggregate counts
  const [usersResult, creatorsResult, seriesResult, purchasesResult] = await Promise.all([
    adminDb.from("profiles").select("id", { count: "exact", head: true }),
    adminDb.from("profiles").select("id", { count: "exact", head: true }).eq("role", "creator"),
    adminDb.from("series").select("id", { count: "exact", head: true }).eq("status", "published"),
    adminDb.from("purchases").select("amount_cents").eq("status", "completed"),
  ]);

  const totalRevenueCents = (purchasesResult.data ?? [])
    .reduce((sum, p) => sum + p.amount_cents, 0);

  return {
    totalUsers: usersResult.count ?? 0,
    activeCreators: creatorsResult.count ?? 0,
    publishedSeries: seriesResult.count ?? 0,
    totalRevenueCents,
    totalPurchases: purchasesResult.data?.length ?? 0,
  };
});
```

### Featured Series Toggle (Homepage Curation)
```typescript
// src/modules/admin/actions/homepage.ts
"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/require-admin";

export async function toggleFeatured(seriesId: string, featured: boolean, sortOrder?: number) {
  await requireAdmin();
  const adminDb = createAdminClient();

  await adminDb
    .from("series")
    .update({
      is_featured: featured,
      featured_sort_order: featured ? (sortOrder ?? 0) : null,
    })
    .eq("id", seriesId);

  revalidatePath("/admin/homepage");
  revalidatePath("/"); // Public homepage
  return { success: true };
}
```

### Next.js Config for forbidden() Support
```typescript
// next.config.ts -- needs authInterrupts experimental flag
import { withSerwist } from "@serwist/turbopack";

const nextConfig = withSerwist({
  serverExternalPackages: ["esbuild"],
  experimental: {
    authInterrupts: true,
  },
});

export default nextConfig;
```

### Admin Sidebar Navigation Update
```typescript
// The existing sidebar already has admin nav items defined:
const adminNavItems = [
  { label: "Dashboard", href: "/admin", icon: "..." },
  { label: "Creators", href: "/admin/creators", icon: "..." },
  { label: "Content", href: "/admin/content", icon: "..." },
  { label: "Users", href: "/admin/users", icon: "..." },
  { label: "Settings", href: "/admin/settings", icon: "..." },
];

// Needs updating to include:
// - "Applications" (for ADMN-01)
// - "Revenue" (for ADMN-02/04)
// - "Homepage" (for ADMN-03)
// And remove "Settings" if not needed for v1
```

## Database Changes

### New Migration: 00000000000005_admin_panel.sql

The migration needs to add:

1. **`featured_sort_order` column on `series` table** -- controls display order of featured series on homepage
2. **`editorial_picks` table** -- optional, for additional curated collections beyond featured series
3. **Admin RLS policies** on tables that don't yet have them (most tables only need admin client access, not RLS policies)

```sql
-- Migration: 00000000000005_admin_panel
-- Phase 7: Admin Panel - Featured sort order, editorial picks

-- Featured series sort order
ALTER TABLE public.series
  ADD COLUMN featured_sort_order INTEGER DEFAULT 0;

-- Editorial picks: curated collections for homepage sections
CREATE TABLE public.editorial_picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  section TEXT NOT NULL DEFAULT 'featured'
    CHECK (section IN ('featured', 'trending', 'new_releases', 'staff_picks')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  added_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (series_id, section)
);

ALTER TABLE public.editorial_picks ENABLE ROW LEVEL SECURITY;

-- Public can read editorial picks
CREATE POLICY "Editorial picks are publicly readable"
  ON public.editorial_picks FOR SELECT
  USING (true);

-- Admins can manage editorial picks
CREATE POLICY "Admins can manage editorial picks"
  ON public.editorial_picks FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
  );

CREATE INDEX idx_editorial_picks_section ON public.editorial_picks(section, sort_order);

-- Admin full access to all content tables (for admin panel operations via regular client)
-- Note: The admin panel primarily uses createAdminClient() which bypasses RLS,
-- but these policies provide defense-in-depth for any regular client usage.

CREATE POLICY "Admins can manage all series"
  ON public.series FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
  );

CREATE POLICY "Admins can manage all seasons"
  ON public.seasons FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
  );

CREATE POLICY "Admins can manage all episodes"
  ON public.episodes FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
  );

CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
  );

CREATE POLICY "Admins can view all purchases"
  ON public.purchases FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
  );

CREATE POLICY "Admins can manage all community posts"
  ON public.community_posts FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
  );
```

### Decision: `is_featured` + `editorial_picks` Table (Dual Approach)
The existing `series.is_featured` boolean remains for the simple "is this series featured?" toggle. The new `editorial_picks` table enables multiple curated sections (featured, trending, new_releases, staff_picks) with sort order, allowing the homepage to have distinct sections. Both approaches are used: `is_featured` as a quick flag on the series itself, and `editorial_picks` for organized homepage sections.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom RBAC middleware | `forbidden()` + `authInterrupts` in Next.js | Next.js 15+ | Clean 403 handling with `forbidden.tsx` page, no manual error catching |
| RLS policies for every admin operation | Service role client (admin client) | Supabase best practice | Simpler admin code, fewer migration files, same security posture for internal tools |
| Client-side role checks | Server Component role checks | Next.js App Router pattern | Role check happens before any data is sent to client, impossible to bypass |
| Separate admin API routes | Server Actions from admin pages | Next.js 14+ | Colocation of mutation logic, type-safe form handling, automatic request binding |

**Deprecated/outdated:**
- `getServerSideProps` for admin pages -- replaced by Server Components in App Router
- `pages/api/admin/*` API routes -- replaced by Server Actions for mutations, Server Components for data fetching
- Client-side `useEffect` role checks -- insecure, should always be server-side

## Open Questions

1. **Should middleware enforce admin role or just auth?**
   - What we know: Current middleware checks auth only (redirects unauthenticated users from `/admin`). Role checks happen in server components. This is the recommended pattern per Next.js docs (middleware is for auth, components for authorization).
   - What's unclear: Whether adding a profile query in middleware for admin role enforcement would be beneficial or harmful (adds DB call to every admin request but provides earlier rejection).
   - Recommendation: Keep middleware simple (auth only). Do role checks in the `requireAdmin()` utility called by each server component/action. This matches the existing pattern and avoids adding database queries to the edge middleware.

2. **Editorial picks: separate table or just `is_featured` + sort order?**
   - What we know: `series.is_featured` already exists with an index. Adding `featured_sort_order` column to `series` would be minimal. But the homepage likely needs multiple sections (featured, trending, staff picks).
   - What's unclear: How many homepage sections are actually needed for pitch readiness (Phase 8).
   - Recommendation: Use both. Keep `is_featured` as a quick boolean. Add the `editorial_picks` table for organized homepage sections. The homepage page can query `editorial_picks` grouped by section. This provides flexibility without over-engineering.

3. **Content moderation: soft delete or hard delete?**
   - What we know: The existing creator `deleteSeries` action does a hard delete (Supabase cascade). For admin moderation, a soft delete (status change to `'archived'`) might be more appropriate to preserve evidence.
   - What's unclear: Whether there are legal or compliance requirements for content preservation.
   - Recommendation: Use `status = 'archived'` for admin-initiated content removal (soft delete). This uses the existing `content_status` enum which already includes `'archived'`. Hard delete remains available as a separate, more destructive action.

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `src/app/(admin)/` route group, layout, page (existing scaffold)
- Codebase analysis: `src/db/schema.sql` -- `profiles.role`, `series.is_featured`, `creator_applications` table with admin RLS policy
- Codebase analysis: `src/lib/supabase/admin.ts` -- existing admin client with service role key
- Codebase analysis: `src/lib/supabase/middleware.ts` -- current auth-only middleware protecting `/admin`
- Codebase analysis: `src/modules/creator/actions/*.ts` -- established server action patterns
- Context7: `/supabase/supabase` -- RLS admin policies, `security definer` functions, `bypassrls` role privilege
- Context7: `/vercel/next.js` -- `forbidden()` function, `authInterrupts` experimental config, role-based route protection patterns

### Secondary (MEDIUM confidence)
- Next.js docs (via Context7) -- Server Component authorization pattern with `forbidden()`
- Supabase docs (via Context7) -- Admin role RLS policy pattern using `EXISTS` subquery

### Tertiary (LOW confidence)
- None -- all findings verified against codebase or official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new packages, all existing libraries, patterns verified in codebase
- Architecture: HIGH -- follows established creator dashboard patterns, extends existing route group scaffold
- Database changes: HIGH -- minimal schema additions (one column, one table), existing patterns for RLS policies
- Pitfalls: HIGH -- derived from actual codebase analysis and known Next.js/Supabase patterns

**Research date:** 2026-02-15
**Valid until:** 2026-03-15 (stable -- all technologies are already in use in the project)
