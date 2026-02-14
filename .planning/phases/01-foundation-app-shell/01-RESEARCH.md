# Phase 1: Foundation + App Shell - Research

**Researched:** 2026-02-14
**Domain:** Next.js 16 project scaffolding, Supabase schema design, PWA setup, Tailwind/shadcn theming, App Router routing
**Confidence:** HIGH

## Summary

Phase 1 establishes the entire application skeleton: a Next.js 16 project with Supabase integration, cinematic dark-first branding via Tailwind CSS v4 + shadcn/ui, the content hierarchy database schema (Series > Seasons > Episodes), PWA installability via Serwist, and route group scaffolding for all major sections of the app. No code exists yet -- this is a greenfield setup.

The critical prior concern -- Serwist requiring Webpack while Next.js 16 defaults to Turbopack -- is now **resolved**. Serwist v9.5.6 ships `@serwist/turbopack`, a dedicated package for Turbopack-based Next.js projects. It was last published 2026-02-13 and supports Next.js >=14.0.0. No Webpack fallback is needed.

The theming approach uses shadcn/ui's CSS variable system with oklch colors, where the `.dark` class is the default (forced via next-themes `defaultTheme="dark"`). The brand's "deep blacks + cinematic yellow" maps to a custom color palette defined in CSS variables within `globals.css`, integrated with shadcn/ui's `@theme inline` system for Tailwind v4.

**Primary recommendation:** Use `create-next-app` with `--yes` defaults (Turbopack, TypeScript, Tailwind, App Router), then layer Supabase client setup, Serwist Turbopack PWA, shadcn/ui with custom dark-first cinematic theme, and route group scaffolding. Database schema via Supabase CLI migrations.

## Standard Stack

### Core (Phase 1 specific)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **Next.js** | 16.1.6 | Full-stack React framework | `create-next-app --yes` sets up Turbopack, TypeScript, Tailwind, App Router by default. Server Components for SEO-ready pages, Server Actions for mutations. **Confidence: HIGH** (Context7 v16.1.5 docs verified) |
| **React** | 19.2.4 | UI library | Required by Next.js 16. Server Components enabled by default. **Confidence: HIGH** |
| **TypeScript** | 5.9.3 | Type safety | Latest stable. Next.js 16 requires >=5.1.0. **Confidence: HIGH** |
| **Tailwind CSS** | 4.1.18 | Utility-first CSS | CSS-first config via `@theme` directive. oklch color space. `dark:` variant for dark mode. No `tailwind.config.js` needed in v4. **Confidence: HIGH** (Context7 verified) |
| **@tailwindcss/postcss** | 4.1.18 | PostCSS plugin for Tailwind v4 | Required for Next.js integration. shadcn/ui uses this in `postcss.config.mjs`. **Confidence: HIGH** |
| **shadcn/ui** | CLI 3.x | UI component library | Copy-paste components on Radix UI primitives. Tailwind v4 + oklch theming confirmed. `@theme inline` integration with CSS variables. **Confidence: HIGH** (Context7 verified) |
| **next-themes** | 0.4.6 | Theme management | `defaultTheme="dark"` forces dark mode. `attribute="class"` pairs with Tailwind `dark:` variant. SSR-safe (no flash). **Confidence: HIGH** |
| **lucide-react** | latest | Icons | Tree-shakeable icon library. Used by shadcn/ui. **Confidence: HIGH** |
| **@supabase/supabase-js** | latest | Supabase client | Browser/server isomorphic client for database queries, auth. **Confidence: HIGH** |
| **@supabase/ssr** | latest | Supabase SSR client | `createServerClient` for Server Components and middleware. Cookie-based session management. **Confidence: HIGH** (Context7 verified with code examples) |
| **@serwist/turbopack** | 9.5.6 | PWA service worker (Turbopack) | Dedicated Turbopack integration. Published 2026-02-13. Supports Next.js >=14.0.0. Eliminates Webpack dependency. **Confidence: HIGH** (npm verified, Context7 docs verified) |
| **serwist** | 9.5.x | Service worker runtime | Core Serwist library. Precaching, runtime caching, offline fallback. **Confidence: HIGH** |
| **esbuild** | >=0.25.0 | Build tool (peer dep) | Required peer dependency for @serwist/turbopack. **Confidence: HIGH** |

