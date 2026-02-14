# Project Research Summary

**Project:** MicroShort
**Domain:** Freemium microshort video platform with creator marketplace
**Researched:** 2026-02-14
**Confidence:** MEDIUM-HIGH

## Executive Summary

MicroShort is a freemium, web-first (PWA) platform for serialized premium short-form video (1-3 minute episodes), monetized through per-season unlocks and distributed via a curated creator marketplace. The vertical micro-drama market is exploding -- ReelShort alone hit $214M revenue in 2024 and is tracking toward $400M. However, every successful player in this space uses native apps, per-episode coin systems, and studio-produced content. MicroShort deliberately diverges on all three axes: PWA delivery (avoiding the 30% app store tax), per-season pricing (simpler than per-episode coins), and a curated creator marketplace (open to vetted independents, not just studios). This combination is genuinely novel, which means there is no direct precedent to validate it -- but each individual element has strong precedent in adjacent markets (Patreon for creator marketplaces, Webtoon for per-content pricing, PWAs for web-first media).

The recommended approach is a modular monolith built on Next.js 16 (App Router) with Supabase as the unified backend (PostgreSQL + Auth + Realtime), Mux for managed video infrastructure, and Stripe for payments and creator payouts via Connect. This stack is high-confidence -- every component has mature Next.js integrations, and the "buy, don't build" approach to video infrastructure is critical for a small team. The architecture follows a clear layered dependency chain: database schema and auth first, then content management and video player, then payments and access control, then engagement and analytics features. Mock data seeding should be treated as a first-class concern built alongside each module, not bolted on afterward, because the platform must look alive for investor and creator pitches.

The key risks are threefold. First, the Quibi Trap: building a beautiful platform with no distribution engine. Social sharing with rich link previews and at least one real ad-to-payment funnel test must happen in Phase 1, not after launch. Second, iOS PWA video playback has a known WebKit bug where videos freeze after backgrounding -- this must be solved in the initial player implementation with blob URL workarounds and visibilitychange listeners, tested on physical iPhones. Third, the chicken-and-egg marketplace problem: creators will not join without viewers, and viewers will not come without content. The mitigation is to lead with the founder's own content, gather real conversion data from paid social ads, and use that data (not mock data) to recruit launch partners.

## Key Findings

### Recommended Stack

The stack centers on a Next.js 16 / React 19 foundation with Supabase providing an all-in-one backend (PostgreSQL, authentication, real-time WebSockets, edge functions). Mux handles the entire video lifecycle from upload through CDN delivery, eliminating the need to build transcoding infrastructure. Stripe handles consumer payments and creator payouts via Connect. Tailwind CSS v4 with shadcn/ui provides the styling and component layer, with Motion (Framer Motion) for cinematic animations. All choices are high-confidence with verified official documentation.

**Core technologies:**
- **Next.js 16.1 (App Router)** -- full-stack React framework. Server Components reduce client JS by ~38%. Turbopack for fast builds. Server Actions eliminate API boilerplate for mutations.
- **Supabase (hosted)** -- PostgreSQL + Auth + Realtime + Storage in one service. Row Level Security for authorization. Realtime handles live reactions/comments at <100ms latency. Eliminates integrating 5+ separate backend services.
- **Mux** -- managed video encoding, HLS streaming, and CDN delivery. Self-optimizing encodings, built-in analytics. Launch plan $20/mo for $100 usage credit. Critical "buy, don't build" decision.
- **Stripe + Stripe Connect** -- consumer payments via Checkout, creator payouts via Connect Express accounts. Handles PCI compliance and 1099-K reporting.
- **Tailwind CSS v4 + shadcn/ui + Motion** -- CSS-first theming with Oxide engine (5x faster builds), copy-paste components on Radix primitives, hardware-accelerated animations.
- **Deepgram (Nova-3)** -- AI auto-subtitling at $0.0077/min with 0.2-0.3x real-time latency. Deferred to post-MVP.
- **fal.ai** -- AI thumbnail generation via FLUX.1 model for mock data seeding. Official Next.js integration.

