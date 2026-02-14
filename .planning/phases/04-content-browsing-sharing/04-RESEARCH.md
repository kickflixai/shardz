# Phase 4: Content Browsing + Sharing - Research

**Researched:** 2026-02-14
**Domain:** Genre-based content browsing, series detail pages, Open Graph social previews, SEO structured data, share link generation
**Confidence:** HIGH

## Summary

Phase 4 transforms the placeholder browse and series pages (built in Phase 1 as empty scaffolds) into fully functional content discovery and sharing surfaces. The work spans three distinct domains: (1) a genre-based browsing page with series card components and category filtering, (2) rich series detail pages showing seasons, episodes, and creator info, and (3) SEO/sharing infrastructure including Open Graph tags, JSON-LD structured data, and smart share link generation via the Web Share API.

The technical approach is straightforward because the foundation is already solid. The database schema has a `genre` enum, a partial index on `idx_series_genre` for published series, the Supabase client infrastructure exists, and the `(browse)` route group with `series/[slug]` is already scaffolded. The work is primarily Server Components fetching from Supabase, rendering UI with shadcn/ui + Tailwind, and using Next.js 16's built-in Metadata API for all SEO/OG concerns. No new infrastructure services are needed.

The one significant library addition is `nuqs` for URL-based genre filter state, which keeps the browse page shareable (a filtered view has its own URL). Everything else -- `generateMetadata`, `opengraph-image.tsx`, JSON-LD `<script>` tags, and the Web Share API -- is built into Next.js 16 or the browser platform. No `next-seo` library is needed; the built-in Metadata API is the standard for App Router projects.

**Primary recommendation:** Use Next.js 16's built-in `generateMetadata` + `opengraph-image.tsx` for all SEO/OG. Use `nuqs` for shareable genre filter state. Use the Web Share API with clipboard fallback for the share button. Render all content pages as Server Components for full SEO indexability. Use `generateStaticParams` with ISR revalidation for series pages.

## Standard Stack

### Core (Phase 4 specific)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **Next.js Metadata API** | (built-in, 16.1.6) | OG tags, Twitter cards, SEO meta | Built into Next.js 16 App Router. `generateMetadata` function per route generates all `<meta>` tags. Supports dynamic metadata from database content. No additional library needed. **Confidence: HIGH** (Context7 verified) |
| **Next.js ImageResponse** | (built-in, `next/og`) | Dynamic OG image generation | `opengraph-image.tsx` route convention generates unique OG images per series page. Uses JSX + subset of CSS rendered to PNG via satori + resvg. 1200x630px images cached at build/ISR time. **Confidence: HIGH** (Context7 verified) |
| **nuqs** | 2.x | URL query state for genre filter | Type-safe URL search params. `useQueryState('genre', parseAsString)` keeps genre filter state in the URL (e.g., `?genre=thriller`), making filtered views shareable and bookmarkable. Requires `NuqsAdapter` in root layout. Already in recommended stack. **Confidence: HIGH** (Context7 verified) |
| **Web Share API** | (browser built-in) | Native share sheet on mobile | `navigator.share({ title, text, url })` invokes OS-native share sheet on mobile (iOS, Android). Works in PWA context. Falls back to clipboard copy on unsupported browsers (desktop Firefox, some desktop Chrome). No library needed. **Confidence: HIGH** (MDN + multiple sources verified) |

### Supporting (Phase 4 specific)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **shadcn/ui Card** | (already installed) | Series card component | Base for the SeriesCard component. Already available in `components/ui/card.tsx`. |
| **shadcn/ui Badge** | (add via CLI) | Genre badges on cards | `pnpm dlx shadcn@latest add badge` -- for genre tag display on series cards. Accessible, themeable. |
| **shadcn/ui Tabs** | (add via CLI) | Season tabs on series detail page | `pnpm dlx shadcn@latest add tabs` -- for switching between seasons on the series page. |
| **shadcn/ui Avatar** | (add via CLI) | Creator avatar on series page | `pnpm dlx shadcn@latest add avatar` -- for creator info section. |
| **lucide-react** | (already installed) | Share icon, play icon, clock icon | Icons for share button, episode duration, play indicators. Already in the project. |
| **date-fns** | 4.x | Date formatting | For "Published X days ago" on series pages. Listed in recommended stack but not yet installed. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| **Next.js built-in Metadata API** | `next-seo` library | `next-seo` is designed for Pages Router. The built-in Metadata API is the standard for App Router -- covers OG tags, Twitter cards, and JSON-LD natively. Adding `next-seo` would be redundant. |
| **`nuqs` for genre filter** | `useSearchParams` from `next/navigation` | `useSearchParams` works but is untyped, requires manual parsing, and doesn't provide `withDefault()`. `nuqs` adds type safety and cleaner API. Minimal bundle cost (~3KB). |
| **`opengraph-image.tsx`** | Pre-generated OG images stored in R2 | Pre-generated images are faster to serve (no runtime generation) but require a pipeline to generate/update them. For v1 with dynamic content, `opengraph-image.tsx` is simpler. Can migrate to pre-generated later if performance matters. |
| **Web Share API** | `react-share` library | `react-share` provides platform-specific share buttons (Facebook, Twitter, WhatsApp individually). But the Web Share API provides the native share sheet which includes ALL apps on the user's device. Better UX on mobile. Use react-share only as a desktop fallback if needed. |
| **date-fns** | Native `Intl.RelativeTimeFormat` | Browser native but more verbose and less ergonomic. date-fns is tree-shakeable and already in the stack plan. |

