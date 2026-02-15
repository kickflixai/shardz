# Phase 9: Social + Engagement - Research

**Researched:** 2026-02-15
**Domain:** Social features (profiles, reactions, comments, favorites, watch history), Supabase Realtime broadcast, CSS animation, video player overlay integration
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Live Reactions
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

#### Scrolling Comments
- Bottom-up overlay style — comments appear at bottom ~25% of video and scroll upward, semi-transparent (Instagram Live style)
- Timestamp-synced — comments replay at the timestamp they were posted during playback
- Pause-to-comment — posting a comment pauses the video, resumes after sending (ensures accurate timestamp)
- Basic profanity/spam auto-filter, instant post for everything else, report/flag for after-the-fact moderation
- Must be responsive for both mobile and desktop viewports

#### Profile & Activity Page
- Auto-generated initials avatar as default, with option to upload a photo
- Full public activity page: favorited series, followed creators, recent reactions, and recent comments
- Watch history is private by default, user can choose to make it public
- Simple heart/save for favorites — single favorites list, no collections

#### Cinematic Mode
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

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

## Summary

Phase 9 adds the social identity and engagement layer to MicroShort. It builds on an existing architecture where the `profiles` table already stores `display_name`, `avatar_url`, `bio`, `social_links`, and `follower_count`, and the `followers` table with denormalized count triggers already exists from Phase 6. The `FollowButton` component with `useOptimistic` is already implemented. The key new work falls into four areas: (1) viewer-facing profile and activity pages with favorites, watch history, and avatar upload, (2) live emoji reactions using Supabase Realtime broadcast with accumulated timestamp-synced replay from database storage, (3) scrolling comments overlay synced to video timestamps with profanity filtering, and (4) a cinematic mode toggle that persists user preference.

The video player architecture is well-suited for overlays: `PlayerLayout` provides a responsive container (full-width 9:16 on mobile, max-480px centered on desktop), and `VideoPlayer` wraps MuxPlayer with a ref-accessible `MuxPlayerRefAttributes` interface. MuxPlayer supports `onTimeUpdate` events and exposes `currentTime` via the ref, which is essential for timestamp-synced comments and reactions. The existing Supabase Realtime pattern from the community feed (Phase 6) uses `postgres_changes` subscriptions; for live reactions, we instead use Realtime **broadcast channels** which are designed for low-latency ephemeral messages without database writes for each live event.

