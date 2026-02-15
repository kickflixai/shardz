import { createClient } from "@supabase/supabase-js";

/**
 * Standalone Supabase admin client for seed scripts.
 * NOT imported from src/lib/supabase/admin.ts -- seed scripts must not
 * import from the Next.js app.
 *
 * Requires env vars loaded via `tsx --env-file=.env.local`.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
	throw new Error(
		"Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Ensure .env.local is loaded (use --env-file=.env.local).",
	);
}

export const adminDb = createClient(url, serviceRoleKey, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
	},
});
