# Pitfalls Research

**Domain:** Freemium microshort video platform with creator marketplace
**Researched:** 2026-02-14
**Confidence:** MEDIUM-HIGH (multiple verified sources; some areas rely on pattern-matching from adjacent platform failures)

## Critical Pitfalls

Mistakes that cause rewrites, major setbacks, or platform failure.

### Pitfall 1: Building a Content Platform Without Solving Distribution First (The Quibi Trap)

**What goes wrong:**
You build a polished platform but nobody comes because there is no organic discovery loop. Quibi spent $1.8B and died in 6 months. Verizon's Go90 spent $1.2B and also died. Both had premium content and zero organic growth engine. MicroShort's plan to use social media ads as the primary acquisition channel is the right instinct, but the trap is building the platform first and figuring out distribution second. The per-season payment model means every user must convert from a social media ad to a free watch to a payment -- that is a 3-step funnel that needs to be validated before the platform is built to scale.

**Why it happens:**
Founders conflate "building the product" with "building the business." Product people naturally focus on features, player UX, and creator tools. Distribution is treated as a marketing problem that will be solved later. But for content platforms, distribution IS the product.

**How to avoid:**
- Validate the ad-to-free-watch-to-pay funnel with a landing page and a single series BEFORE building the full platform. Even a simple Vimeo-embedded page with a Stripe checkout can validate willingness to pay.
- Design the sharing mechanics (smart share links with rich previews, clip sharing, social embeds) as a Phase 1 priority, not a nice-to-have.
- The mock data pitch system is smart, but the pitch should include real conversion data from at least one series run through social ads. Investors and creators will ask for this.

**Warning signs:**
- Team spends 80%+ of time on platform features, 0% on acquisition experiments
- No social media ad campaigns running in parallel with development
- Share links and social preview cards are deferred to a later phase
- Zero organic signups happening during development

**Phase to address:**
Phase 1 (Foundation). Run at least one ad-to-payment funnel test with a single series before building the full platform. Embed social sharing and rich link previews into the very first functional version.

---

### Pitfall 2: Per-Season Payment Model Creates Fatal Friction at Scale

**What goes wrong:**
The per-season unlock model (vs. subscription) creates a purchase decision at every season boundary. Each purchase is a churn point. Users who paid for Season 1 may not pay for Season 2. Unlike subscriptions where revenue is recurring by default, per-season requires re-convincing users every time. Chinese micro-drama platforms like ReelShort ($214M revenue in 2024, surging to ~$400M) have validated per-episode unlocks, but they spend enormous sums on marketing -- 80% of overseas micro-drama projects operate at a loss due to marketing costs. The model works at massive scale but bleeds money while growing.

**Why it happens:**
Per-season pricing feels "fair" to creators and users. The rationale ("not enough content for subscription") is correct for launch. But the economics are brutal: every unlock is a new conversion event, and conversion rates compound downward. If Season 1 converts at 5%, Season 2 might convert at 40% of Season 1 payers -- meaning only 2% of original viewers become Season 2 payers.

**How to avoid:**
- Build bundle pricing from day one (all seasons of a series at a discount). This is already in the requirements -- make it prominent, not buried.
- Track per-season drop-off rates obsessively from the first paying user. This is the critical health metric.
- Design the payment UX for minimal friction: saved payment methods, one-tap unlock, "auto-unlock next season" option.
- Plan the subscription transition early. Define the catalog size threshold that triggers the switch. Do not let "we will add subscriptions later" become a vague future plan.
- Consider a credits/wallet model where users pre-load a balance, reducing per-purchase friction.

**Warning signs:**
- Season 2 purchase rate drops below 30% of Season 1 payers
- Average revenue per user (ARPU) is lower than customer acquisition cost (CAC)
- Users complain about "nickel and diming" in reviews or feedback
- Creators with multi-season series see declining revenue per season

**Phase to address:**
Phase 1 (Payments). Build bundle pricing alongside per-season pricing. Instrument funnel analytics from the start. Plan a credits/wallet system as a Phase 2 priority.

---

### Pitfall 3: PWA Video Playback Breaks on iOS After Backgrounding

**What goes wrong:**
When a PWA is installed to the iOS home screen, video playback works on first launch. If the user switches apps and returns, videos become stuck -- the play command refuses to work even though the video has loaded and can be scrubbed. This is a known WebKit bug. For a video platform where every user interaction IS video playback, this is catastrophic.

