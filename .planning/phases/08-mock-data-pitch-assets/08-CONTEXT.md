# Phase 8: Mock Data + Pitch Assets - Context

**Gathered:** 2026-02-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Populate the platform with realistic mock content (15-25 series across all genres) so it looks like a thriving marketplace, then build standalone pitch pages for investors, creators, brands, and advisors. Includes showcase dashboards with mock attribution and ad data. Does NOT include actual ad integration, real traction metrics, or content moderation features.

</domain>

<decisions>
## Implementation Decisions

### Mock Content Character
- Fully believable series: each has a compelling logline, unique episode titles, synopses — looks like a real catalog
- Full creator personas: unique names, bios, avatars, social links, backstories — feels like real people
- Even genre coverage: at least 1-2 series in every genre category (Drama, Comedy, Thriller, Sci-Fi, Horror, Romance, Action, Documentary, BTS, Music, Sports)
- Mix of 1-3 seasons per series: some single-season (new shows), some multi-season (established) for realism
- Varied pricing: $0.99–$7.99 range across series/seasons to show flexible creator pricing
- Realistic engagement data: seed view counts (hundreds to thousands), purchase counts, follower numbers so platform looks active

### Video Strategy
- ONE hero series (sci-fi) gets actual royalty-free stock video clips for every episode — this is the demo series
- All other series use a single short branded MicroShort loop clip as placeholder — something plays, but it's clearly not the featured content
- AI-generated thumbnails via fal.ai for all series — pre-generate and store locally, seed script uploads from local files (avoids API costs on repeated seeds)

### Seeding Mechanism
- CLI seed script: `pnpm seed` / `pnpm seed:clear` commands for developer workflow
- No admin panel button — developer-facing tool only
- Script handles: creating creator profiles, series, seasons, episodes, uploading thumbnails to Supabase Storage, uploading video to Mux, seeding engagement metrics

### Pitch Page Messaging
- Core investor narrative: market gap story — "Short-form video has no monetization layer — MicroShort is the missing marketplace"
- Vision-focused, no fake traction numbers — focus on market opportunity, product capability, and platform screenshots/demos
- Platform base + marketing flair: same dark cinematic theme but with marketing-style sections, bigger typography, scroll effects
- Public URLs: /pitch/investors, /pitch/brands, /pitch/advisors, /pitch/creators — anyone with the link can view
- Hub page at /pitch linking to all stakeholder pages
- Remotion for animated feature loops in each pitch section — small looping compositions showing key features in action (player, browsing, paywall, creator dashboard) instead of static screenshots
- Full pitch demo video with Remotion is deferred for later
- Must research compelling pitch page patterns/best practices before building
- Frontend implementation must use the frontend-design plugin for high design quality

### Brand/Sponsor Pitch
- Present full ad product vision: sponsored series, pre-roll ad spots, and branded/native content partnerships
- Position MicroShort as a brand-safe, genre-targeted advertising platform

### Advisor Pitch
- Cast wide: entertainment, tech, and business advisory expertise — not limited to one domain

### Creator Landing Page
- Separate page at /creators — distinct from /dashboard/apply (existing application form)
- Hero message: format validation angle — "Short-form deserves its own home"
- Transparent economics: "Creators keep 80% of every sale" — exact split shown
- Waitlist signup: collect email for creator waitlist pipeline
- No social proof/testimonials — let product features and economics speak
- No mock creator quotes — platform features only
- Links to /dashboard/apply for those ready to apply now

### Showcase Dashboards
- Content warnings display dropped from showcase/pitch material — not sales-relevant

### Claude's Discretion
- Pitch page tone per audience (bold vs. data-driven vs. storytelling — adapt to each stakeholder)
- CTA hierarchy per pitch page (explore platform + contact — balance per audience)
- Visual differentiation between stakeholder pages (accents, motifs — or consistent template)
- Creator landing page layout for different creator types (sections vs. tabs vs. callouts)
- Waitlist data storage approach (Supabase table vs. external form service)
- Attribution dashboard story (source tracking, creator ROI, content funnel — or combination)
- Social media ad dashboard content (campaign performance, content-as-creative, audience insights)
- Showcase dashboard interactivity level (interactive charts vs. static polished displays)
- Which sci-fi series to use as the hero demo series (will communicate choice to user)

</decisions>

<specifics>
## Specific Ideas

- Hero demo series must be sci-fi genre — user demos by clicking this specific series during presentations
- Remotion (remotion.dev) for animated feature loops on pitch pages — small React compositions showing features in action, not static screenshots
- Pricing range explicitly includes low end ($0.99, $1.99) to show accessibility alongside premium ($5.99, $7.99)
- Single branded loop clip for non-demo series — something plays to avoid broken state, but clearly a placeholder
- Pre-generated thumbnails stored locally to avoid fal.ai API costs on repeated seed runs

</specifics>

<deferred>
## Deferred Ideas

- Full pitch demo video using Remotion — revisit after phase is built, create as a separate follow-up
- Content warnings/moderation as a selling point — not included in pitch material for now

</deferred>

---

*Phase: 08-mock-data-pitch-assets*
*Context gathered: 2026-02-15*
