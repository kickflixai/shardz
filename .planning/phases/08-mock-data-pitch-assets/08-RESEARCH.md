# Phase 8: Mock Data + Pitch Assets - Research

**Researched:** 2026-02-15
**Domain:** Mock data seeding (Supabase + Mux + fal.ai), marketing/pitch pages (Remotion + Recharts), creator landing page
**Confidence:** HIGH

## Summary

Phase 8 transforms MicroShort from a functional but empty platform into a convincing, populated marketplace with 15-25 mock series and standalone pitch pages for four stakeholder audiences. The phase has two distinct technical domains: (1) a CLI seed script that programmatically creates auth users, profiles, series content hierarchies, uploads AI-generated thumbnails to Supabase Storage, ingests royalty-free video into Mux, and seeds engagement metrics; and (2) marketing-quality pitch pages using Remotion for animated feature loops, Recharts (via shadcn/ui charts) for showcase dashboards, and scroll-driven marketing sections.

The existing codebase provides a solid foundation: the database schema already defines all content tables (series, seasons, episodes, profiles, purchases, followers), the admin client (`createAdminClient()`) bypasses RLS for server-side operations, and the Mux SDK singleton is initialized. The seed script will operate as a standalone Node/TypeScript script using these existing patterns. Pitch pages will be new Next.js routes under `(public)` using the existing dark cinematic theme.

**Primary recommendation:** Build the seed script as a standalone TypeScript file executed via `tsx` (already available via the existing TypeScript toolchain), using the Supabase admin client for all database operations and `supabase.auth.admin.createUser()` for creating mock auth users. Use `mux.video.assets.create({ input: [{ url }], passthrough, playback_policies: ['signed'] })` for video ingestion. For pitch pages, install `remotion` + `@remotion/player` for animated compositions and use the existing shadcn/ui chart component (built on Recharts) for showcase dashboards.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Fully believable series: each has a compelling logline, unique episode titles, synopses — looks like a real catalog
- Full creator personas: unique names, bios, avatars, social links, backstories — feels like real people
- Even genre coverage: at least 1-2 series in every genre category (Drama, Comedy, Thriller, Sci-Fi, Horror, Romance, Action, Documentary, BTS, Music, Sports)
- Mix of 1-3 seasons per series: some single-season (new shows), some multi-season (established) for realism
- Varied pricing: $0.99–$7.99 range across series/seasons to show flexible creator pricing
- Realistic engagement data: seed view counts (hundreds to thousands), purchase counts, follower numbers so platform looks active
- ONE hero series (sci-fi) gets actual royalty-free stock video clips for every episode — this is the demo series
- All other series use a single short branded MicroShort loop clip as placeholder — something plays, but it's clearly not the featured content
- AI-generated thumbnails via fal.ai for all series — pre-generate and store locally, seed script uploads from local files (avoids API costs on repeated seeds)
- CLI seed script: `pnpm seed` / `pnpm seed:clear` commands for developer workflow
- No admin panel button — developer-facing tool only
- Script handles: creating creator profiles, series, seasons, episodes, uploading thumbnails to Supabase Storage, uploading video to Mux, seeding engagement metrics
- Core investor narrative: market gap story — "Short-form video has no monetization layer — MicroShort is the missing marketplace"
- Vision-focused, no fake traction numbers — focus on market opportunity, product capability, and platform screenshots/demos
- Platform base + marketing flair: same dark cinematic theme but with marketing-style sections, bigger typography, scroll effects
- Public URLs: /pitch/investors, /pitch/brands, /pitch/advisors, /pitch/creators — anyone with the link can view
- Hub page at /pitch linking to all stakeholder pages
- Remotion for animated feature loops in each pitch section — small looping compositions showing key features in action (player, browsing, paywall, creator dashboard) instead of static screenshots
- Full pitch demo video with Remotion is deferred for later
- Must research compelling pitch page patterns/best practices before building
- Frontend implementation must use the frontend-design plugin for high design quality
- Present full ad product vision: sponsored series, pre-roll ad spots, and branded/native content partnerships
- Position MicroShort as a brand-safe, genre-targeted advertising platform
- Cast wide: entertainment, tech, and business advisory expertise — not limited to one domain
- Separate page at /creators — distinct from /dashboard/apply (existing application form)
- Hero message: format validation angle — "Short-form deserves its own home"
- Transparent economics: "Creators keep 80% of every sale" — exact split shown
- Waitlist signup: collect email for creator waitlist pipeline
- No social proof/testimonials — let product features and economics speak
- No mock creator quotes — platform features only
- Links to /dashboard/apply for those ready to apply now
- Content warnings display dropped from showcase/pitch material — not sales-relevant

### Claude's Discretion
- Pitch page tone per audience (bold vs. data-driven vs. storytelling — adapt to each stakeholder)
- CTA hierarchy per pitch page (explore platform + contact — balance per audience)
- Visual differentiation between stakeholder pages (accents, motifs — or consistent template)
- Creator landing page layout for different creator types (sections vs. tabs vs. callouts)
- Waitlist data storage approach (Supabase table vs. external form service)
- Attribution dashboard story (source tracking, creator ROI, content funnel — or combination)
- Social media ad dashboard content (campaign performance, content-as-creative, audience insights)
- Showcase dashboard interactivity level (interactive charts vs. static polished displays)
- Which sci-fi series to use as the hero demo series (will communicate choice to user)

