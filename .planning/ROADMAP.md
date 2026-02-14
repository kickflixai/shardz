# Roadmap: MicroShort

## Overview

MicroShort is a freemium microshort video platform where creators monetize serialized short-form content through per-season unlocks. The roadmap delivers a pitch-ready v1 across 9 phases: starting with the app foundation and auth, building the core watch-and-pay loop (player, browsing, payments), layering on creator tools and admin controls, then seeding mock data and pitch pages to make the platform look alive for investors and creator partners. Social engagement features round out the experience. Every phase produces observable, demoable capability -- not hidden backend work.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation + App Shell** - Project scaffolding, data model, branding, PWA setup
- [ ] **Phase 2: Authentication + Access** - User accounts, zero-friction free viewing, session management
- [ ] **Phase 3: Video Player** - Vertical-first player with theater mode, auto-continue, subtitles
- [ ] **Phase 4: Content Browsing + Sharing** - Genre discovery, series pages, smart share links, SEO
- [ ] **Phase 5: Payments + Monetization** - Per-season unlock via Stripe, paywall, creator payouts
- [ ] **Phase 6: Creator Dashboard** - Self-serve upload, series management, analytics, community spaces
- [ ] **Phase 7: Admin Panel** - Creator approval, content management, homepage curation, platform metrics
- [ ] **Phase 8: Mock Data + Pitch Assets** - Seed 15-25 series, pitch pages, showcase dashboards, creator landing page
- [ ] **Phase 9: Social + Engagement** - User profiles, reactions, comments overlay, favorites, follow creators

## Phase Details

### Phase 1: Foundation + App Shell
**Goal**: The application skeleton exists with routing, cinematic branding, responsive layout, and the core data model -- ready for features to build on
**Depends on**: Nothing (first phase)
**Requirements**: PLAT-01, PLAT-02, PLAT-05, CONT-04, CONT-05
**Success Criteria** (what must be TRUE):
  1. User can install the app to their home screen and it launches with an app-like experience (no browser chrome)
  2. The application renders with deep blacks and cinematic yellow branding on both mobile and desktop viewports
  3. The database schema for Series > Seasons > Episodes exists and enforces the content hierarchy (1-3 min episodes, 8-70 episodes per season)
  4. Page navigation works across all major route groups (home, browse, series detail, auth, creator, admin) with loading states
**Plans**: TBD

Plans:
- [ ] 01-01: Next.js project setup, Supabase integration, Tailwind + shadcn/ui theming
- [ ] 01-02: Database schema design and migration (content hierarchy, users, creators)
- [ ] 01-03: App shell layout, route groups, PWA manifest, responsive scaffolding

### Phase 2: Authentication + Access
**Goal**: Users can create accounts, log in persistently, and watch free episodes without any account barrier
**Depends on**: Phase 1
**Requirements**: ACCS-01, ACCS-02, ACCS-03, ACCS-04, ACCS-05, ACCS-06, PLAT-03
**Success Criteria** (what must be TRUE):
  1. User can watch the first 3 episodes of any series without creating an account or seeing a login prompt
  2. User can sign up with email and password, log in, and their session persists across browser refresh
  3. User can reset their password via an email link and log in with the new password
  4. User can log out from any page in the application
  5. User receives transactional emails for account actions (signup confirmation, password reset)
**Plans**: TBD

Plans:
- [ ] 02-01: Supabase Auth setup (email/password signup, login, logout, session persistence)
- [ ] 02-02: Free episode access gate (3 free episodes, no auth required) and auth-gated routes
- [ ] 02-03: Password reset flow and transactional email templates

### Phase 3: Video Player
**Goal**: Users can watch episodes in a polished, vertical-first video player that feels cinematic and handles the core viewing experience
**Depends on**: Phase 1
**Requirements**: PLAY-01, PLAY-02, PLAY-03, PLAY-04, PLAT-04
**Success Criteria** (what must be TRUE):
  1. User on mobile sees a vertical-first (9:16) video player that fills the viewport
  2. User on desktop sees a theater-mode player with appropriate framing
  3. When an episode ends, the next episode in the season auto-plays without user interaction
  4. User can toggle subtitles on/off while watching
  5. User cannot right-click to save the video or see a download button on the player
**Plans**: TBD

