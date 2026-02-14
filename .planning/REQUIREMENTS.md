# Requirements: MicroShort

**Defined:** 2026-02-14
**Core Value:** Creators can monetize short-form video content with minimal friction -- upload a series, set a price, and earn revenue from a platform purpose-built for microshorts.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Video Player

- [ ] **PLAY-01**: User can watch episodes in a vertical-first (9:16) video player on mobile
- [ ] **PLAY-02**: User can watch episodes in theater mode on desktop
- [ ] **PLAY-03**: Episodes auto-continue to next episode in sequence
- [ ] **PLAY-04**: User can view subtitles while watching episodes
- [ ] **PLAY-05**: User can see live emoji reactions from concurrent viewers popping on screen
- [ ] **PLAY-06**: User can see accumulated reactions from past viewers synced to episode timestamps
- [ ] **PLAY-07**: User can see scrolling comments overlay while watching
- [ ] **PLAY-08**: User can toggle cinematic mode to hide all social overlays

### Content

- [ ] **CONT-01**: User can browse series organized by genre categories (Drama, Comedy, Thriller, Sci-Fi, Horror, Romance, Action, Documentary, BTS, Music, Sports)
- [ ] **CONT-02**: Series display as cards with thumbnail, title, genre, episode count, and creator name
- [ ] **CONT-03**: User can view a series page with full description, season list, episode list, and creator info
- [ ] **CONT-04**: Each series has a structured hierarchy: Series > Seasons > Episodes
- [ ] **CONT-05**: Episodes are 1-3 minutes, seasons contain 8-70 episodes

### Access

- [ ] **ACCS-01**: User can watch the first 3 episodes of any series without creating an account
- [ ] **ACCS-02**: User must create an account to unlock paid content
- [ ] **ACCS-03**: User can sign up with email and password
- [ ] **ACCS-04**: User can log in and session persists across browser refresh
- [ ] **ACCS-05**: User can reset password via email link
- [ ] **ACCS-06**: User can log out from any page

### Payments

- [ ] **PAY-01**: User can unlock a full season via Stripe Checkout (creator-set price)
- [ ] **PAY-02**: Episode 4+ shows a paywall prompting season unlock
- [ ] **PAY-03**: Successful payment immediately grants access to all remaining episodes in the season
- [ ] **PAY-04**: User receives email confirmation after purchase
- [ ] **PAY-05**: Creator receives their revenue share via Stripe Connect payouts

### Sharing

- [ ] **SHAR-01**: User can share a series via a smart link with rich preview (thumbnail, title, hook)
- [ ] **SHAR-02**: Share links render correct Open Graph tags on all major platforms (iMessage, WhatsApp, X, Facebook)
- [ ] **SHAR-03**: Series pages are SEO-friendly (server-rendered, indexable, structured data)
- [ ] **SHAR-04**: Free episodes are accessible directly via shared deep links

### Social

- [ ] **SOCL-01**: User can create a profile with display name and avatar
- [ ] **SOCL-02**: User can view their watch history and unlocked content
- [ ] **SOCL-03**: User can save series to favorites
- [ ] **SOCL-04**: User can follow creators
- [ ] **SOCL-05**: User can see their public activity (followed creators, favorites)
- [ ] **SOCL-06**: Creator has a public profile page with bio, all series, follower count, and social links

### Creator Dashboard

- [ ] **CREA-01**: Creator can apply to join the platform via portfolio review form
- [ ] **CREA-02**: Creator can upload episodes with rich metadata (title, description, thumbnail, genre tags, content warnings, release date, episode order)
- [ ] **CREA-03**: Creator can manage series, seasons, and episodes (create, edit, reorder, delete)
- [ ] **CREA-04**: Creator can set pricing per season
- [ ] **CREA-05**: Creator can choose release strategy (all at once or drip release with schedule)
- [ ] **CREA-06**: Creator can upload an optional trailer for their series
- [ ] **CREA-07**: Creator can view full funnel analytics (views > free watches > signups > unlocks > revenue > community engagement)
- [ ] **CREA-08**: Creator can view payout history and pending earnings
- [ ] **CREA-09**: Creator can create and manage a community space per series (discussion feed + polls/voting)
- [ ] **CREA-10**: Public view counts and likes visible on series; revenue/conversion metrics private to creator