**Installation (Phase 4):**
```bash
# URL query state management
pnpm add nuqs

# Date formatting (if not already installed)
pnpm add date-fns

# shadcn/ui components (copies source, not npm deps)
pnpm dlx shadcn@latest add badge tabs avatar skeleton aspect-ratio
```

## Architecture Patterns

### Recommended Project Structure (Phase 4 additions)

```
src/
├── app/
│   └── (browse)/
│       ├── browse/
│       │   ├── page.tsx                    # Genre browsing page (Server Component)
│       │   ├── loading.tsx                 # Browse page skeleton (already exists)
│       │   └── genre-filter.tsx            # Genre filter bar (Client Component, uses nuqs)
│       ├── series/[slug]/
│       │   ├── page.tsx                    # Series detail page (Server Component)
│       │   ├── loading.tsx                 # Series page skeleton (already exists)
│       │   ├── opengraph-image.tsx         # Dynamic OG image for series
│       │   ├── twitter-image.tsx           # Dynamic Twitter card image (can re-export OG)
│       │   └── episode/[episodeNumber]/
│       │       └── page.tsx               # Episode page (already exists from Phase 3)
│       └── layout.tsx                      # Browse layout with header/footer (exists)
├── components/
│   ├── series/
│   │   ├── series-card.tsx                # Series card (thumbnail, title, genre, episodes, creator)
│   │   ├── series-grid.tsx                # Responsive grid of SeriesCards
│   │   ├── series-detail.tsx              # Full series info (description, creator, seasons)
│   │   ├── season-tabs.tsx                # Season switcher with episode list
│   │   ├── episode-list.tsx               # Episode list within a season
│   │   ├── episode-list-item.tsx          # Single episode row
│   │   └── creator-info.tsx               # Creator avatar + name + bio snippet
│   ├── share/
│   │   └── share-button.tsx               # Share button (Web Share API + clipboard fallback)
│   └── ui/
│       ├── badge.tsx                       # (shadcn -- add)
│       ├── tabs.tsx                        # (shadcn -- add)
│       ├── avatar.tsx                      # (shadcn -- add)
│       ├── skeleton.tsx                    # (shadcn -- add)
│       └── aspect-ratio.tsx               # (shadcn -- add)
├── modules/
│   └── content/
│       ├── queries/
│       │   ├── get-series-by-genre.ts     # Query: published series filtered by genre
│       │   ├── get-series-by-slug.ts      # Query: single series with seasons + episodes + creator
│       │   ├── get-all-genres.ts          # Query: genre categories with series counts
│       │   └── get-all-series-slugs.ts    # Query: all published slugs for generateStaticParams
│       └── types.ts                        # Composite types (SeriesWithCreator, SeriesDetail, etc.)
└── lib/
    └── seo/
        ├── structured-data.ts             # JSON-LD generators (TVSeries, VideoObject)
        └── share.ts                        # Smart share link generator (URL + UTM params)
```

### Pattern 1: Server Component Browse Page with Client-Side Genre Filter

**What:** The browse page is a Server Component that fetches series from Supabase based on the genre query parameter. The genre filter bar is a Client Component using `nuqs` to manage the `?genre=` URL parameter. When the user selects a genre, the URL updates, which triggers a server re-render via Next.js navigation.

**When to use:** Whenever you need a filterable list where the filtered state should be shareable via URL.