Plans:
- [ ] 03-01: Mux integration (upload pipeline, asset management, playback tokens)
- [ ] 03-02: Vertical-first video player component with theater mode, controls, and iOS PWA workarounds
- [ ] 03-03: Auto-continue logic, subtitle rendering, and content protection

### Phase 4: Content Browsing + Sharing
**Goal**: Users can discover series by genre, view detailed series pages, and share content with rich social previews
**Depends on**: Phase 1, Phase 3
**Requirements**: CONT-01, CONT-02, CONT-03, SHAR-01, SHAR-02, SHAR-03, SHAR-04
**Success Criteria** (what must be TRUE):
  1. User can browse series organized by genre categories (Drama, Comedy, Thriller, Sci-Fi, Horror, Romance, Action, Documentary, BTS, Music, Sports)
  2. Series display as cards showing thumbnail, title, genre, episode count, and creator name
  3. User can open a series page with full description, season list, episode list, and creator info
  4. User can share a series via a link that renders a rich preview (thumbnail, title, hook) on iMessage, WhatsApp, X, and Facebook
  5. Series pages are indexable by search engines with structured data / rich snippets
**Plans**: TBD

Plans:
- [ ] 04-01: Genre browsing page, series card components, and category filtering
- [ ] 04-02: Series detail page with season/episode list, creator info, and deep link routing
- [ ] 04-03: Open Graph tags, structured data, SEO metadata, and smart share link generation

### Phase 5: Payments + Monetization
**Goal**: Users can pay to unlock full seasons and creators receive their revenue share -- the business model works end-to-end
**Depends on**: Phase 2, Phase 4
**Requirements**: PAY-01, PAY-02, PAY-03, PAY-04, PAY-05
**Success Criteria** (what must be TRUE):
  1. When a user tries to play episode 4+, they see a paywall prompting them to unlock the season
  2. User can complete a Stripe Checkout flow to unlock a season at the creator-set price
  3. After successful payment, all remaining episodes in the season are immediately playable
  4. User receives an email confirmation after purchase
  5. Creator revenue share is routed to their Stripe Connect account for payout
**Plans**: TBD

Plans:
- [ ] 05-01: Stripe Checkout integration (session creation, webhook handling, payment confirmation)
- [ ] 05-02: Paywall UI, episode access control (free vs. locked), and post-purchase unlock flow
- [ ] 05-03: Stripe Connect setup for creator payouts, revenue split logic, and payout records

### Phase 6: Creator Dashboard
**Goal**: Creators can apply, upload content, manage their series, set pricing, track analytics, and engage their community -- all self-serve
**Depends on**: Phase 5
**Requirements**: CREA-01, CREA-02, CREA-03, CREA-04, CREA-05, CREA-06, CREA-07, CREA-08, CREA-09, CREA-10, SOCL-06
**Success Criteria** (what must be TRUE):
  1. A prospective creator can submit an application with portfolio samples for review
  2. An approved creator can upload episodes with full metadata (title, description, thumbnail, genre tags, content warnings, release date, episode order)
  3. Creator can manage their series catalog -- create, edit, reorder, and delete series, seasons, and episodes
  4. Creator can set per-season pricing and choose a release strategy (all at once or drip release)
  5. Creator can view full-funnel analytics (views, free watches, signups, unlocks, revenue, community engagement) and payout history
  6. Creator has a public profile page showing bio, all series, follower count, and social links
**Plans**: TBD

Plans:
- [ ] 06-01: Creator application form and onboarding flow
- [ ] 06-02: Content upload pipeline (Mux direct upload, metadata form, thumbnail upload)
- [ ] 06-03: Series/season/episode management (CRUD, reorder, release strategy, pricing)
- [ ] 06-04: Creator analytics dashboard and payout history
- [ ] 06-05: Community spaces (discussion feed + polls/voting per series) and optional trailer upload
- [ ] 06-06: Creator public profile page (bio, series, followers, social links)