### Admin

- [ ] **ADMN-01**: Admin can review and approve/reject creator applications
- [ ] **ADMN-02**: Admin can manage all creators, content, users, and revenue data
- [ ] **ADMN-03**: Admin can curate homepage (featured series, editorial picks)
- [ ] **ADMN-04**: Admin can view platform-level metrics and analytics
- [ ] **ADMN-05**: Admin can moderate content if issues arise

### Pitch & Demo

- [ ] **PTCH-01**: System can seed 15-25 mock series across genres with AI-generated thumbnails (fal.ai)
- [ ] **PTCH-02**: Mock series use royalty-free video placeholders for episodes
- [ ] **PTCH-03**: Mock data can be cleared and replaced with real content
- [ ] **PTCH-04**: Standalone pitch page for VCs/investors with platform benefits and concept details
- [ ] **PTCH-05**: Standalone pitch page for creator partners with monetization opportunity details
- [ ] **PTCH-06**: Standalone pitch page for brands/sponsors with partnership details
- [ ] **PTCH-07**: Standalone pitch page for advisors with strategic vision details
- [ ] **PTCH-08**: Creator landing page with multi-angle pitch targeting different creator types

### Showcase UI

- [ ] **SHOW-01**: Attribution tracking dashboard UI is visible with mock data (paid + organic conversion funnels)
- [ ] **SHOW-02**: Unified social media ad dashboard UI is visible with mock data (Meta, TikTok, YouTube, X)
- [ ] **SHOW-03**: Content warnings system is visible on series/episodes

### Platform

- [ ] **PLAT-01**: Platform is a PWA (installable on home screen, app-like feel)
- [ ] **PLAT-02**: Platform is mobile-first responsive design
- [ ] **PLAT-03**: Transactional emails for purchase confirmations, password reset, account emails
- [ ] **PLAT-04**: Basic content protection (disable right-click, no download button)
- [ ] **PLAT-05**: Deep blacks + cinematic yellow branding throughout (premium, cinematic aesthetic)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Monetization v2

- **PAY-06**: Bundle discount for unlocking all seasons of a series
- **PAY-07**: Tiered unlock system (basic content + community tier with extra perks)
- **PAY-08**: Variable revenue split (better rates for launch partners, standard for later)

### Distribution v2

- **DIST-01**: Full attribution tracking (paid ads + organic shares with conversion data)
- **DIST-02**: Unified social media ad dashboard (Meta, TikTok, YouTube, X) with real API integrations
- **DIST-03**: Creator can run ad campaigns from within the platform

### AI Features v2

- **AI-01**: AI auto-subtitling from audio detection (multi-language)
- **AI-02**: AI reaction/comment analysis engine for content intelligence

### Notifications v2

- **NOTF-01**: In-app notifications for new episodes from followed creators
- **NOTF-02**: Push notifications (browser push for PWA)
- **NOTF-03**: Email marketing campaigns for platform updates

### Discovery v2

- **DISC-01**: Search functionality (series, creators, genres)
- **DISC-02**: Algorithmic content recommendations based on watch history
- **DISC-03**: Continue watching / smart resume

### Growth v2

- **GROW-01**: Referral system (user-to-user)
- **GROW-02**: Creator referral program (creator-to-creator)
- **GROW-03**: Paid content placement by creators on homepage

### Native Apps v2