**Primary recommendation:** Use Supabase Realtime broadcast for live reactions (ephemeral, no DB write per reaction). Store accumulated reactions in a `reactions` database table keyed by `(episode_id, timestamp_seconds, emoji)` with a count column, written via a batch-aggregation server action (not per-reaction DB writes). Use pure CSS keyframe animations for floating bubbles (no Framer Motion needed -- keep bundle small). Use `obscenity` for profanity filtering. Build all new features with the existing Server Actions + Zod v4 + `useActionState` pattern. Store cinematic mode preference in `localStorage`.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/supabase-js` | ^2.95.3 (installed) | Realtime broadcast channels, database CRUD, Storage for avatars | Already the core data layer; broadcast is built-in |
| `@mux/mux-player-react` | ^3.11.4 (installed) | Video player with `onTimeUpdate`, `currentTime` ref access | Already the player; supports all needed event hooks |
| `zod` | ^4.3.6 (installed) | Validation for comments, profile updates, favorites | Established validation pattern throughout codebase |
| `sonner` | ^2.0.7 (installed) | Toast notifications for social actions | Already integrated |
| `lucide-react` | ^0.564.0 (installed) | Icons for cinematic mode toggle, favorites heart, etc. | Already the project's icon library |
| `radix-ui` | ^1.4.3 (installed) | Avatar component (already in use), Popover for emoji picker | Already provides Avatar primitives used in profiles |

### New Dependencies
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `obscenity` | ^0.4.x | Profanity detection and censoring for comments | Server-side comment validation before insert |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `obscenity` | `bad-words` | `bad-words` is older, less maintained (last publish ~1yr ago), misses leet-speak/unicode obfuscation. `obscenity` catches variants like `fuuuuck`, `ʃṳ𝒸𝗄` with transformer-based matching |
| `obscenity` | `leo-profanity` | `leo-profanity` is simpler but less robust -- no transformer pipeline for obfuscation detection |
| CSS keyframes | Framer Motion | Framer Motion adds bundle size; floating bubbles are simple translate+fade -- CSS keyframes are sufficient and more performant for 20 simultaneous elements |
| `localStorage` (cinematic pref) | Database column | `localStorage` is instant, no server round-trip, no migration; a preference this simple does not justify a database column |
| Supabase Realtime broadcast | Pusher / Ably | Already in stack; broadcast channels handle ephemeral low-latency messages without extra infrastructure |

**Installation:**
```bash
pnpm add obscenity
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── (browse)/
│   │   └── series/[slug]/episode/[episodeNumber]/
│   │       └── page.tsx                    # Extended with social overlays
│   ├── (profile)/                          # NEW route group
│   │   ├── layout.tsx                      # Profile layout with nav
│   │   └── profile/
│   │       ├── page.tsx                    # User's own profile (activity page)
│   │       ├── favorites/page.tsx          # Favorited series list
│   │       ├── history/page.tsx            # Watch history (private)
│   │       └── settings/page.tsx           # Profile settings (avatar, display name)
│   └── (public)/
│       └── user/[username]/page.tsx        # Public activity page for any user
├── components/
│   ├── player/
│   │   ├── video-player.tsx                # Extended: receives overlay props
│   │   ├── player-layout.tsx               # Extended: wraps overlays around player
│   │   ├── reaction-overlay.tsx            # NEW: floating emoji bubbles layer
│   │   ├── reaction-picker.tsx             # NEW: floating button + emoji picker
│   │   ├── comment-overlay.tsx             # NEW: scrolling comments at bottom 25%
│   │   ├── comment-input.tsx               # NEW: pause-to-comment input
│   │   └── cinematic-toggle.tsx            # NEW: toggle in player controls
│   ├── profile/
│   │   ├── public-profile.tsx              # Existing: extended for viewer profiles
│   │   ├── follow-button.tsx               # Existing: no changes needed
│   │   ├── avatar-upload.tsx               # NEW: avatar upload with preview
│   │   └── activity-feed.tsx               # NEW: recent reactions/comments
│   └── social/
│       ├── favorite-button.tsx             # NEW: heart/save toggle
│       └── report-button.tsx               # NEW: flag content for moderation
├── modules/
│   ├── social/
│   │   ├── actions/
│   │   │   ├── favorites.ts               # NEW: add/remove favorites
│   │   │   ├── comments.ts                # NEW: post comment with profanity check
│   │   │   ├── reactions.ts               # NEW: batch-persist accumulated reactions
│   │   │   ├── profile.ts                 # NEW: update viewer profile, avatar
│   │   │   ├── watch-history.ts           # NEW: record watch progress
│   │   │   └── report.ts                  # NEW: flag content
│   │   ├── queries/
│   │   │   ├── get-episode-comments.ts    # NEW: comments for episode
│   │   │   ├── get-episode-reactions.ts   # NEW: accumulated reactions for episode
│   │   │   ├── get-user-favorites.ts      # NEW: user's favorited series
│   │   │   ├── get-watch-history.ts       # NEW: user's watch history
│   │   │   └── get-user-activity.ts       # NEW: public activity feed
│   │   └── hooks/
│   │       ├── use-reactions.ts            # NEW: Realtime broadcast hook
│   │       ├── use-comments.ts             # NEW: Realtime comments hook
│   │       └── use-cinematic-mode.ts       # NEW: localStorage-backed toggle
│   └── content/
│       └── types.ts                        # Extended with new social types
└── lib/
    └── moderation/
        └── profanity.ts                    # NEW: obscenity configuration
