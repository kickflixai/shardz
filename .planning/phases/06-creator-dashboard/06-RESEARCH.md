# Phase 6: Creator Dashboard - Research

**Researched:** 2026-02-14
**Domain:** Creator onboarding, Mux direct uploads, content management, Supabase Storage, analytics, community features, public profiles
**Confidence:** HIGH

## Summary

Phase 6 transforms MicroShort from a consumer-only platform into a two-sided marketplace by giving creators self-serve tools to apply, upload content, manage their catalog, track analytics, engage community, and maintain a public profile. The phase builds on a solid foundation: the database schema already has Series > Seasons > Episodes with creator ownership via `creator_id`, the `profiles` table has `role` (viewer/creator/admin), `bio`, `stripe_account_id`, and `stripe_onboarding_complete` fields, and the `(creator)` route group with sidebar navigation already exists as a skeleton. The existing Mux integration (client, webhook handler, signed playback tokens) and Stripe Connect infrastructure (connect routes, transfers, payouts dashboard) provide most of the backend needed.

The critical new capability is the **content upload pipeline**: Mux Direct Uploads via `@mux/mux-uploader-react` (already installed at v1.4.1) paired with thumbnail/image uploads to Supabase Storage. The Mux webhook handler (`src/app/api/webhooks/mux/route.ts`) already processes `video.asset.ready` events and writes `mux_asset_id`, `mux_playback_id`, and `duration_seconds` to the `episodes` table, so the upload-to-playback pipeline is already wired. The main new work is: (1) creator application and role upgrade flow, (2) a multi-step upload form with MuxUploader + metadata fields, (3) CRUD for series/seasons/episodes with reorder and release strategy, (4) analytics aggregation queries over the existing `purchases` and `episodes` tables, (5) community discussion tables with Supabase Realtime, and (6) a public profile page.

