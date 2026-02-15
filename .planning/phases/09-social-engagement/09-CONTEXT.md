# Phase 9: Social + Engagement - Context

**Gathered:** 2026-02-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Users have social identities on the platform and can interact with content through reactions, comments, favorites, and following creators. This phase adds profiles, live emoji reactions during playback, timestamp-synced scrolling comments, favorites, watch history, and a cinematic mode toggle. Creating content, monetization, and moderation workflows are handled by prior phases.

</domain>

<decisions>
## Implementation Decisions

### Live Reactions
- Curated emoji set (6-8 emojis: fire, heart, laugh, cry, shocked, clap, etc.)
- Float-up-from-bottom animation style (like Instagram Live / TikTok Live)
- Unlimited sending — no cooldown per user
- Client-side display cap (~20 simultaneous bubbles max) to prevent lag at scale
- Accumulated past reactions replay at their original timestamps as floating bubbles (not heatmap)
- Replay volume scales with real reaction counts — popular moments get more bubbles
- Just emoji in bubbles — no username or avatar attached
- Floating button that expands into emoji picker on tap (not a persistent bottom bar)
- Account required to react (no anonymous reactions)
- Must work on both mobile (9:16 vertical player) and desktop (theater mode)

### Scrolling Comments
- Bottom-up overlay style — comments appear at bottom ~25% of video and scroll upward, semi-transparent (Instagram Live style)
- Timestamp-synced — comments replay at the timestamp they were posted during playback
- Pause-to-comment — posting a comment pauses the video, resumes after sending (ensures accurate timestamp)
- Basic profanity/spam auto-filter, instant post for everything else, report/flag for after-the-fact moderation
- Must be responsive for both mobile and desktop viewports

### Profile & Activity Page
- Auto-generated initials avatar as default, with option to upload a photo
- Full public activity page: favorited series, followed creators, recent reactions, and recent comments
- Watch history is private by default, user can choose to make it public
- Simple heart/save for favorites — single favorites list, no collections

### Cinematic Mode
- Hides both comments overlay and floating reaction bubbles (reaction picker button stays visible for quick access)
- Toggle lives in the player controls bar alongside play/pause, volume, fullscreen
- Default state: social on (comments and reactions visible for new users)
- Preference persists across sessions (remembers user's last choice)
- Responsive: works properly on both mobile and desktop player layouts

### Claude's Discretion
- Exact curated emoji selection (within the 6-8 range)
- Bubble animation speed, size, and fade timing
- Comment overlay opacity and font sizing
- Profanity filter word list and spam detection approach
- Profile page layout and component structure
- Watch history tracking granularity (per-episode vs per-session)

</decisions>

<specifics>
## Specific Ideas

- Reactions should feel like watching with a crowd — accumulated replay creates the "audience in the room" effect
- On mobile (primary use case), overlays must not feel cramped on the 9:16 vertical player
- Cinematic mode is the escape hatch — social features are on by default but one tap makes them disappear

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 09-social-engagement*
*Context gathered: 2026-02-15*