### Supporting (Phase 1 specific)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **tw-animate-css** | latest | Animation utilities | shadcn/ui imports this for component animations. Added automatically by `shadcn init`. |
| **Supabase CLI** | latest | Local dev, migrations | `supabase init`, `supabase migration new`, `supabase db reset`, `supabase db push`. Database schema management. |
| **pnpm** | latest | Package manager | Faster installs, strict dependency resolution. Recommended by prior stack research. |
| **Biome** | latest | Linter + Formatter | 10-30x faster than ESLint. Use from day one. `pnpm add -D @biomejs/biome` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| **@serwist/turbopack** | Manual service worker (`public/sw.js`) | Manual approach is simpler but loses precaching, runtime caching strategies, and offline fallback. Use Serwist for production PWA features. |
| **@serwist/turbopack** | **@serwist/next** (Webpack) | The Webpack-based package. Would require `turbopack: false` in next.config, losing Turbopack's 5x faster builds. Not recommended now that @serwist/turbopack exists. |
| **next-themes** | CSS `prefers-color-scheme` only | Would work for system-preference-only dark mode, but MicroShort forces dark mode always -- next-themes `defaultTheme="dark"` is the cleanest approach. |
| **Supabase migrations** | **Drizzle ORM** migrations | Drizzle provides type-safe schema definitions in TypeScript. Adds complexity for Phase 1. Can be added in later phases if type-safe queries beyond Supabase client are needed. Start with raw SQL migrations. |

**Installation (Phase 1):**

```bash
# Project creation
pnpm create next-app@latest microshort --yes
cd microshort

# Supabase
pnpm add @supabase/supabase-js @supabase/ssr

# PWA (Serwist with Turbopack)
pnpm add -D @serwist/turbopack esbuild serwist

# Theme
pnpm add next-themes

# shadcn/ui init (interactive -- sets up components.json, globals.css, utils)
pnpm dlx shadcn@latest init

# Dev tools
pnpm add -D @biomejs/biome

# Supabase CLI (if not already installed globally)
brew install supabase/tap/supabase
```

## Architecture Patterns

### Recommended Project Structure (Phase 1)

```
src/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public-facing pages (no auth required)
│   │   ├── page.tsx              # Homepage
│   │   ├── loading.tsx           # Homepage loading skeleton
│   │   └── layout.tsx            # Public layout (header, footer)
│   ├── (auth)/                   # Auth pages
│   │   ├── login/page.tsx        # Login (placeholder)
│   │   ├── signup/page.tsx       # Signup (placeholder)
│   │   └── layout.tsx            # Auth layout (centered card)
│   ├── (browse)/                 # Browse/discovery pages
│   │   ├── browse/page.tsx       # Browse by genre (placeholder)
│   │   ├── series/[slug]/        # Series detail page (placeholder)
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   └── layout.tsx            # Browse layout
│   ├── (creator)/                # Creator dashboard (auth required)
│   │   ├── dashboard/page.tsx    # Creator dashboard (placeholder)
│   │   ├── layout.tsx            # Creator sidebar layout
│   │   └── loading.tsx
│   ├── (admin)/                  # Admin panel (admin role required)
│   │   ├── admin/page.tsx        # Admin dashboard (placeholder)
│   │   ├── layout.tsx            # Admin sidebar layout
│   │   └── loading.tsx
│   ├── serwist/                  # Serwist route handler
│   │   └── [path]/route.ts       # Service worker route
│   ├── sw.ts                     # Service worker source
│   ├── manifest.ts               # PWA web app manifest
│   ├── layout.tsx                # Root layout (html, body, providers)
│   ├── loading.tsx               # Global loading state
│   ├── error.tsx                 # Global error boundary
│   ├── global-error.tsx          # Fatal error boundary
│   └── not-found.tsx             # 404 page
├── components/
│   ├── ui/                       # shadcn/ui components (auto-generated)
│   ├── layout/                   # Layout components
│   │   ├── header.tsx            # App header/navbar
│   │   ├── footer.tsx            # App footer
│   │   ├── mobile-nav.tsx        # Mobile navigation
│   │   └── sidebar.tsx           # Dashboard/admin sidebar
│   └── providers/                # Context providers
│       ├── theme-provider.tsx    # next-themes ThemeProvider
│       └── serwist-provider.tsx  # Serwist PWA provider
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   ├── server.ts             # Server Supabase client
│   │   └── middleware.ts         # Supabase auth middleware helper
│   └── utils.ts                  # cn() utility (from shadcn)
├── config/
│   └── env.ts                    # Environment variable validation
├── db/                           # Database (managed by Supabase CLI)
│   ├── schema.sql                # Reference schema (documentation)
│   └── types.ts                  # Generated Supabase types
├── middleware.ts                 # Next.js middleware (Supabase session refresh)
└── globals.css                   # Tailwind imports + theme variables
```