**Primary recommendation:** Leverage the existing Mux webhook handler and `@mux/mux-uploader-react` for video uploads with `passthrough` carrying the episode ID. Use Supabase Storage for thumbnails (a `thumbnails` bucket with RLS policies scoped to `creator_id` folder paths). Build the application form as a new `creator_applications` table with admin review in Phase 7. Use Server Actions (the established pattern from auth forms) for all CRUD mutations with Zod v4 validation. Build analytics as materialized queries over the existing `purchases` table -- no separate analytics tables needed for v1.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@mux/mux-uploader-react` | ^1.4.1 (installed) | Browser-side video upload component with progress, drag-and-drop | Official Mux React uploader, handles chunking, retry, progress UI out of the box |
| `@mux/mux-node` | ^12.8.1 (installed) | Server-side Direct Upload URL creation, asset management | Already used for JWT signing and webhook verification |
| `@supabase/supabase-js` | ^2.95.3 (installed) | Database CRUD, Storage uploads, Realtime subscriptions | Already the core data layer |
| `stripe` | ^20.3.1 (installed) | Creator earnings data for analytics dashboard | Already integrated for payments and Connect |
| `zod` | ^4.3.6 (installed) | Form validation schemas for all creator forms | Existing pattern (`zod/v4` import), used in auth forms |
| `sonner` | ^2.0.7 (installed) | Toast notifications for CRUD success/error feedback | Already integrated in layout and used by paywall/share components |
| `lucide-react` | ^0.564.0 (installed) | Icons for dashboard navigation, actions, and analytics | Already the project's icon library |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `nuqs` | ^2.8.8 (installed) | URL-synced state for analytics date ranges, filters | Already used in browse page for genre filter |
| `next-themes` | ^0.4.6 (installed) | Theme provider | Already active, no additional config needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Supabase Storage (thumbnails) | Cloudinary, S3 | Supabase is already in stack, simplest integration, RLS policies for access control |
| Server Actions (CRUD) | API Route handlers | Server Actions are the established pattern, bind directly to forms, colocate validation |
| Supabase Realtime (community) | Pusher, Ably | Already in stack, free tier sufficient, native postgres_changes integration |
| Raw SQL analytics queries | Dedicated analytics DB | Overkill for v1; Supabase aggregate queries over purchases/episodes are sufficient |

**Installation:**
```bash
# No new packages needed -- everything is already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── (creator)/
│   │   └── dashboard/
│   │       ├── page.tsx                         # Dashboard home (overview stats)
│   │       ├── apply/
│   │       │   └── page.tsx                     # Creator application form (viewer -> creator)
│   │       ├── series/
│   │       │   ├── page.tsx                     # Series list (creator's catalog)
│   │       │   ├── new/
│   │       │   │   └── page.tsx                 # Create new series form
│   │       │   └── [seriesId]/
│   │       │       ├── page.tsx                 # Edit series detail
│   │       │       ├── seasons/
│   │       │       │   ├── new/page.tsx          # Add season
│   │       │       │   └── [seasonId]/
│   │       │       │       ├── page.tsx          # Edit season + episode list
│   │       │       │       └── episodes/
│   │       │       │           ├── new/page.tsx  # Upload episode (Mux + metadata)
│   │       │       │           └── [episodeId]/
│   │       │       │               └── page.tsx  # Edit episode metadata
│   │       │       └── community/
│   │       │           └── page.tsx             # Community feed management
│   │       ├── analytics/
│   │       │   └── page.tsx                     # Analytics dashboard
│   │       ├── payouts/
│   │       │   └── page.tsx                     # (existing) Payout history
│   │       └── settings/
│   │           └── page.tsx                     # Creator profile settings
│   ├── (public)/
│   │   └── creator/
│   │       └── [username]/
│   │           └── page.tsx                     # Public creator profile
│   └── api/
│       └── upload/
│           └── route.ts                         # POST: Create Mux Direct Upload URL
├── lib/
│   ├── mux/
│   │   ├── client.ts                            # (existing) Mux SDK singleton
│   │   ├── tokens.ts                            # (existing) JWT signing
│   │   ├── webhooks.ts                          # (existing) Webhook verification
│   │   └── uploads.ts                           # NEW: createDirectUpload helper
│   └── validations/
│       ├── auth.ts                              # (existing) Auth form schemas
│       └── creator.ts                           # NEW: Creator form validation schemas
├── modules/
│   ├── creator/
│   │   ├── actions/                             # Server Actions for creator CRUD
│   │   │   ├── apply.ts                         # Submit creator application
│   │   │   ├── series.ts                        # Create/update/delete series
│   │   │   ├── seasons.ts                       # Create/update/delete/reorder seasons
│   │   │   ├── episodes.ts                      # Create/update/delete/reorder episodes
│   │   │   └── community.ts                     # Create posts, polls, manage community
│   │   ├── queries/
│   │   │   ├── get-creator-series.ts             # Creator's series catalog
│   │   │   ├── get-creator-analytics.ts          # Analytics aggregation queries
│   │   │   ├── get-creator-profile.ts            # Public profile data
│   │   │   └── get-community-posts.ts            # Community feed data
│   │   └── types.ts                              # Creator-specific type definitions
│   └── purchases/                               # (existing) Purchase queries
├── components/
│   ├── creator/
│   │   ├── series-form.tsx                       # Series create/edit form
│   │   ├── season-form.tsx                       # Season create/edit form
│   │   ├── episode-form.tsx                      # Episode upload form with MuxUploader
│   │   ├── episode-list-manager.tsx              # Reorderable episode list
│   │   ├── thumbnail-upload.tsx                  # Supabase Storage thumbnail uploader
│   │   ├── analytics-charts.tsx                  # Analytics visualizations
│   │   ├── community-feed.tsx                    # Discussion feed component
│   │   └── poll-creator.tsx                      # Poll creation UI
│   └── profile/
│       └── public-profile.tsx                    # Creator public profile component
supabase/
└── migrations/
    └── 00000000000004_creator_dashboard.sql       # creator_applications, community tables, storage bucket
```

### Pattern 1: Mux Direct Upload with Passthrough Episode ID
**What:** Create a Mux Direct Upload URL on the server, passing the episode ID via `passthrough` in `new_asset_settings`. The existing Mux webhook handler already reads `passthrough` as the `episodeId` and writes `mux_asset_id`, `mux_playback_id`, and `duration_seconds` to the episode.
**When to use:** Every time a creator uploads a video file for an episode.
**Example:**
```typescript
// src/lib/mux/uploads.ts
// Source: https://www.mux.com/docs/api-reference/video/direct-uploads/create-direct-upload
// Source: existing webhook handler reads data.passthrough as episodeId

import { mux } from "./client";

interface CreateUploadParams {
  episodeId: string;
  corsOrigin?: string;
}

export async function createDirectUpload(params: CreateUploadParams): Promise<string> {
  const directUpload = await mux.video.uploads.create({
    cors_origin: params.corsOrigin || process.env.NEXT_PUBLIC_APP_URL || "*",
    new_asset_settings: {
      playback_policy: ["signed"],
      passthrough: params.episodeId,       // Webhook reads this as episodeId
      video_quality: "basic",
    },
  });

  return directUpload.url;
}
```

```typescript
// src/app/api/upload/route.ts
// API route called by MuxUploader's endpoint prop (as async function)

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createDirectUpload } from "@/lib/mux/uploads";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { episodeId } = await request.json();

  // Verify the user owns this episode (via series -> creator_id)
  const { data: episode } = await supabase
    .from("episodes")
    .select("id, season_id, seasons!inner(series_id, series!inner(creator_id))")
    .eq("id", episodeId)
    .single();

  if (!episode || episode.seasons.series.creator_id !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // Mark episode as processing
  await supabase.from("episodes").update({ status: "processing" }).eq("id", episodeId);

  const uploadUrl = await createDirectUpload({ episodeId });
  return NextResponse.json({ url: uploadUrl });
}
```

```tsx
// In the episode upload form component
import MuxUploader from "@mux/mux-uploader-react";