```

### Pattern 1: Supabase Realtime Broadcast for Live Reactions
**What:** Use broadcast channels (not postgres_changes) for live emoji reactions. Broadcast is ephemeral -- messages go directly to connected clients without database writes.
**When to use:** Live reactions during video playback where low-latency matters and persistence per individual reaction is not needed.
**Example:**
```typescript
// Source: Supabase docs + Context7 /supabase/supabase-js
// Hook: use-reactions.ts

import { useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface ReactionEvent {
  emoji: string;
  timestamp: number; // video timestamp in seconds
}

export function useReactions(episodeId: string) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`reactions:${episodeId}`, {
      config: { broadcast: { self: true } },
    });

    channel.on("broadcast", { event: "reaction" }, (payload) => {
      const { emoji, timestamp } = payload.payload as ReactionEvent;
      // Add to local bubble queue (capped at ~20)
    });

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [episodeId]);

  const sendReaction = useCallback(
    async (emoji: string, timestamp: number) => {
      await channelRef.current?.send({
        type: "broadcast",
        event: "reaction",
        payload: { emoji, timestamp },
      });
    },
    [],
  );

  return { sendReaction };
}
```

### Pattern 2: Accumulated Reactions with Database Aggregation
**What:** Store aggregated reaction counts per `(episode_id, timestamp_seconds, emoji)` rather than individual reaction events. A server action periodically or on-demand batches reactions.
**When to use:** For the replay feature where past reactions re-appear at their original timestamps.
**Example:**
```typescript
// Server action: batch-persist reactions
// Each row = "at second 42, emoji 'fire' was sent 15 times total"

// Table schema:
// episode_reactions(id, episode_id, timestamp_seconds, emoji, count, created_at)
// UNIQUE(episode_id, timestamp_seconds, emoji)

// On reaction send, also fire a server action:
"use server";
export async function recordReaction(
  episodeId: string,
  timestampSeconds: number,
  emoji: string,
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");

  // Upsert: increment count if exists, insert with count=1 if new
  await supabase.rpc("increment_reaction", {
    p_episode_id: episodeId,
    p_timestamp_seconds: timestampSeconds,
    p_emoji: emoji,
  });
}
```

### Pattern 3: Timestamp-Synced Comment Replay
**What:** Comments are stored with the video timestamp at which they were posted. During playback, `onTimeUpdate` fires and comments whose timestamp falls within the current window are displayed.
**When to use:** For the scrolling comment overlay that shows comments at the moment they were originally posted.
**Example:**
```typescript
// In comment-overlay.tsx
// MuxPlayer fires onTimeUpdate ~4x/second

function onTimeUpdate(event: Event) {
  const player = playerRef.current;
  if (!player) return;
  const currentTime = Math.floor(player.currentTime);

  // Show comments where timestamp_seconds is within [currentTime-1, currentTime]
  const visible = comments.filter(
    (c) => c.timestamp_seconds >= currentTime - 1
        && c.timestamp_seconds <= currentTime
  );
  setVisibleComments(visible);
}
```

### Pattern 4: CSS Keyframe Float-Up Animation with Pool Cap
**What:** Each emoji bubble is a DOM element with a CSS animation that translates upward and fades out. On `animationend`, the element is removed from state. A pool cap of ~20 prevents lag.
**When to use:** For all floating emoji bubble rendering (both live and replay).
**Example:**
```css
/* Floating bubble animation */
@keyframes float-up {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  70% {
    opacity: 1;
    transform: translateY(-60vh) scale(1.1);
  }
  100% {
    opacity: 0;
    transform: translateY(-80vh) scale(0.8);
  }
}

.reaction-bubble {
  position: absolute;
  bottom: 10%;
  animation: float-up 3s ease-out forwards;
  pointer-events: none;
  font-size: 1.75rem;
  /* Randomized left position via inline style */
}
```

```typescript
// React component with pool cap
const MAX_BUBBLES = 20;