### Pattern 1: Route Groups for Audience Separation

**What:** Use parenthesized route groups `(public)`, `(auth)`, `(browse)`, `(creator)`, `(admin)` to give each audience segment its own layout without affecting URL structure.

**When to use:** When different sections of the app have fundamentally different layouts (public pages have header/footer, creator dashboard has sidebar, admin has different sidebar).

**Example:**
```typescript
// Source: Next.js 16 docs (Context7 verified)
// app/(public)/layout.tsx -- public pages with header + footer
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

// app/(creator)/layout.tsx -- creator dashboard with sidebar
export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <CreatorSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
```

### Pattern 2: Dark-First Theme with CSS Variables

**What:** Use shadcn/ui's CSS variable system where `.dark` is the *only* theme. Override shadcn's default neutral palette with the cinematic brand colors. Force dark mode via next-themes.

**When to use:** MicroShort's brand is dark-first -- there is no light mode.

**Example:**
```css
/* Source: shadcn/ui theming docs + Tailwind v4 @theme (Context7 verified) */
/* app/globals.css */
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

/* MicroShort uses dark mode ONLY -- these are the only values that matter */
.dark {
  --background: oklch(0.08 0 0);           /* Deep cinema black */
  --foreground: oklch(0.95 0 0);           /* Near-white text */
  --card: oklch(0.12 0 0);                 /* Card surfaces */
  --card-foreground: oklch(0.95 0 0);
  --popover: oklch(0.12 0 0);
  --popover-foreground: oklch(0.95 0 0);
  --primary: oklch(0.88 0.18 90);          /* Cinematic yellow */
  --primary-foreground: oklch(0.08 0 0);   /* Black text on yellow */
  --secondary: oklch(0.16 0 0);            /* Dark surface */
  --secondary-foreground: oklch(0.95 0 0);
  --muted: oklch(0.16 0 0);
  --muted-foreground: oklch(0.65 0 0);     /* Subdued text */
  --accent: oklch(0.88 0.18 90);           /* Yellow accent = primary */
  --accent-foreground: oklch(0.08 0 0);
  --destructive: oklch(0.60 0.22 25);      /* Error red */
  --destructive-foreground: oklch(0.95 0 0);
  --border: oklch(0.22 0 0);              /* Subtle borders */
  --input: oklch(0.22 0 0);
  --ring: oklch(0.88 0.18 90);            /* Focus ring = yellow */
  --radius: 0.5rem;
}

/* Provide :root fallback (shadcn expects it even if unused) */
:root {
  --background: oklch(0.08 0 0);
  --foreground: oklch(0.95 0 0);
  /* ... same values as .dark ... */
  --primary: oklch(0.88 0.18 90);
  --primary-foreground: oklch(0.08 0 0);
  --radius: 0.5rem;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

/* Additional brand tokens outside shadcn's system */
@theme {
  --color-brand-yellow: oklch(0.88 0.18 90);
  --color-brand-yellow-light: oklch(0.93 0.12 90);
  --color-brand-yellow-dark: oklch(0.75 0.15 90);
  --color-cinema-black: oklch(0.08 0 0);
  --color-cinema-dark: oklch(0.12 0 0);
  --color-cinema-surface: oklch(0.16 0 0);
  --color-cinema-border: oklch(0.22 0 0);
  --color-cinema-muted: oklch(0.65 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### Pattern 3: Supabase Client Setup (Server + Browser + Middleware)

**What:** Create separate Supabase clients for server components, browser components, and middleware. Each handles cookies differently.

**When to use:** Every Next.js + Supabase project must do this in Phase 1.

**Example:**
```typescript
// Source: Supabase SSR docs (Context7 verified)
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component -- ignored if middleware refreshes sessions
          }
        },
      },
    }
  )
}
```

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
```