<MuxUploader
  endpoint={() =>
    fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ episodeId }),
    }).then((res) => res.json()).then((data) => data.url)
  }
  onSuccess={() => {
    toast.success("Upload complete! Processing video...");
    // Episode status will update to "ready" when Mux webhook fires
  }}
  onUploadError={() => {
    toast.error("Upload failed. Please try again.");
  }}
/>
```

### Pattern 2: Supabase Storage for Thumbnails
**What:** A `thumbnails` storage bucket for series and episode thumbnail images. Creators upload via the browser client using signed upload URLs generated server-side.
**When to use:** When a creator sets a thumbnail for a series or episode.
**Example:**
```sql
-- Create storage bucket (in migration)
INSERT INTO storage.buckets (id, name, public) VALUES ('thumbnails', 'thumbnails', true);

-- RLS: Creators can upload to their own folder
CREATE POLICY "Creators can upload thumbnails"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'thumbnails' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS: Creators can update/delete their own thumbnails
CREATE POLICY "Creators can manage own thumbnails"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Creators can delete own thumbnails"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS: Public read access for thumbnails
CREATE POLICY "Thumbnails are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'thumbnails');
```

```typescript
// Upload thumbnail from browser
// Path convention: {creator_id}/{series_id_or_episode_id}/{filename}
const file = event.target.files[0];
const filePath = `${user.id}/${seriesId}/${Date.now()}_${file.name}`;

const { data, error } = await supabase.storage
  .from("thumbnails")
  .upload(filePath, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type,
  });

if (data) {
  const { data: { publicUrl } } = supabase.storage
    .from("thumbnails")
    .getPublicUrl(data.path);
  // Save publicUrl to series.thumbnail_url or episode.thumbnail_url
}
```

### Pattern 3: Server Actions for Creator CRUD (Established Pattern)
**What:** All creator mutations (create/update/delete series, seasons, episodes) use Server Actions with Zod validation, matching the existing auth form pattern.
**When to use:** Every creator form submission.
**Example:**
```typescript
// src/modules/creator/actions/series.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod/v4";
import { createClient } from "@/lib/supabase/server";
import { seriesSchema } from "@/lib/validations/creator";

export async function createSeries(
  _prevState: { errors: Record<string, string[]> | null; success: boolean },
  formData: FormData,
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { errors: null, success: false, message: "Not authenticated" };

  // Verify creator role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "creator" && profile?.role !== "admin") {
    return { errors: null, success: false, message: "Creator access required" };
  }

  const raw = Object.fromEntries(formData.entries());
  const result = seriesSchema.safeParse(raw);
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors, success: false };
  }

  const { data: series, error } = await supabase
    .from("series")
    .insert({
      ...result.data,
      creator_id: user.id,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) {
    return { errors: null, success: false, message: "Failed to create series" };
  }

  revalidatePath("/dashboard/series");
  redirect(`/dashboard/series/${series.id}`);
}
```

### Pattern 4: Creator Application with Role Upgrade
**What:** A `creator_applications` table stores applications from viewers wanting to become creators. An admin approves/rejects in Phase 7. Upon approval, the user's `profiles.role` is upgraded from `viewer` to `creator`.
**When to use:** When a viewer applies to become a creator.
**Example:**
```sql
CREATE TABLE public.creator_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  display_name TEXT NOT NULL,
  bio TEXT NOT NULL,
  portfolio_url TEXT,
  portfolio_description TEXT NOT NULL,
  sample_video_urls TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (user_id)  -- One application per user
);

ALTER TABLE public.creator_applications ENABLE ROW LEVEL SECURITY;

-- Users can view and create their own application
CREATE POLICY "Users can view own application"
  ON public.creator_applications FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own application"
  ON public.creator_applications FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Admins can view all applications (Phase 7 will add admin policies)
CREATE POLICY "Admins can view all applications"
  ON public.creator_applications FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
  );

CREATE POLICY "Admins can update applications"
  ON public.creator_applications FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
  );
```

### Pattern 5: Community Discussion Feed with Supabase Realtime
**What:** A `community_posts` table stores discussion entries per series, with optional polls. Supabase Realtime subscriptions show new posts without page reload.
**When to use:** Creator community spaces within each series.
**Example:**
```sql
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL CHECK (char_length(content) <= 1000),
  post_type TEXT NOT NULL DEFAULT 'discussion'
    CHECK (post_type IN ('discussion', 'poll', 'announcement')),
  poll_options JSONB,           -- Array of { text, votes } for polls
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  option_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (post_id, user_id)  -- One vote per user per poll
);
```

```typescript
// Subscribe to new posts in real-time (client component)
const supabase = createBrowserClient();