function addBubble(emoji: string) {
  setBubbles((prev) => {
    const next = [...prev, { id: crypto.randomUUID(), emoji, left: Math.random() * 80 + 10 }];
    // Cap: remove oldest if over limit
    return next.length > MAX_BUBBLES ? next.slice(next.length - MAX_BUBBLES) : next;
  });
}

function removeBubble(id: string) {
  setBubbles((prev) => prev.filter((b) => b.id !== id));
}

// In render:
{bubbles.map((b) => (
  <span
    key={b.id}
    className="reaction-bubble"
    style={{ left: `${b.left}%` }}
    onAnimationEnd={() => removeBubble(b.id)}
  >
    {b.emoji}
  </span>
))}
```

### Pattern 5: Cinematic Mode via localStorage Hook
**What:** A custom hook reads/writes cinematic mode preference to `localStorage`, providing instant toggle without server round-trip.
**When to use:** For the cinematic mode toggle that persists across sessions.
**Example:**
```typescript
// use-cinematic-mode.ts
import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "microshort:cinematic-mode";

export function useCinematicMode() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") setEnabled(true);
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return { cinematicMode: enabled, toggleCinematicMode: toggle };
}
```

### Anti-Patterns to Avoid
- **Writing every live reaction to the database:** Each emoji tap should NOT insert a row. Use broadcast for live distribution and batch-aggregate for persistence.
- **Using postgres_changes for live reactions:** `postgres_changes` requires a DB write to trigger, adding latency. Use broadcast channels instead.
- **Unbounded bubble DOM elements:** Without the pool cap (~20) and `onAnimationEnd` cleanup, DOM nodes accumulate and cause jank. Always remove after animation completes.
- **Blocking video playback for comment posting:** The pause-to-comment UX should only pause when the input is focused/opened, not block indefinitely. Resume after send.
- **Storing cinematic preference server-side for MVP:** A database column + API call for a simple boolean toggle is over-engineering. Use `localStorage`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Profanity detection | Custom regex word list | `obscenity` with `englishDataset` + `englishRecommendedTransformers` | Handles leet-speak, unicode obfuscation, repeated chars; maintained word list |
| Avatar initials generation | Custom string splitting | Existing `getInitials()` in `community-feed.tsx` | Already implemented, handles edge cases |
| Follow/unfollow | New follow system | Existing `followers` table + `followCreator`/`unfollowCreator` actions + `FollowButton` component | Phase 6 built this completely |
| Optimistic UI for toggles | Manual state management | React 19 `useOptimistic` (existing pattern in `FollowButton`) | Already established pattern in codebase |
| Real-time subscriptions cleanup | Manual WebSocket management | `supabase.removeChannel(channel)` in `useEffect` cleanup | Existing pattern in `CommunityFeed` component |
| Toast notifications | Custom notification system | `sonner` with `toast.success()`/`toast.error()` | Already integrated throughout app |

**Key insight:** The codebase already has most of the infrastructure patterns needed. The `CommunityFeed` component demonstrates Supabase Realtime subscriptions with cleanup, the `FollowButton` demonstrates optimistic UI with `useOptimistic`, and the `ProfileSettingsForm` demonstrates the Server Actions + `useActionState` + Zod validation pattern. Phase 9 applies these same patterns to new features rather than introducing new architectural concepts.

## Common Pitfalls

### Pitfall 1: Supabase Realtime Broadcast Rate Limits
**What goes wrong:** On the free plan, Supabase Realtime allows only 100 messages/second and 200 concurrent connections. A viral episode with many simultaneous viewers sending unlimited reactions could hit these limits.
**Why it happens:** Each emoji tap = 1 broadcast message. With unlimited sending and many users, message throughput spikes.
**How to avoid:** (1) Accept that free-plan limits constrain initial scale. (2) Consider client-side throttling as a future optimization (not a launch requirement per user decision of "unlimited"). (3) On Pro plan: 500 msg/sec, 500 connections. (4) For accumulated replay, reactions come from DB queries -- not real-time -- so replay is unaffected.
**Warning signs:** `supabase-js` auto-reconnects when throughput drops below plan limit, but reactions may be lost during disconnection windows.

### Pitfall 2: Comment Overlay Performance with Many Comments
**What goes wrong:** An episode with thousands of comments creates expensive filter operations on every `onTimeUpdate` (fires ~4x/second).
**Why it happens:** Naive `Array.filter()` over the full comment list on every tick.
**How to avoid:** (1) Pre-bucket comments by timestamp second into a `Map<number, Comment[]>` on load. (2) On each tick, do a `Map.get(currentSecond)` instead of filtering the full array. (3) Only fetch comments for the current episode, not all episodes.
**Warning signs:** Stuttery video playback, high JS main thread time visible in DevTools performance tab.

### Pitfall 3: Accumulated Reaction Replay Overwhelming the UI
**What goes wrong:** A popular moment has hundreds of accumulated reactions. Replaying them all at once creates hundreds of DOM nodes, bypassing the pool cap.
**Why it happens:** The replay system schedules all accumulated reactions for a given timestamp at once.
**How to avoid:** (1) When replaying accumulated reactions for a timestamp, spread them over a short window (e.g., 1-second interval with staggered delays). (2) Still enforce the pool cap -- if 50 reactions exist at second 42, show them in batches of ~5 with 200ms stagger, letting `onAnimationEnd` cleanup make room. (3) Scale replay volume but cap the display rate.
**Warning signs:** UI jank/dropped frames when seeking to popular moments.

### Pitfall 4: Race Condition on Pause-to-Comment
**What goes wrong:** User opens comment input (video pauses), but before they finish typing, a `timeupdate` or seek event changes the timestamp, attaching the comment to the wrong moment.
**Why it happens:** The "current timestamp" is captured at the wrong point in the flow.
**How to avoid:** Capture `currentTime` at the moment the comment input opens (when video pauses), store it in the comment input state, and use THAT timestamp for the posted comment regardless of any subsequent playback changes.
**Warning signs:** Comments appearing at wrong timestamps, especially when users take a long time to type.

### Pitfall 5: Avatar Upload Without Size/Type Validation
**What goes wrong:** Users upload massive images or non-image files as avatars, bloating storage and breaking the UI.
**Why it happens:** No client-side validation before upload.
**How to avoid:** (1) Validate file type (`image/jpeg`, `image/png`, `image/webp`) and size (< 2MB) client-side before upload. (2) Use Supabase Storage bucket policies to enforce server-side. (3) The existing `thumbnails` bucket pattern from Phase 6 shows how to set up RLS policies scoped to user folders.
**Warning signs:** Broken avatar images, slow page loads, storage costs.

### Pitfall 6: MuxPlayer Cinematic Mode Toggle Placement
**What goes wrong:** Adding a custom toggle inside MuxPlayer's shadow DOM controls is fragile and can break across MuxPlayer versions.
**Why it happens:** MuxPlayer uses Web Components with shadow DOM; injecting custom elements into its control bar requires slotted elements or CSS customization that may not be stable across versions.
**How to avoid:** Place the cinematic mode toggle as an absolutely-positioned overlay OUTSIDE the MuxPlayer shadow DOM but visually aligned with the control bar. Use `z-index` and positioning to make it appear integrated. Alternatively, use the `slot` attribute if MuxPlayer exposes a slot for custom controls (needs version-specific verification).
**Warning signs:** Toggle disappears after MuxPlayer version update, toggle not clickable due to z-index layering.

## Code Examples

### Profanity Filter Setup with obscenity
```typescript
// Source: https://github.com/jo3-l/obscenity
// lib/moderation/profanity.ts