**Why it happens:**
iOS aggressively manages PWA resources when backgrounded. WebKit pauses media elements and does not reliably resume them. Apple has limited incentive to fix PWA media issues because they want developers to build native apps (which go through the App Store and pay the 30% cut).

**How to avoid:**
- Implement the TikTok workaround: use blob URLs as video sources via JavaScript/buffer rather than direct HTTP URLs. TikTok's web player uses this technique to avoid PWA playback reset issues.
- Add event listeners for `visibilitychange` and PWA resume events, then call `video.load()` + `video.play()` or reassign the source to force a playback reset.
- Test EVERY build on a physical iPhone installed as a PWA. Do not rely on Safari testing or iOS Simulator alone -- the bug manifests specifically in the home-screen-installed PWA context.
- Build a fallback: detect when playback has stalled after resume and show a "tap to continue watching" overlay rather than appearing broken.
- Consider using Media Source Extensions (MSE) for HLS playback instead of native `<video>` tag HLS, as MSE gives more programmatic control over the playback state.

**Warning signs:**
- QA never tests the "background and resume" flow
- Video player works perfectly in Safari but breaks when installed to home screen
- User complaints about "videos freezing" or "play button does nothing" on iOS
- High bounce rate specifically from iOS PWA users

**Phase to address:**
Phase 1 (Video Player). This must be solved in the first functional player implementation. Do not defer iOS PWA testing to later phases.

---

### Pitfall 4: Chicken-and-Egg Failure -- Empty Platform Stays Empty

**What goes wrong:**
The "own content first" strategy is sound, but the transition from "founder's content" to "external creators" is where most marketplace platforms die. The platform looks real with mock data, the founder's own series gets some traction, but when it is time to recruit external creators, the value proposition is not yet proven because the data is too thin (one creator's metrics do not constitute a marketplace). Creators ask "how many viewers do you have?" and the answer is not enough.

**Why it happens:**
Marketplace chicken-and-egg is the #1 cause of marketplace startup failure. The plan to recruit creators who already have audiences ("bring your own demand") is the correct strategy, but executing it requires more than just offering a revenue split. Creators with existing audiences already have monetization options (YouTube ads, Patreon, merch). They need a compelling reason to also publish on MicroShort.

**How to avoid:**
- Launch partners need an offer they cannot get elsewhere: higher revenue split (already planned), but also exclusivity incentives, equity participation, featured placement, or co-marketing commitments.
- The pitch must lead with REAL conversion data, not mock data. Even modest numbers ("5% of ad viewers converted to paid at $2.99/season") are more convincing than polished mockups.
- Target creators who are currently underserved: AI filmmakers who have no monetization path at all, comedians with TikTok followings but no way to charge for content, indie studios sitting on short films with no distribution.
- Start with 5-10 launch partners, not 50. Quality over quantity. Each partner's success creates a case study for the next.
- "Multiple user roles" strategy: let early creators also be viewers. Encourage creators to watch and react to each other's content, creating initial engagement data.

**Warning signs:**
- More than 3 months pass between mock data completion and first external creator onboarding
- Creator pitches rely on projections rather than actual platform data
- Launch partner conversations stall on "we will wait and see how the platform does"
- Platform has content but zero organic viewer-to-viewer sharing

**Phase to address:**
Pre-launch / Phase 1. The ad campaign validation (Pitfall 1) feeds directly into this. Run paid ads for your own content, gather conversion data, then use that data to recruit launch partners.

---

### Pitfall 5: Video Transcoding Costs and Complexity Spiral Out of Control

**What goes wrong:**
A microshort platform with 8-70 episodes per season, potentially across 15-25+ series, needs each video transcoded into multiple resolutions (360p, 480p, 720p, 1080p) with HLS adaptive bitrate streaming. Building a custom transcoding pipeline is a common startup trap -- it takes months, costs significantly in cloud compute, and the edge cases (corrupt uploads, unusual codecs, variable frame rates, portrait vs. landscape) are endless. Meanwhile, CDN bandwidth costs for video delivery can spike unexpectedly, turning a $50/month hosting bill into a $500+/month bill with modest traffic.