**Example:**
```typescript
// src/app/(browse)/browse/page.tsx (Server Component)
import { createClient } from "@/lib/supabase/server";
import { SeriesGrid } from "@/components/series/series-grid";
import { GenreFilter } from "./genre-filter";
import type { Genre } from "@/db/types";

interface BrowsePageProps {
  searchParams: Promise<{ genre?: string }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const { genre } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("series")
    .select(`
      id, slug, title, genre, thumbnail_url, view_count, status,
      profiles!inner ( display_name ),
      seasons ( id )
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (genre && genre !== "all") {
    query = query.eq("genre", genre as Genre);
  }

  const { data: seriesList } = await query;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground">Browse Series</h1>
      <GenreFilter />
      <SeriesGrid series={seriesList ?? []} />
    </div>
  );
}
```

```typescript
// src/app/(browse)/browse/genre-filter.tsx (Client Component)
"use client";

import { useQueryState, parseAsString } from "nuqs";
import type { Genre } from "@/db/types";

const GENRES: { value: Genre | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "drama", label: "Drama" },
  { value: "comedy", label: "Comedy" },
  { value: "thriller", label: "Thriller" },
  { value: "sci-fi", label: "Sci-Fi" },
  { value: "horror", label: "Horror" },
  { value: "romance", label: "Romance" },
  { value: "action", label: "Action" },
  { value: "documentary", label: "Documentary" },
  { value: "behind-the-scenes", label: "BTS" },
  { value: "music", label: "Music" },
  { value: "sports", label: "Sports" },
];

export function GenreFilter() {
  const [genre, setGenre] = useQueryState(
    "genre",
    parseAsString.withDefault("all")
  );

  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {GENRES.map((g) => (
        <button
          key={g.value}
          onClick={() => setGenre(g.value === "all" ? null : g.value)}
          className={/* active/inactive styles */}
        >
          {g.label}
        </button>
      ))}
    </div>
  );
}
```
**Confidence: HIGH** -- Server Component data fetching + Client Component filter is the standard Next.js App Router pattern. nuqs Context7 docs confirm `useQueryState` with `parseAsString`.

### Pattern 2: generateMetadata for Dynamic SEO + OG Tags

**What:** Each series page exports a `generateMetadata` function that fetches the series data from Supabase and returns full Open Graph metadata (title, description, image, URL, type). Next.js automatically renders these as `<meta>` tags in the page `<head>`. Twitter cards fall back to OG tags but can be explicitly set via the `twitter` property.

**When to use:** Every dynamic page that needs social sharing previews and search engine metadata.

**Example:**
```typescript
// src/app/(browse)/series/[slug]/page.tsx
import type { Metadata, ResolvingMetadata } from "next";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: series } = await supabase
    .from("series")
    .select("title, description, thumbnail_url, genre, profiles!inner(display_name)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!series) {
    return { title: "Series Not Found" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://microshort.tv";
  const seriesUrl = `${siteUrl}/series/${slug}`;
  const creatorName = series.profiles?.display_name || "MicroShort Creator";

  return {
    title: series.title,
    description: series.description || `Watch ${series.title} on MicroShort`,
    openGraph: {
      title: series.title,
      description: series.description || `Watch ${series.title} on MicroShort`,
      url: seriesUrl,
      siteName: "MicroShort",
      type: "video.tv_show",
      images: series.thumbnail_url
        ? [{ url: series.thumbnail_url, width: 1200, height: 630, alt: series.title }]
        : [],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: series.title,
      description: series.description || `Watch ${series.title} on MicroShort`,
      images: series.thumbnail_url ? [series.thumbnail_url] : [],
      creator: `@${creatorName}`,
    },
    alternates: {
      canonical: seriesUrl,
    },
  };
}
```
**Confidence: HIGH** -- Context7 verified. `generateMetadata` is the documented Next.js 16 pattern for dynamic metadata in App Router Server Components.

### Pattern 3: Dynamic OG Image via opengraph-image.tsx

**What:** Place an `opengraph-image.tsx` file in the `series/[slug]/` route segment. Next.js auto-detects it and generates a dynamic PNG image for the `og:image` meta tag. Uses `ImageResponse` from `next/og` to render JSX to an image. Cached statically by default; regenerated with ISR.

**When to use:** When each series needs a unique, branded OG image for social sharing. The generated image includes the series title, genre, creator name, and MicroShort branding.

**Example:**
```typescript
// src/app/(browse)/series/[slug]/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "edge"; // optional: edge for faster generation

export default async function OGImage({
  params,
}: { params: { slug: string } }) {
  const supabase = await createClient();
  const { data: series } = await supabase
    .from("series")
    .select("title, genre, thumbnail_url, profiles!inner(display_name)")
    .eq("slug", params.slug)
    .single();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "48px",
          background: "linear-gradient(135deg, #141414, #1a1a1a)",
          color: "#f2f2f2",
          fontFamily: "sans-serif",
        }}
      >
        {/* Series thumbnail as background if available */}
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>
          {series?.title || "MicroShort Series"}
        </div>
        <div style={{ fontSize: 28, color: "#facc15", marginTop: 16 }}>
          {series?.genre?.toUpperCase()} {" | "} by {series?.profiles?.display_name}
        </div>
        <div style={{ fontSize: 22, color: "#a3a3a3", marginTop: 12 }}>
          microshort.tv
        </div>
      </div>
    ),
    { ...size }
  );
}
```
**Confidence: HIGH** -- Context7 verified. The `opengraph-image.tsx` convention and `ImageResponse` are documented Next.js 16 features.

### Pattern 4: JSON-LD Structured Data for Series Pages

**What:** Render a `<script type="application/ld+json">` tag in the series page body containing Schema.org structured data. For a video series platform, use `TVSeries` type with nested `TVSeason` and `TVEpisode`/`VideoObject` entries. Google uses this for video rich results and carousels.

**When to use:** Every series detail page and episode page.

**Example:**
```typescript
// src/lib/seo/structured-data.ts
import type { Series, Season, Episode, Profile } from "@/db/types";