- **NATIV-01**: Native iOS app
- **NATIV-02**: Native Android app

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Monthly subscription model | Not enough content at launch; per-season unlock validates monetization first |
| User-generated content / open uploads | Destroys curation quality that justifies premium pricing; application-based whitelisting is the feature |
| Algorithmic infinite scroll feed (TikTok-style) | MicroShort is serialized premium content, not UGC clips; breaks narrative structure |
| Real-time live streaming | Completely different infrastructure; not aligned with premium serialized content |
| Horizontal video support | Micro-drama is vertical-first format; enforced by creator guidelines |
| Download for offline viewing | PWA storage limitations (iOS 50MB cache); native app territory |
| Tipping / donations | Undermines per-season pricing model; not suited for pre-recorded content |
| DM / private messaging | Massive moderation liability; not aligned with content consumption |
| Cryptocurrency / NFT integration | Adds friction, negative brand association, regulatory uncertainty |
| Desktop-optimized experience | 90%+ consumption is mobile; functional on desktop but not optimized |
| Video creation/editing tools | Creators bring finished content; production happens externally |
| Creator school/education | Future ecosystem play; not v1 scope |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PLAY-01 | Phase 3 | Pending |
| PLAY-02 | Phase 3 | Pending |
| PLAY-03 | Phase 3 | Pending |
| PLAY-04 | Phase 3 | Pending |
| PLAY-05 | Phase 9 | Pending |
| PLAY-06 | Phase 9 | Pending |
| PLAY-07 | Phase 9 | Pending |
| PLAY-08 | Phase 9 | Pending |
| CONT-01 | Phase 4 | Pending |
| CONT-02 | Phase 4 | Pending |
| CONT-03 | Phase 4 | Pending |
| CONT-04 | Phase 1 | Pending |
| CONT-05 | Phase 1 | Pending |
| ACCS-01 | Phase 2 | Pending |
| ACCS-02 | Phase 2 | Pending |
| ACCS-03 | Phase 2 | Pending |
| ACCS-04 | Phase 2 | Pending |
| ACCS-05 | Phase 2 | Pending |
| ACCS-06 | Phase 2 | Pending |
| PAY-01 | Phase 5 | Pending |
| PAY-02 | Phase 5 | Pending |
| PAY-03 | Phase 5 | Pending |
| PAY-04 | Phase 5 | Pending |
| PAY-05 | Phase 5 | Pending |
| SHAR-01 | Phase 4 | Pending |
| SHAR-02 | Phase 4 | Pending |
| SHAR-03 | Phase 4 | Pending |
| SHAR-04 | Phase 4 | Pending |
| SOCL-01 | Phase 9 | Pending |
| SOCL-02 | Phase 9 | Pending |
| SOCL-03 | Phase 9 | Pending |
| SOCL-04 | Phase 9 | Pending |
| SOCL-05 | Phase 9 | Pending |
| SOCL-06 | Phase 6 | Pending |
| CREA-01 | Phase 6 | Pending |
| CREA-02 | Phase 6 | Pending |
| CREA-03 | Phase 6 | Pending |
| CREA-04 | Phase 6 | Pending |
| CREA-05 | Phase 6 | Pending |
| CREA-06 | Phase 6 | Pending |
| CREA-07 | Phase 6 | Pending |
| CREA-08 | Phase 6 | Pending |
| CREA-09 | Phase 6 | Pending |
| CREA-10 | Phase 6 | Pending |
| ADMN-01 | Phase 7 | Pending |
| ADMN-02 | Phase 7 | Pending |
| ADMN-03 | Phase 7 | Pending |
| ADMN-04 | Phase 7 | Pending |
| ADMN-05 | Phase 7 | Pending |
| PTCH-01 | Phase 8 | Pending |
| PTCH-02 | Phase 8 | Pending |
| PTCH-03 | Phase 8 | Pending |
| PTCH-04 | Phase 8 | Pending |
| PTCH-05 | Phase 8 | Pending |
| PTCH-06 | Phase 8 | Pending |
| PTCH-07 | Phase 8 | Pending |
| PTCH-08 | Phase 8 | Pending |
| SHOW-01 | Phase 8 | Pending |
| SHOW-02 | Phase 8 | Pending |
| SHOW-03 | Phase 8 | Pending |
| PLAT-01 | Phase 1 | Pending |
| PLAT-02 | Phase 1 | Pending |
| PLAT-03 | Phase 2 | Pending |
| PLAT-04 | Phase 3 | Pending |
| PLAT-05 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 70 total
- Mapped to phases: 70
- Unmapped: 0

---
*Requirements defined: 2026-02-14*
*Last updated: 2026-02-14 after roadmap creation*