**Critical version requirements:** Node.js 20.9.0+ (Node 18 dropped), React 19.2.x (required by Next.js 16), TypeScript 5.1.0+.

**Known compatibility issue:** Serwist (PWA service worker library) requires Webpack, but Next.js 16 defaults to Turbopack. Must configure `turbopack: false` for builds or use a manual service worker approach.

### Expected Features

**Must have (table stakes) -- the core watch-and-pay loop:**
- Vertical full-screen video player with adaptive bitrate streaming and preloading
- Automatic episode continuation (auto-play next episode for binge behavior)
- Free episode gateway (3 episodes, no account required) -- the funnel entry point
- User accounts (email + social OAuth, deferred until payment step)
- Per-season unlock with virtual currency/payment processing (Stripe Checkout)
- Series > Season > Episode content structure with genre browsing and search
- Watch history with resume ("Continue Watching" section)
- Subtitles/closed captions (burned-in acceptable for v1)
- Share functionality with Open Graph tags for rich social previews
- Basic creator profiles and minimal creator marketplace (application + manual review)
- Mobile-responsive PWA (installable, fast, service worker caching)

**Should have (differentiators) -- add after core validation (v1.x):**
- Push notifications for new episode alerts and re-engagement
- Creator analytics dashboard (full-funnel: impressions to conversions to revenue)
- Smart share links with deep linking and attribution tracking
- AI auto-subtitling as a creator tool (Deepgram integration with review workflow)
- Variable revenue split (2-3 defined tiers, not per-creator custom)
- Social user profiles (follow/unfollow, optional watch history sharing)

**Defer (v2+) -- requires scale to justify:**
- Live reactions with timestamp-synced accumulated replay (Bilibili-style danmaku)
- Community spaces with polls/voting
- Social media ad attribution dashboard (Meta, TikTok, YouTube API integrations)
- Episode-level engagement analytics (per-second retention curves)

**Anti-features (deliberately NOT building):**
- No algorithmic infinite scroll feed (breaks serialized narrative structure)
- No user-generated content / open uploads (destroys curation quality)
- No monthly subscription model (insufficient catalog, Quibi proved this fails)
- No live streaming (different infrastructure, different content type)
- No horizontal video support (vertical-only is the format)
- No DMs / private messaging (safety liability, not aligned with core loop)

### Architecture Approach

The architecture is a modular monolith -- a single Next.js application organized by business domains (content, payments, analytics, social, AI, users, admin) with clear module boundaries. All modules deploy together but maintain separation via explicit imports and interfaces. This mirrors Amazon Prime Video's successful move back from microservices to a monolith (90% cost reduction). Video infrastructure is fully delegated to Mux (upload, transcode, CDN, playback), eliminating the biggest infrastructure complexity. Webhook-driven async processing handles all external service state changes (Mux asset ready, Stripe payment complete, AI subtitle done). Real-time features use Supabase Realtime (WebSocket) with a dual-path system: live broadcast for concurrent viewers and accumulated replay of historical reactions from the database.

**Major components:**
1. **Vertical Video Player** -- MuxPlayer React component with custom overlay for reactions, comments, controls. The technical foundation everything else builds on.
2. **Content Management System** -- Series/Season/Episode CRUD, Mux upload integration, metadata management. Domain module with server actions.
3. **Payment + Access System** -- Stripe Checkout for season unlocks, Stripe Connect for creator payouts, access control checking free vs. locked episodes.
4. **Creator Dashboard** -- Series management, upload pipeline, analytics views, payout history. Server components for data, client components for interactivity.
5. **Real-time Layer** -- Supabase Realtime channels for live reactions (Broadcast), presence (who is watching), and persisted comments (Postgres Changes).
6. **Analytics Pipeline** -- Client-side event batching, server-side ingestion, materialized views for dashboard queries. The first scaling bottleneck to plan for.
7. **Admin Panel** -- Creator approvals, content moderation, featured curation, platform metrics. Role-gated middleware.

