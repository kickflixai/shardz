# Feature Research

**Domain:** Freemium microshort video platform (serialized premium short-form content with per-season monetization)
**Researched:** 2026-02-14
**Confidence:** MEDIUM-HIGH

Sources span Deloitte 2026 TMT predictions, competitor analysis of ReelShort/DramaBox/GoodShort, Quibi post-mortem analysis, Webtoon/Patreon monetization models, Bilibili danmaku systems, and market data from Variety/Rolling Stone/Hollywood Reporter coverage of the vertical drama market.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or unusable.

| # | Feature | Why Expected | Complexity | Notes |
|---|---------|--------------|------------|-------|
| T1 | **Vertical full-screen video player** | Every micro-drama app (ReelShort, DramaBox, GoodShort) uses vertical video. Users hold phones vertically. This is the format. | MEDIUM | Must support adaptive bitrate streaming, preloading of next episodes, and instant playback. Quality-of-experience (buffering, time-to-first-frame) is the #1 retention driver. |
| T2 | **Automatic episode continuation** | Users binge. Every competitor auto-plays the next episode. Forcing manual navigation to next episode breaks immersion and kills retention. | LOW | Seamless transition between episodes. ReelShort and DramaBox both auto-advance. Consider countdown timer with "next episode" preview. |
| T3 | **Free episode gateway (freemium hook)** | Industry standard: ReelShort offers 3-5 free episodes, DramaBox offers more. Deloitte 2026: "Watch the first few episodes for free, but then they need to pay." Without free content, there is no funnel. | LOW | MicroShort spec says 3 free episodes without account. This is in line with market. Consider A/B testing 3 vs 5 free episodes for optimal conversion. |
| T4 | **Virtual currency / coin system for payments** | ReelShort (71% of views via single-episode payment using coins), DramaBox, and every major micro-drama app uses virtual currency. Users expect coins, not raw dollar amounts per episode. | MEDIUM | Coin bundles ($0.99-$99.99 typical range). Must handle: purchase, balance display, spend confirmation, refund edge cases. MicroShort uses per-season unlock instead of per-episode -- this is a deliberate differentiator (see D2), but a coin/credit system is still expected as the payment mechanism. |
| T5 | **Content discovery / browse by genre** | Every video platform has genre categories. Without browsing, users only find content through external links. DramaBox praised for "clean, organized UI; better content discovery." | MEDIUM | Genre taxonomy, trending/popular sections, new arrivals. MicroShort spec includes genre categories. Must be well-organized from day one -- DramaBox wins over ReelShort on this. |
| T6 | **Search functionality** | Users want to find specific series, creators, or genres. Basic expectation for any content platform. | LOW | Title search, creator search, genre filter. Can start simple (text match) and add faceted search later. |
| T7 | **User accounts and authentication** | Required for purchases, watch history, favorites. MicroShort spec allows 3 free eps without account, but payment requires it. Every competitor requires accounts for purchases. | MEDIUM | Email + social auth (Google, Apple). Account creation should be deferred (not required for free content) to minimize friction. This is the proven pattern. |
| T8 | **Watch history and progress tracking** | Users must return to where they left off. Losing progress in a serialized show is a dealbreaker. DramaBox and ReelShort both track progress. | LOW | Per-series episode progress, resume from timestamp within episode, "Continue Watching" section on home page. |
| T9 | **Push notifications** | ReelShort and DramaBox both use notifications for new episodes, daily rewards, and re-engagement. Deloitte: "Releasing episodes daily at consistent times builds habitual consumption." Notifications drive appointment viewing. | MEDIUM | New episode alerts, series updates, re-engagement nudges. On PWA: push notifications supported on Android and iOS (Safari 16.4+), but iOS requires home screen installation. This is a known PWA limitation. |
| T10 | **Mobile-responsive design** | Content is mobile-first. 90%+ of micro-drama consumption is on mobile. If the experience is not optimized for mobile, users leave immediately. | MEDIUM | MicroShort is PWA-based. Must feel native. Fast load times, touch-optimized controls, offline-awareness. |
| T11 | **Payment processing** | Users need to buy content. Must support major payment methods. In-app purchases dominate on native apps; web payments needed for PWA. | HIGH | Stripe or similar for web payments. PWA avoids the 30% app store tax -- this is a significant business advantage. Must handle: card payments, Apple Pay, Google Pay. Consider regional payment methods for international expansion. |
| T12 | **Basic creator profiles** | Viewers want to know who made the content and browse their other work. MicroShort spec includes creator profiles with follower counts. Every content platform has this. | LOW | Name, avatar, bio, follower count, series list. Links to social media. |
| T13 | **Content rating / age gating** | Legal requirement for content platforms. Many micro-dramas contain mature themes (romance, violence). Absence creates legal liability. | LOW | Age verification gate, content ratings per series, parental controls consideration. |
| T14 | **Subtitles / closed captions** | Accessibility requirement. 80%+ of mobile video is watched without sound in public contexts. Videos with captions shared 15% more. MicroShort spec includes AI auto-subtitling. | MEDIUM | Burned-in or togglable captions. AI auto-generation is the baseline now (Whisper-based ASR is commodity). Multi-language subtitles needed for international content. |
| T15 | **Series and season structure** | Content is organized as Series > Seasons > Episodes. This is MicroShort's core content model. ReelShort organizes by series; season structure adds a layer. Users expect clear navigation. | LOW | Clear hierarchy in UI. Season selector, episode list with locked/unlocked states, progress indicators per season. |
| T16 | **Share functionality** | Basic sharing to social media. If users cannot share content they enjoy, organic growth is crippled. Quibi famously launched without screenshot/sharing capability -- cited as a key failure factor. | LOW | Share buttons generating links to specific series/episodes. MicroShort spec includes "smart share links." At minimum: copy link, share to major platforms. OG meta tags for rich previews. |