interface SeriesStructuredDataProps {
  series: Series;
  creator: Profile;
  seasons: (Season & { episodes: Episode[] })[];
  siteUrl: string;
}

export function generateSeriesJsonLd({
  series,
  creator,
  seasons,
  siteUrl,
}: SeriesStructuredDataProps) {
  const seriesUrl = `${siteUrl}/series/${series.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: series.title,
    description: series.description,
    url: seriesUrl,
    image: series.thumbnail_url,
    genre: series.genre,
    creator: {
      "@type": "Person",
      name: creator.display_name || creator.username,
    },
    containsSeason: seasons.map((season) => ({
      "@type": "TVSeason",
      seasonNumber: season.season_number,
      name: season.title || `Season ${season.season_number}`,
      numberOfEpisodes: season.episodes.length,
      episode: season.episodes.map((ep) => ({
        "@type": "TVEpisode",
        episodeNumber: ep.episode_number,
        name: ep.title,
        description: ep.description,
        url: `${seriesUrl}/episode/${ep.episode_number}`,
        duration: ep.duration_seconds
          ? `PT${Math.floor(ep.duration_seconds / 60)}M${ep.duration_seconds % 60}S`
          : undefined,
        thumbnailUrl: ep.thumbnail_url,
      })),
    })),
    numberOfSeasons: seasons.length,
  };
}
```

**In the page component:**
```typescript
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(jsonLd).replace(/</g, "\u003c"),
  }}
/>
```
**Confidence: HIGH** -- Context7 verified JSON-LD rendering pattern. Schema.org TVSeries/TVEpisode types verified via schema.org.

### Pattern 5: Web Share API with Clipboard Fallback

**What:** A share button that calls `navigator.share()` on supported browsers/devices (mobile Safari, Chrome, Edge) to invoke the native OS share sheet. On unsupported browsers, falls back to copying the share link to the clipboard with a toast notification.

**When to use:** The share button on series pages and episode pages.

**Example:**
```typescript
// src/components/share/share-button.tsx
"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
}

export function ShareButton({ title, text, url }: ShareButtonProps) {
  async function handleShare() {
    const shareData = { title, text, url };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled -- not an error
        if ((err as Error).name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url);
      // Show toast: "Link copied to clipboard"
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleShare}>
      <Share2 className="mr-2 h-4 w-4" />
      Share
    </Button>
  );
}
```
**Confidence: HIGH** -- Web Share API is well-documented (MDN), supported on iOS Safari 14+, Chrome Android 61+, Edge 93+. Clipboard fallback handles all other browsers.

### Pattern 6: ISR with generateStaticParams for Series Pages

**What:** Use `generateStaticParams` to pre-render all published series pages at build time. Combine with `revalidate` to use ISR (Incremental Static Regeneration) so new series are picked up without a full rebuild. Unknown slugs are dynamically rendered on first request and then cached.

**When to use:** Series detail pages. These are SEO-critical and should be pre-rendered HTML for crawlers.

**Example:**
```typescript
// src/app/(browse)/series/[slug]/page.tsx
import { createClient } from "@/lib/supabase/server";

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

// Pre-render all published series at build time
export async function generateStaticParams() {
  const supabase = await createClient();
  const { data: series } = await supabase
    .from("series")
    .select("slug")
    .eq("status", "published");

  return (series ?? []).map((s) => ({ slug: s.slug }));
}
```
**Confidence: HIGH** -- `generateStaticParams` + `revalidate` is the standard Next.js ISR pattern for dynamic content pages.

### Anti-Patterns to Avoid

- **Client-side data fetching for series pages:** Series pages MUST be Server Components with SSR/SSG for SEO. Do not use `useEffect` + `fetch` for the main content. Crawlers see empty content with client-side rendering.

- **Using `next-seo` in App Router:** The built-in Metadata API replaces `next-seo` entirely. Adding `next-seo` alongside `generateMetadata` creates duplicate/conflicting meta tags.

- **Hardcoding genre list in multiple places:** Define the genre enum + display name mapping ONCE (in a shared constant file) and import everywhere. The database enum, the TypeScript type, the filter UI, and the genre labels must all be derived from the same source.

- **Relative URLs in OG tags:** Open Graph `og:url` and `og:image` MUST be absolute URLs (e.g., `https://microshort.tv/series/my-show`). Relative URLs break previews on all platforms.

- **Missing `og:image:width` and `og:image:height`:** Omitting image dimensions causes social platforms to make additional requests to determine image size, delaying preview rendering. Always include dimensions.

- **Skipping the `twitter:card` type:** Without `twitter:card: "summary_large_image"`, X/Twitter defaults to a small summary card instead of the large image preview. Always set the card type explicitly.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OG meta tags | Manual `<meta>` tags in `<Head>` | Next.js `generateMetadata` + `Metadata` type | The Metadata API handles deduplication, template inheritance, and all OG/Twitter properties. Manual `<meta>` tags cause conflicts with server-rendered metadata. |
| OG image generation | Canvas-based image generation service | `opengraph-image.tsx` with `ImageResponse` | Built into Next.js, auto-linked to the page's metadata, cached by CDN. Building a separate service is unnecessary complexity. |
| URL query state | Manual `URLSearchParams` parsing + `router.push` | `nuqs` `useQueryState` | nuqs handles serialization, type-safety, default values, shallow routing, and SSR compatibility. Manual implementation misses edge cases (encoding, history management). |
| Share functionality | Custom per-platform share SDKs (Facebook SDK, Twitter widgets) | Web Share API + clipboard fallback | The Web Share API delegates to the OS. One API covers every app on the user's device. Per-platform SDKs add bundle size, complexity, and break when platforms change their APIs. |
| JSON-LD rendering | String concatenation of JSON-LD | TypeScript object + `JSON.stringify` with XSS protection | Typed objects catch schema errors at compile time. The `replace(/</g, "\u003c")` XSS protection is essential (Next.js docs pattern). |
| Series card grid layout | Custom CSS grid implementation | Tailwind responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) | Standard responsive grid with zero custom CSS. shadcn Card component handles the card chrome. |