import {
  RegExpMatcher,
  TextCensor,
  englishDataset,
  englishRecommendedTransformers,
} from "obscenity";

const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

const censor = new TextCensor();

export function containsProfanity(text: string): boolean {
  return matcher.hasMatch(text);
}

export function censorText(text: string): string {
  const matches = matcher.getAllMatches(text);
  return censor.applyTo(text, matches);
}

// Usage in comment server action:
// if (containsProfanity(commentText)) {
//   return { success: false, message: "Comment contains inappropriate language" };
// }
```

### Database Schema for New Tables
```sql
-- Episode comments (timestamp-synced)
CREATE TABLE public.episode_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 300),
  timestamp_seconds INTEGER NOT NULL CHECK (timestamp_seconds >= 0),
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Accumulated reactions (aggregated counts per timestamp+emoji)
CREATE TABLE public.episode_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  timestamp_seconds INTEGER NOT NULL CHECK (timestamp_seconds >= 0),
  emoji TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1 CHECK (count > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (episode_id, timestamp_seconds, emoji)
);

-- Favorites (series-level)
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  series_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, series_id)
);

-- Watch history
CREATE TABLE public.watch_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  episode_id UUID NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  progress_seconds INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  last_watched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, episode_id)
);

-- User preferences (for watch history visibility)
-- Could add to profiles table as a column instead
ALTER TABLE public.profiles
  ADD COLUMN watch_history_public BOOLEAN NOT NULL DEFAULT false;

