# MicroShort (Working Title)

## What This Is

A microshort video platform where viewers discover short-form series (1-3 minute episodes) through social media ads and organic sharing, watch the first 3 episodes for free, and pay to unlock full seasons. It combines a premium viewing experience with a creator marketplace — enabling independent studios, influencers, comedians, musicians, AI filmmakers, and content creators to monetize short-form content through a self-serve platform. Think "the gap between free social media content and expensive Netflix productions."

## Core Value

Creators can monetize short-form video content with minimal friction — upload a series, set a price, and earn revenue from a platform purpose-built for microshorts.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. -->

**Consumer Experience:**
- [ ] Zero-friction viewing: watch 3 free episodes without creating an account
- [ ] Per-season unlock payments (creator sets price within platform-defined range)
- [ ] Bundle discount for unlocking all seasons of a series
- [ ] Tiered unlock: basic (content) + community tier (discussion, polls, voting)
- [ ] Vertical-first player on mobile, theater mode on desktop
- [ ] Live reactions (emojis popping on screen) + scrolling comments while watching
- [ ] Cinematic toggle to turn off social features for distraction-free viewing
- [ ] Real-time reactions from concurrent viewers + accumulated reactions from past viewers (timestamp-synced)
- [ ] Browse by genre categories (Drama, Comedy, Thriller, Sci-Fi, Horror, Romance, Action, Documentary, Behind-the-Scenes, Music, Sports)
- [ ] Smart share links with rich preview (thumbnail, title, hook)
- [ ] Social user profiles with watch history, favorites, following creators, public activity
- [ ] SEO-friendly series pages (indexable, rich snippets)
- [ ] PWA (installable, app-like feel) as bridge to future native apps

**Creator Platform:**
- [ ] Application + portfolio review process for creator whitelisting
- [ ] Creator self-serve dashboard: upload series, manage seasons/episodes, set pricing
- [ ] Rich metadata upload: title, description, thumbnail, genre tags, content warnings, release date, episode order
- [ ] Optional trailer upload (first episode serves as default trailer)
- [ ] Creator chooses release strategy (all at once or drip release)
- [ ] Full creator profiles: bio, all series, follower count, social links
- [ ] Full funnel analytics: views → free watches → signups → unlocks → revenue → community engagement
- [ ] Unified social media attribution dashboard (Meta, TikTok, YouTube, X/Twitter)
- [ ] Track both paid ad conversions AND organic share conversions
- [ ] Community space per series: discussion feed + polls/voting for interactive storytelling
- [ ] AI auto-subtitling from audio detection (multi-language subtitle generation)
- [ ] Content warnings system (optional tags: violence, language, etc.)
- [ ] Public view counts + likes visible; revenue/conversion metrics private to creator

**Monetization & Payments:**
- [ ] Stripe integration for consumer payments
- [ ] Variable revenue split (better rates for launch partners, standard for later creators)
- [ ] Creator payouts via Stripe Connect (research best practice for payout cadence)
- [ ] Per-season pricing (creator sets price)
- [ ] Bundle pricing discount for multi-season series

**Admin Panel:**
- [ ] Full admin dashboard: manage creators, content, users, revenue, featured content, moderation
- [ ] Creator application review and approval workflow
- [ ] Manual homepage curation (featured series, editorial picks)
- [ ] Platform-level metrics and analytics

**Pitch & Demo:**
- [ ] Mock data seeding system (15-25 series across genres)
- [ ] AI-generated thumbnails via fal.ai (Nano Banana Pro) for mock content
- [ ] Royalty-free video placeholders for demo episodes
- [ ] Ability to clear mock data and replace with real content
- [ ] 4+ standalone pitch pages: VCs/investors, creator partners, brands/sponsors, advisors
- [ ] Pitch pages are compelling, detailed on concept, with benefits and relevant features

**Landing & Marketing:**
- [ ] Creator landing page with multi-angle pitch (revenue opportunity, audience growth, AI-first platform)
- [ ] Different sections targeting different creator types

