# Phase 3: Video Player - Research

**Researched:** 2026-02-14
**Domain:** Video playback infrastructure (Mux), vertical-first player UX, iOS PWA media handling, content protection
**Confidence:** HIGH

## Summary

Phase 3 delivers the core viewing experience: a vertical-first (9:16) video player powered by Mux that works on mobile and desktop, auto-continues between episodes, supports subtitles, and implements basic content protection. The stack is `@mux/mux-player-react` for playback, `@mux/mux-node` for server-side asset management and JWT signing, and `@mux/mux-uploader-react` for the upload pipeline (used in Phase 6 but set up now). Mux handles all transcoding, HLS adaptive bitrate, CDN delivery, and auto-generated captions -- no custom video infrastructure needed.

The critical risk is the iOS PWA video playback freeze bug. When a PWA is backgrounded on iOS and the user returns, video elements can become stuck and refuse to play. This is a known WebKit bug with no official fix. The workaround involves listening for `visibilitychange` events and forcing a video source reset (`video.load()` + `video.play()`) on resume. This must be built into the player from day one and tested on physical iPhones installed as PWAs.

**Primary recommendation:** Use `@mux/mux-player-react` directly (not `next-video`) for maximum control over the player component. Use signed playback URLs for content protection. Skip DRM for v1 -- it costs $100/mo + $0.003/view and requires an Apple FairPlay certificate; signed URLs with right-click prevention are sufficient for the pitch stage.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@mux/mux-player-react` | 3.11.x | React video player component | Official Mux player built on Media Chrome. Supports React 19, HLS adaptive bitrate, signed tokens, captions, theming via CSS variables. Drop-in component with `playbackId` prop. Handles quality switching, poster generation, storyboard previews automatically. **Confidence: HIGH** (Context7 + npm verified) |
| `@mux/mux-node` | 12.8.x | Server-side Mux SDK | TypeScript SDK for Mux REST API. Creates assets, manages uploads, generates signed JWT playback tokens, handles tracks/subtitles. Includes `jwt.signPlaybackId()` helper for signing. **Confidence: HIGH** (Context7 verified, 96 code snippets) |
| `@mux/mux-uploader-react` | 1.4.x | Browser-based video upload component | Official upload UI component for Mux Direct Uploads. Handles file selection, chunked upload, progress display, retries. Used primarily in Phase 6 (Creator Dashboard) but infrastructure set up here. **Confidence: HIGH** (npm verified) |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `player.style/microvideo` | Latest | Player theme for short-form content | Base theme for the vertical player. Optimized for shorter content, minimal controls. Built on Media Chrome so fully customizable via CSS. **Confidence: MEDIUM** (official Mux project, theme verified on player.style) |
| `player.style/instaplay` | Latest | Mobile-first social media player theme | Alternative theme inspired by social media apps (TikTok/Instagram style). Better for mobile-first vertical UX. Evaluate both themes during implementation. **Confidence: MEDIUM** (verified on player.style) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@mux/mux-player-react` | `next-video` (v2.6.0) | `next-video` is simpler (drop files in `/videos/` folder, auto-uploads to Mux) but less control over player customization, token handling, and the vertical layout. For a custom vertical player with signed URLs, direct `@mux/mux-player-react` is better. |
| `@mux/mux-player-react` | `react-player` (cookpete) | `react-player` supports many sources (YouTube, Vimeo, etc.) but no Mux-specific features: no signed tokens, no Mux Data analytics, no built-in caption support, no storyboard previews. Would require building most features from scratch. |
| Mux auto-generated captions | Deepgram API | Mux now includes auto-captioning via Whisper in 22 languages at no extra cost (included in asset processing). Deepgram ($0.0077/min) is better for real-time or higher-accuracy needs but unnecessary when Mux handles it natively. Use Mux captions for v1. |
| Signed URLs only | Full DRM (Widevine/FairPlay/PlayReady) | DRM costs $100/mo + $0.003/view, requires Apple FairPlay certificate, and only works with "plus" or "premium" video quality tiers. For a pitch-stage product, signed URLs + right-click disable are sufficient. Add DRM post-launch if piracy becomes a concern. |

