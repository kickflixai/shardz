# Architecture Research

**Domain:** Microshort video platform with creator marketplace
**Researched:** 2026-02-14
**Confidence:** MEDIUM-HIGH

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER (PWA)                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Vertical     │  │ Creator      │  │ Admin        │  │ Public       │     │
│  │ Video Player │  │ Dashboard    │  │ Panel        │  │ Pages        │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                 │                 │              │
│  ┌──────┴─────────────────┴─────────────────┴─────────────────┴──────┐       │
│  │                    Real-time Layer (WebSocket)                     │       │
│  │             Reactions · Comments · Presence                       │       │
│  └───────────────────────────┬───────────────────────────────────────┘       │
└──────────────────────────────┼──────────────────────────────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────────────────┐
│                      APPLICATION LAYER (Next.js)                            │
│  ┌──────────────┐  ┌────────┴─────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ API Routes / │  │ Server       │  │ Auth          │  │ Webhook      │    │
│  │ Server       │  │ Components   │  │ Middleware     │  │ Handlers     │    │
│  │ Actions      │  │ (SSR/SSG)    │  │               │  │              │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                 │                 │              │
│  ┌──────┴─────────────────┴─────────────────┴─────────────────┴──────┐      │
│  │                    Service Layer (Business Logic)                   │      │
│  │  Content · Payments · Analytics · Social · AI · Users · Admin      │      │
│  └───────────────────────────┬───────────────────────────────────────┘      │
└──────────────────────────────┼──────────────────────────────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────────────────┐
│                         DATA LAYER                                          │
│  ┌──────────────┐  ┌────────┴─────┐  ┌──────────────┐                      │
│  │ PostgreSQL   │  │ Redis /      │  │ Blob Storage  │                      │
│  │ (Supabase)   │  │ KV Store     │  │ (Uploads)     │                      │
│  └──────────────┘  └──────────────┘  └──────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Mux      │  │ Stripe   │  │ Supabase │  │ fal.ai   │  │ Social   │     │
│  │ (Video)  │  │ Connect  │  │ Realtime │  │ (AI Gen) │  │ Media    │     │
│  │          │  │ (Pay)    │  │ + Auth   │  │          │  │ APIs     │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│  ┌──────────┐                                                               │
│  │ Whisper  │                                                               │
│  │ (Subs)   │                                                               │
│  └──────────┘                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With | Typical Implementation |
|-----------|----------------|-------------------|------------------------|
| **Vertical Video Player** | Plays HLS streams, manages quality switching, displays reactions/comments overlay, handles timestamp sync | Mux CDN (stream), Supabase Realtime (reactions), API (progress tracking) | @mux/mux-player-react with custom overlay components |
| **Creator Dashboard** | Series/season/episode CRUD, upload management, analytics views, payout history, social attribution | API Routes (CRUD), Mux (upload), Stripe (payouts), Analytics service | Next.js pages with server components for data, client components for interactivity |
| **Admin Panel** | Creator approvals, content moderation, featured content curation, platform metrics, user management | API Routes (all CRUD), Database directly via server actions | Next.js admin route group with role-gated middleware |
| **Public Pages** | SEO-friendly series/episode pages, landing pages, pitch pages, creator profiles | Server Components (SSR/SSG), API (dynamic data) | Next.js static generation + ISR for series pages |
| **Real-time Layer** | Live reactions broadcast, comment streams, concurrent viewer presence, timestamp-synced overlays | Supabase Realtime (WebSocket), Database (persistence) | Supabase Channels with Broadcast + Postgres Changes |
| **Auth System** | User registration/login, session management, role-based access (viewer/creator/admin), anonymous viewing | Supabase Auth, middleware, database (profiles) | Supabase Auth with Next.js middleware for route protection |
| **Content Service** | Series/season/episode management, metadata, genre categorization, content status workflow | Database (CRUD), Mux (video assets), fal.ai (thumbnails) | Server actions + Prisma/Drizzle ORM |
| **Payment Service** | Season unlocks, bundle pricing, creator payouts, revenue split calculation, transaction records | Stripe (charges), Stripe Connect (payouts), Database (records), Webhooks | Stripe SDK with webhook verification |
| **Analytics Service** | Event ingestion, funnel tracking (view > watch > signup > unlock), creator dashboards, platform metrics | Database (event storage), Social APIs (attribution) | Custom event pipeline with PostgreSQL + materialized views |
| **Social Integration Service** | Ad campaign data import, conversion attribution, share link generation, social previews | Meta API, TikTok API, YouTube API, X API | Abstraction layer over platform-specific SDKs |
| **AI Processing Service** | Auto-subtitling from audio, thumbnail generation, subtitle format conversion | Whisper API (transcription), fal.ai (image gen), Mux (audio extraction) | Background job queue with async processing |
| **Webhook Handlers** | Process Mux events (upload complete, ready), Stripe events (payment, payout), manage async workflows | Mux webhooks, Stripe webhooks, internal services | Next.js API routes with signature verification |

