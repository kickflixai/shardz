# Stack Research

**Domain:** Microshort Video Platform (freemium, web-first, PWA)
**Researched:** 2026-02-14
**Confidence:** HIGH

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Next.js** | 16.1.x (App Router) | Full-stack React framework | Server Components reduce JS sent to client by ~38%. Turbopack builds are 5x faster. App Router provides file-based routing, Server Actions for mutations (Stripe checkout, form handling), built-in image/font optimization, and SEO-friendly SSR/SSG. Next.js 16 stabilizes `cacheComponents` for instant navigation via Partial Pre-Rendering (PPR). Vercel-native deployment with edge functions. The industry standard for production React apps. **Confidence: HIGH** (Context7 + official docs verified) |
| **React** | 19.2.x | UI library | Stable Server Components, Server Actions, concurrent rendering enabled by default. React Compiler auto-optimizes components (25-40% fewer re-renders). Metadata support (`<title>`, `<meta>`) built into components for SEO. Required by Next.js 16. **Confidence: HIGH** |
| **TypeScript** | 5.5+ | Type safety | Required by Next.js 16 (minimum 5.1.0). Strict mode catches errors at compile time. Zod schemas generate types automatically. Non-negotiable for a project of this scope. **Confidence: HIGH** |
| **Node.js** | 20.x LTS (minimum 20.9.0) | Runtime | Required by Next.js 16. Node 18 is no longer supported. Use 20.x LTS for stability. **Confidence: HIGH** |