### Phase 7: Admin Panel
**Goal**: Platform operators can review creator applications, manage all content and users, curate the homepage, and monitor platform health
**Depends on**: Phase 6
**Requirements**: ADMN-01, ADMN-02, ADMN-03, ADMN-04, ADMN-05
**Success Criteria** (what must be TRUE):
  1. Admin can review pending creator applications and approve or reject them with feedback
  2. Admin can browse, search, and manage all creators, content (series/seasons/episodes), users, and revenue data
  3. Admin can curate the homepage by selecting featured series and editorial picks
  4. Admin can view platform-level metrics (total users, revenue, active creators, content volume)
  5. Admin can flag or remove content if moderation issues arise
**Plans**: TBD

Plans:
- [ ] 07-01: Admin layout, role-gated access, and creator application review workflow
- [ ] 07-02: Entity management (creators, content, users, revenue) with browse/search/edit
- [ ] 07-03: Homepage curation tools, featured series selection, and editorial picks
- [ ] 07-04: Platform metrics dashboard and content moderation tools

### Phase 8: Mock Data + Pitch Assets
**Goal**: The platform looks like a thriving marketplace with populated content, and pitch pages convince investors, creators, brands, and advisors to engage
**Depends on**: Phase 7
**Requirements**: PTCH-01, PTCH-02, PTCH-03, PTCH-04, PTCH-05, PTCH-06, PTCH-07, PTCH-08, SHOW-01, SHOW-02, SHOW-03
**Success Criteria** (what must be TRUE):
  1. The platform is populated with 15-25 mock series across all genre categories, each with AI-generated thumbnails and royalty-free video episodes
  2. Mock data can be cleared and replaced with real content via a single admin action
  3. Each stakeholder pitch page (VCs, creator partners, brands, advisors) loads as a standalone page with compelling copy, platform benefits, and links to the live platform
  4. Creator landing page presents a multi-angle pitch targeting different creator types (studios, influencers, comedians, musicians, AI filmmakers)
  5. Attribution tracking and social media ad dashboards display realistic mock data demonstrating platform intelligence
**Plans**: TBD

Plans:
- [ ] 08-01: Mock data seeding system (series generation, fal.ai thumbnail generation, royalty-free video sourcing)
- [ ] 08-02: Mock data population (15-25 series across genres) and clear/replace mechanism
- [ ] 08-03: VC/investor pitch page and creator partner pitch page
- [ ] 08-04: Brand/sponsor pitch page and advisor pitch page
- [ ] 08-05: Creator landing page with multi-angle pitch sections
- [ ] 08-06: Showcase UI -- attribution dashboard, social media ad dashboard, and content warnings display with mock data

### Phase 9: Social + Engagement
**Goal**: Users have social identities on the platform and can interact with content through reactions, comments, favorites, and following creators
**Depends on**: Phase 2, Phase 3
**Requirements**: SOCL-01, SOCL-02, SOCL-03, SOCL-04, SOCL-05, PLAY-05, PLAY-06, PLAY-07, PLAY-08
**Success Criteria** (what must be TRUE):
  1. User can create a profile with display name and avatar, and view their public activity page (favorites, followed creators)
  2. User can view their watch history and list of unlocked content
  3. User can save series to favorites and follow creators
  4. User can see emoji reactions from other viewers popping on screen during playback, and accumulated past reactions synced to timestamps
  5. User can see scrolling comments while watching and toggle cinematic mode to hide all social overlays
**Plans**: TBD

Plans:
- [ ] 09-01: User profile creation (display name, avatar) and public activity page
- [ ] 09-02: Watch history tracking, unlocked content list, favorites, and follow creators
- [ ] 09-03: Live emoji reactions (Supabase Realtime broadcast) and accumulated timestamp-synced reactions
- [ ] 09-04: Scrolling comments overlay and cinematic mode toggle

## Progress

**Execution Order:**
Phases execute in numeric order: 1 > 2 > 3 > 4 > 5 > 6 > 7 > 8 > 9

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation + App Shell | 0/3 | Not started | - |
| 2. Authentication + Access | 0/3 | Not started | - |
| 3. Video Player | 0/3 | Not started | - |
| 4. Content Browsing + Sharing | 0/3 | Not started | - |
| 5. Payments + Monetization | 0/3 | Not started | - |
| 6. Creator Dashboard | 0/6 | Not started | - |
| 7. Admin Panel | 0/4 | Not started | - |
| 8. Mock Data + Pitch Assets | 0/6 | Not started | - |
| 9. Social + Engagement | 0/4 | Not started | - |