const channel = supabase
  .channel(`community-${seriesId}`)
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "community_posts",
      filter: `series_id=eq.${seriesId}`,
    },
    (payload) => {
      setPosts((prev) => [payload.new as CommunityPost, ...prev]);
    }
  )
  .subscribe();

// Cleanup
return () => { supabase.removeChannel(channel); };
```

### Pattern 6: Analytics as Aggregate Queries
**What:** Creator analytics are computed from existing tables -- no separate analytics tracking needed for v1. Views come from `series.view_count`, revenue from `purchases`, episode engagement from episode page views.
**When to use:** Creator analytics dashboard.
**Example:**
```typescript
// src/modules/creator/queries/get-creator-analytics.ts

export async function getCreatorAnalytics(creatorId: string) {
  const supabase = await createClient();

  // Total views across all creator's series
  const { data: seriesData } = await supabase
    .from("series")
    .select("id, title, view_count, slug")
    .eq("creator_id", creatorId);

  // Revenue data from purchases table
  const { data: purchaseData } = await supabase
    .from("purchases")
    .select("amount_cents, creator_share_cents, transferred, created_at, season_id")
    .eq("creator_id", creatorId)
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  // Compute aggregates in application code
  const totalViews = seriesData?.reduce((sum, s) => sum + s.view_count, 0) ?? 0;
  const totalRevenue = purchaseData?.reduce((sum, p) => sum + p.amount_cents, 0) ?? 0;
  const creatorEarnings = purchaseData?.reduce((sum, p) => sum + p.creator_share_cents, 0) ?? 0;
  const totalUnlocks = purchaseData?.length ?? 0;

  return {
    totalViews,
    totalRevenue,
    creatorEarnings,
    totalUnlocks,
    series: seriesData ?? [],
    recentPurchases: purchaseData?.slice(0, 20) ?? [],
  };
}
```

### Anti-Patterns to Avoid
- **Client-side role checks only:** Always verify `role === 'creator'` server-side (in Server Actions and route handlers), never rely only on client-side UI hiding.
- **Uploading video through the Next.js server:** Video files are large. Use Mux Direct Upload -- the browser uploads directly to Mux, bypassing the Next.js server entirely. Only the authenticated upload URL is generated server-side.
- **Storing thumbnails in the database:** Binary data should go to Supabase Storage, not in a `bytea` column. Store only the public URL string.
- **Polling for upload status:** The Mux webhook handler already updates episode status to `ready` when encoding completes. Use Supabase Realtime to subscribe to episode status changes on the client instead of polling.
- **Building a custom drag-and-drop uploader:** `@mux/mux-uploader-react` handles drag-and-drop, progress bars, chunked upload, and retry logic out of the box.
- **Separate analytics events table for v1:** The existing `purchases`, `series.view_count`, and `community_posts` tables provide sufficient data for v1 analytics. A dedicated event-sourcing analytics system would be premature.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Video upload UI | Custom drag-and-drop + chunked upload + progress bar | `@mux/mux-uploader-react` MuxUploader component | Handles chunking, retry (5 automatic retries), progress, drag-and-drop, large file support out of the box |
| Video encoding pipeline | Custom transcoding, HLS generation | Mux Direct Upload + auto asset creation | Mux handles encoding, adaptive bitrate, CDN delivery |
| Image/thumbnail storage | Custom file storage, S3 SDK | Supabase Storage bucket with RLS | Already in stack, integrated with auth, public URLs, image transforms |
| Discussion realtime | WebSocket server, Socket.io | Supabase Realtime `postgres_changes` | Already in stack, zero config, leverages existing RLS policies |
| Form validation | Custom validation logic | Zod v4 schemas (existing pattern) | Type-safe, composable, already established in the codebase |
| Toast notifications | Custom notification system | Sonner (already installed and integrated) | Already in layout, used by paywall and share components |
| Date/time formatting | Custom date helpers | `Intl.DateTimeFormat` or `toLocaleDateString` | Already used in payouts dashboard, browser-native, no library needed |

**Key insight:** Phase 6 is primarily a CRUD application layered on top of already-integrated infrastructure (Mux, Supabase, Stripe). The main work is building forms, validation, queries, and UI -- not integrating new services. Every external service needed is already installed and configured.

## Common Pitfalls

### Pitfall 1: MuxUploader Endpoint Must Return Raw URL String
**What goes wrong:** The MuxUploader component receives the full JSON response `{url: "..."}` instead of just the URL string, causing the upload to fail silently.
**Why it happens:** The `endpoint` prop expects either a URL string or a function returning a Promise that resolves to a URL string. If you return JSON, it doesn't know how to parse it.
**How to avoid:** When using `endpoint` as an async function, extract just the URL string from the API response:
```typescript
endpoint={() =>
  fetch("/api/upload", { method: "POST", body: ... })
    .then(res => res.json())
    .then(data => data.url)  // Return JUST the string
}
```
**Warning signs:** Upload starts but fails immediately with no progress. Network tab shows the POST succeeded but upload PUT fails.

### Pitfall 2: Mux Webhook Passthrough Length Limit
**What goes wrong:** The `passthrough` field is silently truncated or rejected if it exceeds 255 characters.
**Why it happens:** Mux limits `passthrough` to 255 characters per their API spec.
**How to avoid:** Since we're only passing a UUID (36 chars), this is unlikely. But do NOT try to encode complex metadata (JSON objects with title, description, etc.) in `passthrough`. Keep it to the episode ID only.
**Warning signs:** Webhook fires but `data.passthrough` is truncated or empty.

### Pitfall 3: Supabase Storage RLS Folder Path Mismatch
**What goes wrong:** Creator's thumbnail upload succeeds in the Supabase client but is rejected by RLS.
**Why it happens:** The RLS policy checks `(storage.foldername(name))[1]` against `auth.uid()`. If the upload path doesn't start with the user's UUID, the policy blocks the insert.
**How to avoid:** Always structure the upload path as `{user_id}/{entity_id}/{filename}`. Example: `abc123/series_xyz/thumbnail.jpg`.
**Warning signs:** Upload returns 403 or "new row violates row-level security policy" error.

### Pitfall 4: Slug Uniqueness on Series Creation
**What goes wrong:** Creator tries to create a series with a title that generates a slug already used by another creator's series.
**Why it happens:** The `series.slug` column has a UNIQUE constraint. Two creators might create series with the same title (e.g., "Love Story").
**How to avoid:** Generate slugs as `{kebab-title}-{short-random-suffix}` (e.g., `love-story-a3k9`). Check for uniqueness before insert and retry with a different suffix if needed.
**Warning signs:** Insert fails with unique constraint violation on `slug`.

### Pitfall 5: Episode Reorder Breaks Episode Number Uniqueness
**What goes wrong:** Reordering episodes 1,2,3 to 2,1,3 triggers a unique constraint violation on `(season_id, episode_number)` because the intermediate state has two episodes with the same number.
**Why it happens:** Updating episode numbers one-at-a-time can create temporary duplicates.
**How to avoid:** Use a two-phase approach: (1) Set all reordered episodes to temporary negative numbers (e.g., -1, -2, -3) in a single update, (2) then set them to the correct positive numbers. Or use a `sort_order` column instead of mutating `episode_number`.
**Recommendation:** Add a `sort_order INTEGER` column to episodes (and seasons) for display ordering, keeping `episode_number` as the canonical identifier set once on creation. This avoids the uniqueness issue entirely.
**Warning signs:** Reorder operation fails with "duplicate key value violates unique constraint" error.

### Pitfall 6: Race Condition Between Upload and Webhook
**What goes wrong:** Creator submits the episode form and navigates away. The Mux webhook fires and updates the episode to `ready`, but the creator doesn't see the updated status.
**Why it happens:** The webhook is asynchronous -- video encoding can take seconds to minutes.
**How to avoid:** After the MuxUploader `onSuccess` fires, show a "processing" state on the episode. Use Supabase Realtime to subscribe to status changes on that episode row, so the UI updates automatically when the webhook fires.
**Warning signs:** Episode stays in "processing" state in the UI even though Mux shows the asset as ready.

### Pitfall 7: Creator Role Gate in Middleware vs. Page-Level
**What goes wrong:** A viewer with no creator role accesses `/dashboard/series/new` and sees the form (even though submission would fail server-side).
**Why it happens:** The existing middleware only checks for authentication (has a user session), not for role.
**How to avoid:** The middleware correctly redirects unauthenticated users to `/login`. For role-based access, check the role in page-level server components (read profile, check role, redirect if not creator). Avoid putting role checks in middleware since they require a database query on every request.
**Warning signs:** Non-creator users see creator dashboard pages with empty data or broken forms.

### Pitfall 8: Published Season Episode Count Trigger
**What goes wrong:** Creator tries to publish a season with fewer than 8 episodes (or more than 70), and gets a cryptic database error.
**Why it happens:** The existing `check_season_episode_count()` trigger enforces 8-70 published episodes per season on status change to `published`.
**How to avoid:** Validate episode count in the application layer before attempting to publish. Show a clear message: "You need at least 8 published episodes to publish this season."
**Warning signs:** Season update fails with "Published seasons must have 8-70 published episodes" trigger exception.

## Code Examples

### Validation Schemas for Creator Forms
```typescript
// src/lib/validations/creator.ts
// Source: existing auth.ts pattern in codebase