**Key insight:** Phase 4 is primarily about content presentation and metadata -- areas where Next.js 16's built-in features (Metadata API, ImageResponse, Server Components, ISR) handle the heavy lifting. The custom work is in the UI components and data queries, not infrastructure.

## Common Pitfalls

### Pitfall 1: Social Platform OG Cache Persistence

**What goes wrong:** You update the OG tags for a series (new thumbnail, updated description), but sharing the link still shows the old preview on iMessage, WhatsApp, X, and Facebook.
**Why it happens:** Social platforms aggressively cache OG data. Facebook caches for 24+ hours. iMessage caches until the cache is cleared. WhatsApp caches on first share.
**How to avoid:**
  1. During development, use platform debugging tools to force refresh: [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/), [X Card Validator](https://cards-dev.twitter.com/validator)
  2. For cache-busting in production, append a version query param to the OG image URL (e.g., `?v=2`) when thumbnails change
  3. Accept that cache staleness is a reality -- design the initial OG tags carefully since they may persist
**Warning signs:** "I updated the thumbnail but the old one still shows when I share the link."

### Pitfall 2: Supabase Server Client in generateMetadata Causing Double Fetch

**What goes wrong:** `generateMetadata` fetches series data from Supabase, then the page component fetches the same data again. This doubles the database queries for every page load.
**Why it happens:** `generateMetadata` and the page component are separate functions -- they don't share fetched data automatically.
**How to avoid:**
  1. Next.js 16 automatically deduplicates `fetch()` calls with the same URL within a single render. BUT Supabase client calls are NOT standard fetch -- they use PostgREST and may not be deduplicatable.
  2. Use React `cache()` to wrap the data fetching function. Call the cached function from both `generateMetadata` and the page component. React ensures it only runs once per request.
  ```typescript
  import { cache } from "react";

  export const getSeriesBySlug = cache(async (slug: string) => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("series")
      .select("*, profiles!inner(*), seasons(*, episodes(*))")
      .eq("slug", slug)
      .single();
    return data;
  });
  ```
**Warning signs:** Slow series page loads, double query counts in Supabase dashboard.

### Pitfall 3: opengraph-image.tsx Not Working with Supabase Server Client

**What goes wrong:** The `opengraph-image.tsx` route handler tries to use the Supabase server client (which reads cookies) but runs in a context where cookies are not available (especially on edge runtime or during static generation).
**Why it happens:** `opengraph-image.tsx` runs as a route handler, not as a page component. Cookie-based Supabase client may not have access to the request cookies in all contexts.
**How to avoid:**
  1. Use the Supabase client with the anon/publishable key directly (no cookies needed for public read queries on published content -- RLS allows anonymous SELECT on published series)
  2. Alternatively, use `edge` runtime and fetch from Supabase REST API directly
  3. The OG image only needs public data (title, genre, creator name) -- no auth-dependent queries
**Warning signs:** OG image route returns 500 error, social previews show default/fallback image.

### Pitfall 4: Genre Filter Causing Full Page Reload Instead of Soft Navigation

**What goes wrong:** Clicking a genre filter button triggers a full page reload (white flash, scroll position reset) instead of a smooth client-side re-render.
**Why it happens:** Using `router.push` with `{ scroll: false }` is necessary to prevent scroll reset. Also, if the genre filter is outside the page component (in a layout), it may not trigger the expected re-render.
**How to avoid:**
  1. Use `nuqs` with `history: "push"` or `history: "replace"` mode -- it handles shallow routing correctly
  2. Keep the genre filter component on the browse page (not in the layout), so searchParams changes trigger a page re-render
  3. The Server Component page reads `searchParams` and re-fetches accordingly
**Warning signs:** Full page flash when switching genres. URL updates but content doesn't change. Scroll jumps to top.

### Pitfall 5: Missing Series Returns 404 Instead of Graceful Empty State

**What goes wrong:** A shared link to a series that was unpublished or deleted shows a raw 404 error instead of a helpful message.
**Why it happens:** The series page doesn't handle the "no data found" case gracefully.
**How to avoid:**
  1. Use Next.js `notFound()` function to trigger the custom `not-found.tsx` page
  2. For series that exist but are unpublished, show a "This series is not available" message rather than a 404
  3. Ensure `generateMetadata` also handles missing series gracefully (return minimal metadata, not throw)
**Warning signs:** Shared links breaking when series are taken down.

### Pitfall 6: Episode Deep Links Not Resolving for Free Episodes

**What goes wrong:** Someone shares a link to a free episode (`/series/my-show/episode/2`), but the recipient hits the auth gate or paywall instead of seeing the episode.
**Why it happens:** The episode page access logic (from Phase 2) correctly gates episodes 4+, but the deep link routing may not properly resolve the series-to-episode relationship, or the episode data may not load because the query fails.
**How to avoid:**
  1. Verify that free episode deep links (episodes 1-3) work without any auth
  2. The existing `checkEpisodeAccess` function already handles this (episodes <= 3 return `allowed: true`)
  3. Ensure the share link generator uses the correct URL format: `/series/{slug}/episode/{number}`
  4. Test that the Supabase query in the episode page correctly resolves `slug + episodeNumber` to an episode
**Warning signs:** "I shared a free episode link but my friend had to sign up to watch it."

## Code Examples

Verified patterns from official sources:

### Genre Display Name Mapping (Single Source of Truth)
```typescript
// src/config/genres.ts
import type { Genre } from "@/db/types";

export const GENRE_CONFIG: Record<Genre, { label: string; emoji?: string }> = {
  drama: { label: "Drama" },
  comedy: { label: "Comedy" },
  thriller: { label: "Thriller" },
  "sci-fi": { label: "Sci-Fi" },
  horror: { label: "Horror" },
  romance: { label: "Romance" },
  action: { label: "Action" },
  documentary: { label: "Documentary" },
  "behind-the-scenes": { label: "BTS" },
  music: { label: "Music" },
  sports: { label: "Sports" },
};

export const ALL_GENRES = Object.keys(GENRE_CONFIG) as Genre[];

export function getGenreLabel(genre: Genre): string {
  return GENRE_CONFIG[genre]?.label ?? genre;
}
```

### React cache() for Deduplicated Data Fetching
```typescript
// Source: Next.js 16 docs (Context7 verified)
// src/modules/content/queries/get-series-by-slug.ts
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const getSeriesBySlug = cache(async (slug: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("series")
    .select(`
      *,
      profiles!inner (
        id, display_name, username, avatar_url, bio
      ),
      seasons (
        *,
        episodes (
          id, episode_number, title, description,
          duration_seconds, thumbnail_url, status
        )
      )
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .order("season_number", { referencedTable: "seasons", ascending: true })
    .order("episode_number", { referencedTable: "seasons.episodes", ascending: true })
    .single();

  return data;
});
```

### Smart Share Link with UTM Parameters
```typescript
// src/lib/seo/share.ts
interface ShareLinkOptions {
  slug: string;
  episodeNumber?: number;
  source?: string;
  medium?: string;
  campaign?: string;
}