### Deferred Ideas (OUT OF SCOPE)
- Full pitch demo video using Remotion — revisit after phase is built, create as a separate follow-up
- Content warnings/moderation as a selling point — not included in pitch material for now
</user_constraints>

## Standard Stack

### Core (New Dependencies)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `remotion` | ^4.0 (pin exact) | Core framework for programmatic video compositions | Only React-based video framework; compositions are React components |
| `@remotion/player` | ^4.0 (pin exact) | Embed Remotion compositions in React apps without rendering full videos | Lightweight player for animated loops in pitch pages |
| `@fal-ai/client` | latest | fal.ai SDK for AI image generation (thumbnails) | Official JS/TS client for fal.ai models |
| `@fal-ai/server-proxy` | latest | Protect FAL_KEY via Next.js API route proxy | Official proxy package for Next.js integration |
| `recharts` | ^2.x | Charts for showcase dashboards | Already the engine behind shadcn/ui charts; chart CSS vars pre-defined in globals.css |
| `tsx` | latest (devDep) | Execute TypeScript scripts directly (seed script runner) | Standard Node TS execution; avoids ts-node configuration |

### Existing (Already Installed)
| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| `@supabase/supabase-js` | ^2.95.3 | Database + Storage + Auth operations | Admin client pattern at `src/lib/supabase/admin.ts` |
| `@mux/mux-node` | ^12.8.1 | Video asset creation from URLs | Singleton at `src/lib/mux/client.ts` |
| `shadcn/ui` | ^3.8.4 | UI components including chart wrapper | Chart component wraps Recharts with shadcn theming |
| `next-themes` | ^0.4.6 | Dark mode (always dark) | Pitch pages inherit the dark cinematic theme |
| `lucide-react` | ^0.564.0 | Icons | Use for pitch page icons and feature callouts |

### Supporting (shadcn/ui chart already provides)
| Library | When to Use |
|---------|-------------|
| `shadcn/ui chart` component | Install via `pnpm dlx shadcn@latest add chart` -- provides `ChartContainer`, `ChartTooltip`, `ChartLegend` wrappers around Recharts |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Recharts (via shadcn) | Nivo, Victory | shadcn already wraps Recharts and provides chart CSS vars in globals.css -- no reason to add another library |
| Remotion Player | Lottie, CSS animations | Remotion compositions are React components; allows realistic UI recreations not just abstract animations |
| fal.ai Flux | DALL-E, Midjourney API | fal.ai has Flux 2 at $0.012/megapixel -- cheapest for batch generation; official Next.js proxy package |
| tsx | ts-node, esbuild-runner | tsx requires zero config; just `tsx script.ts` |

**Installation:**
```bash
# New dependencies
pnpm add remotion @remotion/player @fal-ai/client @fal-ai/server-proxy recharts

# Dev dependency for seed script execution
pnpm add -D tsx

# shadcn chart component (installs recharts if needed + chart wrappers)
pnpm dlx shadcn@latest add chart
```

**CRITICAL: Remotion version pinning.** All `remotion` and `@remotion/*` packages MUST use the exact same version. Remove `^` from version in package.json. The `--save-exact` flag ensures this:
```bash
pnpm add --save-exact remotion @remotion/player
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── (public)/
│   │   ├── pitch/               # Pitch hub + stakeholder pages
│   │   │   ├── page.tsx         # Hub: /pitch
│   │   │   ├── investors/
│   │   │   │   └── page.tsx     # /pitch/investors
│   │   │   ├── brands/
│   │   │   │   └── page.tsx     # /pitch/brands
│   │   │   ├── advisors/
│   │   │   │   └── page.tsx     # /pitch/advisors
│   │   │   └── creators/
│   │   │       └── page.tsx     # /pitch/creators
│   │   ├── creators/
│   │   │   └── page.tsx         # /creators (landing page)
│   │   └── layout.tsx           # Existing public layout
│   └── api/
│       └── fal/
│           └── proxy/
│               └── route.ts     # fal.ai API proxy
├── components/
│   ├── pitch/                   # Pitch page sections
│   │   ├── hero-section.tsx
│   │   ├── feature-section.tsx
│   │   ├── stats-section.tsx
│   │   ├── cta-section.tsx
│   │   └── remotion/            # Remotion compositions for pitch
│   │       ├── player-demo.tsx
│   │       ├── browse-demo.tsx
│   │       ├── paywall-demo.tsx
│   │       └── dashboard-demo.tsx
│   ├── showcase/                # Showcase dashboards
│   │   ├── attribution-dashboard.tsx
│   │   └── ad-dashboard.tsx
│   └── creators/               # Creator landing page components
│       ├── creator-hero.tsx
│       ├── economics-section.tsx
│       ├── feature-grid.tsx
│       └── waitlist-form.tsx
├── lib/
│   └── fal/
│       └── client.ts           # fal.ai client config
scripts/
├── seed/
│   ├── index.ts                # Main seed entry point
│   ├── clear.ts                # Clear mock data
│   ├── data/                   # Mock data definitions
│   │   ├── creators.ts         # Creator personas
│   │   ├── series.ts           # Series catalog
│   │   └── engagement.ts       # View counts, purchases, followers
│   ├── lib/                    # Seed helpers
│   │   ├── supabase.ts         # Admin client for seeding
│   │   ├── mux.ts              # Asset creation helpers
│   │   ├── storage.ts          # Thumbnail upload helpers
│   │   └── fal.ts              # Thumbnail generation (one-time)
│   └── assets/                 # Pre-generated thumbnails
│       ├── thumbnails/         # AI-generated images (committed to repo)
│       └── video/              # Branded loop clip
public/
└── seed-assets/                # Alternative: public dir for thumbnails
```

