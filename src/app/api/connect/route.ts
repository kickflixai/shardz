import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
	createConnectAccount,
	createAccountLink,
} from "@/lib/stripe/connect";

/**
 * POST /api/connect
 * Initiates Stripe Connect onboarding for a creator.
 * Creates an Express account if needed, generates an account link,
 * and returns the onboarding URL for client-side redirect.
 */
export async function POST() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json(
			{ error: "Authentication required" },
			{ status: 401 },
		);
	}

	// Fetch profile to check for existing Connect account
	const { data: profile, error: profileError } = await supabase
		.from("profiles")
		.select("id, username, stripe_account_id")
		.eq("id", user.id)
		.single();

	if (profileError || !profile) {
		return NextResponse.json(
			{ error: "Profile not found" },
			{ status: 404 },
		);
	}

	let accountId = profile.stripe_account_id;

	// Create a new Express account if one doesn't exist yet
	if (!accountId) {
		try {
			accountId = await createConnectAccount({
				email: user.email ?? "",
				creatorUsername: profile.username,
			});

			// Store the account ID on the profile
			await supabase
				.from("profiles")
				.update({ stripe_account_id: accountId })
				.eq("id", user.id);
		} catch (error) {
			console.error("[connect] Failed to create Connect account:", error);
			return NextResponse.json(
				{ error: "Failed to create Connect account" },
				{ status: 500 },
			);
		}
	}

	// Generate an account link for onboarding
	try {
		const url = await createAccountLink({
			accountId,
			returnPath: "/api/connect/onboarding",
			refreshPath: "/api/connect",
		});

		return NextResponse.json({ url });
	} catch (error) {
		console.error("[connect] Failed to create account link:", error);
		return NextResponse.json(
			{ error: "Failed to create onboarding link" },
			{ status: 500 },
		);
	}
}