export function generateShareUrl({
  slug,
  episodeNumber,
  source = "share",
  medium = "social",
  campaign,
}: ShareLinkOptions): string {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://microshort.tv";
  const path = episodeNumber
    ? `/series/${slug}/episode/${episodeNumber}`
    : `/series/${slug}`;

  const url = new URL(path, siteUrl);
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", medium);
  if (campaign) {
    url.searchParams.set("utm_campaign", campaign);
  }

  return url.toString();
}
```

### NuqsAdapter in Root Layout
```typescript
// Source: nuqs docs (Context7 verified)
// Update src/app/layout.tsx to wrap children with NuqsAdapter
import { NuqsAdapter } from "nuqs/adapters/next/app";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head />
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider ...>
          <SerwistProvider swUrl="/serwist/sw.js">
            <NuqsAdapter>{children}</NuqsAdapter>
          </SerwistProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `next-seo` library for meta tags | Next.js built-in `Metadata` API + `generateMetadata` | Next.js 13+ App Router (2023) | No additional library needed. Metadata API covers OG, Twitter, JSON-LD, canonical URLs, robots, etc. natively. |
| Manual OG image creation (Figma/Canva) | `opengraph-image.tsx` with `ImageResponse` (satori) | Next.js 13.3+ (2023) | Dynamic OG images auto-generated from data. No design tool pipeline. Cached by CDN. |
| `next/head` for metadata | `Metadata` object export / `generateMetadata` function | Next.js 13+ App Router (2023) | Declarative, type-safe, server-side. Supports streaming and parallel rendering. |
| Custom share button per platform | Web Share API (`navigator.share()`) | Widely supported since 2020+ | Single API invokes native OS share sheet. Covers all installed apps. |
| `query-string` or manual URL parsing | `nuqs` for type-safe URL state | nuqs 2.x (2024) | Type-safe parsers, SSR-compatible, framework adapters, default values. |