### Pattern 1: Seed Script as Standalone TypeScript
**What:** The seed script runs outside of Next.js -- it is a standalone Node.js TypeScript script using `tsx` for execution.
**When to use:** For developer-only CLI tools that need direct Supabase admin and Mux SDK access.
**Why:** Avoids polluting the Next.js app with seed-only code. The script imports Supabase and Mux clients directly, not through Next.js server actions.

```typescript
// scripts/seed/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase env vars. Ensure .env.local is loaded.");
}

export const adminDb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
```

```typescript
// scripts/seed/lib/mux.ts
import Mux from "@mux/mux-node";

export const mux = new Mux();  // Reads MUX_TOKEN_ID + MUX_TOKEN_SECRET from env
```

### Pattern 2: Creating Mock Auth Users with Supabase Admin API
**What:** Use `supabase.auth.admin.createUser()` to create auth users without sending confirmation emails, then insert/update profile rows.
**When to use:** For seed scripts that need to create users with known IDs for FK references.
**Critical:** Service role key bypasses RLS and email confirmation. Set `email_confirm: true`.

```typescript
// Source: Supabase docs - auth-admin-createuser
async function createMockUser(email: string, password: string, metadata: Record<string, unknown>) {
  const { data, error } = await adminDb.auth.admin.createUser({
    email,
    password,
    email_confirm: true,   // Skip email verification
    user_metadata: metadata,
  });
  if (error) throw error;
  return data.user;
}
```

### Pattern 3: Mux Asset Creation from URL (Programmatic Seeding)
**What:** Create Mux assets by providing a public video URL instead of uploading from browser.
**When to use:** For seeding episodes with stock footage from Pixabay/Pexels URLs or pre-hosted branded loop clips.
**Critical:** The `passthrough` field links the asset back to the episode via the existing Mux webhook handler.

```typescript
// Source: Mux docs - create asset from URL
// Existing webhook at src/app/api/webhooks/mux/route.ts handles video.asset.ready
async function createAssetFromUrl(videoUrl: string, episodeId: string) {
  const asset = await mux.video.assets.create({
    input: [{ url: videoUrl }],
    playback_policies: ["signed"],
    passthrough: episodeId,       // Webhook uses this to update the episode row
    video_quality: "basic",
  });
  return asset;
}
```

### Pattern 4: Supabase Storage Upload from Local File (Server-Side)
**What:** Upload pre-generated thumbnails from local filesystem to Supabase Storage using the admin client.
**When to use:** For seeding thumbnails that were pre-generated by fal.ai and stored locally.
**Critical:** Admin client bypasses RLS storage policies. Use `upsert: true` for idempotent re-runs.

```typescript
// Source: Supabase docs - storage upload
import { readFile } from "fs/promises";

async function uploadThumbnail(localPath: string, storagePath: string) {
  const fileBuffer = await readFile(localPath);
  const { data, error } = await adminDb.storage
    .from("thumbnails")
    .upload(storagePath, fileBuffer, {
      contentType: "image/png",
      cacheControl: "3600",
      upsert: true,  // Idempotent for re-runs
    });
  if (error) throw error;

  // Get public URL
  const { data: urlData } = adminDb.storage
    .from("thumbnails")
    .getPublicUrl(storagePath);
  return urlData.publicUrl;
}
```

### Pattern 5: Remotion Player Embedding (Client Component)
**What:** Embed Remotion compositions as animated feature loops in pitch pages.
**When to use:** Pitch page sections that show animated previews of platform features.
**Critical:** Must be a client component (`"use client"`). Use `lazyComponent` wrapped in `useCallback` for code splitting. Pin all Remotion packages to the exact same version.

```typescript
// Source: Remotion docs - Player component
"use client";

import { Player } from "@remotion/player";
import { useCallback } from "react";

export function FeatureDemo() {
  const lazyComponent = useCallback(
    () => import("./compositions/player-demo"),
    []
  );

  return (
    <Player
      lazyComponent={lazyComponent}
      durationInFrames={150}
      fps={30}
      compositionWidth={1280}
      compositionHeight={720}
      style={{ width: "100%" }}
      loop
      autoPlay
      controls={false}
    />
  );
}
```

