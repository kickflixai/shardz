import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
	let supabaseResponse = NextResponse.next({ request });

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					for (const { name, value } of cookiesToSet) {
						request.cookies.set(name, value);
					}
					supabaseResponse = NextResponse.next({ request });
					for (const { name, value, options } of cookiesToSet) {
						supabaseResponse.cookies.set(name, value, options);
					}
				},
			},
		},
	);

	// Refresh session -- IMPORTANT: do not remove
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const path = request.nextUrl.pathname;

	// Protected routes: redirect to login if not authenticated
	const protectedPrefixes = ["/dashboard", "/admin"];
	const isProtected = protectedPrefixes.some((prefix) =>
		path.startsWith(prefix),
	);
	if (isProtected && !user) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("next", path);
		return NextResponse.redirect(loginUrl);
	}

	// Auth routes: redirect to home if already authenticated
	// Note: /forgot-password and /reset-password are NOT included --
	// a logged-in user might still need to reset their password
	const authPaths = ["/login", "/signup"];
	const isAuthPage = authPaths.includes(path);
	if (isAuthPage && user) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	return supabaseResponse;
}