import { z } from "zod/v4";

export const applicationSchema = z.object({
  displayName: z.string().min(2).max(50),
  bio: z.string().min(20, "Tell us about yourself (at least 20 characters)").max(500),
  portfolioUrl: z.url("Please enter a valid URL").optional().or(z.literal("")),
  portfolioDescription: z.string().min(20).max(1000),
  socialLinks: z.string().optional(), // JSON string of social links
});

export const seriesSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100),
  description: z.string().max(2000).optional(),
  genre: z.enum([
    "drama", "comedy", "thriller", "sci-fi", "horror",
    "romance", "action", "documentary", "behind-the-scenes", "music", "sports",
  ]),
});

export const seasonSchema = z.object({
  title: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  priceTierId: z.string().uuid("Please select a price tier"),
  releaseStrategy: z.enum(["all_at_once", "drip"]),
});

export const episodeSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(2000).optional(),
  contentWarnings: z.string().optional(),  // Comma-separated
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
export type SeriesInput = z.infer<typeof seriesSchema>;
export type SeasonInput = z.infer<typeof seasonSchema>;
export type EpisodeInput = z.infer<typeof episodeSchema>;
```

### Database Migration: New Tables and Columns
```sql
-- Migration: 00000000000004_creator_dashboard

-- ============================================================================
-- CREATOR APPLICATIONS
-- ============================================================================