### Pattern 6: fal.ai Thumbnail Generation Script (One-Time)
**What:** Generate thumbnails offline using fal.ai Flux model, save to local directory.
**When to use:** Run once before seeding, NOT on every seed run. Results are committed to repo or stored in scripts/seed/assets/.
**Critical:** Uses FAL_KEY env var. Costs ~$0.012/megapixel. For 20-25 series thumbnails at 1024x576 (16:9), cost is approximately $0.15-0.20 total.

```typescript
// Source: fal.ai docs - Next.js integration
import { fal } from "@fal-ai/client";
import { writeFile } from "fs/promises";

fal.config({ credentials: process.env.FAL_KEY });

async function generateThumbnail(prompt: string, outputPath: string) {
  const result = await fal.subscribe("fal-ai/flux/dev", {
    input: {
      prompt,
      image_size: "landscape_16_9",  // 16:9 for video thumbnails
    },
    pollInterval: 3000,
  });

  const imageUrl = result.data.images[0].url;
  const response = await fetch(imageUrl);
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(outputPath, buffer);
  return outputPath;
}
```

### Pattern 7: Showcase Dashboards with shadcn/ui Charts
**What:** Use the shadcn chart component (Recharts wrapper) for attribution and ad dashboards.
**When to use:** Showcase dashboard sections on pitch pages.
**Critical:** Chart CSS variables (`--chart-1` through `--chart-5`) are already defined in `globals.css`. The `ChartContainer` component from shadcn handles responsive sizing.

```typescript
// Source: shadcn/ui chart documentation
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";

const chartConfig = {
  organic: { label: "Organic", color: "var(--chart-1)" },
  paid: { label: "Paid Ads", color: "var(--chart-2)" },
  referral: { label: "Referral", color: "var(--chart-3)" },
} satisfies ChartConfig;

const mockAttributionData = [
  { month: "Jan", organic: 186, paid: 80, referral: 45 },
  { month: "Feb", organic: 305, paid: 200, referral: 100 },
  // ... more months
];

function AttributionChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <AreaChart data={mockAttributionData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area type="monotone" dataKey="organic" fill="var(--color-organic)" stroke="var(--color-organic)" />
        <Area type="monotone" dataKey="paid" fill="var(--color-paid)" stroke="var(--color-paid)" />
      </AreaChart>
    </ChartContainer>
  );
}
```