### Pattern 4: PWA with Serwist Turbopack

**What:** Use `@serwist/turbopack` for service worker generation, precaching, and offline fallback. Integrates via a route handler and SerwistProvider.

**When to use:** Phase 1 PWA setup. This is the production approach.

**Example:**
```typescript
// Source: Serwist Turbopack docs (Context7 verified)
// next.config.ts
import withSerwist from "@serwist/turbopack";

const nextConfig = withSerwist({
  serverExternalPackages: ["esbuild"],
  // ... other Next.js config
});

export default nextConfig;
```

```typescript
// app/serwist/[path]/route.ts
import { createSerwistRoute } from "@serwist/turbopack/route";
export const { GET } = createSerwistRoute();
```

```typescript
// app/sw.ts
/// <reference lib="webworker" />
import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});
serwist.addEventListeners();
```

```typescript
// components/providers/serwist-provider.tsx
"use client";
export { SerwistProvider } from "@serwist/turbopack/react";
```

### Pattern 5: Loading States and Error Boundaries

**What:** Every route group gets a `loading.tsx` for streaming SSR fallback and an `error.tsx` for graceful error handling. Root layout gets `global-error.tsx`.

**When to use:** Phase 1 scaffolding. These files are lightweight placeholders initially.

**Example:**
```typescript
// Source: Next.js 16 docs (Context7 verified)
// app/(public)/loading.tsx
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}

// app/error.tsx
'use client'
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <button onClick={() => reset()} className="mt-4 rounded bg-primary px-4 py-2 text-primary-foreground">
        Try again
      </button>
    </div>
  )
}

// app/global-error.tsx -- catches errors in root layout itself
'use client'
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <h2>Something went wrong</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  )
}
```

### Anti-Patterns to Avoid

- **Multiple root layouts without good reason:** Each route group CAN have its own `layout.tsx` with `<html>` and `<body>`, but this means navigating between groups triggers a full page reload. Only the `(pitch)` group might warrant a separate root layout (for standalone pitch pages). All other groups should share the single root layout.
- **Putting business logic in `layout.tsx`:** Layouts persist across navigations. Data fetching in layouts is fine, but mutations or side effects belong in page components or server actions.
- **Using `tailwind.config.js` with Tailwind v4:** Tailwind v4 uses CSS-first configuration via `@theme`. There is no config file. shadcn/ui's setup generates the CSS variables directly in `globals.css`.
- **Mixing `@serwist/next` and `@serwist/turbopack`:** Use one or the other. Since Next.js 16 defaults to Turbopack, use `@serwist/turbopack`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PWA service worker | Manual `public/sw.js` with hand-written cache logic | **@serwist/turbopack** | Precaching, runtime caching strategies, offline fallback, cache versioning -- all solved. Manual service workers miss edge cases (stale caches, update flow, navigation preload). |
| Dark mode implementation | Manual CSS class toggling with localStorage | **next-themes** | Handles SSR hydration mismatch (no flash of wrong theme), system preference detection, persistent preference storage. Two lines of code vs. 50+ lines of bug-prone manual implementation. |
| UI component primitives | Custom buttons, dialogs, dropdowns, etc. | **shadcn/ui** (Radix primitives) | Accessibility (ARIA, keyboard navigation, focus management) is deceptively complex. Radix handles it correctly. shadcn/ui gives you the source to customize. |
| Supabase cookie handling | Manual JWT parsing and cookie management | **@supabase/ssr** | `createServerClient` and `createBrowserClient` handle cookie serialization, session refresh, and hydration correctly across server/client boundary. |
| CSS reset / base styles | Manual reset stylesheet | **Tailwind CSS preflight** | Included by default with `@import "tailwindcss"`. Normalizes across browsers. |
| Database migrations | Manual SQL scripts run via psql | **Supabase CLI migrations** | `supabase migration new` creates timestamped files. `supabase db reset` replays from scratch. `supabase db push` deploys to remote. Version-controlled, repeatable. |