### Backend & Database

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Supabase** | Latest (hosted) | Database + Auth + Realtime + Storage + Edge Functions | All-in-one backend eliminates integrating 5+ separate services. PostgreSQL foundation means full SQL power. Built-in Row Level Security (RLS) for authorization. Auth supports email/password, OAuth (Google, Apple, etc.), magic links. Realtime engine handles 10K+ concurrent connections with <100ms latency -- perfect for live reactions/comments. Edge Functions (Deno-based) for serverless compute. Storage for user avatars and non-video assets. One-click Stripe Sync Engine integration. Free tier generous for MVP. **Confidence: HIGH** (Context7 verified, 24K+ code snippets) |
| **Supabase Realtime** | (included) | Live reactions, comments, presence | Three primitives: **Broadcast** (ephemeral messages like reactions, emoji bursts -- low latency pub/sub), **Presence** (who's watching now, viewer count), **Postgres Changes** (new comments appear instantly via DB triggers). Built on Elixir/Phoenix -- battle-tested for WebSocket workloads. No separate WebSocket server to manage. **Confidence: HIGH** (Context7 verified with code examples) |
| **Supabase Auth** | (included) | Authentication | Handles JWT, session management, OAuth providers, magic links. Row-level security policies tied to auth.uid(). Eliminates building auth from scratch. Supports the "3 free episodes without account" flow via anonymous sessions. **Confidence: HIGH** |

### Video Infrastructure

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Mux** | API v1 | Video encoding, streaming, delivery | API-first video platform purpose-built for developers. Self-optimizing encodings (no manual rendition config). HLS adaptive bitrate streaming out of the box. Built-in analytics (QoE, engagement, rebuffering). Customizable player. Handles vertical video natively. DRM available as add-on ($100/mo + $0.003/license) for premium content protection. Pricing: $0.003/min storage, $0.00096/min streaming. Launch plan: $20/mo for $100 usage credit + 100K free delivery minutes. Perfect for 1-3 minute episodes. **Confidence: HIGH** (official docs verified) |
| **@mux/mux-player-react** | Latest | React video player component | Drop-in React player optimized for Mux infrastructure. Handles HLS playback, quality switching, browser compatibility automatically. Built-in preview thumbnails. Works as a Client Component in Next.js. Alternatively, use `next-video` (v2.6.0) for a more Next.js-native integration with auto-optimization. **Confidence: HIGH** |

### Payments

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Stripe** | Latest Node SDK (API 2026-01-28) | Payments, subscriptions | Industry standard for payment processing. Supports one-time purchases (per-season unlock), subscriptions (if added later), Apple Pay, Google Pay. Stripe Checkout provides hosted payment page with PCI compliance out of the box. Webhooks for fulfillment (grant access after payment). Server Actions in Next.js 16 eliminate API route boilerplate for checkout flows. Supabase has one-click Stripe Sync Engine for querying payment data via SQL. **Confidence: HIGH** |
| **@stripe/stripe-js** | Latest | Client-side Stripe SDK | Lazy-load with singleton pattern to avoid re-instantiation. Use Stripe Elements for embedded payment forms or Stripe Checkout for hosted flow. **Confidence: HIGH** |

### AI & ML Services

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Deepgram** | API (Nova-3 model) | AI auto-subtitling | Lowest latency for real-time transcription (0.2-0.3x real-time factor). 30+ language support. Speaker diarization. Smart formatting (punctuation, capitalization). Pay-as-you-go: $0.0077/min. Bills by exact second, no rounding. Better than Whisper for API-based workflows (Whisper is better self-hosted). Better than AssemblyAI for latency-critical subtitle generation. SRT/VTT output formats for video overlay. **Confidence: MEDIUM** (WebSearch verified by multiple sources; recommend validating accuracy on your specific content type) |
| **fal.ai** | Client SDK (@fal-ai/client) | Image generation for mock data, thumbnails | 600+ production-ready AI models. FLUX.1 [dev] model for high-quality image generation. Official Next.js integration with API proxy pattern (`@fal-ai/server-proxy`) to keep API keys server-side. Vercel template available. Use for V1 mock thumbnails and seed data. Drop-in proxy for App Router at `src/app/api/fal/proxy/route.js`. **Confidence: HIGH** (official docs + Vercel template verified) |

### Styling & UI

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Tailwind CSS** | 4.1.x | Utility-first CSS | Ground-up rewrite with Oxide engine. 5x faster full builds, 100x faster incremental builds. CSS-first config via `@theme` (no more `tailwind.config.js`). Just `@import "tailwindcss"` to start. Automatic content detection. Native container queries, 3D transforms, `color-mix()`. Dark mode via `dark:` variant -- essential for MicroShort's deep blacks branding. Custom theme tokens defined in CSS for cinematic yellow (`--color-brand-yellow`). **Confidence: HIGH** (Context7 + official docs verified) |
| **shadcn/ui** | Latest (CLI 3.0) | UI component library | Copy-paste components you own (not an npm dependency). Built on Radix UI primitives (accessible, unstyled). Tailwind CSS v4 support confirmed. New components: Field, InputGroup, ButtonGroup. Fully customizable -- restyle to match cinematic brand. Supports both Radix UI and Base UI primitives. Rich ecosystem of extensions. **Confidence: HIGH** |
| **Motion** (formerly Framer Motion) | 12.x | Animation library | Most popular React animation library (3.6M weekly downloads). Declarative API with hardware-accelerated animations. Gestures, layout animations, scroll-triggered animations, exit animations. Perfect for cinematic UI transitions, episode card reveals, reaction animations. ~30KB gzipped. Import as `motion/react`. **Confidence: HIGH** |

### State Management

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Zustand** | 5.x | Client-side state management | ~3KB, zero boilerplate. Single store model perfect for global state (auth state, player state, UI preferences). Works with React Server Components (client-side only). Simpler than Redux, more structured than Context. Use selectors to optimize re-renders. For MicroShort: player state, watch progress, UI mode (theater/fullscreen), reaction state. **Confidence: HIGH** |

### Validation

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Zod** | 4.x | Schema validation | 14x faster parsing than v3. 57% smaller core. TypeScript-first with automatic type inference. Use for: API input validation, form validation, environment variable validation, Supabase row type validation. `@zod/mini` available for client-side to reduce bundle. **Confidence: HIGH** |

### PWA

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Serwist** | 9.x (@serwist/next) | Service worker / PWA | Successor to next-pwa. Based on Google Workbox. Handles service worker generation, precaching, runtime caching strategies. Install prompt, offline support, push notifications. **Important caveat: Serwist requires Webpack. Next.js 16 defaults to Turbopack.** You must configure Next.js to use Webpack for the build step, or implement PWA using the built-in Next.js web manifest + manual service worker approach. **Confidence: MEDIUM** (Serwist + Next.js 16 Turbopack conflict needs validation) |

### Analytics & Charts

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Recharts** | 2.x | Creator dashboard charts | Built on D3 + React. Clean SVG rendering. Strong community (24K+ GitHub stars). More flexible than Tremor for custom chart types. Supports: line, bar, area, pie, radar, scatter charts. Tailwind-friendly via className props. Better than Tremor when you need custom visualizations for funnel analytics and ad attribution dashboards. **Confidence: HIGH** |

### Email

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Resend** | Latest | Transactional email | Built for developers. React Email integration lets you write email templates in React/JSX. Official Next.js SDK. Free tier: 100 emails/day. Use for: purchase confirmations, creator application status, new episode notifications. Regional sending (US/EU). Webhooks for delivery tracking. **Confidence: HIGH** |

### Rate Limiting & Caching

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Upstash Redis** | Serverless | Rate limiting, caching, session storage | HTTP-based Redis -- works from edge functions and serverless (no persistent connections needed). `@upstash/ratelimit` library for API protection. Free tier sufficient for MVP. Fixed window, sliding window, and token bucket algorithms. Vercel Marketplace integration. Use for: API rate limiting, view count debouncing, episode unlock caching. **Confidence: HIGH** |

### Social Media APIs

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Meta Marketing API** | v21.0 | Facebook/Instagram ad attribution | Track ad spend to season purchases. Conversion API for server-side event tracking (privacy-compliant, survives iOS ATT). Requires business verification and app review. **Confidence: MEDIUM** (API access requires approval) |
| **TikTok Content Posting API** | v2 | TikTok integration | Share Kit for user sharing, Content Posting API for creator distribution. Login Kit for OAuth. Restricted data access -- most features require approved partner status. **Confidence: MEDIUM** (access restrictions may limit features) |
| **YouTube Data API** | v3 | YouTube integration | Upload videos, manage playlists, access analytics. Well-documented, stable. Quota limits apply (10K units/day default). **Confidence: HIGH** |
| **X (Twitter) API** | v2 | X/Twitter integration | Post tweets, media uploads. Free tier extremely limited (1,500 tweets/month read). Basic tier $100/mo. Pricing has changed frequently. **Confidence: LOW** (pricing/access instability) |

### Infrastructure & Hosting

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Vercel** | Pro ($20/mo) | Hosting, CI/CD, edge network | Native Next.js deployment. Preview deployments per PR. Edge functions for middleware. Mux Marketplace integration auto-configures env vars. Analytics included. Image optimization CDN. 1TB bandwidth on Pro. **Risk: costs can spike at scale ($500-2K/mo).** Fine for MVP through early growth. **Confidence: HIGH** |
| **Cloudflare R2** | Pay-as-you-go | Object storage (non-video assets) | Zero egress fees (vs S3's $0.09/GB). $0.015/GB storage. Use for: user uploads, creator assets, generated thumbnails, subtitle files. 10GB free. Do NOT store video here -- Mux handles video storage and CDN. **Confidence: HIGH** |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **pnpm** | Package manager | Faster installs, strict dependency resolution, disk-efficient via content-addressable storage. Use over npm/yarn. |
| **Biome** | Linter + Formatter | Replaces ESLint + Prettier in a single tool. 10-30x faster (Rust-based). Next.js 16 deprecates `next lint` in favor of direct ESLint/Biome CLI. |
| **Vitest** | Unit/integration testing | Vite-native, Jest-compatible API. Faster than Jest. Works with React Testing Library. |
| **Playwright** | E2E testing | Cross-browser testing. Test payment flows, video playback, PWA install. |
| **Drizzle ORM** | Database ORM (optional) | TypeScript-first, SQL-like API. Generates Supabase-compatible migrations. Use if you want type-safe DB queries beyond Supabase client. Lighter than Prisma. |

---

## Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **next-themes** | 0.4.x | Theme management | Dark/light mode toggle. Pairs with Tailwind `dark:` variant. SSR-safe (no flash of unstyled content). Use from day one for MicroShort's dark-first branding. |
| **next-intl** | 3.x | Internationalization | If/when you need multi-language support. File-based message catalogs. App Router compatible. Defer until post-MVP. |
| **react-hook-form** | 7.x | Form management | Uncontrolled forms for performance. Pairs with Zod resolvers for validation. Use for: creator applications, payment forms, profile editing, polls. |
| **@tanstack/react-query** | 5.x | Server state management | Client-side data fetching, caching, revalidation. Use alongside Server Components for client-interactive data (infinite scroll, optimistic updates on reactions). |
| **nuqs** | 2.x | URL query state | Type-safe URL search params. Use for: filters, pagination, share-able URLs, episode deep links. |
| **sonner** | 1.x | Toast notifications | Lightweight, beautiful toast component. shadcn/ui compatible. Use for: payment success, reaction feedback, error states. |
| **lucide-react** | Latest | Icons | Icon library used by shadcn/ui. Tree-shakeable. Consistent with component library. |
| **date-fns** | 4.x | Date utilities | Tree-shakeable date formatting. Use for: episode release dates, analytics time ranges, "X days ago" formatting. |
| **sharp** | Latest | Image processing | Server-side image optimization. Used by Next.js internally. Use for: thumbnail generation, avatar resizing. |

---

## Installation

```bash
# Core framework
pnpm add next@latest react@latest react-dom@latest

# Backend & Auth
pnpm add @supabase/supabase-js @supabase/ssr

# Video
pnpm add @mux/mux-player-react
# OR for Next.js-native approach:
# pnpm add next-video

# Payments
pnpm add stripe @stripe/stripe-js

# AI Services
pnpm add @fal-ai/client @fal-ai/server-proxy
# Deepgram: use REST API directly or pnpm add @deepgram/sdk

# Styling & UI
pnpm add tailwindcss @tailwindcss/vite
# shadcn/ui: npx shadcn@latest init (copies components, not an npm dep)
pnpm add motion
pnpm add lucide-react

# State & Validation
pnpm add zustand zod
pnpm add react-hook-form @hookform/resolvers
pnpm add @tanstack/react-query

# PWA
pnpm add @serwist/next serwist

# Utilities
pnpm add next-themes nuqs sonner date-fns
pnpm add @upstash/redis @upstash/ratelimit
pnpm add resend

# Dev dependencies
pnpm add -D typescript @types/react @types/node
pnpm add -D @biomejs/biome
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
pnpm add -D playwright @playwright/test
pnpm add -D drizzle-orm drizzle-kit
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| **Supabase** | Firebase | If you need Firestore's document model or are deep in Google Cloud. Firebase Realtime DB is less structured than Postgres. Supabase wins on SQL power, RLS, and open-source portability. |
| **Supabase** | Neon + Clerk + separate services | If you want best-in-class Postgres (Neon) with best-in-class auth (Clerk). More integration work, higher total cost. Neon had multiple outages in 2025 (5.5hr incident in May). |
| **Mux** | Cloudflare Stream | If you want cheaper encoding and are already on Cloudflare. Less developer tooling, no built-in analytics, fewer player options. Mux wins on DX, analytics, and player ecosystem. |
| **Mux** | AWS MediaConvert + CloudFront | If you need full AWS ecosystem control. Significantly more infrastructure to manage. Only consider at massive scale (millions of viewers). |
| **Deepgram** | AssemblyAI | If you need higher accuracy on specific domains or sentiment analysis included. AssemblyAI has slightly higher accuracy for some accents. Deepgram wins on latency and per-second billing. |
| **Deepgram** | OpenAI Whisper (self-hosted) | If you want zero API costs and have GPU infrastructure. Whisper is the accuracy gold standard. But requires GPU servers, scaling, and maintenance. Not worth it for MVP. |
| **Vercel** | Railway | If Vercel costs spike. Railway uses containers (more predictable pricing). Good DX. Less optimized for Next.js edge features. |
| **Vercel** | Cloudflare Pages | For static/edge-heavy apps. Unlimited bandwidth on free plan. Partial Next.js support (not full feature parity). |
| **Motion** | GSAP | If you need timeline-based complex animations (3D, scroll-driven sequences). Steeper learning curve. Licensing costs for commercial use. Motion is sufficient for MicroShort's needs. |
| **Recharts** | Tremor | If you want faster dashboard development with less customization. Tremor is built ON Recharts with Tailwind + Radix. Good for standard dashboards, but less flexible for custom analytics views. |
| **Zustand** | Jotai | If your state is highly atomic (many independent pieces). Jotai uses atom-based model with automatic render optimization. Zustand is simpler for MicroShort's store-oriented state (player, auth, UI). |
| **Biome** | ESLint + Prettier | If you need ESLint plugin ecosystem (eslint-plugin-react-hooks, accessibility). Biome is faster but has fewer plugins. Can start with Biome and add ESLint only if specific plugins are needed. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **next-pwa** | Unmaintained. Last commit 2+ years ago. Does not support Next.js 15/16 App Router properly. | **Serwist** (@serwist/next) or built-in Next.js PWA approach |
| **Prisma** | Heavier ORM, slower cold starts in serverless, more complex migrations. Supabase client handles most queries. | **Supabase Client** for most queries, **Drizzle ORM** if you need a type-safe ORM layer |
| **Redux / Redux Toolkit** | Massive boilerplate for a project this size. Actions, reducers, slices -- overkill when Zustand does the same in 10 lines. | **Zustand** for client state |
| **Styled Components / CSS Modules** | Runtime CSS-in-JS is incompatible with Server Components (styled-components). CSS Modules work but fragment styling across files. | **Tailwind CSS v4** with CSS-first theming |
| **Firebase** | Vendor lock-in to Google. Firestore's document model is awkward for relational data (seasons, episodes, purchases, creators). No SQL. Harder to migrate away. | **Supabase** (PostgreSQL, open-source, SQL) |
| **Socket.io** | Requires managing a separate WebSocket server. Adds infrastructure complexity. Supabase Realtime is included free. | **Supabase Realtime** (Broadcast + Presence + Postgres Changes) |
| **AWS S3** (for non-video assets) | Egress fees add up fast ($0.09/GB). For a video platform where users download thumbnails, previews, etc., costs escalate. | **Cloudflare R2** (zero egress fees) |
| **Moment.js** | Deprecated by its own maintainers. Massive bundle size (67KB). Mutable API causes bugs. | **date-fns** (tree-shakeable, immutable) |
| **Create React App** | Deprecated. No SSR, no Server Components, no file routing, no API routes. Not viable for a modern web app. | **Next.js** |
| **Express.js** (standalone backend) | Unnecessary when Next.js Server Actions + Route Handlers + Supabase Edge Functions cover all backend needs. Adding Express means managing two deployment targets. | **Next.js API Routes / Server Actions + Supabase Edge Functions** |

---

## Stack Patterns by Variant

**If V1 / MVP (pitch tool with mock data):**
- Seed database with mock shows/episodes via Supabase seed scripts
- Generate thumbnails with fal.ai FLUX.1 model (run once, store in R2)
- Use royalty-free video uploaded to Mux
- Stripe in test mode
- Skip social API integrations (mock the data)
- Skip Deepgram (hardcode subtitle files)
- Focus: video player, payment flow, creator dashboard with seeded analytics

**If scaling beyond MVP:**
- Add Deepgram integration for real content
- Implement social API integrations one at a time (YouTube first -- best documented, most stable)
- Consider Railway or self-hosted if Vercel costs exceed $500/mo
- Add Cloudflare CDN in front of Vercel for static assets
- Evaluate DRM via Mux if content piracy becomes a concern

**If mobile app needed later:**
- PWA first (already built)
- React Native with Expo for native app
- Mux player has React Native SDK
- Supabase client works in React Native
- Stripe has React Native SDK

---

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 16.1.x | React 19.2.x | React 19 required by Next.js 16 |
| Next.js 16.1.x | Node.js 20.9.0+ | Node 18 dropped in Next.js 16 |
| Next.js 16.1.x | TypeScript 5.1.0+ | Minimum enforced by Next.js 16 |
| Tailwind CSS 4.1.x | Next.js 16.x | Use `@tailwindcss/vite` plugin (Turbopack uses Vite internally) |
| shadcn/ui (latest) | Tailwind CSS 4.x | Confirmed compatible since Feb 2025 |
| shadcn/ui (latest) | Radix UI or Base UI | Choose one primitive layer; Radix is default and more mature |
| Serwist 9.x | Next.js (Webpack) | **Conflict: Serwist requires Webpack, Next.js 16 defaults to Turbopack.** Must configure `turbopack: false` in next.config.js for builds, or use manual PWA approach. |
| Zod 4.x | react-hook-form 7.x | Use `@hookform/resolvers/zod` |
| Motion 12.x | React 19.x | Compatible. Import from `motion/react`. |
| @supabase/ssr | Next.js 16.x | Use for server-side Supabase client in Server Components and Route Handlers |
| Drizzle ORM | Supabase Postgres | Use `drizzle-orm/pg-core` with Supabase connection string |

---

## MicroShort-Specific Theming Notes

The "deep blacks + cinematic yellow" branding maps directly to Tailwind CSS v4's CSS-first theming:

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-brand-yellow: oklch(0.88 0.18 90);
  --color-brand-yellow-light: oklch(0.93 0.12 90);
  --color-brand-yellow-dark: oklch(0.75 0.15 90);
  --color-cinema-black: oklch(0.08 0 0);
  --color-cinema-dark: oklch(0.12 0 0);
  --color-cinema-surface: oklch(0.16 0 0);
  --color-cinema-border: oklch(0.22 0 0);
}
```

Use `dark:` as the default mode (force dark via `next-themes` `forcedTheme="dark"` or `defaultTheme="dark"`). The entire UI should be dark-first with yellow as the accent color.

---

## Sources

- [Next.js 16 Upgrade Guide](https://github.com/vercel/next.js/blob/v16.1.5/docs/01-app/02-guides/upgrading/version-16.mdx) -- Context7, HIGH confidence
- [Next.js Official Blog](https://nextjs.org/blog) -- Official docs, HIGH confidence
- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime) -- Context7 (24K+ snippets), HIGH confidence
- [Supabase Realtime Broadcast Changes](https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/realtime/getting_started.mdx) -- Context7, HIGH confidence
- [Tailwind CSS v4.0 Blog Post](https://tailwindcss.com/blog/tailwindcss-v4) -- Official docs, HIGH confidence
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode) -- Context7, HIGH confidence
- [Mux Pricing](https://www.mux.com/pricing) -- Official docs, HIGH confidence
- [Mux Next.js Integration](https://www.mux.com/docs/frameworks/next-js) -- Official docs, HIGH confidence
- [Stripe + Next.js 15 Guide](https://www.pedroalonso.net/blog/stripe-nextjs-complete-guide-2025/) -- WebSearch, MEDIUM confidence
- [Deepgram Pricing 2025](https://deepgram.com/learn/speech-to-text-api-pricing-breakdown-2025) -- Official source, HIGH confidence
- [fal.ai Next.js Integration](https://docs.fal.ai/model-apis/integrations/nextjs) -- Official docs, HIGH confidence
- [Serwist Documentation](https://serwist.pages.dev/docs/next) -- Official docs, MEDIUM confidence (Turbopack conflict needs validation)
- [Cloudflare R2 vs AWS S3](https://www.cloudflare.com/pg-cloudflare-r2-vs-aws-s3/) -- Official, HIGH confidence
- [React 19.2 Release](https://react.dev/blog/2025/10/01/react-19-2) -- Official, HIGH confidence
- [Zod v4](https://zod.dev/v4) -- Official, HIGH confidence
- [shadcn/ui Changelog](https://ui.shadcn.com/docs/changelog) -- Official, HIGH confidence
- [Motion (Framer Motion) Documentation](https://motion.dev/) -- Official, HIGH confidence
- [Resend Documentation](https://resend.com/docs/send-with-nextjs) -- Official, HIGH confidence
- [Upstash Rate Limiting](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview) -- Official, HIGH confidence
- [Vercel Pricing](https://vercel.com/pricing) -- Official, HIGH confidence

---
*Stack research for: MicroShort Video Platform*
*Researched: 2026-02-14*
