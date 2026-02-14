# Phase 2: Authentication + Access - Research

**Researched:** 2026-02-14
**Domain:** Supabase Auth (email/password), Next.js App Router auth patterns, free content access control, transactional email
**Confidence:** HIGH

## Summary

Phase 2 adds user authentication and a zero-friction free content access model to MicroShort. The core implementation uses Supabase Auth's email/password flow with PKCE (Proof Key for Code Exchange) -- the server-side auth model recommended for Next.js App Router. The existing Supabase infrastructure from Phase 1 (server client, browser client, middleware) already handles session management; Phase 2 extends it with auth UI, server actions for login/signup/logout, a profile creation trigger, route protection in middleware, and email templates for signup confirmation and password reset.

The "first 3 episodes free" model is implemented as a content access policy, not an auth gate. Published episodes with `episode_number <= 3` are publicly accessible without authentication. Episodes 4+ require account creation (Phase 2) and eventually payment (Phase 5). This is enforced via RLS policies on the episodes table and verified in the application layer when rendering episode pages.

The password reset flow follows Supabase's PKCE pattern: user requests reset via `resetPasswordForEmail()`, receives an email with a `token_hash` link, clicks through to an auth callback route handler that exchanges the token for a session via `verifyOtp()`, then gets redirected to a password update form where `updateUser({ password })` completes the flow. Transactional emails use Supabase's built-in email service for development (Inbucket/Mailpit at port 54324) and will use a custom SMTP provider (Resend or SendGrid) for production.

**Primary recommendation:** Use Supabase Auth server actions with `@supabase/ssr` (already installed), add an auth callback route handler for PKCE token exchange, create a `handle_new_user` database trigger for automatic profile creation on signup, implement middleware-level route protection for `/dashboard` and `/admin`, and use shadcn/ui form components (Field, Input, Button, Card) with Zod validation and `useActionState` for auth forms.

## Standard Stack

### Core (Phase 2 specific)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **@supabase/ssr** | ^0.8.0 | Server-side auth client | Already installed. Provides `createServerClient` / `createBrowserClient` with cookie-based session management. Used in server actions for auth operations. **Confidence: HIGH** (Context7 verified, already in project) |
| **@supabase/supabase-js** | ^2.95.3 | Supabase client SDK | Already installed. Provides `auth.signUp`, `auth.signInWithPassword`, `auth.signOut`, `auth.resetPasswordForEmail`, `auth.updateUser`, `auth.verifyOtp`, `auth.exchangeCodeForSession`. **Confidence: HIGH** (Context7 verified) |
| **zod** | ^3.24 | Schema validation | Server-side and client-side form validation. Shared schemas between Zod and server actions. shadcn/ui form patterns use Zod. **Confidence: HIGH** (shadcn official docs) |

### Supporting (Phase 2 specific)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **shadcn/ui components** | CLI 3.x | Form UI components | `pnpm dlx shadcn@latest add button card input label field`. Pre-built accessible components for auth forms. **Confidence: HIGH** |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| **Server actions + useActionState** | **react-hook-form + @hookform/resolvers/zod** | React Hook Form adds client-side validation with excellent UX (real-time field validation, focus management). But for simple auth forms (2-3 fields), server actions with `useActionState` are simpler and provide progressive enhancement. shadcn/ui supports both patterns. **Recommendation:** Use server actions + useActionState for auth forms. React Hook Form is overkill for login/signup/reset forms. |
| **Supabase email templates** | **Resend + React Email** | React Email gives full component-based email design. But Supabase's built-in templates handle the auth flow natively (confirmation URLs, token hashes). Custom SMTP + Resend is better for production transactional emails but adds complexity. **Recommendation:** Start with Supabase built-in templates, configure custom SMTP for production in a later deployment phase. |
| **Middleware route protection** | **Page-level auth checks (Server Component)** | Middleware catches unauthorized access before the page renders (faster, no flash). Page-level checks are more granular but show loading states before redirecting. **Recommendation:** Middleware for broad route group protection (`/dashboard/*`, `/admin/*`). Page-level checks for fine-grained access (e.g., episode access by number). |