**Key insight:** Phase 1 is infrastructure. Every hour spent on custom infrastructure is an hour not spent on the features that make MicroShort unique. Use the standard tools.

## Common Pitfalls

### Pitfall 1: Tailwind v4 Config File Confusion

**What goes wrong:** Developer creates a `tailwind.config.js` or `tailwind.config.ts` expecting it to work like v3. Tailwind v4 ignores config files by default and uses CSS-first `@theme` directives.
**Why it happens:** Most tutorials and Stack Overflow answers reference v3 config patterns. The v4 migration is recent.
**How to avoid:** Do not create any `tailwind.config.*` file. All theme customization goes in `globals.css` using `@theme` and `@theme inline`. shadcn/ui's CLI generates the correct v4 structure when initialized on a Tailwind v4 project.
**Warning signs:** Theme colors not applying, custom utilities not generating, IDE autocompletion not working for custom colors.

### Pitfall 2: Multiple Root Layouts Causing Full-Page Reloads

**What goes wrong:** Each route group gets its own root layout (with `<html>` and `<body>` tags). Navigation between groups triggers a full-page reload instead of a client-side transition, destroying the app-like feel.
**Why it happens:** Next.js docs describe multiple root layouts as a feature. It IS a feature -- but only when groups are genuinely independent (different `<html lang>`, different metadata, etc.).
**How to avoid:** Use a SINGLE root layout at `app/layout.tsx`. Each route group gets its own nested layout (`app/(public)/layout.tsx`, `app/(creator)/layout.tsx`) that wraps only the content area. The root layout contains `<html>`, `<body>`, providers, and shared elements.
**Warning signs:** Flash of white/unstyled content when navigating between sections. Loss of client-side state (player, auth) on navigation.

### Pitfall 3: Supabase Session Desync Between Server and Client

**What goes wrong:** User appears logged in on some pages but logged out on others. Server Components see a different session state than Client Components.
**Why it happens:** Supabase stores sessions in cookies. Without middleware to refresh the session token on every request, the server-side token can expire while the client-side token is still valid (or vice versa).
**How to avoid:** Implement Supabase middleware from day one. The middleware intercepts every request, refreshes the auth token from cookies, and passes the updated cookies to the response. This is non-optional.
**Warning signs:** Intermittent auth errors, "user is null" in Server Components but valid in Client Components, session expiry after 1 hour.

### Pitfall 4: Missing `suppressHydrationWarning` on `<html>` Tag

**What goes wrong:** React throws hydration mismatch warnings in the console because next-themes adds a `class="dark"` attribute to `<html>` during client hydration that wasn't present in the server-rendered HTML.
**Why it happens:** next-themes injects a script to set the theme class before React hydrates, which intentionally modifies the DOM. React sees this as a mismatch.
**How to avoid:** Add `suppressHydrationWarning` to the `<html>` tag in the root layout. This is documented by next-themes but easy to forget.
**Warning signs:** Console warnings about hydration mismatches mentioning the `class` attribute on `<html>`.

### Pitfall 5: Database Schema Without CHECK Constraints

**What goes wrong:** Application enforces content rules (1-3 min episodes, 8-70 episodes per season) only in application code. Invalid data enters the database via direct SQL, admin tools, or future API changes.
**Why it happens:** Developers defer validation to the application layer and skip database-level constraints.
**How to avoid:** Define CHECK constraints in the migration SQL. The database is the last line of defense. Application validation can be lenient (user-friendly errors); database constraints must be strict.
**Warning signs:** Episodes with 0-second or 10-minute durations in the database, seasons with 0 or 500 episodes.

### Pitfall 6: PWA Not Testing on Real Devices

**What goes wrong:** PWA works in Chrome DevTools but fails on actual iOS/Android devices. Install prompt doesn't appear, or splash screen shows incorrectly.
**Why it happens:** Desktop browsers are more permissive about PWA requirements. iOS has specific requirements (proper apple-touch-icon, apple-mobile-web-app-capable meta tag, https).
**How to avoid:** Test PWA installation on at least one physical iPhone and one Android device before considering Phase 1 complete. Use `next dev --experimental-https` for local HTTPS testing.
**Warning signs:** "Add to Home Screen" option missing on iOS Safari, app opens with browser chrome instead of standalone mode.