## Recommended Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (public)/               # Public-facing pages (no auth required)
│   │   ├── page.tsx            # Homepage (curated series grid)
│   │   ├── series/[slug]/      # SEO series pages
│   │   ├── creators/[slug]/    # Creator profile pages
│   │   └── watch/[episodeId]/  # Video player page
│   ├── (auth)/                 # Auth pages
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/            # Creator dashboard (auth required)
│   │   ├── dashboard/
│   │   ├── series/
│   │   ├── analytics/
│   │   └── payouts/
│   ├── (admin)/                # Admin panel (admin role required)
│   │   ├── admin/
│   │   ├── creators/
│   │   └── content/
│   ├── (pitch)/                # Standalone pitch pages
│   │   ├── investors/
│   │   ├── creators/
│   │   ├── brands/
│   │   └── advisors/
│   └── api/                    # API routes + webhooks
│       ├── webhooks/
│       │   ├── mux/
│       │   └── stripe/
│       └── [...]/
├── modules/                    # Business domain modules
│   ├── content/                # Series, seasons, episodes
│   │   ├── actions/            # Server actions
│   │   ├── queries/            # Data fetching
│   │   ├── schemas/            # Zod validation
│   │   └── types.ts
│   ├── payments/               # Stripe, unlocks, payouts
│   │   ├── actions/
│   │   ├── queries/
│   │   └── stripe.ts           # Stripe client config
│   ├── analytics/              # Event tracking, funnels
│   │   ├── events.ts           # Event definitions
│   │   ├── tracker.ts          # Client-side tracker
│   │   └── queries/            # Dashboard queries
│   ├── social/                 # Social media integrations
│   │   ├── meta.ts
│   │   ├── tiktok.ts
│   │   ├── youtube.ts
│   │   └── attribution.ts
│   ├── ai/                     # AI processing
│   │   ├── subtitles.ts        # Whisper integration
│   │   └── thumbnails.ts       # fal.ai integration
│   ├── realtime/               # Real-time features
│   │   ├── reactions.ts
│   │   ├── comments.ts
│   │   └── presence.ts
│   ├── users/                  # Auth, profiles, roles
│   │   ├── auth.ts
│   │   ├── profiles.ts
│   │   └── roles.ts
│   └── admin/                  # Admin operations
│       ├── moderation.ts
│       └── curation.ts
├── components/                 # Shared UI components
│   ├── player/                 # Video player + overlays
│   ├── ui/                     # Design system primitives
│   └── layout/                 # Layout components
├── lib/                        # Shared utilities
│   ├── supabase/               # Supabase client (server/client)
│   ├── mux/                    # Mux client config
│   ├── stripe/                 # Stripe client config
│   └── utils/                  # General utilities
├── db/                         # Database schema + migrations
│   ├── schema/                 # Table definitions
│   ├── migrations/             # Migration files
│   └── seed/                   # Mock data seeding
└── config/                     # App configuration
    ├── constants.ts
    └── env.ts                  # Validated env vars