**Why it happens:**
Developers underestimate transcoding complexity. "Just convert to MP4" ignores the reality of adaptive bitrate, segment alignment, keyframe intervals, and per-title encoding optimization. Building it from scratch with FFmpeg is a multi-month project that produces a fragile pipeline.

**How to avoid:**
- Use a managed video API (Mux, Cloudflare Stream, or Bunny.net Stream) instead of building transcoding infrastructure. Mux provides automatic per-title encoding, HLS packaging, and a global CDN for ~$0.007/min stored + $0.005/min streamed. For microshorts (1-3 min episodes), this is extremely affordable at launch scale.
- Set hard upload limits: max file size, max duration (3 minutes), accepted codecs. Reject non-conforming uploads at the API level before they hit transcoding.
- For mock data / pitch phase, pre-encode a fixed set of demo videos and serve them statically. Do not run a transcoding pipeline for content that does not change.
- Monitor CDN costs weekly from day one. Set billing alerts at 2x and 5x your expected baseline.

**Warning signs:**
- Team is spending weeks on FFmpeg configuration instead of product features
- Transcoding jobs fail silently, leaving broken video entries in the database
- CDN bill doubles in a single month without a corresponding traffic increase (indicates misconfiguration or hotlinking)
- Video upload-to-playable latency exceeds 5 minutes for a 2-minute clip

**Phase to address:**
Phase 1 (Video Infrastructure). Choose a managed video service before writing any transcoding code. This is a "buy, don't build" decision for v1.

---

### Pitfall 6: Social Media Ad API Integration Is Fragile and Platform-Dependent

**What goes wrong:**
The unified social media attribution dashboard (Meta, TikTok, YouTube, X/Twitter) is a core feature, but each platform's ad API has different auth flows, rate limits, data formats, reporting delays, and approval requirements. TikTok's Content Posting API requires becoming an approved Content Marketing Partner. Meta's Conversions API requires domain verification and pixel configuration. YouTube's API has strict quota limits. X/Twitter's API pricing changed dramatically in 2023 and remains unstable. Building direct integrations with all four simultaneously is a recipe for months of platform-specific debugging.

**Why it happens:**
Each platform's API is designed for that platform's use case, not for aggregation dashboards. Data schemas differ (a "view" means different things on each platform), attribution windows differ (Meta uses 7-day click / 1-day view; TikTok uses 28-day click / 7-day view), and APIs break or change without notice.

**How to avoid:**
- Phase the integrations: start with Meta (largest ad platform, best-documented API) and add others one at a time. Do not attempt all four simultaneously.
- Use a unified social media API service (like Ayrshare or a similar aggregation layer) for posting/analytics, and use each platform's native ad manager for ad-specific attribution until volume justifies custom integration.
- For the MVP pitch, use static screenshots of ad dashboards alongside platform analytics rather than building a live integration. Investors care about the conversion data, not the dashboard that displays it.
- Define a canonical event schema (view, click, signup, unlock, revenue) and map each platform's events to it. This schema is more important than any individual integration.

**Warning signs:**
- A single platform's API change breaks the entire attribution dashboard
- Team is spending more time on API integration than on the core product
- Attribution numbers from different platforms do not reconcile (Meta says 100 conversions, Stripe says 40 payments)
- API rate limits cause data gaps in reporting

**Phase to address:**
Phase 2 or 3 (Analytics). Do NOT build this in Phase 1. For Phase 1, use each platform's native ad manager manually and track conversions via UTM parameters + Stripe payment metadata. Build the unified dashboard only after validating the core product.

---

### Pitfall 7: Variable Revenue Split Creates Accounting and Legal Complexity

**What goes wrong:**
Variable revenue splits (better rates for launch partners, standard for later creators) sound simple but create significant complexity. Every payment must be split differently based on the creator's tier. Tax reporting (1099s in the US) must be accurate per creator. If rates change over time, you need to track which rate applies to which transactions. Disputes arise when creators compare rates. Legal contracts must specify the split, the conditions for the better rate, and what happens if conditions change.

**Why it happens:**
Variable splits are a smart GTM strategy, but the implementation is treated as a simple percentage field when it is actually a contractual, accounting, and compliance system.