### Differentiators (Competitive Advantage)

Features that set MicroShort apart. Not universally expected, but create real value when present.

| # | Feature | Value Proposition | Complexity | Notes |
|---|---------|-------------------|------------|-------|
| D1 | **Per-season unlock (not per-episode)** | ReelShort/DramaBox charge per-episode ($0.36-$1.11 each), making full series cost $20-$40. MicroShort's per-season pricing is simpler, more predictable, and feels fairer. This aligns with Webtoon's move away from nickel-and-dime Daily Pass toward clearer pricing. Season pricing reduces purchase friction (one decision vs. 60+ decisions) and increases perceived value. | MEDIUM | Creator sets pricing per season. Must clearly communicate what's included. Risk: if pricing too high per-season, conversion drops. Need pricing guidance/guardrails for creators. Consider showing per-episode effective price to anchor value. |
| D2 | **Creator marketplace with application-based whitelisting** | Most micro-drama platforms (ReelShort, DramaBox) are studio-driven with centralized content production. A curated marketplace where independent creators apply, get vetted, and publish creates a supply-side moat. Patreon proved creator-economy platforms work; TikTok Creator Marketplace proved application/whitelisting models work. This is MicroShort's supply-side strategy. | HIGH | Application flow, review/approval process, creator onboarding, content upload pipeline, quality standards enforcement. Must balance curation rigor with creator acquisition speed. Start manually, automate later. |
| D3 | **Full-funnel analytics for creators** | YouTube offers analytics dashboards. Most micro-drama apps offer creators almost nothing -- they are studio platforms, not creator platforms. Giving creators impression-to-conversion funnel data (views, watch-through rates, purchase conversion, revenue) is a strong creator retention tool. | HIGH | Requires event tracking infrastructure from day one. Metrics: impressions, click-through, free episode completions, account creation conversion, purchase conversion, retention curves, revenue per series. Creator dashboard UI. |
| D4 | **Social media ad attribution** | Most micro-drama apps spend heavily on social ads (ReelShort's success is partly attributed to aggressive paid social). Giving creators visibility into which social channels drive their views and conversions is unique. No competitor offers this to individual creators. | HIGH | Requires UTM/attribution parameter tracking on share links, integration with ad pixel data, deferred deep linking (note: Firebase Dynamic Links shutting down Aug 2025 -- use Branch.io or custom solution). Complex but high-value for creators who promote their own content. |
| D5 | **Live reactions (real-time + accumulated timestamp-synced)** | Bilibili's danmaku system proves timestamp-synced comments create powerful social viewing. No Western micro-drama app offers this. Combining real-time reactions (while watching) with accumulated timestamp-synced reactions (seeing what past viewers reacted to at each moment) creates a "watching together" feeling even for on-demand content. Netflix recently added live voting for live events. | HIGH | Two systems: (1) real-time WebSocket layer for simultaneous viewers, (2) stored timestamp-indexed reaction database for accumulated display. Must handle: reaction types (emoji, short text), display density management (Bilibili lets users filter/toggle), spoiler prevention for unwatched episodes. This is genuinely novel for Western micro-drama. |
| D6 | **Community spaces with polls/voting** | Netflix launched real-time voting (Jan 2026). YouTube has Community tab. But no micro-drama platform has series-specific community spaces. Polls and voting let creators gauge audience interest ("which character should return?") and increase engagement between episodes. Deloitte: successful creators "interact with viewers through comments and adapt subsequent episodes based on fan feedback." | MEDIUM | Per-series community space, creator-posted polls, voting mechanisms, basic discussion threads. Can start simple (polls + announcements) and expand. |
| D7 | **Smart share links with deep linking** | Most competitors generate basic links. Smart links that carry attribution data, render rich social previews (OG tags with episode artwork/trailer), and deep-link directly to the content (or to the right onboarding flow for new users) significantly improve viral coefficient. Each platform (Twitter, Facebook, WhatsApp, iMessage) parses previews differently -- need to handle all. | MEDIUM | Server-side rendered OG tags (social crawlers do not execute JavaScript), dynamic preview images per series/episode, deferred deep linking for users who need to install/sign up first, UTM parameter passthrough. Ties directly into D4 (attribution). |
| D8 | **Social user profiles** | Beyond basic profiles (T12), social profiles with watch history visibility, favorite series, public activity create a social layer. Follows, followers, and activity feeds turn isolated viewers into a community. Most micro-drama apps have zero social features -- DramaBox and ReelShort have no commenting, sharing, or community features at all. | MEDIUM | Public profile pages, follow/unfollow, activity visibility settings (privacy controls essential), optional watch history sharing. Builds network effects but must avoid creepy over-sharing. |
| D9 | **Variable revenue split** | Most platforms use fixed splits (YouTube: 55/45; TikTok varies). MicroShort's variable split lets the platform incentivize behaviors -- higher splits for exclusive content, top performers, or early adopters. Patreon charges 5-12% depending on plan tier. This is a competitive lever for creator recruitment. | LOW | Business logic, not complex technically. Must be transparent. Consider tiered system: base split, bonuses for exclusivity, volume thresholds. Creator dashboard must clearly show earnings and split details. |
| D10 | **PWA (Progressive Web App) delivery** | Avoids 30% app store commission on payments. Reduces friction (no install required for first visit). Webtoon, Patreon, and others have web-first experiences. However, PWA has iOS limitations (storage, background sync, install UX). The 30% commission savings alone is a major business differentiator. | HIGH | PWA with service workers, web app manifest, offline awareness. iOS Safari limitations: 50MB cache limit, no background sync, push notifications require home screen install. Must feel native despite being web. Consider native app wrapper (TWA for Android) as a complement, not replacement. |
| D11 | **AI auto-subtitling** | While subtitles are table stakes (T14), AI-generated subtitles as a creator tool (upload video, get subtitles automatically) reduces creator burden and standardizes quality. Whisper-based ASR is now commodity technology. Multi-language auto-translation extends content reach internationally. | MEDIUM | Speech-to-text pipeline (OpenAI Whisper or equivalent), timing synchronization, creator review/edit workflow, multi-language translation layer. The subtitling itself is solved technology; the workflow integration is the value-add. |
| D12 | **Episode-level engagement analytics** | Beyond series-level stats, showing creators exactly where in each episode viewers drop off, rewatch, or react most lets them improve their craft. Inspired by YouTube's retention curve feature. No micro-drama platform offers this granularity to creators. | HIGH | Requires per-second playback event tracking, aggregation pipeline, visualization (retention curve charts). Heavy data infrastructure but extremely valuable for creator retention on the platform. |

### Anti-Features (Deliberately NOT Building)

Features that seem appealing but create problems for MicroShort's specific model.

| # | Feature | Why Requested | Why Problematic | Alternative |
|---|---------|---------------|-----------------|-------------|
| A1 | **Algorithmic infinite scroll feed (TikTok-style)** | TikTok's success makes everyone want an algorithm-driven feed. Seems like the obvious model for short video. | MicroShort is serialized premium content, not UGC. An infinite scroll feed treats episodes as interchangeable clips, breaking narrative structure. It undermines per-season monetization by encouraging sampling over commitment. Quibi failed partly because content "felt like feature-length movies arbitrarily cut into 10-minute chunks" -- random algorithmic serving would make this worse. | Curated discovery (genre browse, editorial picks, trending series, personalized recommendations based on watch history). Help users find series to commit to, not clips to scroll past. |
| A2 | **User-generated content / open uploads** | Democratizing content creation seems like a natural extension. "Let anyone upload." | Destroys curation quality that justifies premium pricing. Creates massive moderation burden. Dilutes the creator marketplace value proposition. ReelShort/DramaBox succeed with studio-quality curated content, not UGC. MicroShort's application-based whitelisting exists specifically to prevent this. | Keep the curated marketplace. Quality over quantity. The application process IS the feature. |
| A3 | **Monthly subscription (Netflix-style all-access)** | Subscription models are familiar. "Just charge $9.99/month for everything." | Undermines the per-season creator pricing model. Requires a massive content library to justify (Netflix has 17,000+ titles). With limited initial catalog, subscription feels empty. Quibi's $4.99-$7.99/month subscription was a key failure factor -- users saw it as too expensive for short-form content when free alternatives existed. Webtoon abandoned daily-pass in favor of clearer per-content pricing for the same reason. | Per-season pricing with free episode gateway. Users pay for what they want, not a blanket subscription. Consider "bundle" discounts for multiple seasons of the same series as the catalog grows. |
| A4 | **Real-time live streaming** | Twitch and YouTube Live are successful. "Creators should go live." | Completely different infrastructure (live encoding, CDN, real-time chat at scale). Different content type from scripted series. Splits engineering focus. Does not align with MicroShort's core value proposition of premium serialized micro-content. | Community spaces (D6) for creator-viewer interaction. Pre-recorded Q&A or behind-the-scenes episodes. Live interaction through polls and voting, not live video. |
| A5 | **Horizontal video support** | "Some creators shoot horizontally." Desktop users might want widescreen. | Micro-drama is a vertical-first format. Supporting horizontal splits the player experience, complicates the UI, and dilutes the mobile-first brand. ReelShort and DramaBox are vertical-only. Quibi tried "Turnstyle" (rotate phone for different camera angle) and it was more gimmick than feature. | Vertical only. This is a format constraint, not a limitation. Enforce it in creator guidelines and upload requirements. |
| A6 | **Download for offline viewing** | Users want to watch on planes, subways without signal. Netflix, YouTube Premium offer this. | PWA storage limitations (especially iOS: 50MB cache, 7-day expiry). Offline DRM is extremely complex for web. Creates piracy surface area for premium content. Native apps can do this; PWAs realistically cannot at the required quality level. | Aggressive preloading of next 2-3 episodes while watching (within storage limits). If offline viewing becomes a top user request, that is the trigger to build a native app wrapper. |
| A7 | **Tipping / donations** | Twitch and YouTube Super Chat are popular. "Let viewers tip creators." | Undermines per-season pricing model. Creates a parasocial dynamic that does not match scripted content consumption (tipping makes sense for live streamers who acknowledge you, not for pre-recorded series). Regulatory complexity (money transmission laws). | Per-season purchases already compensate creators. Consider "support this creator" callout linking to their next series. Revenue split transparency shows creators they are fairly compensated. |
| A8 | **DM / private messaging between users** | "Social platforms need messaging." | Massive moderation and safety liability. Not aligned with content consumption core loop. Creates an entirely separate product surface area (trust & safety, spam, abuse reporting, CSAM detection). Discord, Telegram, WhatsApp already exist. | Link to external communities (Discord, etc.) from series community spaces. Keep social features public and community-oriented, not private. |
| A9 | **Cryptocurrency / NFT integration** | "Web3 for creators." Blockchain-based ownership, NFT collectibles. | Technology adds friction, not value, for mainstream users. Crypto payment adoption is tiny. NFTs have negative brand association with most consumer audiences in 2026. Regulatory uncertainty. | Standard payment processing (Stripe). Virtual currency (coins) provides the abstraction layer already. If crypto demand materializes from creator segment, add as optional payment method only. |
| A10 | **Desktop-optimized experience** | "We need a web app that works great on desktop too." | 90%+ of micro-drama consumption is mobile. Desktop optimization spreads engineering thin for <10% of usage. Vertical video on desktop looks odd without significant UI adaptation. | Functional on desktop (video plays, purchases work) but not optimized. Mobile-first, always. Desktop parity is a v2+ consideration if analytics show meaningful desktop traffic. |

## Feature Dependencies

```
[T7 User Accounts]
    |--required-by--> [T4 Virtual Currency / Payments]
    |                      |--required-by--> [D1 Per-Season Unlock]
    |                      |--required-by--> [T11 Payment Processing]
    |--required-by--> [T8 Watch History]
    |--required-by--> [D8 Social User Profiles]
    |--required-by--> [T9 Push Notifications]

[T1 Vertical Video Player]
    |--required-by--> [T2 Auto Episode Continuation]
    |--required-by--> [T14 Subtitles]
    |--required-by--> [D5 Live Reactions / Timestamp-Synced]
    |--required-by--> [D12 Episode-Level Engagement Analytics]

[T15 Series/Season Structure]
    |--required-by--> [D1 Per-Season Unlock]
    |--required-by--> [T3 Free Episode Gateway]
    |--required-by--> [D6 Community Spaces]

[T12 Creator Profiles]
    |--required-by--> [D2 Creator Marketplace]
    |--required-by--> [D3 Full-Funnel Analytics (creator-facing)]
    |--required-by--> [D9 Variable Revenue Split]

[T16 Share Functionality]
    |--required-by--> [D7 Smart Share Links]
    |--required-by--> [D4 Social Media Ad Attribution]

[D7 Smart Share Links]
    |--enhances--> [D4 Social Media Ad Attribution]

[D3 Full-Funnel Analytics]
    |--enhances--> [D4 Social Media Ad Attribution]
    |--enhances--> [D12 Episode-Level Engagement Analytics]

[D5 Live Reactions]
    |--enhances--> [D6 Community Spaces]

[D11 AI Auto-Subtitling]
    |--enhances--> [T14 Subtitles]
    |--enhances--> [D2 Creator Marketplace (lowers creator barrier)]

[T10 Mobile-Responsive Design]
    |--enhances--> [D10 PWA Delivery]
```

### Dependency Notes

- **T7 (User Accounts) is the critical gate:** Nearly everything requiring state -- purchases, history, social features, notifications -- depends on accounts. But accounts must NOT be required for the free content gateway (T3), which is pre-account by design.
- **T1 (Video Player) is the technical foundation:** The player quality determines whether everything built on top of it (reactions, analytics, subtitles) works well. Invest heavily here.
- **D7 (Smart Share Links) feeds D4 (Attribution):** Attribution only works if share links carry trackable parameters. Build share links with attribution baked in from the start, not bolted on later.
- **D2 (Creator Marketplace) is high complexity and gating:** Without creators and content, there is no platform. The marketplace approval flow, content upload pipeline, and creator onboarding must be operational before any consumer features matter.
- **D5 (Live Reactions) conflicts with simplicity:** This is a complex real-time system that should not be built until the core watch-and-pay loop is validated. It enhances D6 (Community) but is not required by it.

## MVP Definition

### Launch With (v1)

Minimum viable product -- what is needed to validate that users will pay for microshort serialized content via per-season pricing.

- [x] **T1 Vertical video player** -- Core experience. Must be fast, smooth, and reliable.
- [x] **T2 Auto episode continuation** -- Binge behavior is the retention driver.
- [x] **T3 Free episode gateway (3 eps, no account)** -- The funnel entry point. Without this, no users.
- [x] **T7 User accounts** -- Required for payments and retention.
- [x] **T4 Virtual currency + T11 Payment processing** -- The business model. Per-season purchase flow.
- [x] **T15 Series/season structure** -- Content organization backbone.
- [x] **D1 Per-season unlock** -- The core monetization differentiator.
- [x] **T5 Content discovery / genre browse** -- Users must find content.
- [x] **T6 Search** -- Basic series/genre search.
- [x] **T8 Watch history** -- "Continue watching" is essential for serialized content.
- [x] **T14 Subtitles** -- Accessibility baseline. Burned-in acceptable for v1.
- [x] **T16 Share functionality** -- Organic growth channel. At minimum: copy link with OG tags.
- [x] **T12 Basic creator profiles** -- Who made this content.
- [x] **D2 Creator marketplace (minimal)** -- Application form, manual review, content upload. Does not need to be self-service automated yet.
- [x] **T10 Mobile-responsive + D10 PWA basics** -- Installable, fast, service worker for caching.

### Add After Validation (v1.x)

Features to add once the core watch-and-pay loop is working and initial creators are onboarded.

- [ ] **T9 Push notifications** -- Trigger: users are watching but not returning for new episodes. Notifications drive appointment viewing.
- [ ] **D3 Full-funnel analytics (creator dashboard)** -- Trigger: creators asking "how is my content performing?" Early creators will ask immediately; have basic stats (views, revenue) at launch, expand to full funnel.
- [ ] **D7 Smart share links with deep linking** -- Trigger: share volume growing but conversion from share-to-viewer is poor. Upgrade basic links to deep-linked, attributed, rich-preview links.
- [ ] **D11 AI auto-subtitling** -- Trigger: creator onboarding bottleneck around subtitle creation. Reduces creator effort and speeds content pipeline.
- [ ] **D9 Variable revenue split** -- Trigger: need to recruit higher-profile creators. Use split incentives as a competitive lever.
- [ ] **D8 Social user profiles** -- Trigger: users expressing desire to see what friends watch, follow other viewers.
- [ ] **T13 Content rating / age gating** -- Trigger: content library expands to include mature themes requiring formal rating. For launch, manual content review suffices.

### Future Consideration (v2+)

Features to defer until product-market fit is established and the content library has grown.

- [ ] **D5 Live reactions (timestamp-synced)** -- Defer because: requires significant real-time infrastructure, only valuable with concurrent viewers (needs scale), and the core value proposition does not depend on it. Build when community features are validated.
- [ ] **D6 Community spaces with polls/voting** -- Defer because: communities need critical mass. Launch communities for top series first, not all series.
- [ ] **D4 Social media ad attribution** -- Defer because: requires mature analytics infrastructure (D3) and smart links (D7) as prerequisites. Most valuable when creators are spending on paid promotion, which happens at scale.
- [ ] **D12 Episode-level engagement analytics** -- Defer because: requires heavy data pipeline infrastructure. Start with series-level metrics (D3), add per-episode granularity when creator demand and data volume justify the investment.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority | Phase |
|---------|------------|---------------------|----------|-------|
| T1 Vertical video player | HIGH | MEDIUM | **P1** | v1 |
| T2 Auto episode continuation | HIGH | LOW | **P1** | v1 |
| T3 Free episode gateway | HIGH | LOW | **P1** | v1 |
| T7 User accounts / auth | HIGH | MEDIUM | **P1** | v1 |
| T4+T11 Payments + virtual currency | HIGH | HIGH | **P1** | v1 |
| D1 Per-season unlock | HIGH | MEDIUM | **P1** | v1 |
| T15 Series/season structure | HIGH | LOW | **P1** | v1 |
| T5 Genre browse / discovery | HIGH | MEDIUM | **P1** | v1 |
| T8 Watch history | HIGH | LOW | **P1** | v1 |
| T16 Share functionality | HIGH | LOW | **P1** | v1 |
| T14 Subtitles | HIGH | LOW-MEDIUM | **P1** | v1 |
| D2 Creator marketplace (basic) | HIGH | HIGH | **P1** | v1 |
| T10+D10 Mobile/PWA | HIGH | HIGH | **P1** | v1 |
| T12 Creator profiles | MEDIUM | LOW | **P1** | v1 |
| T6 Search | MEDIUM | LOW | **P1** | v1 |
| T9 Push notifications | HIGH | MEDIUM | **P2** | v1.x |
| D3 Creator analytics | HIGH | HIGH | **P2** | v1.x |
| D7 Smart share links | HIGH | MEDIUM | **P2** | v1.x |
| D11 AI auto-subtitling | MEDIUM | MEDIUM | **P2** | v1.x |
| D9 Variable revenue split | MEDIUM | LOW | **P2** | v1.x |
| D8 Social user profiles | MEDIUM | MEDIUM | **P2** | v1.x |
| T13 Content rating | MEDIUM | LOW | **P2** | v1.x |
| D5 Live reactions | HIGH | HIGH | **P3** | v2+ |
| D6 Community spaces | MEDIUM | MEDIUM | **P3** | v2+ |
| D4 Ad attribution | HIGH | HIGH | **P3** | v2+ |
| D12 Episode analytics | MEDIUM | HIGH | **P3** | v2+ |

**Priority key:**
- **P1:** Must have for launch -- the core watch-and-pay loop
- **P2:** Should have, add as soon as core is validated
- **P3:** Future consideration, requires scale to justify

## Competitor Feature Analysis

| Feature | ReelShort | DramaBox | Quibi (failed) | YouTube Shorts | TikTok | MicroShort (Planned) |
|---------|-----------|----------|-----------------|----------------|--------|---------------------|
| **Content model** | Studio-produced micro-dramas | Studio-produced micro-dramas | Hollywood-produced premium shorts | UGC + creator short clips | UGC short clips | Curated creator marketplace |
| **Episode length** | 60-90 sec | 1-3 min | ~10 min | Up to 3 min | Up to 10 min | 1-3 min |
| **Monetization** | Per-episode coins ($0.36-$1.11/ep) | Per-episode coins + optional subscription | Monthly subscription ($4.99-$7.99) | Ad revenue share (RPM $0.03-$0.07) | Creator Rewards (RPM $0.40-$1.00) | Per-season unlock (creator-set price) |
| **Free content** | 3-5 free episodes | More free chapters | 90-day free trial | All free (ad-supported) | All free (ad-supported) | 3 free episodes, no account needed |
| **Discovery** | Minimal, binge-focused | Good genre organization | Curated editorial | Algorithm-driven feed | Algorithm-driven feed | Genre browse + editorial curation |
| **Social features** | None | None | None at launch (fatal flaw) | Comments, shares, community tab | Duets, stitches, comments | Community spaces, polls, live reactions, social profiles |
| **Creator tools** | None (studio model) | None (studio model) | None (studio model) | Analytics dashboard, monetization | Analytics, Creator Marketplace | Full-funnel analytics, AI subtitling, ad attribution |
| **Sharing** | Basic | Basic | Blocked at launch | Native + deep links | Native + deep links | Smart links with attribution |
| **Platform** | Native iOS + Android | Native iOS + Android | Native iOS + Android | In-app (YouTube) | Native app | PWA (web-first) |
| **Revenue split** | Studio deals | Studio deals | 7-year content licenses | 45% to creators (Shorts) | Varies by program | Variable split (creator negotiable) |

### Key Competitive Insights

1. **ReelShort/DramaBox have zero social features.** This is MicroShort's biggest competitive gap to exploit. Adding community, reactions, and social profiles to premium micro-content is genuinely novel in the Western market.

2. **Per-season pricing is untested in micro-drama.** Every competitor uses per-episode or subscription. This is MicroShort's riskiest differentiator -- but also potentially the most valuable if validated. It solves real user complaints about per-episode costs ($20-$40 per series on ReelShort).

3. **Creator marketplace is unique.** ReelShort and DramaBox are studio operations. YouTube and TikTok are open platforms. MicroShort's curated-but-open model sits in between and has no direct competitor.

4. **PWA delivery is a double-edged sword.** Saves 30% app store commission but introduces iOS limitations. Must be executed exceptionally well to not feel inferior to native apps.

5. **Quibi's lesson is clear:** no sharing, no social, no community = death. MicroShort's planned social features directly address Quibi's fatal flaws. But also: the content must be good, the pricing must feel fair, and the experience must be mobile-native.

## Sources

- [Deloitte 2026 TMT Predictions: Short-form video series](https://www.deloitte.com/us/en/insights/industry/technology/technology-media-and-telecom-predictions/2026/short-form-video-series.html) -- Revenue projections, monetization models, retention strategies (HIGH confidence)
- [Rolling Stone: Vertical Short Apps Like ReelShort Are Taking Over Hollywood](https://www.rollingstone.com/culture/culture-features/vertical-short-industry-hollywood-reelshort-dramabox-1235009933/) -- Market landscape, competitor analysis (MEDIUM confidence)
- [DramaBox vs ReelShort: Full Comparison](https://yourappland.com/dramabox-vs-reelshort-full-comparison-of-features-and-pricing/) -- Feature-by-feature competitor comparison (MEDIUM confidence)
- [Failory: 7 Reasons Quibi Failed](https://www.failory.com/cemetery/quibi) -- Post-mortem analysis, anti-patterns (HIGH confidence)
- [How They Grow: Why Quibi Died](https://www.howtheygrow.co/p/why-quibi-died-the-2b-dumpster-fire) -- Detailed failure analysis (HIGH confidence)
- [Wikipedia: Danmaku subtitling](https://en.wikipedia.org/wiki/Danmaku_subtitling) -- Timestamp-synced reaction system reference (HIGH confidence)
- [Influencer Marketing Hub: Patreon Memberships 2025](https://influencermarketinghub.com/patreon-memberships/) -- Creator economy monetization patterns (MEDIUM confidence)
- [Brainhub: PWA on iOS Limitations 2025](https://brainhub.eu/library/pwa-on-ios) -- PWA technical constraints (HIGH confidence)
- [K Comics Beat: WEBTOON Monetization Changes 2026](https://kcomicsbeat.com/2026/01/13/webtoon-rolls-out-changes-to-its-monetization-features/) -- Per-content pricing evolution (MEDIUM confidence)
- [Shopify: YouTube Shorts Monetization 2026](https://www.shopify.com/blog/youtube-shorts-monetization) -- Creator revenue models (MEDIUM confidence)
- [10 Best Short Drama Apps 2026 Ranking](https://yourappland.com/best-short-drama-apps-ranking-the-leading-micro-drama-platforms/) -- Competitor feature landscape (MEDIUM confidence)
- [Variety: Vertical Video Apps Growth](https://variety.com/vip/vertical-video-apps-growth-quibi-audiences-1236130902/) -- Market size and growth data (HIGH confidence)
- [Branch.io: Deep Linking](https://www.branch.io/deep-linking/) -- Deep linking and attribution infrastructure (HIGH confidence)

---
*Feature research for: Freemium microshort video platform*
*Researched: 2026-02-14*