CREATE TABLE public.creator_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) UNIQUE,
  display_name TEXT NOT NULL,
  bio TEXT NOT NULL,
  portfolio_url TEXT,
  portfolio_description TEXT NOT NULL,
  sample_video_urls TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.creator_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own application"
  ON public.creator_applications FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own application"
  ON public.creator_applications FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Admins can manage all applications"
  ON public.creator_applications FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
  );

CREATE TRIGGER creator_applications_updated_at
  BEFORE UPDATE ON public.creator_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_applications_status ON public.creator_applications(status);
CREATE INDEX idx_applications_user ON public.creator_applications(user_id);

-- ============================================================================
-- SEASONS: RELEASE STRATEGY + SORT ORDER
-- ============================================================================

ALTER TABLE public.seasons
  ADD COLUMN release_strategy TEXT NOT NULL DEFAULT 'all_at_once'
    CHECK (release_strategy IN ('all_at_once', 'drip')),
  ADD COLUMN drip_interval_days INTEGER DEFAULT 7
    CHECK (drip_interval_days IS NULL OR (drip_interval_days >= 1 AND drip_interval_days <= 30)),
  ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

-- ============================================================================
-- EPISODES: SORT ORDER + CONTENT WARNINGS + RELEASE DATE
-- ============================================================================

ALTER TABLE public.episodes
  ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN content_warnings TEXT,
  ADD COLUMN release_date TIMESTAMPTZ;

-- ============================================================================
-- PROFILES: SOCIAL LINKS + FOLLOWER COUNT
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN social_links JSONB DEFAULT '{}',
  ADD COLUMN follower_count INTEGER NOT NULL DEFAULT 0;

-- ============================================================================
-- COMMUNITY TABLES
-- ============================================================================

CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL CHECK (char_length(content) <= 1000),
  post_type TEXT NOT NULL DEFAULT 'discussion'
    CHECK (post_type IN ('discussion', 'poll', 'announcement')),
  poll_options JSONB,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community posts are publicly readable"
  ON public.community_posts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON public.community_posts FOR INSERT
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "Authors can update own posts"
  ON public.community_posts FOR UPDATE
  USING ((SELECT auth.uid()) = author_id);

CREATE POLICY "Authors and series creators can delete posts"
  ON public.community_posts FOR DELETE
  USING (
    (SELECT auth.uid()) = author_id OR
    EXISTS (
      SELECT 1 FROM public.series
      WHERE id = series_id AND creator_id = (SELECT auth.uid())
    )
  );

CREATE TRIGGER community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_community_posts_series ON public.community_posts(series_id);
CREATE INDEX idx_community_posts_author ON public.community_posts(author_id);

CREATE TABLE public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  option_index INTEGER NOT NULL CHECK (option_index >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Votes are publicly readable"
  ON public.poll_votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote"
  ON public.poll_votes FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE INDEX idx_poll_votes_post ON public.poll_votes(post_id);

-- ============================================================================
-- FOLLOWERS TABLE
-- ============================================================================

CREATE TABLE public.followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (follower_id, creator_id)
);

ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Follows are publicly readable"
  ON public.followers FOR SELECT
  USING (true);

