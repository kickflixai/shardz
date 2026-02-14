---
phase: 03-video-player
plan: 01
subsystem: api
tags: [mux, video, webhooks, jwt, streaming, hmac]

# Dependency graph
requires:
  - phase: 01-foundation-app-shell
    provides: Next.js app structure, Supabase client, env config pattern
  - phase: 02-authentication-access
    provides: Episode database schema with mux_asset_id and mux_playback_id columns
provides:
  - Mux SDK singleton client for server-side video operations
  - Signed playback token generation (video, thumbnail, gif, storyboard)
  - Webhook endpoint at /api/webhooks/mux for asset lifecycle events
  - Episode status auto-update when Mux asset processing completes
  - Supabase admin client for server-side operations without user sessions
affects: [03-video-player, 06-creator-dashboard, video-upload, content-management]

# Tech tracking
tech-stack:
  added: ["@mux/mux-node@12.8.1", "@mux/mux-player-react@3.11.4", "@mux/mux-uploader-react@1.4.1"]
  patterns: [mux-sdk-singleton, async-jwt-signing, sdk-webhook-verification, supabase-admin-client]

key-files:
  created:
    - src/lib/mux/client.ts
    - src/lib/mux/tokens.ts
    - src/lib/mux/webhooks.ts
    - src/app/api/webhooks/mux/route.ts
    - src/lib/supabase/admin.ts
  modified:
    - src/config/env.ts
    - .env.example
    - package.json

key-decisions:
  - "Mux SDK constructor reads all env vars automatically (MUX_TOKEN_ID, MUX_TOKEN_SECRET, MUX_SIGNING_KEY, MUX_PRIVATE_KEY, MUX_WEBHOOK_SECRET) -- no need to pass explicitly"
  - "signPlaybackToken is async (SDK v12.8 returns Promise<string>) -- callers must await"
  - "Used SDK built-in mux.webhooks.unwrap() for webhook verification instead of hand-rolling HMAC-SHA256"
  - "Created Supabase admin client (service role) for webhook handler since cookies-based server client cannot work in webhook context"

patterns-established:
  - "Pattern: Mux SDK singleton at @/lib/mux/client.ts -- all Mux operations go through this"
  - "Pattern: Supabase admin client at @/lib/supabase/admin.ts for server-side ops without user sessions"
  - "Pattern: Webhook routes use SDK signature verification, not manual crypto"

# Metrics
duration: 4min
completed: 2026-02-14
---

# Phase 3 Plan 1: Mux Infrastructure Summary

**Mux SDK client with async JWT playback token signing and webhook handler that auto-updates episodes on asset.ready via SDK signature verification**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-14T14:41:52Z
- **Completed:** 2026-02-14T14:45:47Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Mux SDK installed and singleton client initialized with automatic env var reading
- Async playback token signing with configurable type (video/thumbnail/gif/storyboard) and expiration (default 2h)
- Webhook endpoint at /api/webhooks/mux that verifies Mux signatures and handles video.asset.ready, video.asset.errored, and video.asset.track.ready events
- Episode records auto-updated in Supabase with mux_asset_id, mux_playback_id, and duration_seconds when Mux processing completes
- Supabase admin client created for server-side operations without user cookie context

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Mux packages and create SDK client + token signing helpers** - `55438f3` (feat)
2. **Task 2: Create Mux webhook handler with signature verification** - `ca820cd` (feat)

## Files Created/Modified
- `src/lib/mux/client.ts` - Mux SDK singleton, reads env vars automatically
- `src/lib/mux/tokens.ts` - Async signPlaybackToken helper for video/thumbnail/gif/storyboard JWTs
- `src/lib/mux/webhooks.ts` - Webhook verification wrappers + typed event re-exports from Mux SDK
- `src/app/api/webhooks/mux/route.ts` - POST handler for Mux webhook events with episode DB updates
- `src/lib/supabase/admin.ts` - Service role Supabase client for webhooks/background tasks
- `src/config/env.ts` - Added Mux server-only env vars with base64 decode for private key
- `.env.example` - Added 5 Mux env vars + SUPABASE_SERVICE_ROLE_KEY
- `package.json` - Added @mux/mux-node, @mux/mux-player-react, @mux/mux-uploader-react