**Installation:**
```bash
pnpm add @mux/mux-player-react @mux/mux-node @mux/mux-uploader-react
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   └── player/
│       ├── video-player.tsx        # Main MuxPlayer wrapper (Client Component)
│       ├── video-player-shell.tsx  # Server Component that fetches episode data + generates tokens
│       ├── theater-mode.tsx        # Desktop theater mode container
│       ├── vertical-player.tsx     # Mobile vertical (9:16) container
│       ├── auto-continue.tsx       # Next-episode countdown + transition
│       ├── subtitle-toggle.tsx     # Caption toggle control
│       └── ios-pwa-fix.tsx         # visibilitychange handler for iOS PWA resume
├── lib/
│   └── mux/
│       ├── client.ts              # Mux SDK client initialization
│       ├── tokens.ts              # JWT signing helpers (playback, thumbnail, storyboard)
│       └── webhooks.ts            # Webhook signature verification + handlers
├── app/
│   ├── api/
│   │   └── webhooks/
│   │       └── mux/
│   │           └── route.ts       # Mux webhook endpoint
│   └── (browse)/
│       └── series/[slug]/
│           └── episode/[episodeNumber]/
│               └── page.tsx       # Episode page (Server Component, fetches data, renders player shell)
└── config/
    └── env.ts                     # MUX_TOKEN_ID, MUX_TOKEN_SECRET, MUX_SIGNING_KEY, MUX_PRIVATE_KEY
```

### Pattern 1: Server Component Shell + Client Component Player

**What:** The episode page is a Server Component that fetches episode data from Supabase and generates a signed playback token server-side. It passes the playbackId and token to a Client Component wrapper that renders MuxPlayer.

**When to use:** Always. The Mux signing key must never reach the client. The Server Component handles data fetching and token generation; the Client Component handles interactive playback.

**Example:**
```typescript
// src/components/player/video-player-shell.tsx (Server Component)
import { createClient } from "@/lib/supabase/server";
import { signPlaybackToken } from "@/lib/mux/tokens";
import { VideoPlayer } from "./video-player";

interface VideoPlayerShellProps {
  episodeId: string;
  nextEpisodeUrl?: string;
}

export async function VideoPlayerShell({ episodeId, nextEpisodeUrl }: VideoPlayerShellProps) {
  const supabase = await createClient();
  const { data: episode } = await supabase
    .from("episodes")
    .select("mux_playback_id, title, subtitle_url, duration_seconds")
    .eq("id", episodeId)
    .single();

  if (!episode?.mux_playback_id) return null;

  // Generate signed token server-side (signing key never leaves server)
  const playbackToken = signPlaybackToken(episode.mux_playback_id, {
    expiration: "2h",
  });
  const thumbnailToken = signPlaybackToken(episode.mux_playback_id, {
    type: "thumbnail",
    expiration: "2h",
  });

  return (
    <VideoPlayer
      playbackId={episode.mux_playback_id}
      playbackToken={playbackToken}
      thumbnailToken={thumbnailToken}
      title={episode.title}
      nextEpisodeUrl={nextEpisodeUrl}
    />
  );
}
```

```typescript
// src/components/player/video-player.tsx (Client Component)
"use client";

import MuxPlayer from "@mux/mux-player-react";
import type { MuxPlayerRefAttributes } from "@mux/mux-player-react";
import { useRef } from "react";

interface VideoPlayerProps {
  playbackId: string;
  playbackToken: string;
  thumbnailToken: string;
  title: string;
  nextEpisodeUrl?: string;
}

export function VideoPlayer({
  playbackId,
  playbackToken,
  thumbnailToken,
  title,
  nextEpisodeUrl,
}: VideoPlayerProps) {
  const playerRef = useRef<MuxPlayerRefAttributes>(null);

  return (
    <MuxPlayer
      ref={playerRef}
      playbackId={playbackId}
      tokens={{ playback: playbackToken, thumbnail: thumbnailToken }}
      metadata={{
        video_title: title,
        player_name: "MicroShort Player",
      }}
      streamType="on-demand"
      onEnded={() => {
        if (nextEpisodeUrl) {
          // Auto-continue logic
        }
      }}
    />
  );
}
```
**Confidence: HIGH** -- follows documented Mux + Next.js App Router pattern.

### Pattern 2: Responsive Vertical-First Player Layout