-- RPC for atomic reaction increment
CREATE OR REPLACE FUNCTION increment_reaction(
  p_episode_id UUID,
  p_timestamp_seconds INTEGER,
  p_emoji TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.episode_reactions (episode_id, timestamp_seconds, emoji, count)
  VALUES (p_episode_id, p_timestamp_seconds, p_emoji, 1)
  ON CONFLICT (episode_id, timestamp_seconds, emoji)
  DO UPDATE SET count = episode_reactions.count + 1;
END;
$$ LANGUAGE plpgsql;
```

### Reaction Replay from Database
```typescript
// Query accumulated reactions for an episode, pre-bucketed by timestamp
export async function getEpisodeReactions(episodeId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("episode_reactions")
    .select("timestamp_seconds, emoji, count")
    .eq("episode_id", episodeId)
    .order("timestamp_seconds", { ascending: true });

  // Pre-bucket into Map for O(1) lookup during playback
  const buckets = new Map<number, Array<{ emoji: string; count: number }>>();
  for (const row of data ?? []) {
    const existing = buckets.get(row.timestamp_seconds) ?? [];
    existing.push({ emoji: row.emoji, count: row.count });
    buckets.set(row.timestamp_seconds, existing);
  }

  return buckets;
}
```

### Avatar Upload to Supabase Storage
```typescript
// Server action for avatar upload
"use server";

import { createClient } from "@/lib/supabase/server";

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");

  const file = formData.get("avatar") as File;
  if (!file) throw new Error("No file provided");

  // Validate
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, message: "Invalid file type" };
  }
  if (file.size > 2 * 1024 * 1024) {
    return { success: false, message: "File too large (max 2MB)" };
  }

  const ext = file.name.split(".").pop();
  const path = `${user.id}/avatar.${ext}`;

  // Upload to avatars bucket
  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });

  if (error) return { success: false, message: "Upload failed" };

  // Get public URL and update profile
  const { data: { publicUrl } } = supabase.storage
    .from("avatars")
    .getPublicUrl(path);

  await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  return { success: true };
}
```

### MuxPlayer Time Access for Comment Sync
```typescript
// Source: https://www.mux.com/docs/guides/player-api-reference/react
// Accessing currentTime from MuxPlayer ref

import type { MuxPlayerRefAttributes } from "@mux/mux-player-react";

const playerRef = useRef<MuxPlayerRefAttributes>(null);

// Get current time when user opens comment input
function handleOpenCommentInput() {
  const player = playerRef.current;
  if (!player) return;

  const capturedTimestamp = Math.floor(player.currentTime);
  setCommentTimestamp(capturedTimestamp);

  // Pause video
  player.pause();
}