**Installation (Phase 2):**

```bash
# Validation
pnpm add zod

# shadcn/ui components for auth forms
pnpm dlx shadcn@latest add button card input label field
```

No new infrastructure libraries needed -- `@supabase/ssr` and `@supabase/supabase-js` are already installed from Phase 1.

## Architecture Patterns

### Recommended Project Structure (Phase 2 additions)

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   ├── page.tsx              # Login form (replace Phase 1 placeholder)
│   │   │   └── actions.ts            # Login server action
│   │   ├── signup/
│   │   │   ├── page.tsx              # Signup form (replace Phase 1 placeholder)
│   │   │   └── actions.ts            # Signup server action
│   │   ├── forgot-password/
│   │   │   ├── page.tsx              # Password reset request form
│   │   │   └── actions.ts            # resetPasswordForEmail server action
│   │   ├── reset-password/
│   │   │   ├── page.tsx              # New password form (after email link)
│   │   │   └── actions.ts            # updateUser server action
│   │   ├── auth-code-error/
│   │   │   └── page.tsx              # Error page for failed token exchange
│   │   └── layout.tsx                # Existing centered card layout
│   ├── auth/
│   │   └── confirm/
│   │       └── route.ts              # Auth callback: token exchange (PKCE)
│   └── ...
├── lib/
│   ├── supabase/
│   │   ├── server.ts                 # Existing server client
│   │   ├── client.ts                 # Existing browser client
│   │   └── middleware.ts             # Extended with route protection
│   └── validations/
│       └── auth.ts                   # Zod schemas for auth forms
├── components/
│   ├── auth/
│   │   └── logout-button.tsx         # Logout button (used in header)
│   └── layout/
│       └── header.tsx                # Updated: show user state + logout
├── middleware.ts                     # Extended with protected route redirects
└── ...

supabase/
├── migrations/
│   ├── 00000000000001_create_content_schema.sql   # Existing
│   └── 00000000000002_auth_profile_trigger.sql    # NEW: handle_new_user trigger
└── templates/                        # NEW: Custom email templates
    ├── confirmation.html             # Signup confirmation email
    └── recovery.html                 # Password reset email
```

### Pattern 1: Server Actions for Auth Operations

**What:** Each auth operation (login, signup, logout, password reset request, password update) is a Next.js server action. Forms submit directly to server actions using `formAction` or the `action` prop on `<form>`.

**When to use:** All auth mutations in Phase 2.

**Example:**
```typescript
// Source: Supabase SSR docs (Context7 verified) + Next.js server actions
// app/(auth)/login/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema } from '@/lib/validations/auth'

export type AuthFormState = {
  values?: { email: string }
  errors: Record<string, string[]> | null
  success: boolean
  message?: string
}