```

### Structure Rationale

- **`app/` route groups:** Separate route groups `(public)`, `(dashboard)`, `(admin)`, `(pitch)` allow different layouts and middleware per audience. Parenthesized groups do not affect URL structure.
- **`modules/` domain modules:** Business logic organized by domain, not by technical layer. Each module owns its actions, queries, schemas, and types. This is the "modular" in modular monolith -- modules can be extracted later if needed.
- **`components/`:** Shared UI stays separate from business logic. The `player/` subdirectory contains the core video player and its overlay system (reactions, comments, controls).
- **`lib/`:** Third-party client configurations centralized. Each external service has one initialization point.
- **`db/`:** Database concerns isolated. Schema definitions, migrations, and seed data co-located for clarity.

## Architectural Patterns

### Pattern 1: Modular Monolith with Domain Modules

**What:** A single Next.js application organized by business domains (content, payments, analytics, etc.) rather than technical layers. All modules deploy together but maintain clear boundaries via explicit imports and interfaces.

**When to use:** Small teams (1-5 developers) building a product that needs to move fast but plans to scale. MicroShort fits this exactly -- you need rapid iteration with a small team, but the system has enough distinct domains that clean boundaries matter.

**Trade-offs:**
- Pro: Single deployment, simple ops, fast development, easy debugging
- Pro: Module boundaries make future extraction to microservices possible
- Con: Shared database means modules can become coupled if discipline slips
- Con: Single failure domain (if the app crashes, everything is down)

**Why this over microservices:** Amazon Prime Video famously moved back from microservices to a monolith for their video processing, reducing costs by 90%. For a small team, microservices add operational overhead (deployment, networking, observability) that far outweighs their benefits. A modular monolith provides the organizational benefit of services without the operational cost.

**Confidence:** HIGH -- Amazon Prime Video case study, multiple industry sources, and Next.js ecosystem all support this pattern for small-team video platforms.

### Pattern 2: Delegated Video Pipeline (Mux-Managed)

**What:** Instead of building a custom video transcoding/CDN pipeline, delegate the entire video lifecycle to Mux: upload, transcoding, HLS packaging, CDN delivery, and playback analytics. Your application stores only Mux asset IDs and metadata.

**When to use:** When video is core to the product but building/maintaining video infrastructure is not your competitive advantage. MicroShort's value is the creator marketplace and viewing experience, not the transcoding pipeline.

**Trade-offs:**
- Pro: Zero video infrastructure to manage -- no FFmpeg, no S3 buckets for segments, no CDN configuration
- Pro: Mux handles adaptive bitrate, quality switching, poster generation, and captions automatically
- Pro: Built-in analytics (video start, engagement, quality of experience)
- Con: Vendor dependency on Mux (mitigation: store original files in your own storage as backup)
- Con: Cost scales with video minutes delivered (predictable but potentially significant at scale)

**Data flow:**
```
Creator uploads video
    ↓
Browser → Mux Direct Upload (signed URL from your API)
    ↓
Mux transcodes → multiple HLS renditions
    ↓
Mux webhook → your API (asset.ready event)
    ↓
Your DB stores: mux_asset_id, mux_playback_id, duration, status
    ↓
Viewer requests episode
    ↓
Server Component fetches episode metadata + mux_playback_id
    ↓
MuxPlayer component loads HLS stream from Mux CDN
```

**Confidence:** HIGH -- Mux is the industry standard for this pattern, with explicit Next.js integration support, React player components, and webhook-driven architecture.

### Pattern 3: Webhook-Driven Async Processing

**What:** External services (Mux, Stripe, social APIs) communicate state changes to your application via webhooks. Your application processes these asynchronously rather than polling or waiting synchronously.

**When to use:** Whenever integrating with external services that have async workflows -- video transcoding (minutes), payment processing (seconds), AI subtitling (minutes).

**Trade-offs:**
- Pro: No polling, no timeouts, no wasted compute waiting
- Pro: Reliable -- webhook retry mechanisms handle transient failures
- Con: Requires idempotent webhook handlers (same event delivered twice must not cause double-processing)
- Con: Requires webhook signature verification for security

**Critical webhooks in MicroShort:**
```
Mux Webhooks:
  video.asset.ready      → Mark episode as playable, extract duration
  video.asset.errored    → Flag upload failure, notify creator
  video.upload.created   → Track upload progress

Stripe Webhooks:
  checkout.session.completed  → Grant season access to user
  payment_intent.succeeded    → Record transaction
  account.updated             → Update creator payout status
  payout.paid                 → Record payout completion