// onTimeUpdate for comment replay
<MuxPlayer
  ref={playerRef}
  onTimeUpdate={() => {
    const currentSecond = Math.floor(playerRef.current?.currentTime ?? 0);
    const commentsAtTime = commentBuckets.get(currentSecond) ?? [];
    setVisibleComments(commentsAtTime);
  }}
/>
```

## Discretion Recommendations

### Emoji Selection (Claude's Discretion)
**Recommendation:** 7 emojis for a balanced curated set:
| Emoji | Name | Why |
|-------|------|-----|
| :fire: | Fire | Universal "this is awesome" |
| :heart: | Heart | Love/appreciation |
| :joy: | Laughing | Comedy/funny moments |
| :sob: | Crying | Emotional/sad moments |
| :open_mouth: | Shocked | Plot twists/surprises |
| :clap: | Clap | Applause/impressive |
| :100: | 100 | Perfect/excellent |

Seven covers the core emotional spectrum for short-form video without overwhelming the picker UI on mobile.

### Bubble Animation Timing (Claude's Discretion)
**Recommendation:**
- Duration: 3 seconds total float-up
- Size: 1.75rem (28px) on mobile, 2rem (32px) on desktop
- Fade: Opacity 1 from 0-70%, fade to 0 from 70-100%
- Horizontal spread: Random `left` between 10% and 90% of player width
- Slight horizontal wiggle via secondary `translateX` keyframe for organic feel

### Comment Overlay Styling (Claude's Discretion)
**Recommendation:**
- Opacity: 0.85 background on comment bubbles, 1.0 text
- Font size: 0.8125rem (13px) on mobile, 0.875rem (14px) on desktop
- Maximum 4-5 visible comments at once in the overlay
- Comments fade in from bottom, slide up, then fade out at top of the overlay zone
- Semi-transparent dark gradient at bottom 25% of player for readability

### Profanity Filter Approach (Claude's Discretion)
**Recommendation:** Use `obscenity` with the built-in `englishDataset` and `englishRecommendedTransformers`. For spam detection, add basic heuristics: (1) reject comments that are all-caps with > 10 characters, (2) reject comments with > 3 repeated characters in a row (e.g., "aaaaaa"), (3) reject comments that are exact duplicates of user's previous comment within 30 seconds. These heuristics catch the most common spam patterns without ML overhead.

### Watch History Granularity (Claude's Discretion)
**Recommendation:** Track per-episode with `progress_seconds` and `completed` boolean. Upsert on each watch session using `UNIQUE(user_id, episode_id)`. Update progress periodically during playback (every 10-15 seconds via throttled `onTimeUpdate`) rather than only on pause/end. This captures accurate "resume where you left off" data without excessive writes.

### Profile Page Layout (Claude's Discretion)
**Recommendation:** Reuse the existing `PublicProfile` component structure from `src/components/profile/public-profile.tsx` but extend it for viewer profiles. The viewer profile page should use tabs: "Favorites" | "Activity" | "Following". For creators (who already have `/creator/[username]`), add a link from the viewer profile to their creator page rather than merging them.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| WebSocket libraries (Socket.io, Pusher) | Supabase Realtime broadcast (built-in) | Supabase v2 (2023) | No additional infrastructure for live features |
| `bad-words` for profanity filtering | `obscenity` with transformer pipeline | 2023+ | Catches leet-speak, unicode obfuscation, repeated chars |
| Framer Motion for all animations | CSS keyframes for simple animations | Ongoing best practice | Smaller bundle, better performance for non-interactive animations |
| `useEffect` + `useState` for form state | `useActionState` (React 19) | React 19 (2024) | Server Actions with built-in pending state |
| Custom optimistic updates | `useOptimistic` (React 19) | React 19 (2024) | Built-in optimistic UI for toggle actions |

**Deprecated/outdated:**
- `bad-words` npm package: Last significant update over a year ago; does not handle obfuscation variants
- Supabase Realtime v1 API (pre-channel): Replaced by the channel-based API in supabase-js v2

## Open Questions

1. **MuxPlayer Custom Controls Slot**
   - What we know: MuxPlayer uses Web Components with shadow DOM. Custom controls can be added but the API for slotting custom elements may vary by version.
   - What's unclear: Whether `@mux/mux-player-react` v3.11.4 exposes a stable slot for injecting custom buttons into the control bar, or if we must use an overlay positioned outside the shadow DOM.
   - Recommendation: Start with an overlay approach (absolutely positioned toggle outside the shadow DOM). Test whether MuxPlayer provides a `slot="controls"` mechanism at implementation time.

2. **Supabase Realtime Broadcast Message Counting for Billing**
   - What we know: Each broadcast message counts as 1 sent + 1 per subscriber received. Free plan allows 100 msg/sec.
   - What's unclear: Exact billing implications as the platform scales. With 50 concurrent viewers and a burst of 10 reactions/sec, that is 10 + (10 * 50) = 510 messages/second -- exceeding free plan.
   - Recommendation: Launch with free plan for initial testing. Monitor via Supabase Realtime reports dashboard. Upgrade to Pro when needed. Consider client-side broadcast throttling as a future optimization (but user decided "unlimited" so no throttle at launch).

3. **Storage Bucket for Avatars**
   - What we know: A `thumbnails` bucket already exists with creator-scoped RLS. Avatar uploads need a similar `avatars` bucket.
   - What's unclear: Whether to use the existing `thumbnails` bucket with a subfolder or create a separate `avatars` bucket.
   - Recommendation: Create a separate `avatars` bucket with RLS policy: `auth.uid()::text = (storage.foldername(name))[1]`. This mirrors the existing thumbnails pattern and keeps avatar storage isolated.

## Sources

### Primary (HIGH confidence)
- Context7 `/supabase/supabase-js` - Realtime broadcast channels API, channel creation, send/receive patterns
- [Supabase Realtime Limits](https://supabase.com/docs/guides/realtime/limits) - Exact quotas by plan tier (connections, messages/sec, payload size)
- [Supabase Broadcast Docs](https://supabase.com/docs/guides/realtime/broadcast) - Broadcast vs postgres_changes, ack/self options, database broadcast
- [Mux Player React API Reference](https://www.mux.com/docs/guides/player-api-reference/react) - `onTimeUpdate`, `currentTime`, ref access
- [obscenity GitHub](https://github.com/jo3-l/obscenity) - API, features, transformer pipeline, `englishDataset`

### Secondary (MEDIUM confidence)
- [Supabase Realtime Pricing](https://supabase.com/docs/guides/realtime/pricing) - Message counting for billing
- [Supabase Storage Image Transformations](https://supabase.com/docs/guides/storage/serving/image-transformations) - On-the-fly resize (Pro plan)
- Existing codebase patterns: `CommunityFeed` (Realtime), `FollowButton` (useOptimistic), `ProfileSettingsForm` (useActionState)

### Tertiary (LOW confidence)
- CSS keyframe animation performance with 20+ elements: Based on general web performance knowledge. No specific benchmark found for this exact scenario. The pool cap + `onAnimationEnd` cleanup pattern should keep DOM node count low enough to avoid issues.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All core libraries already installed except `obscenity`. Patterns are established in existing codebase.
- Architecture: HIGH -- Extends existing patterns (Server Actions, Supabase CRUD, Realtime subscriptions). New database tables follow established schema conventions.
- Pitfalls: HIGH -- Rate limits are documented in Supabase docs. Performance concerns for DOM animations are well-understood. MuxPlayer shadow DOM challenge is identified.
- Discretion recommendations: MEDIUM -- Emoji selection, animation timing, and profanity approach are based on industry patterns but untested in this specific product context.

**Research date:** 2026-02-15
**Valid until:** 2026-03-15 (30 days -- stable domain, no fast-moving dependencies)