**What:** On mobile (< 768px), the player fills the viewport in 9:16 portrait orientation. On desktop (>= 768px), the player renders in "theater mode" -- centered with dark backdrop, constrained height, and episode info below.

**When to use:** Always. This is the core layout requirement (PLAY-01, PLAY-02).

**Example:**
```css
/* Mobile: full viewport vertical player */
.player-container {
  width: 100%;
  aspect-ratio: 9 / 16;
  max-height: 100dvh;
  background: black;
}

/* Desktop: theater mode with constrained height */
@media (min-width: 768px) {
  .player-container {
    max-width: 480px;         /* constrain width for vertical video */
    max-height: 80vh;
    margin: 0 auto;           /* center horizontally */
    border-radius: 8px;
    overflow: hidden;
  }

  .theater-backdrop {
    background: var(--color-cinema-black);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 2rem;
  }
}
```

**Key insight:** Vertical video on desktop needs width constraint, not height. A 9:16 video at full viewport height would be absurdly wide. Constrain `max-width` to around 400-500px and center it. The surrounding dark "theater" backdrop fills the rest of the screen.

MuxPlayer respects the container's aspect ratio via CSS `--media-object-fit: contain` and container sizing. Set `aspect-ratio: 9 / 16` on the player container rather than on MuxPlayer itself.

**Confidence: HIGH** -- standard responsive CSS pattern; MuxPlayer vertical video fix confirmed in next-video PR #132.

### Pattern 3: Auto-Continue with Countdown Overlay

**What:** When an episode ends, show a brief countdown (3-5 seconds) with a "Next Episode" preview, then automatically navigate to the next episode. User can cancel or skip.

**When to use:** When `nextEpisodeUrl` is available (not the last episode in a season).

**Example:**
```typescript
// On the MuxPlayer `onEnded` event:
// 1. Show countdown overlay with next episode info
// 2. Start 5-second countdown timer
// 3. On countdown complete OR user clicks "Play Next": router.push(nextEpisodeUrl)
// 4. On user clicks "Cancel": hide overlay, stay on current episode

// Key decision: use router.push() (client navigation) not full page reload.
// This keeps the app shell and avoids a flash of white during transition.
// The new episode page fetches new episode data + generates fresh signed token.
```

**Confidence: HIGH** -- standard pattern (Netflix, Disney+, YouTube all use this). The `onEnded` event on MuxPlayer is a standard HTML5 video event.

### Pattern 4: iOS PWA Video Resume Handler

**What:** Listen for the `visibilitychange` event and, when the document becomes visible again, force a video source reset to work around the iOS PWA playback freeze bug.

**When to use:** Always on iOS PWA context. Detect with `navigator.standalone === true` on iOS.

**Example:**
```typescript
// src/components/player/ios-pwa-fix.tsx
"use client";

import { useEffect, useRef } from "react";
import type { MuxPlayerRefAttributes } from "@mux/mux-player-react";

export function useIOSPWAVideoFix(
  playerRef: React.RefObject<MuxPlayerRefAttributes | null>
) {
  const wasBackgrounded = useRef(false);

  useEffect(() => {
    // Only apply in iOS PWA (standalone) context
    const isIOSPWA =
      "standalone" in navigator &&
      (navigator as any).standalone === true;

    if (!isIOSPWA) return;

    function handleVisibilityChange() {
      if (document.hidden) {
        wasBackgrounded.current = true;
        return;
      }

      // Document became visible again
      if (wasBackgrounded.current && playerRef.current) {
        wasBackgrounded.current = false;
        const mediaEl = playerRef.current.media?.nativeEl;
        if (mediaEl) {
          const currentTime = mediaEl.currentTime;
          // Force source reset
          mediaEl.load();
          mediaEl.currentTime = currentTime;
          mediaEl.play().catch(() => {
            // Autoplay may be blocked; show "tap to continue" overlay
          });
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [playerRef]);
}
```

**Critical:** This must be tested on a physical iPhone installed as a PWA. The bug does NOT reproduce in Safari or iOS Simulator -- only in the home-screen-installed PWA context.

**Confidence: MEDIUM** -- the workaround is well-documented across multiple sources (Apple Developer Forums, GitHub, community blogs), but the exact implementation for MuxPlayer's internal `<video>` element access needs validation during development. The `playerRef.current.media?.nativeEl` path to the underlying HTMLVideoElement may vary.