### Critical Pitfalls

1. **The Quibi Trap (no distribution engine)** -- Build social sharing with rich link previews in Phase 1. Run at least one real ad-to-payment funnel test before building the full platform. Distribution is the product, not an afterthought.

2. **iOS PWA video playback freezes after backgrounding** -- Known WebKit bug where video.play() fails after app resume. Use blob URLs instead of direct HTTP URLs (TikTok's workaround), add visibilitychange listeners for playback reset, test on physical iPhones installed as PWA. Must be solved in the first player build.

3. **Per-season payment friction compounds** -- Each season boundary is a churn point. Build bundle pricing from day one, implement saved payment methods and one-tap unlock, track Season 1 to Season 2 drop-off obsessively. Plan the subscription transition trigger point now.

4. **Chicken-and-egg marketplace failure** -- Lead with founder's own content and real conversion data. Target underserved creators (AI filmmakers, comedians with TikTok followings, indie studios). Start with 5-10 launch partners, not 50. Each success creates the next recruitment case study.

5. **Real-time reactions scale quadratically** -- 100 viewers each reacting once/second = 10,000 outgoing messages/second. Never broadcast individual reactions. Aggregate into 1-second time windows from day one. Defer live reactions entirely to Phase 2; Phase 1 uses pre-computed accumulated reactions only.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation + Core Content Loop
**Rationale:** Everything depends on the database schema, authentication, and content management. The video player is the technical foundation all engagement features build on. Architecture research identifies this as Layer 0 + Layer 1 -- nothing else can begin without it.
**Delivers:** Working video player with series/season/episode structure, user accounts, basic content management, Mux integration for upload and playback. Next.js app shell with route groups, layouts, middleware.
**Addresses:** T1 (video player), T2 (auto-continuation), T7 (auth), T15 (series/season structure), T10 (mobile-responsive)
**Avoids:** Pitfall 3 (iOS PWA video freeze -- solve blob URL workaround here), Pitfall 5 (video transcoding -- use Mux from day one)

### Phase 2: Monetization + Access Control
**Rationale:** The business model must be validated immediately after the core viewing experience works. Architecture Layer 2 (Monetization) depends on Layer 1 (Content) existing. Stripe Connect requires legal review of creator agreements before first external creator.
**Delivers:** Per-season unlock flow, Stripe Checkout integration, Stripe Connect for creator payouts, free vs. locked episode access control, bundle pricing, transaction records, revenue split logic.
**Addresses:** T4 (payments), T11 (payment processing), D1 (per-season unlock), D9 (variable revenue split -- define 2-3 tiers)
**Avoids:** Pitfall 2 (payment friction -- build bundles alongside per-season), Pitfall 7 (revenue split complexity -- use Stripe Connect, lock splits per transaction, legal review first)

### Phase 3: Discovery + Sharing + Pitch Readiness
**Rationale:** The platform must be discoverable and shareable before launch. Share links with rich previews are critical for the ad-to-viewer funnel -- the #1 growth channel. Mock data must be pitch-quality. This phase makes the platform demoable.
**Delivers:** Genre browsing, search, watch history, share links with OG tags, creator profiles, mock data seeding system, pitch pages, PWA installation.
**Addresses:** T5 (discovery), T6 (search), T8 (watch history), T16 (share), T12 (creator profiles), D10 (PWA), T14 (subtitles -- burned-in for v1)
**Avoids:** Pitfall 1 (Quibi Trap -- sharing baked in from this phase), Pitfall 10 (fake-looking mock data -- hand-curate descriptions, realistic view counts, manually select AI thumbnails)

### Phase 4: Creator Marketplace + Dashboard
**Rationale:** Cannot onboard external creators until the platform is functional and has real data. The marketplace is high-complexity (D2) and the key supply-side differentiator. Creator dashboard needs basic analytics even at launch.
**Delivers:** Creator application flow, manual approval process, content upload pipeline via Mux direct upload, basic creator analytics (views, revenue, watch-through rates), payout history.
**Addresses:** D2 (creator marketplace), D3 (creator analytics -- basic version), content ingestion flow
**Avoids:** Pitfall 4 (chicken-and-egg -- lead with founder's own content + real conversion data before recruiting)

### Phase 5: Engagement + Social Features
**Rationale:** Social features require the core loop to be validated and concurrent viewers to be meaningful. Architecture Layer 3 (Engagement) depends on Layers 0-2. Real-time reactions should use accumulated-only mode first, adding live broadcast later.
**Delivers:** Accumulated timestamp-synced reactions (pre-computed, no live WebSocket), comments system, push notifications, social user profiles, community spaces for top series.
**Addresses:** D5 (reactions -- accumulated only), D8 (social profiles), T9 (push notifications), D6 (community -- basic)
**Avoids:** Pitfall 8 (real-time scaling -- start with pre-computed accumulated reactions, not live broadcast)

### Phase 6: Intelligence + Analytics
**Rationale:** Analytics pipeline and AI features require all user actions to exist first (Architecture Layer 4). Social media API integrations are fragile and should be phased one platform at a time. AI subtitling needs a review workflow, not just a generate button.
**Delivers:** Full-funnel analytics dashboard for creators, smart share links with deep linking, AI auto-subtitling with creator review UI, episode-level engagement analytics, initial social media ad attribution (Meta first).
**Addresses:** D3 (full-funnel analytics), D7 (smart share links), D11 (AI auto-subtitling), D4 (ad attribution -- Meta only), D12 (episode analytics)
**Avoids:** Pitfall 6 (social API fragility -- one platform at a time, starting with Meta), Pitfall 9 (AI subtitle quality -- include editing UI, test on real content)

### Phase Ordering Rationale

- **Dependencies drive order:** The architecture has a clear layered dependency chain (schema > content > monetization > engagement > intelligence). Each phase builds on the prior, preventing rework.
- **Business validation gates:** Phase 2 (monetization) comes before Phase 3 (sharing/pitch) so the payment flow exists before running real ad campaigns. Phase 4 (creator marketplace) comes after Phase 3 (pitch readiness) so the platform looks alive before creator recruitment.
- **Risk front-loading:** The two highest-risk technical challenges (iOS PWA video playback, Stripe Connect payment flow) are in Phases 1 and 2 respectively. If either proves insurmountable, the team learns early.
- **Mock data alongside features:** Each phase should include seed data for its features. Do not defer all seeding to a single phase.
- **Real-time deferred intentionally:** Live WebSocket reactions are deferred to Phase 5 because they scale quadratically and are not needed until the platform has concurrent viewers. Phase 5 starts with accumulated (pre-computed) reactions only.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** iOS PWA video playback workarounds need hands-on prototyping and testing. Serwist vs. manual service worker approach for PWA needs validation against Turbopack.
- **Phase 2:** Stripe Connect Express account flows, cross-border payout restrictions, and creator agreement legal requirements need detailed research.
- **Phase 4:** Creator upload pipeline (Mux direct upload from browser, webhook handling for asset.ready) needs API-level research. Content moderation approach (hash-matching for compliance) needs vendor research.
- **Phase 6:** Meta Conversions API requires domain verification and app review -- start the approval process months before building. TikTok Content Posting API requires approved Content Marketing Partner status.

Phases with standard patterns (skip additional research):
- **Phase 3:** Genre browsing, search, watch history, OG tags, PWA manifest -- all well-documented Next.js patterns with abundant examples.
- **Phase 5:** Supabase Realtime for reactions and comments has extensive documentation (24K+ Context7 snippets). Push notifications on PWA are well-documented (with known iOS limitations).

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All core technologies verified via Context7 and official docs. Version compatibility confirmed. The only medium-confidence element is Serwist/Turbopack compatibility and Deepgram accuracy on non-ideal audio. |
| Features | MEDIUM-HIGH | Table stakes validated against ReelShort, DramaBox, and Quibi post-mortem analysis. Per-season pricing is genuinely untested in micro-drama (the riskiest differentiator). Feature dependencies are well-mapped. |
| Architecture | MEDIUM-HIGH | Modular monolith pattern strongly supported (Amazon Prime Video case study). Mux-delegated video pipeline is industry standard. Layered real-time (live + accumulated) is proven by Bilibili/NicoNico but needs custom implementation for emoji reactions. |
| Pitfalls | MEDIUM-HIGH | Quibi/Go90 failures well-documented. iOS PWA bug confirmed by Apple community reports. Marketplace chicken-and-egg is the #1 marketplace failure mode (NFX research). WebSocket scaling math is straightforward. Some pitfalls (AI subtitle quality on real content) based on pattern-matching, not direct experience. |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Per-season pricing validation:** No direct precedent in micro-drama. Every competitor uses per-episode or subscription. Must validate willingness-to-pay with real users before over-investing in the model. Run a pricing experiment with a single series early.
- **Serwist + Turbopack conflict:** Serwist requires Webpack but Next.js 16 defaults to Turbopack. Need to validate whether `turbopack: false` in next.config.js causes acceptable build time regression, or whether a manual service worker approach is better.
- **iOS PWA storage limits:** iOS limits PWA cache to ~50MB with 7-day expiry. For a video platform, this constrains offline capability. Need to determine what can realistically be cached (thumbnails, metadata) vs. what must always stream (video).
- **Stripe Connect cross-border payouts:** Connect has regional restrictions for transfers. If targeting creators outside US/CA/UK/EEA, need to research supported countries before making global creator marketplace promises.
- **X/Twitter API stability:** API pricing and access tiers remain unstable. LOW confidence on this integration. Recommend deprioritizing or dropping X integration unless access stabilizes.
- **Content moderation at scale:** Even with whitelisted creators, CSAM hash-matching may be legally required. PhotoDNA or similar integration needs vendor evaluation before first external creator upload goes live.
- **Deepgram vs. Whisper accuracy on real content:** Deepgram recommended for API convenience, but accuracy on content with background music, multiple speakers, and sound effects needs testing with actual MicroShort content samples.

## Sources

### Primary (HIGH confidence)
- Next.js 16 Upgrade Guide -- Context7 verified, version compatibility confirmed
- Supabase Realtime Documentation -- Context7, 24K+ code snippets
- Tailwind CSS v4 Official Blog -- CSS-first config, Oxide engine performance
- Mux Pricing and Next.js Integration -- official docs
- Stripe Connect Marketplace Documentation -- official docs
- Zod v4 / shadcn/ui / Motion -- official docs, all verified
- React 19.2 Release -- official docs
- Quibi / Go90 Post-Mortems (Failory, How They Grow) -- detailed failure analysis
- Deloitte 2026 TMT Predictions -- market sizing, monetization model analysis
- NFX Marketplace Tactics -- chicken-and-egg bootstrapping strategies
- Amazon Prime Video Monolith Case Study -- architecture pattern validation

### Secondary (MEDIUM confidence)
- ReelShort / DramaBox feature comparisons (YourAppLand, Rolling Stone)
- Deepgram pricing and accuracy benchmarks (WebSearch, multiple sources)
- PWA on iOS limitations 2025 (Brainhub)
- Webtoon monetization changes 2026 (K Comics Beat)
- WebSocket scaling patterns (Ably, VideoSDK)
- Creator economy revenue split benchmarks (Fundmates)
- Stripe + Next.js 15 integration guide (Pedro Alonso blog)

### Tertiary (LOW confidence)
- X/Twitter API pricing and access stability -- changes frequently, needs re-verification
- Serwist compatibility with Next.js 16 Turbopack -- official docs note conflict, no resolution documented
- TikTok Content Posting API access requirements -- requires partner approval, timelines unknown

---
*Research completed: 2026-02-14*
*Ready for roadmap: yes*