## Code Examples

Verified patterns from official sources:

### Next.js 16 Root Layout with Providers

```typescript
// Source: Next.js 16 docs + shadcn/ui + next-themes + Serwist
// app/layout.tsx
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SerwistProvider } from "@/components/providers/serwist-provider";
import "@/globals.css";

const APP_NAME = "MicroShort";
const APP_DESCRIPTION = "Premium microshort video series";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#141414",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head />
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SerwistProvider swUrl="/serwist/sw.js">
            {children}
          </SerwistProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### PWA Manifest (Dynamic)

```typescript
// Source: Next.js 16 PWA docs (Context7 verified)
// app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MicroShort",
    short_name: "MicroShort",
    description: "Premium microshort video series",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#141414",
    theme_color: "#141414",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
```

### Database Schema: Content Hierarchy

```sql
-- Source: Supabase PostgreSQL patterns (Context7 verified)
-- supabase/migrations/YYYYMMDDHHMMSS_create_content_schema.sql

-- Genres enum for consistent categorization
CREATE TYPE genre AS ENUM (
  'drama', 'comedy', 'thriller', 'sci-fi', 'horror',
  'romance', 'action', 'documentary', 'behind-the-scenes',
  'music', 'sports'
);

-- Content status workflow
CREATE TYPE content_status AS ENUM (
  'draft', 'processing', 'ready', 'published', 'archived'
);

-- Series: top-level content entity
CREATE TABLE public.series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  genre genre NOT NULL,
  thumbnail_url TEXT,
  trailer_url TEXT,
  creator_id UUID NOT NULL,  -- FK added after profiles table exists
  status content_status NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seasons: ordered groupings within a series
CREATE TABLE public.seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL,
  title TEXT,
  description TEXT,
  price_cents INTEGER,  -- creator-set price (NULL = free)
  status content_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Enforce unique season numbers within a series
  UNIQUE (series_id, season_number),

  -- Price must be positive if set
  CHECK (price_cents IS NULL OR price_cents > 0)
);

-- Episodes: individual video content
CREATE TABLE public.episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_seconds INTEGER,  -- set by Mux webhook when asset is ready
  mux_asset_id TEXT,
  mux_playback_id TEXT,
  thumbnail_url TEXT,
  subtitle_url TEXT,          -- WebVTT file URL
  status content_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Enforce unique episode numbers within a season
  UNIQUE (season_id, episode_number),

  -- Episodes must be 1-3 minutes (60-180 seconds) when duration is known
  CHECK (duration_seconds IS NULL OR (duration_seconds >= 60 AND duration_seconds <= 180))
);

-- Profiles: user accounts (extends Supabase Auth)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'creator', 'admin')),
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add foreign key for series.creator_id now that profiles exists
ALTER TABLE public.series
  ADD CONSTRAINT fk_series_creator
  FOREIGN KEY (creator_id) REFERENCES public.profiles(id);

-- Season episode count enforcement via trigger
-- (8-70 episodes per season -- enforced on publish, not on insert)
CREATE OR REPLACE FUNCTION check_season_episode_count()
RETURNS TRIGGER AS $$
DECLARE
  episode_count INTEGER;
BEGIN
  IF NEW.status = 'published' THEN
    SELECT COUNT(*) INTO episode_count
    FROM public.episodes
    WHERE season_id = NEW.id AND status = 'published';

    IF episode_count < 8 OR episode_count > 70 THEN
      RAISE EXCEPTION 'Published seasons must have 8-70 published episodes (found %)', episode_count;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_season_episode_count
  BEFORE UPDATE ON public.seasons
  FOR EACH ROW
  WHEN (NEW.status = 'published')
  EXECUTE FUNCTION check_season_episode_count();

-- Enable Row Level Security
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Published series are visible to everyone"
  ON public.series FOR SELECT
  USING (status = 'published');

CREATE POLICY "Published seasons are visible to everyone"
  ON public.seasons FOR SELECT
  USING (status = 'published');

CREATE POLICY "Published episodes are visible to everyone"
  ON public.episodes FOR SELECT
  USING (status = 'published');