**How to avoid:**
- Use Stripe Connect with destination charges or separate charges and transfers. The split logic should be in Stripe's system, not in custom application code. Stripe handles the 1099-K reporting threshold automatically for connected accounts.
- Define exactly 2-3 tiers (e.g., Launch Partner: 85/15, Standard: 70/30, Featured: 80/20) with clear criteria for each. Do not allow custom per-creator negotiations at v1 scale.
- Lock the revenue split per transaction at the time of purchase. If a creator's tier changes, it applies only to future transactions. Never retroactively change splits.
- Have a lawyer review the creator agreement before onboarding the first external creator. Not before launch -- before the FIRST creator.

**Warning signs:**
- Revenue split percentages are stored only in application code, not in contracts
- No clear documentation of which creators are on which tier
- Creator payouts are calculated manually or in spreadsheets
- Tax reporting obligations are not yet researched

**Phase to address:**
Phase 1 (Payments / Legal). The Stripe Connect integration and creator agreement must be built together. Do not launch payouts without legal review of the split structure.

---

### Pitfall 8: Real-Time Reactions System Becomes an Unscalable Performance Bottleneck

**What goes wrong:**
Live reactions (emojis popping on screen) from concurrent viewers + accumulated reactions from past viewers (timestamp-synced) is a feature that seems simple but hides enormous complexity. Every emoji reaction needs to be: received via WebSocket, broadcast to all concurrent viewers, stored with a timestamp for future replay, and rendered on screen without jank. At 100 concurrent viewers each reacting once per second, that is 100 incoming messages/second and 10,000 outgoing messages/second (100 reactions broadcast to 100 viewers). At 1,000 viewers, it is 1,000,000 outgoing messages/second. This scales quadratically.

**Why it happens:**
Developers prototype with a single WebSocket server, 5 test users, and everything is fast. The architecture works perfectly until it does not. The transition from "works in dev" to "works at 100+ concurrent users" requires a fundamentally different architecture (pub/sub, message aggregation, sharding).

**How to avoid:**
- Aggregate reactions from the start. Never broadcast individual reactions. Batch reactions into 1-second windows: "thumbs-up: 47, heart: 23, laugh: 12" rather than 82 individual messages. This reduces broadcast volume by 95%+.
- Separate live reactions from historical reactions entirely. Historical reactions are a pre-computed data layer (store aggregated reaction counts per 5-second timestamp bucket). Live reactions use WebSockets. They are two different systems that render to the same UI.
- Use a managed WebSocket/real-time service (Ably, Pusher, or Supabase Realtime) rather than building custom WebSocket infrastructure. These services handle pub/sub, connection management, and scaling.
- For v1, consider making reactions "near-real-time" (2-3 second batching delay) rather than truly real-time. Users will not notice a 2-second delay on emoji reactions, and it massively reduces infrastructure complexity.

**Warning signs:**
- Reaction system works in local testing but causes visible lag with 10+ concurrent viewers
- WebSocket server memory usage grows linearly with connected users
- Individual reaction events are stored in the database (one row per emoji, not aggregated)
- No message batching or aggregation in the WebSocket layer

**Phase to address:**
Phase 2 (Social Features). Do NOT build this in Phase 1. Phase 1 should have pre-recorded/accumulated reactions only (no live component). Add live reactions in Phase 2 with proper aggregation architecture.

---

### Pitfall 9: AI Auto-Subtitling Appears to Work but Fails on Real Content

**What goes wrong:**
AI subtitling (likely Whisper-based) works well on clean, single-speaker, English audio. But real microshort content includes: background music, sound effects, multiple speakers talking over each other, accents, slang, whispered dialogue, non-English phrases mixed into English dialogue, and intentional audio effects. Whisper's accuracy drops significantly on non-ideal audio. Timestamps drift on longer content. Multi-language subtitle generation compounds errors (translating already-incorrect transcriptions).

**Why it happens:**
Demos use clean audio samples. Production content has messy audio. The gap between "95% accurate on clean audio" and "80% accurate on real content" is the difference between usable and unusable subtitles. And multi-language generation means errors in the source language get amplified in translations.

**How to avoid:**
- Always provide a human review step in the creator dashboard. Auto-generate subtitles, but require creators to review and approve before publishing. This is non-negotiable.
- Pre-process audio: strip background music/effects where possible before sending to speech-to-text. Audio separation models (like Demucs) can isolate vocals.
- Use `--word_timestamps True` flag (or equivalent) to prevent timestamp drift on content near the 3-minute maximum.
- For multi-language, use the AI transcription for the source language only, then use a dedicated translation API (DeepL, Google Translate) on the corrected text rather than running Whisper in multi-language mode.
- Set quality expectations: subtitle generation is a "draft" tool, not a "done" tool. Creator UI messaging should say "Review auto-generated subtitles" not "Subtitles generated."