### Anti-Patterns to Avoid

- **Building a custom HLS player with hls.js directly:** MuxPlayer already uses hls.js internally on non-Apple platforms and native HLS on Apple. Wrapping hls.js yourself means losing Mux's adaptive bitrate optimizations, analytics, caption handling, and poster generation.

- **Storing video files in Supabase Storage or Cloudflare R2:** Video files need transcoding, HLS packaging, and CDN delivery. Supabase Storage is for static assets (avatars, thumbnails), not video streaming. Mux handles the entire video pipeline.

- **Generating playback tokens on the client:** The Mux signing key (private RSA key) must never be sent to the browser. Always generate JWT tokens in Server Components or API routes.

- **Using `next-video` with automatic file upload for this project:** The `next-video` approach (drop files in `/videos/` folder) is designed for developer-owned video content, not a multi-creator platform. MicroShort needs dynamic asset management via the Mux API.

- **Hard-coding aspect ratio on MuxPlayer:** MuxPlayer defaults to 16:9. Don't fight it with `aspect-ratio` on the player element itself. Instead, constrain the container to 9:16 and let MuxPlayer fill it with `--media-object-fit: contain`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Video transcoding & HLS packaging | FFmpeg pipeline, S3 storage, CDN setup | Mux API (asset creation + delivery) | Months of work, fragile edge cases (codecs, frame rates, portrait), ongoing ops burden. Mux does it in seconds. |
| Adaptive bitrate streaming | Custom HLS.js integration with quality ladder | `@mux/mux-player-react` (handles ABR internally) | MuxPlayer uses hls.js (non-Apple) and native HLS (Apple) with Mux's per-title encoding optimization. |
| Video player UI/controls | Custom `<video>` element with HTML/CSS controls | MuxPlayer + player.style theme | 100+ edge cases: mobile gesture conflicts, fullscreen API differences, volume control (iOS has none), accessibility, keyboard shortcuts. |
| Playback token signing | Custom JWT library + key management | `mux.jwt.signPlaybackId()` from `@mux/mux-node` | Built-in helper handles RS256 signing, claim structure, audience types. One function call. |
| Caption/subtitle rendering | Custom WebVTT parser + overlay renderer | MuxPlayer built-in caption support + Mux auto-generated captions | MuxPlayer renders captions from HLS text tracks automatically. Toggle with `defaultHiddenCaptions` prop. |
| Upload progress + chunked uploads | Custom chunk splitting, retry logic, progress tracking | `@mux/mux-uploader-react` (or `@mux/upchunk` for headless) | Handles resumable uploads, progress UI, error recovery. Re-inventing this is a multi-week project. |
| Poster/thumbnail generation | Screenshot extraction from video | Mux automatic poster + thumbnail API | Mux generates posters and storyboard thumbnails from every asset. Access via `image.mux.com/{playbackId}/thumbnail.jpg`. |

**Key insight:** Mux's value proposition is handling the entire video pipeline. Every piece of video infrastructure you build yourself is a piece you'll maintain forever. For a v1 pitch product, delegating the video pipeline to Mux is the highest-leverage decision in this phase.

## Common Pitfalls