### Pattern 8: Waitlist Email Collection
**What:** Simple Supabase table for creator waitlist signups.
**When to use:** /creators landing page waitlist form.
**Recommendation (Claude's Discretion):** Use a dedicated Supabase table -- simpler than an external service, keeps data in one place, trivial to query later.

```sql
-- New migration for waitlist
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL DEFAULT 'creator_landing',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Only allow inserts from anyone (public signup form)
CREATE POLICY "Anyone can join waitlist"
  ON public.waitlist FOR INSERT
  WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can view waitlist"
  ON public.waitlist FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));
```

### Anti-Patterns to Avoid
- **Running fal.ai generation inside the seed script:** Generates images on EVERY seed run. Pre-generate once, store locally, upload from local files.
- **Using the server Supabase client (cookie-based) in seed scripts:** The seed script is not a Next.js request context. Use `createClient()` from `@supabase/supabase-js` directly with service role key, not the SSR helper.
- **Creating episodes without respecting the 8-70 published episode constraint:** The DB trigger `check_season_episode_count` enforces 8-70 published episodes per season. Seed script must create at least 8 episodes per season before setting season status to "published".
- **Setting `duration_seconds` on episodes outside 60-180 range:** DB CHECK constraint requires `duration_seconds` between 60 and 180 seconds (or NULL). Either leave NULL or use values within range.
- **Mixing Remotion versions:** All `remotion` and `@remotion/*` packages must be pinned to the exact same version. Version mismatch causes runtime errors.
- **Importing seed script code into Next.js app:** Keep scripts/ completely separate from src/. Seed data definitions can be in scripts/seed/data/, NOT in src/.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Chart rendering | Custom SVG charts | shadcn/ui chart (Recharts) | Chart CSS vars already in globals.css; responsive containers, tooltips, legends for free |
| Animated feature previews | CSS animations or Lottie | Remotion Player + React compositions | Remotion compositions ARE React components -- can render actual UI elements, not just abstract animations |
| AI thumbnail generation | Manual image creation | fal.ai Flux model ($0.012/MP) | Batch generation of 20+ unique thumbnails in minutes; human-quality at <$0.20 total |
| API key protection for fal | Custom proxy middleware | `@fal-ai/server-proxy` package | Drop-in Next.js route handler; handles CORS, auth headers, error forwarding |
| TypeScript script execution | Custom build pipeline | `tsx` | Zero config; `tsx scripts/seed/index.ts` just works |
| Auth user creation in seed | Raw SQL auth manipulation | `supabase.auth.admin.createUser()` | Properly creates auth.users entries with password hashing, bypasses email confirmation |
| Video ingestion from URLs | Download-then-upload pipeline | `mux.video.assets.create({ input: [{ url }] })` | Mux fetches the URL directly -- no bandwidth through our servers |

**Key insight:** The seed script's complexity comes from orchestrating many services (Supabase Auth, Supabase DB, Supabase Storage, Mux, fal.ai) in the right order with proper FK references. Each individual operation is simple -- the challenge is the orchestration and error handling.

## Common Pitfalls

### Pitfall 1: Episode Count Trigger Blocks Season Publishing
**What goes wrong:** Seed script tries to set season status to "published" but the `check_season_episode_count` trigger rejects it because there are fewer than 8 published episodes.
**Why it happens:** The trigger fires on UPDATE to seasons where `NEW.status = 'published'` and counts episodes WHERE `status = 'published'`.
**How to avoid:** Insert all episodes first with `status: 'draft'`, then batch-update episodes to `status: 'published'`, THEN update the season to `status: 'published'`. Must have at least 8 published episodes per season.
**Warning signs:** Supabase error `Published seasons must have 8-70 published episodes`.

### Pitfall 2: Mux Webhook Timing for Seeded Videos
**What goes wrong:** Seed script creates episodes and Mux assets, but episodes remain in "draft" status because the webhook hasn't fired yet.
**Why it happens:** `mux.video.assets.create()` returns immediately while Mux processes the video asynchronously. The webhook `video.asset.ready` fires later (seconds to minutes).
**How to avoid:** Two approaches: (a) Skip waiting -- set episode status to "published" directly in the seed script after creating the asset, and let the webhook update `mux_playback_id` whenever it fires. (b) Poll `mux.video.assets.retrieve(assetId)` until status is "ready". Approach (a) is recommended -- the seed script can set `mux_asset_id` and `mux_playback_id` directly if the asset creation response includes them (for `input: [{ url }]`, the response includes `playback_ids` once status is "ready").
**Warning signs:** Episodes show "processing" status long after seeding.

### Pitfall 3: Profile FK Constraint on Series Creator
**What goes wrong:** Inserting a series fails because `creator_id` references `profiles.id` which references `auth.users.id`.
**Why it happens:** The profile must exist before creating series, and the auth user must exist before the profile (due to FK chain: `auth.users -> profiles -> series`).
**How to avoid:** Strict ordering: (1) `auth.admin.createUser()`, (2) upsert profile row, (3) insert series.
**Warning signs:** FK violation errors on `fk_series_creator`.

### Pitfall 4: Storage Path Conflicts with RLS
**What goes wrong:** Thumbnail uploads fail or conflict with existing RLS policies.
**Why it happens:** The existing RLS policy for thumbnails requires `auth.uid()::text = (storage.foldername(name))[1]` -- meaning the first path segment must be the user's ID.
**How to avoid:** Use the admin client (bypasses RLS) for uploads, AND follow the existing path convention: `{creator_id}/{filename}` so that the public URL pattern remains consistent with real uploads.
**Warning signs:** Storage upload returns 403 or policy violation.

### Pitfall 5: Remotion Player in Server Components
**What goes wrong:** Importing `@remotion/player` in a Server Component causes "window is not defined" errors.
**Why it happens:** Remotion Player uses browser APIs and must run client-side.
**How to avoid:** Always use `"use client"` directive on components that render `<Player>`. Use `lazyComponent` with `useCallback` for code splitting. Consider `next/dynamic` with `ssr: false` if needed as a wrapper.
**Warning signs:** Build errors or hydration mismatches mentioning `window` or `document`.

### Pitfall 6: Seed Script Idempotency
**What goes wrong:** Running `pnpm seed` twice creates duplicate data.
**Why it happens:** No deduplication logic in seed operations.
**How to avoid:** Use `upsert` where possible (Supabase `.upsert()` with `onConflict`). For Mux assets, check if episode already has `mux_asset_id` before creating new ones. The `seed:clear` command should wipe everything cleanly. Consider using deterministic UUIDs (based on email/slug) so inserts are truly idempotent.
**Warning signs:** Duplicate series, double-charged Mux assets.

### Pitfall 7: fal.ai Rate Limits and Cost
**What goes wrong:** Generating 25+ thumbnails in rapid succession hits rate limits or unexpected costs.
**Why it happens:** fal.ai has queue-based processing; many simultaneous requests may queue or fail.
**How to avoid:** Generate thumbnails with a sequential loop and delay between requests (e.g., 2-3 second gap). Use `fal-ai/flux/dev` (cheapest at $0.012/MP). Generate at reasonable resolution (1024x576 for 16:9). Pre-generate and store locally -- never regenerate on every seed run.
**Warning signs:** 429 rate limit responses, unexpectedly high fal.ai bill.

### Pitfall 8: Price Tier FK on Seasons
**What goes wrong:** Season insert fails because `price_tier_id` references a tier that doesn't exist.
**Why it happens:** Price tiers are seeded in migration 00000000000003 but might not exist in fresh databases.
**How to avoid:** Query existing price tiers first, map pricing to available tiers. The migration inserts Budget ($2.99), Standard ($4.99), Premium ($7.99), Deluxe ($9.99), Blockbuster ($14.99). For the $0.99-$1.99 range, use `price_cents` directly (column exists) with `price_tier_id` set to NULL, or create additional tiers.
**Warning signs:** FK violation on `seasons.price_tier_id`.

## Code Examples

### Seed Script Entry Point
```typescript
// scripts/seed/index.ts
import { adminDb } from "./lib/supabase";
import { seedCreators } from "./data/creators";
import { seedSeries } from "./data/series";
import { seedEngagement } from "./data/engagement";

async function main() {
  console.log("Starting MicroShort seed...");

  // 1. Create auth users + profiles
  const creators = await seedCreators(adminDb);
  console.log(`Created ${creators.length} creator profiles`);

  // 2. Create series -> seasons -> episodes with thumbnails + video
  const series = await seedSeries(adminDb, creators);
  console.log(`Created ${series.length} series`);

  // 3. Seed engagement metrics
  await seedEngagement(adminDb, series, creators);
  console.log("Engagement metrics seeded");

  console.log("Seed complete!");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
```

### Clear Script
```typescript
// scripts/seed/clear.ts
import { adminDb } from "./lib/supabase";
import Mux from "@mux/mux-node";

const mux = new Mux();

async function clear() {
  console.log("Clearing mock data...");

  // 1. Get all mock episodes with mux_asset_id to clean up Mux
  const { data: episodes } = await adminDb
    .from("episodes")
    .select("mux_asset_id")
    .not("mux_asset_id", "is", null);

  // 2. Delete Mux assets
  if (episodes) {
    for (const ep of episodes) {
      try {
        await mux.video.assets.delete(ep.mux_asset_id!);
      } catch { /* Asset may already be deleted */ }
    }
  }

  // 3. Delete all mock content (cascade handles seasons/episodes)
  // Use a known marker: mock series have slugs starting with "mock-"
  await adminDb.from("series").delete().like("slug", "mock-%");

  // 4. Delete mock profiles (and their auth users)
  // Use known mock email pattern
  const { data: mockProfiles } = await adminDb
    .from("profiles")
    .select("id")
    .like("username", "mock_%");

  if (mockProfiles) {
    for (const profile of mockProfiles) {
      await adminDb.auth.admin.deleteUser(profile.id);
    }
  }

  // 5. Clear storage thumbnails for mock users
  // Storage cleanup would go here

  console.log("Clear complete!");
}

clear().catch((err) => {
  console.error("Clear failed:", err);
  process.exit(1);
});
```

### Package.json Scripts
```json
{
  "scripts": {
    "seed": "tsx --env-file=.env.local scripts/seed/index.ts",
    "seed:clear": "tsx --env-file=.env.local scripts/seed/clear.ts",
    "seed:thumbnails": "tsx --env-file=.env.local scripts/seed/generate-thumbnails.ts"
  }
}
```

### fal.ai Proxy Route (App Router)
```typescript
// src/app/api/fal/proxy/route.ts
// Source: fal.ai docs - Next.js integration
import { route } from "@fal-ai/server-proxy/nextjs";

export const { GET, POST } = route;
```

### Remotion Composition Example (Animated Player Demo)
```typescript
// src/components/pitch/remotion/player-demo.tsx
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

export const PlayerDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  const scale = spring({ frame, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill style={{ backgroundColor: "#141414", padding: 40 }}>
      <div style={{ opacity, transform: `scale(${scale})` }}>
        {/* Render a mock player UI */}
        <div style={{
          width: "100%",
          aspectRatio: "16/9",
          borderRadius: 12,
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {/* Animated play button, progress bar, etc. */}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default PlayerDemo;
```

### Pitch Page Section (Server Component with Client Animation)
```typescript
// src/app/(public)/pitch/investors/page.tsx
import type { Metadata } from "next";
import { HeroSection } from "@/components/pitch/hero-section";
import { FeatureSection } from "@/components/pitch/feature-section";
import { StatsSection } from "@/components/pitch/stats-section";
import { CTASection } from "@/components/pitch/cta-section";

export const metadata: Metadata = {
  title: "MicroShort for Investors",
  description: "The missing monetization layer for short-form video",
};

export default function InvestorPitchPage() {
  return (
    <main>
      <HeroSection
        headline="Short-Form Video Has No Monetization Layer"
        subheadline="MicroShort is the missing marketplace"
        variant="investor"
      />
      <FeatureSection variant="investor" />
      <StatsSection variant="investor" />
      <CTASection
        primaryCTA={{ label: "Explore the Platform", href: "/browse" }}
        secondaryCTA={{ label: "Get in Touch", href: "mailto:invest@microshort.com" }}
      />
    </main>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Static screenshots on pitch pages | Animated Remotion compositions | Remotion Player v4 (2024) | Live animated previews instead of static images; compositions are React components |
| Manual thumbnail creation | AI generation with Flux models | Flux 2 (2025) | Batch generate 25+ unique thumbnails at <$0.20; 16:9 cinematic quality |
| Recharts raw integration | shadcn/ui Chart wrapper | shadcn charts release (2024) | CSS variable theming, automatic dark mode, copy-paste components |
| Supabase `signUp()` for seed users | `auth.admin.createUser()` | Always available | Bypasses email confirmation, creates users server-side; required for seed scripts |
| Mux upload via browser (Direct Upload) | `assets.create({ input: [{ url }] })` | Always available | Server-side ingestion from URL; no browser upload needed for seeding |

**Deprecated/outdated:**
- `@fal-ai/serverless-proxy`: Renamed to `@fal-ai/server-proxy`. Use the new package name.
- Remotion v3 APIs: v4 changed some composition registration patterns. Use v4 syntax.

## Claude's Discretion Recommendations

### Pitch Page Tone (per audience)
**Recommendation:** Adapt tone significantly per stakeholder:
- **Investors:** Bold, vision-driven, data-backed market opportunity. Lead with market gap, end with product capability. "The $X billion short-form market has no premium monetization layer."
- **Brands:** Professional, ROI-focused, brand-safety emphasis. Lead with genre-targeting precision, end with partnership options. Data-driven visuals.
- **Advisors:** Storytelling, strategic framing, visionary. Lead with industry transformation narrative, end with how advisors shape the platform. Less hard sell, more invitation.
- **Creators (pitch/creators):** Empowering, transparent, community-building. Lead with format validation, end with economics. Direct, no corporate speak.

### CTA Hierarchy
**Recommendation:** Two CTAs per pitch page -- primary (explore platform) and secondary (contact):
- **Investors:** Primary: "Explore the Platform" (link to /browse). Secondary: "Schedule a Call" (mailto or calendly)
- **Brands:** Primary: "See the Ad Platform" (scroll to showcase dashboards). Secondary: "Partner With Us" (mailto)
- **Advisors:** Primary: "Explore the Platform". Secondary: "Join Our Advisory Board" (mailto)
- **Creators:** Primary: "Apply Now" (link to /dashboard/apply). Secondary: "Join Waitlist" (scroll to waitlist form)

### Visual Differentiation Between Stakeholder Pages
**Recommendation:** Use a consistent template with subtle accent color differentiation:
- **Investors:** Accent the existing primary yellow -- confidence/energy
- **Brands:** Introduce a teal/cyan accent for corporate professionalism
- **Advisors:** Use a warm amber/gold accent for wisdom/prestige
- **Creators:** Use the platform's standard yellow -- this IS the platform pitch

All pages share the same dark cinematic base, section structure, and typography scale. Differentiation comes through accent colors on CTAs, section dividers, and Remotion composition color schemes.

### Creator Landing Page Layout
**Recommendation:** Single long-scroll page with distinct sections, NOT tabs:
1. Hero with "Short-form deserves its own home" + primary CTA
2. Economics section: "80% creator share" with visual split diagram
3. Feature grid: Platform capabilities in a responsive grid (upload, pricing, analytics, community, paywall)
4. Creator types callout: Visual cards for Studios, Influencers, Comedians, Musicians, AI Filmmakers -- same content, just showing the breadth
5. Waitlist form: Simple email collection + "Apply Now" CTA for those ready

### Waitlist Data Storage
**Recommendation:** Supabase table. Simpler than any external service, data stays in one place, trivial to export later. See Pattern 8 above for schema.

### Attribution Dashboard Story
**Recommendation:** Combined funnel + ROI story:
- Top section: Source attribution funnel (organic search -> social -> paid ads -> direct) with stacked area chart
- Middle section: Creator ROI metrics (revenue per series, subscriber growth, conversion rate) with bar charts
- Bottom section: Content performance heatmap (which genres/times drive engagement)
- All mock data -- numbers designed to tell a compelling "this platform gives you visibility into what works" story

### Social Media Ad Dashboard Content
**Recommendation:** Unified cross-platform view:
- Campaign overview: Unified metrics across Meta, TikTok, YouTube, X with platform breakdown
- Content-as-creative performance: Which series clips perform best as ad creative
- Audience insights: Genre preference by platform, demographic reach
- Mock data shows realistic CPM, CTR, ROAS numbers for a content platform

### Showcase Dashboard Interactivity
**Recommendation:** Semi-interactive: Responsive charts with tooltips and hover effects, but NO editable filters or date range pickers. The dashboards are "view only" showcases. Interactive enough to feel real when presenting, but not so complex they need testing.

### Hero Demo Series Selection
**Recommendation:** Create an original sci-fi series concept: "SIGNAL LOST" -- a deep-space communication thriller. Compelling premise: "When Earth's only contact with a distant colony goes silent, the last transmission reveals something impossible." This works because:
- Sci-fi generates the most visually striking AI thumbnails (space, tech, dramatic lighting)
- Pixabay/Pexels have extensive free sci-fi stock footage (space, technology, cityscapes)
- Thriller tension translates well even with stock footage
- The title is memorable for live demos

## Open Questions

1. **Mux Webhook Delivery for Local Development**
   - What we know: The existing webhook at `/api/webhooks/mux/route.ts` processes `video.asset.ready` events and updates episode rows. For seeded videos, the webhook needs to fire to set `mux_playback_id`.
   - What's unclear: During local development, Mux webhooks need a publicly accessible URL (typically via ngrok or similar). If seeding against a production/staging Supabase but running locally, webhooks may not reach the local server.
   - Recommendation: The seed script should set `mux_asset_id` and `mux_playback_id` directly after creating the asset (by polling `mux.video.assets.retrieve()` until status is "ready"), rather than relying on webhooks. This makes seeding independent of webhook delivery.

2. **Episode Duration Constraint vs. Stock Footage**
   - What we know: Episodes have a CHECK constraint: `duration_seconds >= 60 AND duration_seconds <= 180`. Stock footage clips may be shorter or longer.
   - What's unclear: Will the Mux webhook attempt to set `duration_seconds` to the actual clip length, which might violate the constraint?
   - Recommendation: For the hero series, source stock clips that are 60-180 seconds long, OR leave `duration_seconds` as NULL (the constraint allows NULL) and don't update it from the webhook for seeded content. The seed script can set it to a reasonable mock value (e.g., 90-120 seconds) directly.

3. **Existing Branded Loop Clip**
   - What we know: Non-demo series need "a single short branded MicroShort loop clip as placeholder."
   - What's unclear: Does this clip already exist, or does it need to be created?
   - Recommendation: Create a simple branded loop (10-15 seconds of MicroShort logo animation on dark background) using Remotion and render to MP4, OR use a simple static card. Host on a public URL (e.g., Supabase Storage or a public CDN) that the seed script can reference.

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `src/db/schema.sql`, `src/db/types.ts`, `src/config/genres.ts`, `src/lib/supabase/admin.ts`, `src/lib/mux/client.ts`, `src/app/api/webhooks/mux/route.ts` -- direct code inspection
- Context7 `/remotion-dev/remotion` -- Player component API, embedding patterns, composition structure
- Context7 `/websites/fal_ai` -- fal.ai client setup, Flux model invocation, Next.js proxy integration
- Context7 `/websites/mux` -- `video.assets.create` API with `input[].url`, `passthrough`, `playback_policies`
- Context7 `/websites/supabase` -- Storage upload API, file body formats, admin client patterns
- Context7 `/recharts/recharts` -- AreaChart, BarChart, PieChart, ResponsiveContainer patterns

### Secondary (MEDIUM confidence)
- [Remotion brownfield installation](https://www.remotion.dev/docs/brownfield) -- Packages: `remotion` + `@remotion/player`; version pinning guidance
- [Remotion Player installation](https://www.remotion.dev/docs/player/installation) -- `@remotion/player` package requirements
- [fal.ai Next.js integration](https://docs.fal.ai/model-apis/integrations/nextjs) -- App Router proxy setup, client configuration
- [fal.ai pricing](https://fal.ai/pricing) -- Flux dev $0.012/megapixel, Flux pro $0.03/megapixel
- [Supabase auth.admin.createUser](https://supabase.com/docs/reference/javascript/auth-admin-createuser) -- Server-side user creation with `email_confirm: true`
- [Mux Node SDK](https://github.com/muxinc/mux-node-sdk) -- Asset creation TypeScript types, passthrough parameter (max 255 chars)
- [shadcn/ui charts](https://ui.shadcn.com/docs/components/radix/chart) -- ChartContainer, ChartConfig, CSS variable theming, Recharts composition pattern
- [Pixabay sci-fi videos](https://pixabay.com/videos/search/sci-fi/) -- 1,400+ free sci-fi stock clips, no attribution required, MP4 format

### Tertiary (LOW confidence)
- Pitch page design patterns from web search -- general industry trends (large typography, gradient schemes, minimal design, clear CTAs); specific implementation details need validation during build
- Remotion + Next.js App Router SSR concerns -- confirmed Player needs `"use client"` but exact `next/dynamic` behavior with Remotion in v4 needs validation during implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All libraries verified via Context7 + official docs; versions confirmed against existing package.json
- Architecture: HIGH -- Patterns derived from existing codebase analysis (admin client, Mux webhook, Storage policies) and verified against library docs
- Pitfalls: HIGH -- Identified from DB constraint analysis (episode counts, duration checks, FK chains) and service interaction patterns (webhook timing, RLS policies)
- Seed script approach: HIGH -- Uses established patterns (admin client, Mux SDK) with well-documented APIs
- Remotion integration: MEDIUM -- Player embedding is well-documented but the specific animated compositions (showing mock UI in React) need creative implementation
- Pitch page design: MEDIUM -- General patterns clear but specific marketing copy and scroll effects require design iteration
- fal.ai thumbnail quality: MEDIUM -- Flux model produces good results but prompt engineering for cinematic thumbnails needs experimentation

**Research date:** 2026-02-15
**Valid until:** 2026-03-15 (30 days -- stable domain, no fast-moving dependencies)