AI Processing (internal queue):
  subtitle.requested     → Trigger Whisper transcription
  subtitle.completed     → Attach WebVTT to episode
  thumbnail.requested    → Trigger fal.ai generation
  thumbnail.completed    → Attach thumbnail URL to series
```

**Confidence:** HIGH -- standard pattern across all major API-first services.

### Pattern 4: Layered Real-time with Accumulated History

**What:** Real-time reactions and comments operate in two modes simultaneously: (1) live broadcast for concurrent viewers via WebSocket, and (2) accumulated/replayed reactions from past viewers stored in the database and triggered by timestamp during playback. This creates the "lively" feeling even when watching alone.

**When to use:** Video platforms that want a social viewing experience without requiring many concurrent viewers. This is critical for MicroShort's early days when concurrent viewership will be low.

**Trade-offs:**
- Pro: Content feels alive even with low concurrency -- past reactions replay at their timestamps
- Pro: Social proof builds over time as more viewers watch
- Con: Requires careful timestamp synchronization between player position and reaction display
- Con: Accumulated reactions can feel artificial if not tuned well (rate limiting, natural distribution)

**Data flow:**
```
LIVE PATH (concurrent viewers):
  Viewer reacts → WebSocket broadcast to channel → all connected viewers see it
  Viewer reacts → also persisted to DB with episode_id + timestamp_ms

REPLAY PATH (accumulated):
  Player reaches timestamp T → query reactions WHERE timestamp BETWEEN T-500ms AND T+500ms
  Display accumulated reactions with slight random offset for natural feel

COMBINED:
  Player overlay merges live WebSocket reactions + accumulated DB reactions
  Deduplicate by reaction_id to prevent showing own live reaction twice
```

**Confidence:** MEDIUM -- this pattern is used by platforms like NicoNico and Bilibili for "danmaku" (scrolling comments), but applying it to emoji reactions specifically requires custom implementation. The concept is proven; the MicroShort-specific implementation will need tuning.

### Pattern 5: Server Components for SEO, Client Components for Interactivity

**What:** Use Next.js Server Components for all data-fetching and SEO-critical content (series pages, creator profiles, episode metadata). Use Client Components only where browser interactivity is needed (video player, reactions overlay, form submissions, real-time features).

**When to use:** Any Next.js application that needs both SEO and rich interactivity. MicroShort needs both -- series pages must be indexable by search engines, but the player and social features require client-side JavaScript.

**Trade-offs:**
- Pro: Smaller JavaScript bundles (server components send zero JS to client)
- Pro: SEO pages render full HTML for crawlers
- Pro: Sensitive logic (API keys, DB queries) stays server-side
- Con: Mental model requires understanding the server/client boundary
- Con: Cannot use hooks or browser APIs in server components

**Example boundary:**
```
[Server Component: SeriesPage]
  ├── fetches series + episodes from DB
  ├── renders SEO metadata, structured data
  ├── renders static series info (title, description, creator)
  └── renders [Client Component: EpisodePlayer]
        ├── MuxPlayer (video playback)
        ├── ReactionsOverlay (WebSocket + accumulated)
        ├── CommentsPanel (WebSocket + persisted)
        └── UnlockButton (Stripe checkout trigger)
```

**Confidence:** HIGH -- this is the documented Next.js App Router pattern, well-supported by Mux and Supabase integrations.

## Data Flow

### Core Data Flows

#### 1. Content Ingestion Flow

```
Creator uploads via Dashboard
    ↓
[Browser] → Mux Direct Upload (presigned URL from API route)
    ↓
[Mux] transcodes video → generates HLS renditions + poster image
    ↓
[Mux webhook: video.asset.ready] → API route
    ↓
[Webhook handler] updates episode record:
  - status: "processing" → "ready"
  - duration_seconds: from Mux
  - mux_playback_id: for streaming
  - mux_asset_id: for management
    ↓
(Optional) [AI subtitle job] triggered:
  Audio extracted → Whisper API → WebVTT generated → stored
    ↓
(Optional) [AI thumbnail job] triggered:
  Prompt from metadata → fal.ai → image URL → stored
```

#### 2. Viewer Funnel Flow

```
[Social Media Ad] → share link with UTM params
    ↓
[Landing: Series Page] (SSR, SEO-indexed)
  - Series metadata, episode list, creator info
  - UTM params captured → analytics event: "series_view"
    ↓