**Warning signs:**
- Subtitles are auto-published without creator review
- No subtitle editing interface in the creator dashboard
- Test content uses only clean, single-speaker audio
- Multi-language subtitles are generated without validating the source language transcription first

**Phase to address:**
Phase 2 (Creator Tools). Subtitle generation is not Phase 1. When built, it must include an editing/review UI, not just a generate button.

---

### Pitfall 10: Mock Data That Looks Fake Destroys Pitch Credibility

**What goes wrong:**
The mock data seeding system (15-25 series across genres) must make the platform look like a thriving, real product. But AI-generated thumbnails, lorem ipsum descriptions, impossible view counts, and obviously fake creator profiles immediately signal "this is not real" to investors and potential creator partners. A platform that looks fake is worse than a platform with one real series, because it signals deception rather than early-stage reality.

**Why it happens:**
Mock data is treated as a development convenience rather than a pitch-critical asset. Developers generate data programmatically without considering how it reads to a non-technical evaluator.

**How to avoid:**
- Write every mock series description by hand. Each series needs a believable title, logline, genre, and episode structure. Study how Netflix, Tubi, and Roku Channel present their catalogs and mirror that tone.
- Use AI-generated thumbnails that look like real promotional art, not "obviously AI" imagery. Run thumbnails through fal.ai's best model and select the best results manually. Discard any that have AI artifacts (extra fingers, text gibberish, uncanny faces).
- Keep view counts and engagement numbers modest and realistic. 500-5,000 views per episode, not 50,000. A brand-new platform with 50K views per episode is obviously fake.
- Include 2-3 creator profiles that are your actual team members with real photos and bios. Mix real and mock to create plausible density.
- Mock data should be clearable in one command (already planned) -- but also exportable for backup, so you do not lose curated mock data accidentally.

**Warning signs:**
- All mock series have the same description length and writing style
- Thumbnails have visible AI artifacts (mangled text, extra limbs)
- View counts are suspiciously round (1,000, 5,000, 10,000) or suspiciously high
- No real content exists alongside mock content
- Demo walkthrough avoids showing details pages because they look thin