export async function login(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const values = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const result = loginSchema.safeParse(values)
  if (!result.success) {
    return {
      values: { email: values.email },
      errors: result.error.flatten().fieldErrors,
      success: false,
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(result.data)

  if (error) {
    return {
      values: { email: values.email },
      errors: null,
      success: false,
      message: 'Invalid email or password',
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
```

### Pattern 2: Auth Callback Route Handler (PKCE Token Exchange)

**What:** A route handler at `/auth/confirm` that exchanges tokens from email links (signup confirmation, password reset) for user sessions. This is required for the PKCE flow used in server-side auth.

**When to use:** When user clicks email confirmation or password reset links.

**Example:**
```typescript
// Source: Supabase SSR docs (Context7 verified)
// app/auth/confirm/route.ts
import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })

    if (!error) {
      // For password recovery, redirect to reset password page
      if (type === 'recovery') {
        redirect('/reset-password')
      }
      // For email confirmation, redirect to intended destination
      redirect(next)
    }
  }

  // Token exchange failed
  redirect('/auth-code-error')
}
```

### Pattern 3: Automatic Profile Creation on Signup (Database Trigger)

**What:** A PostgreSQL trigger function that automatically creates a row in `public.profiles` when a new user signs up via `auth.users`. Uses `SECURITY DEFINER` with empty `search_path` for security.

**When to use:** Every new user signup must create a corresponding profile.

**Example:**
```sql
-- Source: Supabase User Management docs (Context7 verified)
-- supabase/migrations/00000000000002_auth_profile_trigger.sql

-- Automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fire after every new user creation in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Pattern 4: Middleware Route Protection

**What:** Extend the existing Supabase middleware to redirect unauthenticated users away from protected routes (`/dashboard/*`, `/admin/*`) and redirect authenticated users away from auth pages (`/login`, `/signup`).

**When to use:** Phase 2 adds route protection on top of the existing session refresh.

**Example:**
```typescript
// Source: Supabase SSR docs + Next.js middleware (Context7 verified)
// lib/supabase/middleware.ts (extended)
import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          supabaseResponse = NextResponse.next({ request })
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options)
          }
        },
      },
    }
  )

  // Refresh session
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Protected routes: redirect to login if not authenticated
  const protectedPrefixes = ['/dashboard', '/admin']
  const isProtected = protectedPrefixes.some((prefix) => path.startsWith(prefix))
  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', path)
    return NextResponse.redirect(loginUrl)
  }

  // Auth routes: redirect to home if already authenticated
  const authPaths = ['/login', '/signup']
  const isAuthPage = authPaths.includes(path)
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}
```

### Pattern 5: Free Episode Access (No Auth Gate)

**What:** The first 3 episodes of any series are publicly viewable without authentication. This is not an "auth wall" but a content access policy. Published episodes with `episode_number <= 3` are visible to everyone. Episodes 4+ require authentication (Phase 2) and payment (Phase 5).

**When to use:** Episode detail pages and the video player (Phase 3).

**Implementation approach:**
```
Episode Access Matrix:
| Episode # | Auth Status | Paid Status | Access  |
|-----------|-------------|-------------|---------|
| 1-3       | Any         | Any         | FREE    |
| 4+        | Not logged  | N/A         | BLOCKED (prompt signup) |
| 4+        | Logged in   | Not paid    | BLOCKED (prompt payment - Phase 5) |
| 4+        | Logged in   | Paid        | ALLOWED |
```

**RLS policy approach:**
```sql
-- Published episodes 1-3 are always visible (free tier)
-- This is already partially covered by the existing "Published episodes are visible to everyone" policy
-- The access check for episodes 4+ happens at the application layer:
--   1. Check if episode_number <= 3 → allow (no auth needed)
--   2. Check if user is authenticated → prompt signup if not
--   3. Check if user has purchased the season → prompt payment if not (Phase 5)
```

**Application-level check (in episode page component):**
```typescript
// Simplified access check logic for Phase 2
function canAccessEpisode(
  episode: Episode,
  user: User | null,
): { allowed: boolean; reason?: 'free' | 'auth_required' | 'payment_required' } {
  // First 3 episodes are always free
  if (episode.episode_number <= 3) {
    return { allowed: true, reason: 'free' }
  }

  // Episodes 4+ require authentication
  if (!user) {
    return { allowed: false, reason: 'auth_required' }
  }

  // Payment check deferred to Phase 5
  return { allowed: false, reason: 'payment_required' }
}
```

### Pattern 6: Logout from Any Page

**What:** A logout button component that can be placed in the header, sidebar, or mobile nav. Uses a server action to call `supabase.auth.signOut()`.

**When to use:** Visible on every page when user is authenticated.

**Example:**
```typescript
// components/auth/logout-button.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button onClick={handleLogout} className="text-sm text-muted-foreground hover:text-foreground">
      Sign Out
    </button>
  )
}
```

### Anti-Patterns to Avoid

- **Checking auth with `getSession()` instead of `getUser()`:** `getSession()` reads from the local cookie and does NOT verify the JWT with the Supabase server. Always use `getUser()` for security-sensitive operations (middleware, server actions, protected pages). `getSession()` can be spoofed.
- **Storing auth state in React context/state instead of cookies:** Supabase SSR uses cookies to share session between server and client. Adding a React context that duplicates session state leads to desync. Use `supabase.auth.getUser()` in server components and `supabase.auth.onAuthStateChange()` in client components.
- **Blocking free episodes behind an auth wall:** Success criterion #1 explicitly states users must watch the first 3 episodes WITHOUT creating an account or seeing a login prompt. Do not show a signup modal, banner, or gate on free episodes.
- **Using `supabase.auth.getUser()` in the root layout:** The root layout persists across navigations. Calling `getUser()` there would make every page wait for the auth check. Move auth checks to middleware (for redirects) or individual pages/layouts (for conditional UI).
- **Redirecting with `window.location` in server actions:** Use `redirect()` from `next/navigation` in server actions. It throws a special error that Next.js catches to perform the redirect. `window.location` doesn't exist in server context.
- **Forgetting `revalidatePath('/', 'layout')` after auth state changes:** After login/logout/signup, call `revalidatePath('/', 'layout')` to bust the server-side cache. Without it, Server Components may render stale auth state.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Password hashing | Custom bcrypt/argon2 implementation | **Supabase Auth** | Supabase uses bcrypt with configurable rounds. Handles salt generation, timing-safe comparison, and password strength validation. Rolling your own is a security risk. |
| Session management | Custom JWT tokens + cookie management | **@supabase/ssr** | Cookie serialization, token refresh, cross-domain handling, httpOnly flags, SameSite settings -- all handled. Custom session management is the #1 source of auth bugs. |
| Email sending for auth | Custom nodemailer/SendGrid integration | **Supabase Auth built-in** | Supabase sends confirmation and recovery emails automatically. Custom SMTP is only needed for production scale (rate limits). |
| CSRF protection | Custom CSRF tokens | **Next.js server actions** | Server actions use encrypted action IDs and the `Origin` header check by default. Adding custom CSRF tokens is unnecessary and can break forms. |
| Rate limiting auth endpoints | Custom rate limiter middleware | **Supabase Auth rate limits** | Supabase has built-in rate limiting: 30 sign-in/sign-ups per 5 min per IP, 2 emails/hour (configurable). Adding application-level rate limiting on top of Supabase's is unnecessary in Phase 2. |
| Profile auto-creation | Application-code profile creation after signup | **Database trigger** (`handle_new_user`) | A database trigger runs atomically with the user creation. Application-code solutions can fail (network error, crash) leaving a user without a profile, which breaks downstream queries. |
| Form validation | Custom regex validation functions | **Zod** | Type-safe schema validation with clear error messages. Works on both client and server. Handles email format, password length, and custom rules. |

**Key insight:** Auth is security-critical infrastructure. Every custom auth component is an attack surface. Supabase Auth + @supabase/ssr handles the hard parts (password storage, session management, token refresh, PKCE flow). Phase 2's job is to build the UI layer on top.

## Common Pitfalls

### Pitfall 1: Email Templates Not Updated for PKCE Flow

**What goes wrong:** Signup confirmation and password reset emails use the default Supabase template with `{{ .ConfirmationURL }}`, which contains the token in a URL fragment (`#access_token=...`). Fragments are not sent to the server, so server-side auth (PKCE) can't read them.
**Why it happens:** The default Supabase email template is designed for client-side (implicit) auth flow. Server-side auth requires a different template that uses `{{ .TokenHash }}` instead of `{{ .ConfirmationURL }}`.
**How to avoid:** Update email templates to use `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email` for signup and `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery` for password reset. Configure these in `supabase/config.toml` for local dev and in the Supabase dashboard for production.
**Warning signs:** Clicking email confirmation links lands on a broken page or the token is missing from the URL.

### Pitfall 2: Missing Auth Callback Route Handler

**What goes wrong:** Email links redirect to the app, but no route handler exists to exchange the token for a session. The user sees a 404 or error page.
**Why it happens:** The PKCE flow requires a server-side endpoint (`/auth/confirm`) to call `verifyOtp()` and establish the session. This is easy to forget because it doesn't exist in client-side auth flows.
**How to avoid:** Create `app/auth/confirm/route.ts` as one of the first tasks in Phase 2. Test it with both signup confirmation and password reset flows.
**Warning signs:** Users report "page not found" after clicking email links. Session is not established after email confirmation.

### Pitfall 3: handle_new_user Trigger Blocks Signups

**What goes wrong:** The `handle_new_user` trigger function has a bug (e.g., NOT NULL column without a default), causing every signup to fail with a database error. No users can register.
**Why it happens:** The trigger runs inside the same transaction as the `auth.users` INSERT. If the trigger fails, the entire signup is rolled back.
**How to avoid:** 1) Test the trigger with `supabase db reset` before deploying. 2) Make non-essential profile columns nullable (e.g., `display_name`, `username`). 3) Use `SET search_path = ''` with explicit schema references. 4) Use `SECURITY DEFINER` so the function has permission to write to `public.profiles`.
**Warning signs:** Signup returns a database error. No rows appear in `auth.users` after signup attempts.