[Watch: Free Episode] (no auth required)
  - MuxPlayer streams HLS
  - Analytics: "episode_start", "episode_progress_25/50/75", "episode_complete"
  - Reactions + comments visible (read-only for anon)
    ↓
[Episode 4+: Paywall]
  - Prompt: sign up + unlock season
  - Analytics: "paywall_hit"
    ↓
[Auth: Sign Up / Login]
  - Supabase Auth (email/password or social OAuth)
  - Analytics: "signup_complete"
    ↓
[Stripe Checkout]
  - Season unlock or bundle
  - Stripe webhook → grant access → record transaction
  - Analytics: "purchase_complete"
    ↓
[Continue Watching]
  - Full season access unlocked
  - Can post reactions + comments
  - Analytics: "engagement_post_purchase"
```

#### 3. Payment + Payout Flow

```
CONSUMER PAYMENT:
  Viewer clicks "Unlock Season" → Stripe Checkout Session created
    ↓
  Stripe processes payment (2.9% + 30c)
    ↓
  [Webhook: checkout.session.completed]
    ↓
  Server: create access record (user_id, season_id, purchased_at)
  Server: create transaction record (amount, fees, creator_share)
  Server: calculate revenue split (platform % + creator %)
    ↓
  Viewer immediately sees unlocked content

CREATOR PAYOUT:
  [Scheduled job or manual trigger]
    ↓
  Calculate accumulated creator earnings since last payout
    ↓
  Stripe Connect Transfer to creator's connected account
    ↓
  [Webhook: payout.paid]
    ↓
  Record payout in creator's payout history
  Send transactional email confirmation
```

#### 4. Analytics Pipeline Flow

```
CLIENT-SIDE:
  [Event occurs] → analytics tracker captures:
    - event_type (view, play, progress, complete, signup, purchase)
    - metadata (episode_id, series_id, creator_id, timestamp)
    - attribution (utm_source, utm_medium, utm_campaign, referrer)
    ↓
  Batched POST to /api/analytics/events (debounced, ~5s batches)

SERVER-SIDE:
  [API route] receives batch → validates → inserts to analytics_events table
    ↓
  [Materialized views / scheduled queries] aggregate:
    - Funnel metrics per series (views → watches → signups → purchases)
    - Attribution breakdown (which social platform drives conversions)
    - Creator dashboard metrics (daily/weekly/monthly)
    - Platform-level metrics (admin dashboard)
    ↓
  [Dashboard queries] read from materialized views for fast display
```

#### 5. Real-time Reactions + Comments Flow

```
POSTING:
  Viewer reacts/comments while watching
    ↓
  Client sends to Supabase Realtime Channel:
    {type: "reaction", emoji: "fire", timestamp_ms: 45200, episode_id: "abc"}
    ↓
  Supabase broadcasts to all subscribers on episode channel
    ↓
  Simultaneously: insert to reactions table (persisted for replay)

RECEIVING (live):
  Connected viewers receive broadcast → display on overlay

RECEIVING (accumulated replay):
  Player position updates → query accumulated reactions for current timestamp window
  Merge with any live reactions → deduplicate → display on overlay

COMMENT PERSISTENCE:
  Comments always persisted to DB (unlike ephemeral reactions)
  Timestamp-linked for replay: "this comment was posted at 1:23"
  Displayed in scrolling panel alongside video
```

#### 6. Social Media Integration Flow

```
OUTBOUND (share links):
  Platform generates smart share links with:
    - Open Graph metadata (thumbnail, title, hook text)
    - UTM parameters (source, medium, campaign)
    - Deep link to specific episode
    ↓
  Creator shares on social platforms

INBOUND (attribution):
  Viewer arrives with UTM params → captured in analytics
    ↓
  Attribution tracked through entire funnel
    ↓
  Creator dashboard shows: "TikTok ad → 500 views → 50 signups → 12 purchases"

AD CAMPAIGN DATA (future integration):
  Social platform APIs → pull campaign spend data
    ↓
  Match with platform conversion data
    ↓
  Creator sees: "Spent $100 on Meta → earned $300 on platform → 3x ROAS"