**Phase to address:**
Phase 1 (Pitch & Demo). Mock data quality is as important as code quality for a pitch-focused v1. Budget time for manual curation, not just automated seeding.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Storing videos on your own server instead of a video CDN/API | Saves API costs early | Bandwidth costs spike unpredictably; no adaptive bitrate; no global edge delivery | Never -- use a managed video service from day one |
| Hardcoding revenue split percentages in app code | Ship faster | Every tier change requires a code deploy; no audit trail; legal risk | Never -- store in database with creator agreement reference |
| Building WebSocket infrastructure from scratch | Full control | Scaling requires pub/sub, load balancing, connection management; months of ops work | Only if team has prior WebSocket infrastructure experience |
| Skipping Stripe Connect and doing manual payouts | Avoid Stripe Connect complexity | Tax reporting burden, manual reconciliation, payout errors, legal liability | Only for first 1-2 creators during initial testing |
| Using direct `<video>` tag HLS on iOS instead of MSE/player library | Simpler implementation | iOS backgrounding bug breaks playback; limited control over ABR switching | Only for prototype; replace with proper player before any user testing |
| Single database for content, users, and analytics events | Simpler architecture | Analytics queries slow down content serving; events table grows unboundedly | MVP only -- separate analytics before 1,000 users |
| No rate limiting on reaction WebSocket endpoints | Faster to ship | One spammer can flood reactions, causing broadcast storms and server overload | Never -- add rate limiting before any public access |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Stripe Connect | Using `Standard` accounts for creators (requires them to manage their own Stripe dashboard) | Use `Express` accounts -- platform controls the experience, creators just enter bank details; handles 1099-K compliance |
| Stripe Connect cross-border | Assuming you can pay creators in any country | Stripe Connect has regional restrictions. Platform and connected accounts must be in the same region for transfers unless using cross-border transfers (US/CA/UK/EEA/CH only). Research country support before promising global creator payouts |
| Meta Ads API | Building conversion tracking without server-side Conversions API | Client-side Pixel is increasingly blocked by browsers/iOS. Implement Meta Conversions API (server-side) from the start for accurate attribution |
| TikTok Content Posting API | Assuming public API access for video posting/ad integration | Requires approved Content Marketing Partner status. Apply early -- approval takes weeks to months |
| fal.ai (thumbnail generation) | Generating thumbnails on-the-fly during page loads | Pre-generate and cache all thumbnails during the seeding process. fal.ai calls are async with variable latency -- never put them in the request path |
| Whisper / Speech-to-Text | Sending full audio files for transcription | Extract and pre-process audio (strip music, normalize volume) before transcription. Send audio-only files, not full video files, to reduce processing time and cost |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Storing individual reaction events as database rows | Works fine, queries are fast | Aggregate reactions into time-bucketed counters (e.g., per 5-second window per episode). Store aggregates, not individual events | >50 concurrent viewers per episode (thousands of rows per minute) |
| Loading all episodes for a series in a single API call | Fast for series with 8 episodes | Paginate episode lists. A season with 70 episodes (max spec) means 70 video metadata objects + thumbnails | >30 episodes per season, or >100 series in catalog |
| No CDN for thumbnails/static assets | Fine when all users are local | Use a CDN for all static assets from day one. Thumbnail images are small but loaded frequently | >500 concurrent users or users outside your hosting region |
| Synchronous video processing on upload | Upload completes quickly for small files | Make transcoding async with a job queue. Return immediately to the creator, notify when processing is done | >5 concurrent uploads or videos >100MB |
| Broadcasting analytics events to the analytics pipeline synchronously | All events are captured | Buffer analytics events client-side, batch-send every 30 seconds. Use a message queue (not direct DB writes) for the pipeline | >200 concurrent viewers generating watch events |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Relying only on "disable right-click" for content protection | Zero actual protection; anyone with browser dev tools can download videos | Use signed URLs with short expiration (15-30 min) for video segments. Rotate signing keys. Accept that DRM-level protection is not feasible for a PWA v1, but signed URLs prevent casual scraping |
| Storing creator payout bank details in your own database | PCI-like liability; breach exposes financial data | Never store banking details. Stripe Connect handles all sensitive financial data. Your database only stores the Stripe Connected Account ID |
| No rate limiting on payment endpoints | Attackers can test stolen cards against your payment flow | Implement Stripe's built-in fraud prevention (Radar). Add IP-based rate limiting on payment initiation. Require CAPTCHA after 3 failed payment attempts |
| Trusting whitelisted creators to never upload harmful content | Legal liability if a "trusted" creator uploads CSAM, copyrighted, or violent content | Even with whitelisted creators, implement basic automated scanning (hash-matching against known CSAM databases is legally required in many jurisdictions; use PhotoDNA or similar). Log all uploads with creator identity |
| Exposing creator revenue data in client-side API responses | Competitors or other creators see revenue figures | Ensure revenue/conversion endpoints require creator authentication AND only return data for the authenticated creator's own content. Never include revenue data in public API responses |
| Mock data seeding script accessible in production | Allows anyone to reset or pollute the database | Gate the seeding script behind an environment variable check (`NODE_ENV !== 'production'`). Better: make it a CLI command, not an API endpoint |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Requiring account creation before watching free episodes | Kills the zero-friction funnel from social media ads; user bounces before seeing content | Allow anonymous viewing for first 3 free episodes. Only require account creation at the payment step (already planned -- enforce this requirement ruthlessly) |
| Payment wall appears without showing what the user is buying | User does not know if Season 2 is worth paying for | Show episode count, thumbnails, descriptions, and a trailer/preview for the locked season. Make the value visible before asking for money |
| Reactions/comments overlay covers video content | Viewer cannot see the video they came to watch | "Cinematic toggle" (already planned) must default to ON for first-time viewers. Social features should be opt-in, not opt-out. Reactions should appear in margins/edges, not center of video |
| Creator dashboard shows vanity metrics without actionable data | Creators see view counts but cannot diagnose why conversions are low | Show the full funnel: impressions to views to free completions to signups to unlocks. Highlight where the biggest drop-off occurs |
| Mobile player controls overlap with system UI gestures | Swipe-to-go-back, swipe-down-to-close, and bottom bar gestures conflict with player controls | Test on real devices with system gesture navigation enabled. Use safe areas for interactive elements. The vertical player is especially vulnerable to gesture conflicts |
| Share links open a generic homepage instead of the specific series/episode | User shared a specific moment, recipient sees an unrelated homepage | Deep linking must work from day one: every series and episode has a unique, shareable URL that loads the correct content. This is critical for the social media ad funnel |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Video Player:** Looks great in Chrome desktop -- verify it works when installed as iOS PWA, backgrounded, and resumed. Test on at least 3 physical iOS devices
- [ ] **Stripe Connect:** Creator can receive a test payment -- verify tax reporting setup, payout schedule configuration, and handling of failed payouts (bank rejects, insufficient platform balance)
- [ ] **Mock Data:** 25 series seeded with thumbnails -- verify each series detail page looks realistic (descriptions, episode counts, view numbers, creator profiles). Walk through every page as if pitching
- [ ] **Free Episode Funnel:** First 3 episodes play without login -- verify that episode 4 correctly triggers the payment wall, that the payment wall shows the right price, and that successful payment immediately unlocks remaining episodes
- [ ] **Share Links:** Links generate with rich previews -- verify previews render correctly on iMessage, WhatsApp, X/Twitter, Facebook, and Slack (each renders Open Graph tags differently)
- [ ] **Creator Dashboard Analytics:** Charts display correctly -- verify data is real (not hardcoded), updates when new events occur, and handles the zero-data state gracefully (new creator with no views)
- [ ] **Revenue Split:** Payments split correctly in test mode -- verify the split matches the creator's contractual tier and that the platform's take is correctly calculated after Stripe's processing fees
- [ ] **Subtitles:** Auto-generated subtitles appear on screen -- verify timing accuracy, handling of overlapping dialogue, and that the creator can edit them before publishing
- [ ] **Responsive Layout:** Looks good on iPhone 15 -- verify on iPhone SE (small screen), iPad (medium screen), and a 13" laptop. Vertical video player aspect ratio is the hardest to get right across breakpoints
- [ ] **Search/SEO:** Series pages load correctly -- verify that Google can crawl and index them (server-side rendered or statically generated, not client-only SPA rendering)

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| iOS PWA video playback broken | MEDIUM | Implement blob URL workaround + visibilitychange listener. Can be patched without architecture change, but requires thorough testing across iOS versions |
| Transcoding pipeline built from scratch and fragile | HIGH | Migrate to managed video API (Mux/Cloudflare Stream). Requires re-uploading all content and updating all video URLs. Budget 2-3 weeks |
| Revenue split logic is wrong and creators were underpaid | HIGH | Audit all transactions, calculate correct amounts, issue corrective payments. Legal exposure if contracts were violated. This must never happen -- validate split math with unit tests |
| Real-time reactions cause server overload | MEDIUM | Disable live reactions temporarily (show only accumulated/historical). Implement message aggregation. Redeploy. Can be done in days, not weeks |
| Social media API integration breaks (platform changes API) | LOW | Revert to manual tracking via UTM parameters + Stripe metadata. The core product (watch + pay) does not depend on social API integrations |
| Mock data looks obviously fake during a pitch | MEDIUM | Pause pitching. Spend 1-2 weeks hand-curating mock data: rewrite descriptions, regenerate thumbnails, adjust metrics. This is a sprint, not a rebuild |
| Creator fund/split model is unsustainable | HIGH | Renegotiate creator agreements (may lose launch partners). Adjust tier thresholds. This is a business model pivot, not a technical fix |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Distribution before product (Quibi Trap) | Phase 1 | At least one social media ad campaign running before platform launch. Share links with rich previews functional |
| Per-season payment friction | Phase 1 (Payments) | Bundle pricing implemented. Funnel analytics tracking Season 1 to Season 2 conversion rates |
| iOS PWA video playback | Phase 1 (Video Player) | Manual test protocol: install as PWA on iPhone, background app, resume, verify playback works. Tested on every PR that touches the player |
| Chicken-and-egg marketplace | Pre-launch + Phase 1 | Real conversion data from at least one self-produced series before first creator pitch. First 3 launch partners signed within 30 days of pitch-ready state |
| Transcoding cost/complexity | Phase 1 (Infrastructure) | Managed video API selected and integrated. No custom FFmpeg pipelines. CDN cost monitoring active |
| Social media API fragility | Phase 2-3 (not Phase 1) | Phase 1 uses UTM + manual tracking. Phase 2+ adds integrations one platform at a time, starting with Meta |
| Revenue split complexity | Phase 1 (Payments + Legal) | Creator agreement template reviewed by lawyer. Stripe Connect Express accounts configured. Split logic has unit tests for every tier |
| Real-time reaction scaling | Phase 2 (not Phase 1) | Phase 1 has accumulated reactions only (pre-computed). Phase 2 adds live reactions with message aggregation. Load tested at 100+ concurrent viewers before launch |
| AI subtitling quality | Phase 2 (Creator Tools) | Phase 1 has no auto-subtitling. Phase 2 includes subtitle editing UI alongside generation. Tested on 5+ real content samples with background music/effects |
| Mock data credibility | Phase 1 (Pitch) | Every mock series page reviewed by a non-team-member for realism. AI thumbnails manually curated (not auto-accepted) |
| Content safety despite whitelisted creators | Phase 1 (Compliance) | Automated hash-matching for CSAM integrated before first user-uploaded content goes live. Upload logging with creator identity |

