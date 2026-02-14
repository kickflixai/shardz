import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAccountStatus } from "@/lib/stripe/connect";
import { batchTransferToCreator } from "@/lib/stripe/transfers";

/**
 * GET /api/connect/onboarding
 * Return URL after Stripe Connect onboarding completes.
 * Checks account status, marks onboarding complete if ready,
 * triggers batch transfer of accumulated revenue, then redirects
 * to the payouts dashboard.
 */
export async function GET() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login");
	}

	// Fetch profile to get Connect account ID
	const { data: profile } = await supabase
		.from("profiles")
		.select("id, stripe_account_id, stripe_onboarding_complete")
		.eq("id", user.id)
		.single();

	if (!profile?.stripe_account_id) {
		redirect("/dashboard/payouts?onboarding=incomplete");
	}

	// Check the account status with Stripe
	try {
		const status = await getAccountStatus(profile.stripe_account_id);

		if (status.detailsSubmitted && status.chargesEnabled) {
			// Mark onboarding as complete
			await supabase
				.from("profiles")
				.update({ stripe_onboarding_complete: true })
				.eq("id", user.id);

			// Trigger batch transfer of all accumulated revenue
			const result = await batchTransferToCreator(
				user.id,
				profile.stripe_account_id,
			);

			console.log(
				"[connect-onboarding] Batch transfer complete:",
				result.transferred,
				"transfers,",
				`$${(result.totalCents / 100).toFixed(2)}`,
			);

			redirect("/dashboard/payouts?onboarding=complete");
		}

		// Onboarding not fully complete yet
		redirect("/dashboard/payouts?onboarding=incomplete");
	} catch (error) {
		console.error("[connect-onboarding] Error checking account status:", error);
		redirect("/dashboard/payouts?onboarding=error");
	}
}