**Deprecated/outdated:**
- **`next-seo`**: Not needed for App Router projects. The built-in Metadata API is more capable and better integrated.
- **`next/head`**: Pages Router only. Use `Metadata` object export in App Router.
- **Manual `<meta>` tags in layout**: Causes conflicts with `generateMetadata`. Use the Metadata API exclusively.

## Open Questions

1. **NEXT_PUBLIC_APP_URL environment variable**
   - What we know: OG tags, canonical URLs, and share links all require absolute URLs. This requires a `NEXT_PUBLIC_APP_URL` variable.
   - What's unclear: Whether this is already configured in `.env.local` or needs to be added.
   - Recommendation: Add `NEXT_PUBLIC_APP_URL` to `config/env.ts` validation. Set to `http://localhost:3000` in development, the production URL in production.

2. **Series thumbnail images for OG**
   - What we know: The `series.thumbnail_url` field exists in the schema. OG images should be 1200x630px.
   - What's unclear: Whether existing thumbnails (when they exist -- there's no content yet) will be in the correct aspect ratio for OG images. Series thumbnails are likely vertical (9:16 poster format), not horizontal (1.91:1 OG format).
   - Recommendation: Use `opengraph-image.tsx` to generate a branded OG image that INCLUDES the vertical thumbnail within a horizontal layout (thumbnail on left, series info on right, MicroShort branding). This avoids requiring separate OG-specific images.