### Pitfall 1: iOS PWA Video Playback Freeze After Backgrounding
**What goes wrong:** Video plays fine on first load. User switches to another app, then returns to the PWA. Video is stuck -- play button does nothing, scrubbing doesn't work, audio may continue but video is frozen.
**Why it happens:** WebKit aggressively manages PWA media resources when backgrounded. It pauses media elements and does not reliably resume them. This is a known WebKit bug (bugs.webkit.org #211018) with no official Apple fix.
**How to avoid:**
  1. Implement the `visibilitychange` handler (see Pattern 4 above) that forces `video.load()` + `video.play()` on resume
  2. Consider using blob URLs as video sources (TikTok's approach) for more reliable PWA playback
  3. Set `preferPlayback="mse"` on MuxPlayer to use Media Source Extensions instead of native HLS (gives more programmatic control, but test thoroughly as it may have tradeoffs on iOS)
  4. Build a "Tap to continue watching" overlay as a fallback when autoplay fails after resume
  5. Test every build on a physical iPhone installed as a PWA -- this bug does NOT reproduce in Safari or Simulator
**Warning signs:** Works in Safari but breaks in PWA. User reports "videos freeze" or "play button doesn't work."

### Pitfall 2: Signed Token Expiration During Playback
**What goes wrong:** You set a short token expiration (e.g., 15 minutes) for security, but the user starts watching a 3-minute episode at minute 14 of the token lifetime. Mid-playback, the HLS segments stop loading because the token expired.
**Why it happens:** Mux validates the token on every HLS segment request, not just the initial manifest. When the token expires, segment requests return 403.
**How to avoid:**
  1. Set token expiration to at least 2 hours (covers a full binge session)
  2. For additional security, use `playback_restriction_id` to restrict tokens to your domain rather than short expiration times
  3. If you must use short tokens, implement token refresh: generate a new token before the old one expires and update the player's `tokens` prop
**Warning signs:** Video starts playing but stops/errors mid-episode. Error logs show 403 responses from `stream.mux.com`.

### Pitfall 3: Vertical Video Displays as Letterboxed 16:9
**What goes wrong:** You upload a 9:16 video to Mux, but the player renders it in a 16:9 container with black bars on the sides, wasting most of the screen on mobile.
**Why it happens:** MuxPlayer defaults to 16:9 aspect ratio. If the container doesn't specify 9:16, the player uses its default. The `next-video` component had this exact bug (GitHub issue #131, fixed in PR #132).
**How to avoid:**
  1. Set the container's CSS `aspect-ratio: 9 / 16` and `width: 100%`
  2. Use `--media-object-fit: contain` on MuxPlayer to fit within the vertical container
  3. On desktop, constrain `max-width` to ~480px so the vertical video doesn't become absurdly wide
  4. Do NOT set `aspect-ratio` as a prop on MuxPlayer itself -- control it via the container
**Warning signs:** Mobile users see a tiny video with huge black bars. The player area is mostly wasted space.

### Pitfall 4: Autoplay Blocked by Browser Policy
**What goes wrong:** You implement auto-continue to the next episode, but the next episode doesn't start playing -- it loads but sits paused.
**Why it happens:** Browsers restrict autoplay of video with sound. Chrome, Safari, and Firefox all require user interaction before allowing unmuted autoplay, unless the user has previously interacted with the media element.
**How to avoid:**
  1. The user's initial "play" interaction on the first episode satisfies the browser's autoplay policy for subsequent plays on the same page
  2. For auto-continue across page navigations (router.push), the autoplay policy resets. Use `autoPlay="any"` on MuxPlayer which will try unmuted first, fall back to muted
  3. Alternatively, keep the player instance alive across episode transitions by updating `playbackId` instead of navigating to a new page
  4. Always have a fallback: if autoplay fails, show a prominent "Play" button rather than appearing broken
**Warning signs:** Auto-continue works in development (localhost has relaxed autoplay policy) but fails in production.

### Pitfall 5: Subtitle Toggle Not Working
**What goes wrong:** You add subtitles to the Mux asset, but the caption button doesn't appear in the player, or toggling it does nothing.
**Why it happens:** Captions must be added as text tracks on the Mux asset (either during creation or via the tracks API). If the asset has no text tracks, the player correctly hides the caption button. Also, if using a custom theme that hides the caption button via CSS (`--captions-button: none`), the button won't be visible.
**How to avoid:**
  1. Verify text tracks exist on the asset via `mux.video.assets.retrieve(assetId)` -- check the `tracks` array
  2. Ensure the theme doesn't hide the caption button
  3. Use `defaultHiddenCaptions={false}` to show captions by default (user can still toggle off)
  4. For auto-generated captions, listen for the `video.asset.track.ready` webhook before expecting captions to be available
**Warning signs:** No CC button in player. Or button appears but does nothing when clicked.

## Code Examples

Verified patterns from official sources:

### Mux Client Initialization
```typescript
// src/lib/mux/client.ts
// Source: Mux Node SDK README (Context7)
import Mux from "@mux/mux-node";

export const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});
```

### Creating a Video Asset with Signed Playback + Auto-Captions
```typescript
// Source: Mux Node SDK API docs (Context7) + Mux captions docs
const asset = await mux.video.assets.create({
  inputs: [
    { url: videoSourceUrl },
  ],
  playback_policies: ["signed"],  // Require signed tokens for playback
  video_quality: "basic",         // "basic", "plus", or "premium"
  // Auto-generate captions in English
});

// After asset is ready, generate captions on the audio track:
// POST to generate-subtitles endpoint (via webhook handler when asset.ready fires)
```

### Signing Playback Tokens
```typescript
// src/lib/mux/tokens.ts
// Source: Mux Node SDK README (Context7)
import { mux } from "./client";

interface SignOptions {
  type?: "video" | "thumbnail" | "gif" | "storyboard";
  expiration?: string; // e.g., "2h", "7d"
  params?: Record<string, unknown>;
}

export function signPlaybackToken(
  playbackId: string,
  options: SignOptions = {}
): string {
  const { type = "video", expiration = "2h", params } = options;

  return mux.jwt.signPlaybackId(playbackId, {
    type,
    expiration,
    params,
  });
}
```

**Note:** Requires environment variables `MUX_SIGNING_KEY` (key ID) and `MUX_PRIVATE_KEY` (RSA private key) to be set. These are separate from `MUX_TOKEN_ID` / `MUX_TOKEN_SECRET`.

### MuxPlayer with Signed Tokens + Captions
```typescript
// Source: Mux Player React API reference + Mux secure playback docs
"use client";

import MuxPlayer from "@mux/mux-player-react";

<MuxPlayer
  playbackId={playbackId}
  tokens={{
    playback: playbackToken,
    thumbnail: thumbnailToken,
    storyboard: storyboardToken,
  }}
  streamType="on-demand"
  defaultHiddenCaptions={false}    // Show captions by default
  metadata={{
    video_id: episodeId,
    video_title: episodeTitle,
    viewer_user_id: userId || "anonymous",
  }}
  primaryColor="#facc15"           // Cinematic yellow accent
  secondaryColor="rgba(0,0,0,0.7)" // Dark control bar
  accentColor="#facc15"
  style={{
    "--media-object-fit": "contain",
    width: "100%",
    height: "100%",
  }}
  onEnded={handleEpisodeEnded}
  onContextMenu={(e: React.MouseEvent) => e.preventDefault()} // Disable right-click
/>
```

### Mux Webhook Handler
```typescript
// src/app/api/webhooks/mux/route.ts
// Source: Mux Node SDK webhook types (Context7)
import { mux } from "@/lib/mux/client";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();

  // Verify webhook signature
  const signature = headersList.get("mux-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 401 });
  }

  // Mux webhook verification using the webhook secret
  // const isValid = mux.webhooks.verifySignature(body, signature, webhookSecret);

  const event = JSON.parse(body);

  switch (event.type) {
    case "video.asset.ready": {
      const assetId = event.data.id;
      const playbackId = event.data.playback_ids?.[0]?.id;
      const duration = event.data.duration;
      const passthrough = event.data.passthrough; // Links to your episode ID

      // Update episode in database
      const supabase = await createClient();
      await supabase
        .from("episodes")
        .update({
          mux_asset_id: assetId,
          mux_playback_id: playbackId,
          duration_seconds: Math.round(duration),
          status: "ready",
        })
        .eq("id", passthrough);
      break;
    }
    case "video.asset.errored": {
      // Handle encoding failure
      break;
    }
    case "video.asset.track.ready": {
      // Captions are now available for playback
      break;
    }
  }

  return new Response("OK", { status: 200 });
}
```

### Content Protection: Disable Right-Click + Hide Download
```typescript
// Applied on the player container and MuxPlayer component

// 1. Disable context menu (right-click) on the player
onContextMenu={(e: React.MouseEvent) => e.preventDefault()}

// 2. MuxPlayer does NOT show a download button by default (unlike native <video>).
//    No extra configuration needed for download button prevention.

// 3. For additional protection, add to the page container:
<div
  onContextMenu={(e) => e.preventDefault()}
  style={{ userSelect: "none", WebkitUserSelect: "none" }}
>
  {/* Player goes here */}
</div>

// 4. Signed URLs prevent direct link sharing.
//    Even if someone inspects the network tab, the HLS manifest URL
//    includes a JWT token that expires (default: 2 hours).
```

### Creating a Direct Upload URL (Server Action for Phase 6)
```typescript
// Source: Mux Direct Upload docs
// This pattern is set up in Phase 3 but primarily used in Phase 6
export async function createUploadUrl(episodeId: string) {
  "use server";

  const upload = await mux.video.uploads.create({
    cors_origin: process.env.NEXT_PUBLIC_APP_URL!,
    new_asset_settings: {
      playback_policies: ["signed"],
      video_quality: "basic",
      passthrough: episodeId, // Links upload to episode in webhook
    },
  });

  return upload.url; // Pass this to MuxUploader on the client
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual HLS.js setup + custom controls | MuxPlayer with Media Chrome themes | 2023-2024 | MuxPlayer abstracts away HLS.js/native HLS decision, ABR, captions, analytics. Themes from player.style provide customizable UI. |
| `mux-video-react` (headless) + custom UI | `mux-player-react` (full player UI) | 2023 | `mux-player-react` adds themed UI on top of `mux-video-react`. Use the full player unless you need completely custom controls. |
| External subtitle services (Deepgram, AssemblyAI) | Mux auto-generated captions (Whisper, 22 languages) | 2024-2025 | Mux now handles captioning natively. No external service needed for v1. Saves ~$0.0077/min. |
| DRM as premium add-on (beta) | DRM now GA with Widevine/FairPlay/PlayReady | October 2025 | Full DRM available at $100/mo + $0.003/view. For v1 pitch, signed URLs are sufficient -- DRM can be added later. |
| `next-video` for all Mux+Next.js projects | `@mux/mux-player-react` for dynamic platforms, `next-video` for static video content | 2024 | `next-video` is better for blogs/marketing sites. For a multi-creator platform with dynamic content, use `@mux/mux-player-react` directly for more control. |

**Deprecated/outdated:**
- `@mux-elements/mux-player-react`: Old package name. Use `@mux/mux-player-react` instead.
- `mux-video-react` standalone: Superseded by `mux-player-react` which includes the video element + full player UI.

## Open Questions

1. **MuxPlayer internal video element access for iOS PWA fix**
   - What we know: The iOS PWA fix needs access to the underlying `<video>` element to call `.load()` and `.play()`. MuxPlayer wraps this in a web component.
   - What's unclear: The exact API path to access the native video element from a MuxPlayer ref (`playerRef.current.media?.nativeEl`). This needs testing.
   - Recommendation: During implementation, test `playerRef.current` access. If the native element is not directly accessible, use the MuxPlayer's own `pause()`/`play()` methods or update the `playbackId` prop to force a reload.

2. **Autoplay policy across router.push() navigation**
   - What we know: Auto-continue uses `router.push(nextEpisodeUrl)` which is a client-side navigation. After navigation, the new page's MuxPlayer needs to autoplay.
   - What's unclear: Whether the browser's media engagement policy persists across Next.js client navigations (it should, since the page doesn't fully reload).
   - Recommendation: Test in production build. If autoplay fails after navigation, consider updating `playbackId` prop on the existing player instead of navigating to a new page.

3. **player.style theme selection (Microvideo vs Instaplay)**
   - What we know: Both themes exist and are suitable. Microvideo is optimized for short content; Instaplay is mobile-first social media style.
   - What's unclear: Which theme better suits the MicroShort aesthetic (deep blacks, cinematic yellow, vertical format).
   - Recommendation: Try both during implementation. Both are CSS-customizable via variables. Pick whichever feels more "cinematic" when themed with the MicroShort color palette.

4. **Mux webhook signature verification method**
   - What we know: Mux sends a `mux-signature` header with webhook requests. The `@mux/mux-node` SDK should provide a verification method.
   - What's unclear: The exact method name and parameters in v12.x of the SDK for webhook verification.
   - Recommendation: Check `mux.webhooks.verifySignature()` or similar during implementation. If not available in the SDK, implement manual HMAC-SHA256 verification using the webhook signing secret from the Mux dashboard.

5. **Environment variables for Mux signing keys**
   - What we know: Signed playback requires two key pairs: (1) API credentials (`MUX_TOKEN_ID` + `MUX_TOKEN_SECRET`) for REST API calls, and (2) Signing keys (`MUX_SIGNING_KEY` + `MUX_PRIVATE_KEY`) for JWT token generation.
   - What's unclear: Whether the signing key private key should be stored as a multi-line env var or base64-encoded.
   - Recommendation: Store as base64-encoded in `.env.local` and decode at runtime. Mux docs show both approaches; base64 is more portable across deployment environments (Vercel, Docker, etc.).

## Sources

### Primary (HIGH confidence)
- [Mux Node SDK - Context7](/muxinc/mux-node-sdk) - JWT signing, asset management API, webhook types (96 code snippets)
- [next-video - Context7](/muxinc/next-video) - Video component props, player customization, theme integration (29 code snippets)
- [Mux Player React API Reference](https://www.mux.com/docs/guides/player-api-reference/react) - Complete prop reference, token structure, caption control
- [Mux Secure Video Playback](https://www.mux.com/docs/guides/secure-video-playback) - Signed URL claims, JWT generation, token expiration
- [Mux Add Subtitles/Captions](https://www.mux.com/docs/guides/add-subtitles-to-your-videos) - WebVTT format, text track API, language codes
- [Mux Auto-Generated Captions](https://www.mux.com/docs/guides/add-autogenerated-captions-and-use-transcripts) - Whisper-based captioning, 22 supported languages, generate-subtitles API
- [Mux DRM Guide](https://www.mux.com/docs/guides/protect-videos-with-drm) - Widevine/FairPlay/PlayReady setup, pricing ($100/mo + $0.003/view), asset creation
- [Mux Direct Uploads](https://www.mux.com/docs/guides/upload-files-directly) - Presigned URL flow, CORS, chunked uploads, webhook events
- [Mux Player Customize Look and Feel](https://www.mux.com/docs/guides/player-customize-look-and-feel) - CSS variables, CSS parts, theme system
- [Mux Player Advanced Usage](https://www.mux.com/docs/guides/player-advanced-usage) - preferPlayback MSE/native, preloading, iOS DRM considerations
- [player.style](https://player.style/) - Microvideo theme, Instaplay theme, Media Chrome theming system
- [Mux Player Integration Guide](https://www.mux.com/docs/guides/player-integrate-in-your-webapp) - React component setup, metadata, event handling

### Secondary (MEDIUM confidence)
- [next-video Issue #131: 9:16 aspect ratio fix](https://github.com/muxinc/next-video/issues/131) - Vertical video container fix confirmed in PR #132
- [Apple Community: PWA Video Playback Fails](https://discussions.apple.com/thread/256166996) - iOS PWA video freeze reports, workaround discussion
- [WebKit Bug #211018: iOS PWAs freeze after backgrounding](https://bugs.webkit.org/show_bug.cgi?id=211018) - Official WebKit bug tracker
- [Apple Developer Forums: HTML5 Video in PWA Stuck](https://developer.apple.com/forums/thread/724503) - Additional iOS PWA video reports
- [Mux Blog: Introducing player.style](https://www.mux.com/blog/introducing-player-style) - Theme architecture and available themes
- [Mux Blog: DRM Now GA](https://www.mux.com/blog/protect-your-video-content-with-drm-now-ga) - DRM general availability announcement (October 2025)

### Tertiary (LOW confidence)
- [GitHub: ios-pwa-freeze-bug](https://github.com/djsweet/ios-pwa-freeze-bug) - Community reproduction of PWA freeze issue
- [GitHub: PWA-POLICE/pwa-bugs](https://github.com/PWA-POLICE/pwa-bugs) - Crowdsourced list of PWA bugs and workarounds
- [Brainhub: PWA on iOS Limitations 2025](https://brainhub.eu/library/pwa-on-ios) - General iOS PWA limitations overview

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Mux packages verified via Context7 (96 snippets), npm (version numbers confirmed), and official docs. React 19 peer dependency confirmed.
- Architecture: HIGH - Server Component + Client Component pattern is the documented Next.js App Router approach. Mux integration follows official guides.
- Pitfalls: HIGH for iOS PWA (multiple sources, WebKit bug tracker), MEDIUM for autoplay policy (needs production testing), HIGH for signed token expiration (documented in Mux docs).
- Content protection: HIGH for signed URLs (well-documented), HIGH for DRM pricing/setup (official docs), LOW for effectiveness of right-click disable (security theater but meets the requirement).

**Research date:** 2026-02-14
**Valid until:** 2026-03-14 (30 days -- Mux API is stable, iOS PWA bugs change with iOS releases)