## Sources

- [7 Reasons Quibi Failed Despite Raising $1.8B](https://www.failory.com/cemetery/quibi) -- Quibi post-mortem analysis
- [Why Quibi Died: The $2B Dumpster Fire](https://www.howtheygrow.co/p/why-quibi-died-the-2b-dumpster-fire) -- Detailed Quibi failure analysis
- ['Never had a chance': Inside Verizon's $1B bad bet on Go90](https://digiday.com/media/go90-never-shot/) -- Go90 failure post-mortem
- [15 Failed Streaming Startups & Analyses](https://www.failory.com/startups/streaming-failures) -- Pattern analysis across failed platforms
- [Video playback fails on PWA after reopening -- Apple Community](https://discussions.apple.com/thread/256166996) -- iOS PWA video bug reports
- [PWA on iOS - Current Status & Limitations 2025](https://brainhub.eu/library/pwa-on-ios) -- PWA iOS limitations documentation
- [19 Tactics to Solve the Chicken-or-Egg Problem](https://www.nfx.com/post/19-marketplace-tactics-for-overcoming-the-chicken-or-egg-problem) -- Marketplace bootstrapping strategies (NFX)
- [WebSocket Scale in 2025: Architecting Real-Time Systems](https://www.videosdk.live/developer-hub/websocket/websocket-scale) -- WebSocket scalability patterns
- [WebSocket Architecture Best Practices](https://ably.com/topic/websocket-architecture-best-practices) -- Ably's WebSocket scaling guide
- [Stripe Connect Marketplace Documentation](https://docs.stripe.com/connect) -- Stripe Connect implementation patterns
- [Marketplace Payments 2025 Guide](https://www.nauticalcommerce.com/blog/marketplace-payments-guide) -- Marketplace payout best practices
- [Creator Economy Trends 2025](https://www.fundmates.com/blog/creator-economy-trends-what-platforms-are-paying-the-most-in-2025) -- Revenue split benchmarks
- [The Vertical Revolution: How Microdramas Became a Multi-Billion Dollar Phenomenon](https://variety.com/2025/tv/news/global-microdrama-boom-1236560947/) -- ReelShort/micro-drama market data
- [CDN Bandwidth Optimization for Bootstrapped Startups](https://blog.filestack.com/cdn-bandwidth-optimization-bootstrapped-startups/) -- CDN cost management
- [Video Streaming APIs: What Developers Need to Know](https://www.mux.com/articles/video-streaming-apis-what-developers-actually-need-to-know) -- Managed video infrastructure
- [Whisper Inaccurate Subtitles Discussion](https://github.com/openai/whisper/discussions/1811) -- Whisper accuracy issues on real content
- [Content Moderation Challenges in Video Streaming](https://www.muvi.com/blogs/content-moderation-challenges-in-video-streaming/) -- Video moderation complexity
- [OTT Platform Development: 10 Common Mistakes](https://medium.com/@sumanta_93769/ott-platform-development-10-common-mistakes-to-avoid-in-2025-aa08c0fe2026) -- Streaming platform technical mistakes

---
*Pitfalls research for: Freemium microshort video platform with creator marketplace*
*Researched: 2026-02-14*