CREATE POLICY "Profiles are visible to everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Creators can manage their own series
CREATE POLICY "Creators can manage own series"
  ON public.series FOR ALL
  USING ((SELECT auth.uid()) = creator_id);

-- Creators can manage seasons/episodes in their series
CREATE POLICY "Creators can manage own seasons"
  ON public.seasons FOR ALL
  USING (
    series_id IN (
      SELECT id FROM public.series WHERE creator_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Creators can manage own episodes"
  ON public.episodes FOR ALL
  USING (
    season_id IN (
      SELECT s.id FROM public.seasons s
      JOIN public.series sr ON s.series_id = sr.id
      WHERE sr.creator_id = (SELECT auth.uid())
    )
  );

-- Users can manage their own profile
CREATE POLICY "Users can manage own profile"
  ON public.profiles FOR ALL
  USING ((SELECT auth.uid()) = id);

-- Indexes for performance
CREATE INDEX idx_series_genre ON public.series(genre) WHERE status = 'published';
CREATE INDEX idx_series_creator ON public.series(creator_id);
CREATE INDEX idx_series_featured ON public.series(is_featured) WHERE status = 'published';
CREATE INDEX idx_seasons_series ON public.seasons(series_id);
CREATE INDEX idx_episodes_season ON public.episodes(season_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER series_updated_at BEFORE UPDATE ON public.series
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER seasons_updated_at BEFORE UPDATE ON public.seasons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER episodes_updated_at BEFORE UPDATE ON public.episodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Supabase Middleware (Session Refresh)

```typescript
// Source: Supabase SSR docs (Context7 verified)
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session -- IMPORTANT: do not remove
  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Environment Variable Validation

```typescript
// Source: Best practice pattern
// config/env.ts
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
] as const;

type EnvVar = (typeof requiredEnvVars)[number];

function getEnvVar(name: EnvVar): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  supabase: {
    url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
    publishableKey: getEnvVar('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
  },
} as const;
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` / `tailwind.config.ts` | CSS-first `@theme` directive in `globals.css` | Tailwind CSS v4 (Jan 2025) | No config file needed. All theme tokens in CSS. Faster builds (Oxide engine). |
| `@serwist/next` (Webpack only) | `@serwist/turbopack` (Turbopack native) | Serwist 9.5.x (Jan 2026) | No need to disable Turbopack. Keeps 5x faster build times. Uses route handler instead of Webpack plugin. |
| `next-pwa` | **Serwist** | 2024 | next-pwa is unmaintained (2+ years). Serwist is its spiritual successor built on Workbox. |
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | 2024 | auth-helpers is deprecated. `@supabase/ssr` provides `createServerClient` / `createBrowserClient` with proper cookie handling. |
| shadcn/ui with HSL colors | shadcn/ui with oklch colors | shadcn 2025 | oklch provides perceptually uniform color transitions. Better for dark themes. |
| `experimental.turbopack` in next.config | Top-level `turbopack` key | Next.js 16 | Turbopack is now default (not experimental). Config key moved to top level. |
| Node.js 18 support | Node.js 20.9.0+ minimum | Next.js 16 | Node 18 dropped. Must use Node 20 LTS. |

**Deprecated/outdated:**
- **next-pwa:** Unmaintained. Do not use. Use Serwist.
- **@supabase/auth-helpers-nextjs:** Deprecated. Use `@supabase/ssr`.
- **`experimental.turbopack`:** Moved to top-level `turbopack` key in Next.js 16.
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`:** Renamed to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in Supabase docs (both work, new name is standard).

## Open Questions

1. **shadcn/ui `components.json` Tailwind v4 config path**
   - What we know: shadcn/ui's `components.json` has a `tailwind.config` field. Tailwind v4 has no config file.
   - What's unclear: Does `shadcn init` on a Tailwind v4 project leave the config path empty or handle it automatically?
   - Recommendation: Run `pnpm dlx shadcn@latest init` and observe. The CLI auto-detects Tailwind v4 and adjusts accordingly. LOW risk.

2. **Serwist Turbopack dev mode limitations**
   - What we know: `@serwist/turbopack` works for production builds. Serwist docs note that dev mode may not fully support service worker testing.
   - What's unclear: Does `next dev` with Turbopack properly serve the service worker for local PWA testing?
   - Recommendation: Use `next dev --experimental-https` and test service worker registration in dev. If it fails in dev, use `next build && next start` for PWA testing. MEDIUM risk -- dev-only limitation.

3. **Apple splash screen images for PWA**
   - What we know: iOS requires specific apple-touch-startup-image meta tags for PWA splash screens. These must be pre-generated at specific resolutions.
   - What's unclear: How many sizes are needed for current iOS devices, and should they use the cinematic brand theme?
   - Recommendation: Generate splash screen images for iPhone (1170x2532, 1284x2778, 1179x2556) and iPad sizes. Use deep black background with cinematic yellow MicroShort logo. Can be deferred to end of Phase 1 if time is tight.

4. **Supabase local dev Docker requirements**
   - What we know: `supabase start` requires Docker Desktop running.
   - What's unclear: Whether the team has Docker set up and whether local Supabase vs. remote-only development is preferred.
   - Recommendation: Use local Supabase for migrations and schema development. Push to remote for deployment. This is standard Supabase workflow.

## Sources

### Primary (HIGH confidence)
- [Next.js 16.1.5 docs](https://github.com/vercel/next.js/blob/v16.1.5/docs/) -- Context7, installation, PWA guide, route groups, loading states, upgrading guide
- [Serwist Turbopack docs](https://serwist.pages.dev/docs/next/turbo) -- Context7, full setup guide with code examples
- [@serwist/turbopack npm](https://www.npmjs.com/package/@serwist/turbopack) -- v9.5.6, published 2026-02-13, peer deps confirmed
- [Supabase SSR docs](https://supabase.com/docs/guides/auth/server-side/creating-a-client) -- Context7, createServerClient, createBrowserClient, middleware
- [Supabase database docs](https://supabase.com/docs/guides/database/) -- Context7, RLS policies, migrations, table creation, check constraints
- [Supabase local development](https://supabase.com/docs/guides/local-development/overview) -- CLI workflow, migrations, db push
- [Tailwind CSS v4 docs](https://tailwindcss.com/docs/theme) -- Context7, @theme directive, oklch colors, dark mode
- [shadcn/ui theming docs](https://ui.shadcn.com/docs/theming) -- Context7, CSS variables, oklch, @theme inline, dark mode
- [shadcn/ui installation Next.js](https://ui.shadcn.com/docs/installation/next) -- CLI init command, configuration
- [Next.js PWA guide](https://nextjs.org/docs/app/guides/progressive-web-apps) -- Official docs, manifest, service worker, push notifications, install prompts

### Secondary (MEDIUM confidence)
- [next-themes GitHub](https://github.com/pacocoursey/next-themes) -- defaultTheme, attribute="class", suppressHydrationWarning
- [LogRocket: Next.js 16 PWA](https://blog.logrocket.com/nextjs-16-pwa-offline-support/) -- Build tutorial (WebSearch)
- [Aurora Scharff: PWA App Icons in Next.js 16 with Serwist](https://aurorascharff.no/posts/dynamically-generating-pwa-app-icons-nextjs-16-serwist/) -- Dynamic icon generation pattern

### Tertiary (LOW confidence)
- Serwist Turbopack dev mode behavior -- needs hands-on validation during implementation

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** -- All versions verified via npm. All docs verified via Context7. Serwist Turbopack concern resolved.
- Architecture: **HIGH** -- Route groups, loading states, error boundaries are standard Next.js patterns with extensive documentation.
- Database schema: **HIGH** -- Standard PostgreSQL patterns with Supabase-specific RLS. CHECK constraints for content rules.
- PWA setup: **HIGH** -- @serwist/turbopack is production-ready (v9.5.6, actively maintained, published yesterday). Next.js has built-in manifest support.
- Theming: **HIGH** -- shadcn/ui + Tailwind v4 oklch theming is well-documented. Dark-first approach via next-themes is standard.
- Pitfalls: **MEDIUM-HIGH** -- Based on documented patterns and known issues. Tailwind v4 migration confusion is real. iOS PWA testing is critical.

**Research date:** 2026-02-14
**Valid until:** 2026-03-14 (30 days -- stable technologies, unlikely to change significantly)