### Pitfall 4: Middleware Redirect Loop

**What goes wrong:** Middleware redirects `/login` to `/` (because user is logged in), then `/` redirects back to `/login` (because of some other condition), creating an infinite redirect loop. Or middleware runs on the auth callback route and blocks it.
**Why it happens:** The middleware matcher is too broad, or the route protection logic doesn't account for the auth callback path (`/auth/confirm`).
**How to avoid:** 1) Exclude `/auth/confirm` from middleware route protection. 2) Test the redirect logic with both authenticated and unauthenticated states. 3) Only redirect auth pages for authenticated users -- don't redirect all public pages.
**Warning signs:** Browser shows "too many redirects" error. Auth callback links fail.

### Pitfall 5: Session Not Persisting Across Browser Refresh

**What goes wrong:** User logs in successfully but appears logged out after refreshing the page.
**Why it happens:** The middleware is not refreshing the auth token on every request. Or the `setAll` cookie handler in the server client is silently swallowing errors instead of propagating cookies.
**How to avoid:** 1) Verify middleware runs on all routes (check matcher pattern). 2) Verify `supabase.auth.getUser()` is called in middleware (this triggers token refresh). 3) Verify cookies are being set on the response (not just the request).
**Warning signs:** User stays logged in during SPA navigation but loses session on hard refresh. `auth.getUser()` returns null in Server Components but `auth.getSession()` returns a session in Client Components.