```

### State Management

```
SERVER STATE (source of truth):
  PostgreSQL (Supabase) → all persistent data
    ↓
  Server Components fetch directly (no API layer needed)
  Server Actions mutate directly (form submissions, CRUD)

CLIENT STATE:
  React state / hooks → UI-only state (modals, forms, player controls)
  Supabase Realtime subscriptions → live data (reactions, comments)

CACHE LAYER:
  Next.js fetch cache → server component data (ISR for series pages)
  React Query / SWR → client-side data fetching with stale-while-revalidate
  (Avoid complex client-side state management -- keep it simple)
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Monolith is perfect. Single Supabase project. Mux handles all video. No caching layer needed. Focus on product, not infra. |
| 1k-10k users | Add Redis/KV for session caching and rate limiting. Materialized views for analytics queries. Consider Vercel Edge Middleware for geo-routing. |
| 10k-100k users | Analytics events may need a dedicated table or external service (e.g., PostHog). Real-time channels need connection management. Consider read replicas for DB. |
| 100k+ users | Extract analytics to dedicated pipeline (ClickHouse or similar). Consider breaking real-time into dedicated service. Evaluate Mux costs vs. self-hosted transcoding. Multiple Supabase projects or migrate to self-hosted PostgreSQL. |

### Scaling Priorities

1. **First bottleneck: Database queries for analytics.** The analytics_events table will grow fastest. Mitigation: Use materialized views from day one, partition by month, and plan to extract to a dedicated analytics store when query times degrade.

2. **Second bottleneck: Real-time connections.** Each viewer watching an episode opens a WebSocket connection. Supabase Realtime has connection limits per project. Mitigation: Disconnect when viewer leaves episode page, implement connection pooling, and monitor connection counts. Supabase's free tier supports 200 concurrent connections; paid plans scale higher.

3. **Third bottleneck: Video costs.** Mux charges per minute of video delivered. As viewership grows, this becomes the largest line item. Mitigation: Use Mux's "basic" playback policy for free episodes (lower cost), monitor delivery minutes, and evaluate self-hosted CDN only when costs justify the engineering investment.

4. **Fourth bottleneck: Build/deploy times.** As the monolith grows, Next.js build times increase. Mitigation: Use ISR (Incremental Static Regeneration) instead of full SSG for content pages. Consider Turborepo if the project needs a monorepo structure.

## Anti-Patterns

### Anti-Pattern 1: Building Your Own Video Pipeline

**What people do:** Set up FFmpeg on a server, write custom HLS segmentation, manage S3 buckets for video chunks, configure CloudFront distributions, handle adaptive bitrate logic manually.

**Why it's wrong:** This is months of engineering work with ongoing maintenance. Video encoding is a solved problem with commodity APIs. Every hour spent on video infra is an hour not spent on the creator marketplace, which is the actual product differentiator.

**Do this instead:** Use Mux (or Cloudflare Stream, or similar). Upload via their API, get HLS streams back. Store only asset IDs in your database. The managed service costs more per-minute than self-hosted at scale, but the engineering time saved is worth 10x the cost for a small team.

### Anti-Pattern 2: Premature Microservices

**What people do:** Create separate services for auth, video, payments, analytics, real-time, etc. from day one, with message queues between them, separate databases, and individual deployment pipelines.

**Why it's wrong:** For a small team, the operational overhead of managing 5-10 services, their networking, their observability, and their deployment pipelines will consume more engineering time than building features. Amazon Prime Video moved back to a monolith and reduced costs by 90%.

**Do this instead:** Build a modular monolith. Organize code into domain modules with clear interfaces. When a specific module becomes a bottleneck (analytics at scale, real-time at high concurrency), extract just that module into a separate service. This is cheaper, faster, and reversible.

### Anti-Pattern 3: Client-Side Heavy Architecture

**What people do:** Build the entire app as a SPA with client-side routing, fetch all data via REST APIs, and manage global state with Redux or similar.

**Why it's wrong:** Destroys SEO (series pages need to be indexable), increases JavaScript bundle size, requires a separate API layer, and misses Next.js's biggest strengths (Server Components, server actions, streaming SSR).

**Do this instead:** Default to Server Components. Use Server Actions for mutations. Only use Client Components where browser interactivity is required (player, reactions, forms). This reduces code, improves SEO, and keeps sensitive logic server-side.