## Decisions Made
- **Mux SDK auto-reads env vars:** The `new Mux()` constructor defaults to `process.env.MUX_TOKEN_ID`, etc. No need to pass credentials explicitly, matching the existing Supabase pattern.
- **signPlaybackToken is async:** SDK v12.8.1's `jwt.signPlaybackId()` returns `Promise<string>`, not sync. All callers must `await` the result.
- **SDK webhook verification over hand-rolled HMAC:** Used `mux.webhooks.unwrap()` which handles parsing the `mux-signature` header, computing HMAC-SHA256, and timing-safe comparison internally. More secure and maintainable than manual implementation.
- **Supabase admin client for webhooks:** Webhook requests from Mux have no browser cookies, so the cookies-based `createClient()` from `@/lib/supabase/server` would fail. Created `createAdminClient()` using the service role key, which bypasses RLS.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] signPlaybackToken is async, not sync**
- **Found during:** Task 1 (token signing helper)
- **Issue:** Plan specified sync `signPlaybackToken` but Mux SDK v12.8.1 `jwt.signPlaybackId()` returns `Promise<string>`
- **Fix:** Made `signPlaybackToken` async, returns `Promise<string>`
- **Files modified:** src/lib/mux/tokens.ts
- **Verification:** pnpm build passes, TypeScript types correct
- **Committed in:** 55438f3

**2. [Rule 1 - Bug] Used SDK webhook verification instead of hand-rolled HMAC**
- **Found during:** Task 2 (webhook handler)
- **Issue:** Plan specified creating manual HMAC-SHA256 verification in webhooks.ts, but SDK provides `mux.webhooks.unwrap()` and `mux.webhooks.verifySignature()` with timing-safe comparison
- **Fix:** Used SDK's built-in methods, which also provide typed event parsing
- **Files modified:** src/lib/mux/webhooks.ts, src/app/api/webhooks/mux/route.ts
- **Verification:** pnpm build passes, correct types exported
- **Committed in:** ca820cd

**3. [Rule 3 - Blocking] Created Supabase admin client for webhook context**
- **Found during:** Task 2 (webhook handler needs to update episodes in Supabase)
- **Issue:** Existing server Supabase client uses cookies (from browser requests), but webhook requests from Mux have no cookies. Cannot authenticate with RLS-based client.
- **Fix:** Created `src/lib/supabase/admin.ts` using service role key, added `SUPABASE_SERVICE_ROLE_KEY` to .env.example
- **Files modified:** src/lib/supabase/admin.ts, .env.example
- **Verification:** pnpm build passes, admin client properly imported in webhook route
- **Committed in:** ca820cd

---

**Total deviations:** 3 auto-fixed (2 bug fixes, 1 blocking)
**Impact on plan:** All auto-fixes necessary for correctness. Using SDK methods is more secure than hand-rolling crypto. Admin client is essential for webhook functionality. No scope creep.

## Issues Encountered
None -- all issues were handled proactively via deviation rules.

## User Setup Required

External services require manual configuration before the webhook handler will work:

**Mux Dashboard (https://dashboard.mux.com/settings):**
1. Create API Access Token with Mux Video read/write permissions -> get MUX_TOKEN_ID and MUX_TOKEN_SECRET
2. Create Signing Key for secure playback -> get MUX_SIGNING_KEY and base64-encode the private key for MUX_PRIVATE_KEY
3. Create webhook endpoint pointing to `{SITE_URL}/api/webhooks/mux` -> get MUX_WEBHOOK_SECRET

**Supabase Dashboard:**
4. Get the service role key from Settings -> API -> service_role key -> set SUPABASE_SERVICE_ROLE_KEY

**Add all variables to `.env.local`:**
```
MUX_TOKEN_ID=...
MUX_TOKEN_SECRET=...
MUX_SIGNING_KEY=...
MUX_PRIVATE_KEY=... (base64-encoded)
MUX_WEBHOOK_SECRET=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Next Phase Readiness
- Mux SDK client and token signing are ready for the video player component (Plan 02)
- Webhook handler is ready to receive events once Mux dashboard is configured
- @mux/mux-player-react is installed and ready for Plan 02 (player component)
- @mux/mux-uploader-react is installed for Phase 6 (creator dashboard upload)

## Self-Check: PASSED

All created files verified on disk. All task commits verified in git log.

---
*Phase: 03-video-player*
*Plan: 01*
*Completed: 2026-02-14*