CREATE POLICY "Users can follow creators"
  ON public.followers FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = follower_id);

CREATE POLICY "Users can unfollow"
  ON public.followers FOR DELETE
  USING ((SELECT auth.uid()) = follower_id);

CREATE INDEX idx_followers_creator ON public.followers(creator_id);
CREATE INDEX idx_followers_follower ON public.followers(follower_id);

-- ============================================================================
-- STORAGE BUCKET FOR THUMBNAILS
-- ============================================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('thumbnails', 'thumbnails', true);

CREATE POLICY "Creators can upload thumbnails"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'thumbnails' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Creators can update own thumbnails"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Creators can delete own thumbnails"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Thumbnails are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'thumbnails');
```

### Thumbnail Upload Component
```tsx
// src/components/creator/thumbnail-upload.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface ThumbnailUploadProps {
  entityId: string;       // Series or episode ID
  currentUrl: string | null;
  onUpload: (url: string) => void;
}

export function ThumbnailUpload({ entityId, currentUrl, onUpload }: ThumbnailUploadProps) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("Image must be under 5MB");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Authentication required");
      setUploading(false);
      return;
    }

    const filePath = `${user.id}/${entityId}/${Date.now()}.${file.name.split(".").pop()}`;
    const { data, error } = await supabase.storage
      .from("thumbnails")
      .upload(filePath, file, { cacheControl: "3600", upsert: true, contentType: file.type });

    if (error) {
      toast.error("Upload failed");
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("thumbnails")
      .getPublicUrl(data.path);

    onUpload(publicUrl);
    toast.success("Thumbnail uploaded");
    setUploading(false);
  }

  return (
    <div className="space-y-2">
      {currentUrl && (
        <div className="relative aspect-video w-48 overflow-hidden rounded-md">
          <Image src={currentUrl} alt="Thumbnail" fill className="object-cover" />
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        className="text-sm text-muted-foreground"
      />
      {uploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
    </div>
  );
}
```

### Public Creator Profile Query
```typescript
// src/modules/creator/queries/get-creator-profile.ts

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const getCreatorProfile = cache(async (username: string) => {
  const supabase = await createClient();

  // Get creator profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio, social_links, follower_count, role")
    .eq("username", username)
    .eq("role", "creator")
    .single();

  if (!profile) return null;

  // Get creator's published series
  const { data: series } = await supabase
    .from("series")
    .select(`
      id, slug, title, genre, thumbnail_url, view_count, status,
      seasons(id, season_number, title, episodes(id))
    `)
    .eq("creator_id", profile.id)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return {
    ...profile,
    series: series ?? [],
  };
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| URL-based Mux upload (input[url]) | Mux Direct Upload + MuxUploader component | 2023 | Browser uploads directly to Mux CDN, no server proxy needed |
| `tus` protocol manually | `@mux/mux-uploader-react` wraps tus | Ongoing | Handles chunking, retry, progress out of the box |
| Custom S3 uploads for images | Supabase Storage with RLS | 2023 | Integrated auth, RLS policies, public URLs, no separate S3 config |
| Polling for video status | Webhooks + Supabase Realtime | Ongoing | Real-time status updates without client-side polling |
| `useFormState` (React) | `useActionState` (React 19) | React 19 | `useFormState` renamed to `useActionState` in React 19 |
| Zod v3 `.refine()` | Zod v4 `.check()` | Zod v4 | New API for custom validation (already used in auth schemas) |

**Deprecated/outdated:**
- `useFormState` from `react-dom` -- use `useActionState` from `react` (React 19)
- Mux `Video.Assets.create()` old namespace -- use `mux.video.assets.create()` (already correct in codebase)
- Supabase `createClient` without `await` -- server client requires `await createClient()` (already correct)

## Open Questions

1. **Trailer upload mechanism**
   - What we know: The `series` table already has a `trailer_url TEXT` column. CREA-06 requires optional trailer upload.
   - What's unclear: Should trailers use Mux Direct Upload (same as episodes) or be a simpler URL-paste? Trailers don't need signed playback since they're promotional.
   - Recommendation: Use the same Mux Direct Upload flow but with `playback_policy: ["public"]` instead of `["signed"]`. Store the Mux playback ID in `trailer_url` (or a new `trailer_playback_id` column). Use a separate API route for trailer uploads that doesn't link to an episode row. The trailer needs its own passthrough identifier -- use `trailer_{series_id}` and handle this in the Mux webhook.

2. **Drip release scheduling implementation**
   - What we know: CREA-05 requires creators to choose between "all at once" and "drip release with schedule." The `seasons` table will have `release_strategy` and `drip_interval_days`.
   - What's unclear: How to actually enforce drip release at the application level. Should episodes have a `release_date` that controls visibility?
   - Recommendation: Add a `release_date TIMESTAMPTZ` column to episodes. For "all at once," all episodes get the same release date. For "drip," episodes get staggered dates based on `drip_interval_days`. The existing "published episodes" RLS policy should be extended to check `release_date <= now()` in addition to `status = 'published'`. This keeps the enforcement at the database level.

3. **Content warnings display**
   - What we know: CREA-02 requires content warnings as episode metadata.
   - What's unclear: How should content warnings be stored (enum array, free text, predefined tags)?
   - Recommendation: Use a simple TEXT field for v1. Creators type warnings like "violence, language, flashing lights." This can be upgraded to a structured tag system later. Display as a small warning badge on the episode card.

4. **Follower count denormalization**
   - What we know: SOCL-06 requires follower count on the public profile. The `followers` table tracks follow relationships.
   - What's unclear: Should follower count be computed on the fly or denormalized?
   - Recommendation: Add `follower_count INTEGER DEFAULT 0` to `profiles`. Update via a database trigger on the `followers` table (increment on INSERT, decrement on DELETE). This avoids a COUNT query on every profile page load.

5. **sort_order vs episode_number for reordering**
   - What we know: Episodes have a `UNIQUE (season_id, episode_number)` constraint. Reordering by mutating `episode_number` causes constraint violations.
   - What's unclear: Whether to add `sort_order` or change the reorder strategy.
   - Recommendation: Add `sort_order INTEGER` to both episodes and seasons for display ordering within the creator dashboard. Keep `episode_number` as the canonical, user-facing identifier (what viewers see as "Episode 3"). Use `sort_order` for the order in which episodes appear in admin/creator lists. When a creator drags to reorder, update `sort_order` values only.

## Sources

### Primary (HIGH confidence)
- `/muxinc/mux-node-sdk` (Context7) - Direct Upload API, `video.uploads.create()`, passthrough parameter
- `/llmstxt/mux_llms-full_txt` (Context7) - Direct Upload `new_asset_settings` with passthrough, playback_policy, video_quality, cors_origin; MuxUploader component; webhook events
- `/supabase/supabase` (Context7) - Storage upload API, `createSignedUploadUrl`, RLS policies for storage, Realtime `postgres_changes` subscription patterns
- [Mux Direct Uploads API Reference](https://www.mux.com/docs/api-reference/video/direct-uploads/create-direct-upload) - Full request body spec, passthrough (255 char limit), new_asset_settings
- [Mux Uploader Core Functionality](https://www.mux.com/docs/guides/uploader-web-core-functionality) - Events: success, uploaderror, progress; attributes: endpoint, max-file-size, chunk-size, dynamic-chunk-size
- [Mux Uploader Integration Guide](https://www.mux.com/docs/guides/uploader-web-integrate-in-your-webapp) - React component usage, endpoint as async function
- [Supabase Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control) - RLS policies for storage.objects, `storage.foldername()` helper
- Existing codebase: `src/app/api/webhooks/mux/route.ts` - Proven webhook handler reading `data.passthrough` as episodeId

### Secondary (MEDIUM confidence)
- [Mux Upload Files Directly Guide](https://www.mux.com/docs/guides/upload-files-directly) - Upload workflow overview
- [Mux Add Metadata Guide](https://www.mux.com/docs/guides/add-metadata-to-your-videos) - title, creator_id, external_id metadata fields
- [Supabase Realtime with Next.js](https://supabase.com/docs/guides/realtime/realtime-with-nextjs) - Client-side subscription patterns
- [Supabase Storage Helper Functions](https://supabase.com/docs/guides/storage/schema/helper-functions) - `storage.foldername()`, `storage.filename()`, `storage.extension()`

### Tertiary (LOW confidence)
- General SaaS onboarding research - Creator application flow best practices (keep forms short, progressive disclosure)
- Community discussion patterns from [supabase threaded-comments example](https://github.com/lawrencecchen/threaded-comments) - Data model for community feeds

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed; no new dependencies needed
- Architecture: HIGH - Builds directly on existing patterns (Server Actions, webhook handlers, RLS policies, route groups)
- Upload pipeline: HIGH - Mux Direct Upload + MuxUploader verified via Context7 and official docs; existing webhook handler already processes the asset lifecycle
- Database schema: HIGH - Extends existing migration pattern; new tables follow established RLS and constraint patterns
- Community features: MEDIUM - Supabase Realtime is well-documented for this use case, but specific discussion feed UI patterns are custom design
- Analytics: MEDIUM - Aggregate queries over existing tables are straightforward, but funnel visualization is custom
- Pitfalls: HIGH - Upload, reorder, and RLS pitfalls are well-documented in official sources

**Research date:** 2026-02-14
**Valid until:** 2026-03-14 (Mux Uploader and Supabase Storage APIs are stable)