### Anti-Pattern 4: Polling for Real-time Data

**What people do:** Use setInterval to poll an API endpoint every 2-5 seconds for new reactions and comments.

**Why it's wrong:** Wastes bandwidth, creates unnecessary server load, and introduces visible latency in the "real-time" experience. With 1000 viewers polling every 2 seconds, that is 500 requests/second for data that may not have changed.

**Do this instead:** Use Supabase Realtime (WebSocket) for live data. The server pushes updates to connected clients only when data changes. Zero wasted requests, sub-100ms latency.

### Anti-Pattern 5: Storing Videos in Your Database or Application Storage

**What people do:** Upload video files to the application server or store them in the database as BLOBs.

**Why it's wrong:** Video files are large (a 3-minute vertical video at 1080p is 100-500MB). This overwhelms application storage, makes backups enormous, and provides no CDN delivery, adaptive bitrate, or transcoding.

**Do this instead:** Videos go directly from the browser to Mux (direct upload). Your database stores only metadata and Mux IDs. Viewers stream from Mux's CDN. Your application never touches the video binary.

## Integration Points

### External Services

| Service | Integration Pattern | Purpose | Notes |
|---------|---------------------|---------|-------|
| **Mux** | REST API + webhooks + React component | Video upload, transcoding, CDN delivery, playback | Direct upload from browser; webhook for status; MuxPlayer component for playback. Auto-generates captions in 20+ languages. |
| **Stripe** | REST API + webhooks + Checkout | Consumer payments + creator payouts | Checkout Sessions for purchases; Connect for creator payouts; webhook for all state changes. Use test mode extensively. |
| **Stripe Connect** | Connect Onboarding + Transfers | Creator payout accounts | Creators complete Connect onboarding (KYC). Platform creates Transfers to connected accounts. Express accounts recommended for simplest UX. |
| **Supabase** | Client SDK + Realtime subscriptions + Auth | Database, auth, real-time | Single service for PostgreSQL, authentication, and real-time WebSockets. Reduces vendor count significantly. |
| **fal.ai** | REST API (async) | AI thumbnail generation | Submit generation request, poll for result or use webhook callback. Store resulting image URL. |
| **Whisper API** | REST API (async) | Auto-subtitling | Extract audio from video (Mux can provide audio track URL), send to Whisper, receive timestamped transcription, convert to WebVTT. |
| **Meta Marketing API** | REST API + OAuth | Ad campaign data, conversion tracking | Requires app review. Pull campaign spend, impressions, clicks. Match with platform conversions via UTM params. |
| **TikTok Marketing API** | REST API + OAuth | Ad campaign data | Similar to Meta. Pull campaign metrics. TikTok Pixel for conversion tracking on-site. |
| **YouTube Data API** | REST API + OAuth | Channel data, campaign tracking | Less direct ad integration; primarily for content cross-promotion tracking. |
| **X/Twitter API** | REST API + OAuth | Share tracking, campaign data | API access tiers have changed significantly; evaluate cost/benefit for v1. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Content module ↔ Payment module | Via shared DB (user access records) | Payment module grants access; content module checks access before serving locked episodes. |
| Content module ↔ AI module | Via job queue (DB-backed) | Content creation triggers AI jobs (subtitles, thumbnails). AI module updates content records on completion. |
| Analytics module ↔ All modules | Write-only from all modules → analytics | All modules emit events. Analytics module consumes and aggregates. No module reads from analytics except dashboards. |
| Realtime module ↔ Content module | Content provides episode context; realtime handles live data | Realtime channels keyed by episode_id. Content module provides metadata (episode duration, timestamps). |
| Auth module ↔ All modules | Middleware provides user context | Auth middleware attaches user/role to request. All modules check permissions via shared utility. |

## Build Order Implications

The architecture has clear dependency chains that inform the build order:

### Layer 0: Foundation (must come first)
- **Database schema** -- everything depends on the data model
- **Authentication** -- most features need user context
- **Next.js app shell** -- routing, layouts, middleware

### Layer 1: Core Content (depends on Layer 0)
- **Content management** (series/season/episode CRUD) -- the core data model
- **Mux integration** (upload + playback) -- the core viewing experience
- **Video player** (MuxPlayer + custom UI) -- how users consume content