### Pitfall 6: Password Reset Token Expires Before User Acts

**What goes wrong:** User requests a password reset, reads the email hours later, and clicks the link. The token has expired (default: 1 hour for OTP).
**Why it happens:** Supabase OTP tokens expire after `otp_expiry` seconds (default 3600 = 1 hour, configured in `config.toml`).
**How to avoid:** 1) Set a reasonable `otp_expiry` (3600 seconds is fine for most cases). 2) Show a clear expiry message in the reset email. 3) If token exchange fails, show a helpful error page with a "request new link" button, not a generic error.
**Warning signs:** Users report "link expired" or see the auth-code-error page after clicking reset links.

## Code Examples

Verified patterns from official sources:

### Zod Validation Schemas for Auth

```typescript
// Source: shadcn/ui form docs + Supabase auth requirements
// lib/validations/auth.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(72, 'Password must be at most 72 characters'),
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be at most 50 characters')
    .optional(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(72, 'Password must be at most 72 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
```

### Signup Server Action with Metadata

```typescript
// Source: Supabase Auth docs (Context7 verified)
// app/(auth)/signup/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signupSchema, type AuthFormState } from '@/lib/validations/auth'

export async function signup(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const values = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    displayName: (formData.get('displayName') as string) || undefined,
  }

  const result = signupSchema.safeParse(values)
  if (!result.success) {
    return {
      values: { email: values.email },
      errors: result.error.flatten().fieldErrors,
      success: false,
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      data: {
        display_name: result.data.displayName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
    },
  })

  if (error) {
    return {
      values: { email: values.email },
      errors: null,
      success: false,
      message: error.message,
    }
  }

  // If email confirmation is enabled, show success message
  // If disabled, user is auto-logged in
  revalidatePath('/', 'layout')
  return {
    errors: null,
    success: true,
    message: 'Check your email for a confirmation link.',
  }
}
```