3. **Edge runtime for opengraph-image.tsx**
   - What we know: ImageResponse can run on edge runtime for faster generation. But the Supabase server client uses cookies which may not be available.
   - What's unclear: Whether the Supabase client works in edge runtime for anonymous (public) queries.
   - Recommendation: Start with Node.js runtime (default). Switch to edge only if generation speed is a problem. For public read queries, the Supabase JS client with the publishable key works without cookies.

4. **Series count per genre for browsing UI**
   - What we know: The browse page should show genre categories. It would be helpful to show how many series are in each genre.
   - What's unclear: Whether to show genre categories as a filter bar (horizontal pills) or as a grid of genre cards (each linking to a filtered view).
   - Recommendation: Use a horizontal filter bar (pills/chips) at the top of the browse page. This is more compact and follows the "browse by genre" pattern (like Netflix category rows). The filter updates the URL via nuqs, and the page re-renders with filtered results.

5. **Whether to add `sonner` now for toast notifications**
   - What we know: The share button clipboard fallback should show a "Link copied" toast. `sonner` is in the recommended stack but not yet installed.
   - What's unclear: Whether to add it now or defer.
   - Recommendation: Add `sonner` now. It's lightweight (~5KB), and the share button needs it. Install: `pnpm add sonner`. Add `<Toaster />` to root layout.

## Sources

### Primary (HIGH confidence)
- [Next.js 16 generateMetadata API](https://github.com/vercel/next.js/blob/v16.1.5/docs/01-app/03-api-reference/04-functions/generate-metadata.mdx) -- Context7, dynamic metadata, OG config, Twitter cards
- [Next.js 16 Metadata and OG Images Guide](https://github.com/vercel/next.js/blob/v16.1.5/docs/01-app/01-getting-started/14-metadata-and-og-images.mdx) -- Context7, `opengraph-image.tsx`, `ImageResponse`, dynamic OG images
- [Next.js 16 JSON-LD Guide](https://github.com/vercel/next.js/blob/v16.1.5/docs/01-app/02-guides/json-ld.mdx) -- Context7, structured data rendering with XSS protection
- [nuqs Docs](https://github.com/47ng/nuqs) -- Context7, `useQueryState`, `parseAsString`, `NuqsAdapter`, URL key remapping
- [next-seo VideoJsonLd](https://github.com/garmeeh/next-seo) -- Context7, Schema.org VideoObject structure reference (not used as dependency, only for schema reference)
- [Schema.org TVSeries](https://schema.org/TVSeries) -- Official schema type for TV series structured data
- [Schema.org VideoObject](https://schema.org/VideoObject) -- Official schema type for video content
- [MDN: Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API) -- Navigator.share(), canShare(), share data structure
- [MDN: Navigator.share()](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share) -- API reference, browser support, security requirements

### Secondary (MEDIUM confidence)
- [Open Graph Protocol Best Practices](https://ogpreview.app/guides/open-graph-preview) -- Image dimensions (1200x630), text length guidelines, platform-specific behavior
- [X Developer: Cards Markup](https://developer.x.com/en/docs/x-for-websites/cards/overview/markup) -- Twitter card types, summary_large_image, image requirements
- [Next.js ISR Guide](https://nextjs.org/docs/app/guides/incremental-static-regeneration) -- `revalidate` + `generateStaticParams` pattern
- [Next.js generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) -- Dynamic route pre-rendering

### Tertiary (LOW confidence)
- Social platform caching behavior varies and is not well-documented by platforms. Cache durations are approximate based on community observation.

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** -- All libraries either built into Next.js 16 (Metadata API, ImageResponse) or verified via Context7 (nuqs). Web Share API is a browser standard with excellent documentation.
- Architecture: **HIGH** -- Server Component pages with `generateMetadata`, `opengraph-image.tsx`, and `generateStaticParams` + ISR are all documented Next.js App Router patterns.
- Data queries: **HIGH** -- Supabase queries use existing schema (genre index, RLS policies for public read). `React.cache()` for deduplication is a documented React 19 pattern.
- SEO/OG implementation: **HIGH** -- Open Graph spec, Schema.org types, and Twitter Card spec are stable standards. Next.js Metadata API handles the rendering.
- Pitfalls: **MEDIUM-HIGH** -- OG caching behavior is real but not precisely documented. Supabase client in `opengraph-image.tsx` context needs validation.
- Share functionality: **HIGH** -- Web Share API + clipboard fallback is well-proven.

**Research date:** 2026-02-14
**Valid until:** 2026-03-14 (30 days -- stable technologies, Next.js Metadata API unlikely to change significantly)