### Layer 2: Monetization (depends on Layers 0-1)
- **Stripe payments** (season unlocks) -- requires content to exist to unlock
- **Stripe Connect** (creator payouts) -- requires payment flow to exist
- **Access control** (free vs. locked episodes) -- requires both content and payments

### Layer 3: Engagement (depends on Layers 0-1)
- **Real-time reactions** -- requires player and episodes to exist
- **Comments system** -- requires auth and episodes
- **Creator dashboard** -- requires content management

### Layer 4: Intelligence (depends on Layers 0-3)
- **Analytics pipeline** -- requires all user actions to exist first
- **Social media integrations** -- requires analytics to be meaningful
- **AI processing** (subtitles, thumbnails) -- enhances existing content

### Layer 5: Polish (depends on everything)
- **SEO optimization** -- requires content pages to exist
- **PWA features** -- requires app to be functional
- **Admin panel** -- requires all systems to be manageable
- **Mock data seeding** -- requires all data models to be finalized
- **Pitch pages** -- requires platform to be demoable

### Key dependency insight:
The mock data seeding system and pitch pages depend on nearly everything else being built. Since the platform must look "alive" for pitching, the seeding system should be built alongside features (not after) -- each module should include its seed data as it is built.

## Sources

- [VPlayed: How to Make a Vertical Format Micro-Drama Short Video App](https://www.vplayed.com/blog/create-vertical-micro-drama-streaming-app/)
- [Mux: Video Streaming API Guide](https://www.mux.com/articles/video-streaming-api-how-to-build-live-and-on-demand-video-into-your-app)
- [Mux: Next.js Integration](https://www.mux.com/docs/integrations/next-js)
- [Mux: Adding Video to Next.js](https://www.mux.com/articles/adding-video-to-your-next-js-application)
- [Bento: Serverless Video Transcoding Case Study](https://bento-video.github.io/)
- [Inngest: Event Driven Video Processing with Next.js](https://www.inngest.com/blog/nextjs-trpc-inngest)
- [System Design Handbook: Design Live Comment System](https://www.systemdesignhandbook.com/guides/design-live-comment-system/)
- [Stripe: Build a Marketplace](https://docs.stripe.com/connect/end-to-end-marketplace)
- [Stripe: Platforms and Marketplaces with Connect](https://docs.stripe.com/connect)
- [Silversky: Production-Ready Stripe Connect Payment Flow](https://medium.com/@silverskytechnology/designing-a-production-ready-stripe-connect-payment-flow-for-marketplaces-2dcd538dfeba)
- [Supabase: Realtime Architecture](https://supabase.com/docs/guides/realtime/architecture)
- [Supabase: Realtime with Next.js](https://supabase.com/docs/guides/realtime/realtime-with-nextjs)
- [fal.ai: Generative Media Integration Guide](https://fal.ai/learn/biz/gen-ai-integration-guide)
- [fal.ai: Building Effective Gen AI Architectures](https://fal.ai/learn/devs/building-effective-gen-ai-model-architectures)
- [web.dev: PWA with Offline Streaming](https://web.dev/articles/pwa-with-offline-streaming)
- [web.dev: ZDF Video PWA Case Study](https://web.dev/zdf/)
- [Nexar: Application Architecture for Next.js App Router](https://www.flsilva.com/blog/nexar-application-architecture-for-nextjs-app-router-apps)
- [SoftwareMill: Modern Full Stack Architecture Using Next.js 15+](https://softwaremill.com/modern-full-stack-application-architecture-using-next-js-15/)
- [Amazon Prime Video Monolith Case Study](https://blog.container-solutions.com/reflections-on-amazon-prime-videos-monolith-move)
- [Netflix: Rebuilding Video Processing Pipeline](https://netflixtechblog.com/rebuilding-netflix-video-processing-pipeline-with-microservices-4e5e6310e359)
- [GeeksforGeeks: Database Design for Video Streaming](https://www.geeksforgeeks.org/sql/how-to-design-a-database-for-video-streaming-service/)

---
*Architecture research for: Microshort video platform with creator marketplace*
*Researched: 2026-02-14*