### Password Reset Request Server Action

```typescript
// Source: Supabase Auth docs (Context7 verified)
// app/(auth)/forgot-password/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { forgotPasswordSchema, type AuthFormState } from '@/lib/validations/auth'

export async function requestPasswordReset(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const values = { email: formData.get('email') as string }

  const result = forgotPasswordSchema.safeParse(values)
  if (!result.success) {
    return {
      values: { email: values.email },
      errors: result.error.flatten().fieldErrors,
      success: false,
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(result.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/reset-password`,
  })

  if (error) {
    return {
      values: { email: values.email },
      errors: null,
      success: false,
      message: error.message,
    }
  }

  // Always show success to prevent email enumeration
  return {
    errors: null,
    success: true,
    message: 'If an account exists with this email, you will receive a password reset link.',
  }
}
```

### Password Update Server Action

```typescript
// Source: Supabase Auth docs (Context7 verified)
// app/(auth)/reset-password/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { resetPasswordSchema, type AuthFormState } from '@/lib/validations/auth'

export async function updatePassword(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const values = {
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  }

  const result = resetPasswordSchema.safeParse(values)
  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
      success: false,
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    password: result.data.password,
  })

  if (error) {
    return {
      errors: null,
      success: false,
      message: error.message,
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
```

### Email Templates for PKCE Flow

```html
<!-- Source: Supabase email template docs (verified via official docs)  -->
<!-- supabase/templates/confirmation.html -->
<html>
  <body style="background-color: #141414; color: #f2f2f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px;">
    <div style="max-width: 480px; margin: 0 auto;">
      <h1 style="color: #E0B800; font-size: 24px; margin-bottom: 24px;">Welcome to MicroShort</h1>
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
        Confirm your email address to start watching premium microshort series.
      </p>
      <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email"
         style="display: inline-block; background-color: #E0B800; color: #141414; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Confirm Email
      </a>
      <p style="font-size: 13px; color: #999; margin-top: 32px;">
        If you didn't create a MicroShort account, you can safely ignore this email.
      </p>
    </div>
  </body>
</html>
```

```html
<!-- supabase/templates/recovery.html -->
<html>
  <body style="background-color: #141414; color: #f2f2f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px;">
    <div style="max-width: 480px; margin: 0 auto;">
      <h1 style="color: #E0B800; font-size: 24px; margin-bottom: 24px;">Reset Your Password</h1>
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
        Click the button below to reset your MicroShort password.
        This link expires in 1 hour.
      </p>
      <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password"
         style="display: inline-block; background-color: #E0B800; color: #141414; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Reset Password
      </a>
      <p style="font-size: 13px; color: #999; margin-top: 32px;">
        If you didn't request a password reset, you can safely ignore this email.
      </p>
    </div>
  </body>
</html>
```

### Supabase config.toml Email Template Configuration

```toml
# Add to existing supabase/config.toml

[auth.email.template.confirmation]
subject = "Confirm your MicroShort account"
content_path = "./supabase/templates/confirmation.html"

[auth.email.template.recovery]
subject = "Reset your MicroShort password"
content_path = "./supabase/templates/recovery.html"
```

### Header with Auth State

```typescript
// Source: Next.js App Router patterns
// components/layout/header.tsx (updated for auth)
// The header needs to conditionally show Sign In or user menu + Sign Out
// Since the header is a client component (for mobile menu), it can use
// the browser Supabase client to check auth state

'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LogoutButton } from '@/components/auth/logout-button'
import type { User } from '@supabase/supabase-js'

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  return (
    <header>
      {/* ... existing header markup ... */}
      <nav>
        {user ? (
          <LogoutButton />
        ) : (
          <Link href="/login">Sign In</Link>
        )}
      </nav>
    </header>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | 2024 | auth-helpers is deprecated. `@supabase/ssr` handles cookie management for SSR frameworks. Already using the correct package. |
| Implicit auth flow (tokens in URL fragment) | PKCE flow (code exchange on server) | Supabase Auth 2024 | URL fragments (`#access_token=...`) don't reach the server. PKCE uses `?code=...` which the server can read. Required for server-side auth in Next.js App Router. |
| `getSession()` for auth checks | `getUser()` for auth checks | Supabase 2024 recommendation | `getSession()` reads from the local cookie without server verification. It can be spoofed. `getUser()` makes a network call to verify the JWT. Always use `getUser()` for security-sensitive checks. |
| `supabase.auth.onAuthStateChange` `SIGNED_IN` event | Check for `INITIAL_SESSION` event first | supabase-js v2.39+ | The `INITIAL_SESSION` event fires once on subscription creation. Use it to get the initial auth state instead of duplicating with a separate `getSession()` call. |
| Custom email templates via dashboard only | Local templates via `config.toml` | Supabase CLI 2024 | Templates can now be customized in `supabase/config.toml` for local development. Changes are reflected when restarting `supabase start`. |
| `middleware.ts` → `proxy.ts` | Next.js 16 may rename middleware | Next.js 16.1+ | Next.js docs now reference "proxy" in some places. For now, `middleware.ts` still works. Monitor for naming changes. **Confidence: MEDIUM** -- some Context7 docs show `proxy` naming but `middleware.ts` is still standard. |

**Deprecated/outdated:**
- **`@supabase/auth-helpers-nextjs`:** Fully deprecated. Use `@supabase/ssr`. Already correct in this project.
- **Implicit auth flow:** Should not be used with Next.js App Router. PKCE is the correct flow.
- **`getSession()` for security checks:** Use `getUser()`. `getSession()` is fine for non-security-sensitive UI (showing user name) but not for access control.

## Open Questions

1. **Email confirmation enabled or disabled for development?**
   - What we know: `config.toml` has `enable_confirmations = false` currently. This means users are auto-confirmed on signup (no email verification required).
   - What's unclear: Should we enable email confirmations for Phase 2 to test the full flow? Or keep it disabled for faster development and enable for production?
   - Recommendation: Keep `enable_confirmations = false` for initial development to simplify testing. Enable it before Phase 2 verification to test the full confirmation flow. The email templates and auth callback should be built regardless, as they're needed for password reset.

2. **NEXT_PUBLIC_SITE_URL for email redirects**
   - What we know: `resetPasswordForEmail` and `signUp` accept `redirectTo` / `emailRedirectTo` options. These need the full site URL.
   - What's unclear: The `.env.local` currently only has Supabase URL and key. A `NEXT_PUBLIC_SITE_URL` env var is needed.
   - Recommendation: Add `NEXT_PUBLIC_SITE_URL=http://localhost:3000` to `.env.local` and `.env.example`. This is used for constructing email redirect URLs.

3. **Admin route protection -- role check in middleware vs page?**
   - What we know: `/admin` routes should only be accessible to users with `role = 'admin'` in the profiles table. Middleware can check auth status, but checking the database role in middleware adds latency to every request.
   - What's unclear: Should we check the admin role in middleware (more secure, blocks before render) or in the page component (less latency on non-admin routes)?
   - Recommendation: Phase 2 middleware checks auth only (logged in / not logged in). Role-based access (admin, creator) is checked at the page/layout level by querying the profiles table. This defers role enforcement to Phase 7 (Admin Panel) when it's actually needed.

4. **Docker availability for local Supabase testing**
   - What we know: Phase 1 noted Docker was unavailable. The `handle_new_user` trigger migration needs testing.
   - What's unclear: Has Docker been set up since Phase 1?
   - Recommendation: If Docker is available, test with `supabase db reset`. If not, verify the migration SQL manually and test on a remote Supabase project. The trigger SQL is straightforward and unlikely to have issues.

## Sources

### Primary (HIGH confidence)
- [Supabase SSR docs - Next.js setup](https://supabase.com/docs/guides/auth/server-side/nextjs) - Context7 verified, server actions, middleware, client setup
- [Supabase Auth - signUp, signInWithPassword, signOut, resetPasswordForEmail, updateUser](https://context7.com/supabase/supabase-js/llms.txt) - Context7 verified, all auth methods with code examples
- [Supabase Auth - verifyOtp, exchangeCodeForSession](https://supabase.com/docs/guides/auth/passwords) - Context7 verified, PKCE token exchange
- [Supabase Auth - onAuthStateChange events](https://context7.com/supabase/supabase-js/llms.txt) - Context7 verified, INITIAL_SESSION, SIGNED_IN, SIGNED_OUT, PASSWORD_RECOVERY
- [Supabase - handle_new_user trigger](https://supabase.com/docs/guides/auth/managing-user-data) - Context7 verified, profile auto-creation with SECURITY DEFINER
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates) - Official docs, template variables (ConfirmationURL, TokenHash, SiteURL, RedirectTo, Data)
- [Supabase Local Email Templates](https://supabase.com/docs/guides/local-development/customizing-email-templates) - Official docs, config.toml template configuration
- [Next.js 16 - middleware auth patterns](https://github.com/vercel/next.js/blob/v16.1.5/docs/01-app/02-guides/authentication.mdx) - Context7 verified, route protection, server action auth
- [shadcn/ui - Forms with Next.js server actions](https://ui.shadcn.com/docs/forms/next) - Official docs, useActionState, Zod validation, Field component

### Secondary (MEDIUM confidence)
- [Supabase SMTP configuration](https://supabase.com/docs/guides/auth/auth-smtp) - Official docs, production email setup
- [shadcn/ui - React Hook Form integration](https://ui.shadcn.com/docs/forms/react-hook-form) - Official docs, alternative form pattern
- [Supabase Auth rate limits](https://supabase.com/docs/guides/cli/config) - Official config docs, rate limit settings

### Tertiary (LOW confidence)
- Next.js 16 middleware vs proxy naming -- some Context7 docs show `proxy` naming but `middleware.ts` is still functional. Needs monitoring.

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** -- No new libraries needed beyond Zod. All auth handled by already-installed Supabase packages. Verified via Context7 and official docs.
- Architecture: **HIGH** -- Server actions + PKCE flow is the documented pattern for Supabase + Next.js App Router. Multiple sources confirm the same approach.
- Email templates: **HIGH** -- Template variables and PKCE-compatible templates are well-documented. Local development uses Inbucket/Mailpit (already configured in config.toml).
- Free episode access: **HIGH** -- Simple `episode_number <= 3` check. No complex access control needed. Application-level check with future RLS policy support.
- Pitfalls: **HIGH** -- Based on documented patterns, Supabase community discussions, and known PKCE flow requirements.
- Auth callback: **HIGH** -- `verifyOtp()` with `token_hash` and `type` is the documented approach. Confirmed by Context7 and official Supabase password docs.

**Research date:** 2026-02-14
**Valid until:** 2026-03-16 (30 days -- Supabase Auth and Next.js App Router patterns are stable)