**Technical:**
- [ ] Transactional emails only for v1 (purchase confirmations, password reset, account emails)
- [ ] Basic content protection (disable right-click, no download button)
- [ ] Web app (PWA) — mobile-first, responsive

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Subscription model — not enough content at launch to justify recurring fee; per-season unlock first
- Native mobile apps (iOS/Android) — web PWA first, native apps after product-market fit
- Continue watching / smart resume — users can find unlocked content, no progress tracking in v1
- Notifications (in-app, push, email marketing) — deferred to v2, transactional emails only
- Algorithmic content recommendations — admin-curated homepage for v1
- Paid content placement by creators — future revenue stream, not v1
- Referral/affiliate system — both creator-to-creator and user-to-user deferred to v2
- Search functionality — browse by category sufficient for v1 catalog size
- AI reaction analysis engine — future intelligence system that analyzes reactions/comments to help craft better series
- AI filmmaking tools on-platform — content creation happens externally
- Creator school/education — future support/training for AI filmmaking techniques
- Real-time chat / DMs — high complexity, not core to v1 value
- Video creation/editing tools — creators bring finished content
- Content moderation system — whitelisted creators are trusted, moderate only if issues arise
- Email marketing campaigns — defer to v2

## Context

**Market Position:**
MicroShort fills the gap between free social media content (no monetization for creators beyond ads) and high-cost Netflix/streaming productions (too expensive for most creators). The microshort format caters to shortening attention spans and vertical mobile consumption. AI filmmaking has dramatically lowered production costs, making this format viable for independent creators.

**Content Types:**
- Scripted series (drama, comedy, thriller, sci-fi, etc.)
- Behind-the-scenes content (music tours, sports teams, productions)
- Music-related series
- Sports content
- Comedy sketches
- Any short-form narrative content

**Go-to-Market Strategy:**
1. Build platform with mock data for pitching
2. Produce own series via internal studio (AI filmmaking)
3. Upload own content, run paid impression ads (first episodes as hooks on social media)
4. Gather real metrics and conversion data
5. Use metrics to pitch and onboard launch partners
6. Launch partners ideally have existing fan bases that can be funneled to platform
7. Offer launch partners better revenue split + potential equity/advantages

**Chicken-and-Egg Strategy:**
Platform becomes valuable for creators once it has users. Initial strategy: create own content → run ads → build user base → prove model with data → recruit creators with proven metrics. Ideally, recruited creators/influencers already have audiences they can direct to the platform.

**Branding:**
- Working title: "MicroShort" (final brand name TBD)
- Visual identity: deep blacks + cinematic yellow
- Premium, cinematic aesthetic — must not look cheap or basic
- All UI built with frontend-design plugin for high design quality

**Pitch Assets:**
V1 serves dual purpose: functional platform AND pitch tool. Needs to look like a thriving platform with populated catalog. Standalone pitch pages for different stakeholder types link to the live platform as proof of concept.

**Future Vision (v2+):**
- AI reaction/comment analysis engine for content intelligence
- Creator school/support for AI filmmaking training
- Algorithmic recommendations and personalized feeds
- Paid content placement for creators
- Native iOS/Android apps
- Referral programs
- Notification system (in-app, push, email marketing)
- Search functionality
- Continue watching / progress tracking
- Subscription tier (when catalog is large enough)
- Full ecosystem: platform + AI tools + creator school + studio

## Constraints

- **Platform**: Web-first (PWA), mobile-first responsive design — no native apps in v1
- **Payments**: Stripe for consumer payments and creator payouts (Stripe Connect)
- **Mock Content**: fal.ai API (Nano Banana Pro) for thumbnail generation; royalty-free videos for placeholders
- **Content Format**: Vertical-first (9:16) with graceful horizontal handling
- **Episodes**: 1-3 minutes per episode, 8-70 episodes per season
- **Language**: English UI only for v1; AI auto-subtitling generates multi-language subtitles
- **Design**: Must use frontend-design plugin; deep blacks + cinematic yellow; premium aesthetic
- **Marketing Pages**: Must use marketingskills tooling (github.com/coreyhaines31/marketingskills)
- **Tech Stack**: Research best fit (no predetermined stack)
- **Hosting**: Research best fit for video platform requirements

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Per-season unlock (not subscription) | Not enough content at launch to justify subscription; lets creators set their own prices | — Pending |
| Zero-friction free episodes (no account) | Maximize funnel conversion from social media ads to viewership | — Pending |
| Variable revenue split | Better rates attract launch partners; standard rates for later creators | — Pending |
| Application + portfolio review for creators | Quality control without heavy moderation; trust whitelisted creators | — Pending |
| PWA before native apps | Faster to market; validates product before investing in native development | — Pending |
| Mock data for pitch | V1 must look like thriving platform to convince partners and investors | — Pending |
| Admin-curated homepage for v1 | Catalog too small for algorithm; manual curation ensures quality presentation | — Pending |
| Creator sets pricing | Creator ownership drives platform adoption; platform defines allowed range | — Pending |
| Vertical-first format | Matches mobile consumption patterns; gracefully handles horizontal as exception | — Pending |

---
*Last updated: 2026-02-14 after initialization*
