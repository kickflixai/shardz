import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCreatorEarnings } from "@/lib/stripe/transfers";
import { formatPrice } from "@/lib/stripe/prices";
import { ConnectButton } from "./connect-button";

export default async function PayoutsPage({
	searchParams,
}: {
	searchParams: Promise<{ onboarding?: string }>;
}) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login");
	}

	// Fetch creator profile
	const { data: profile } = await supabase
		.from("profiles")
		.select("id, stripe_account_id, stripe_onboarding_complete")
		.eq("id", user.id)
		.single();

	if (!profile) {
		redirect("/login");
	}

	// Get earnings summary
	const earnings = await getCreatorEarnings(user.id);

	// Fetch completed payout records
	const { data: payoutRecords } = await supabase
		.from("payout_records")
		.select("id, amount_cents, status, created_at, stripe_transfer_id")
		.eq("creator_id", user.id)
		.eq("status", "completed")
		.order("created_at", { ascending: false });

	const params = await searchParams;
	const onboardingStatus = params.onboarding;

	return (
		<div className="py-4">
			<h1 className="text-3xl font-bold text-foreground">Payouts</h1>
			<p className="mt-2 text-muted-foreground">
				Manage your earnings and Stripe Connect account.
			</p>

			{/* Onboarding status banner */}
			{onboardingStatus === "complete" && (
				<div className="mt-4 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
					<p className="text-sm font-medium text-green-400">
						Stripe Connect setup complete! Your accumulated earnings have been
						transferred.
					</p>
				</div>
			)}
			{onboardingStatus === "incomplete" && (
				<div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
					<p className="text-sm font-medium text-yellow-400">
						Stripe Connect setup is not yet complete. Please finish the
						onboarding process to receive payouts.
					</p>
				</div>
			)}
			{onboardingStatus === "error" && (
				<div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
					<p className="text-sm font-medium text-red-400">
						There was an error verifying your Stripe account. Please try again.
					</p>
				</div>
			)}

			{/* Earnings Summary */}
			<div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
				<div className="rounded-lg border border-border bg-cinema-surface p-6">
					<p className="text-sm text-muted-foreground">Total Earned</p>
					<p className="mt-2 text-2xl font-bold text-brand-yellow">
						{formatPrice(earnings.totalEarnedCents)}
					</p>
				</div>
				<div className="rounded-lg border border-border bg-cinema-surface p-6">
					<p className="text-sm text-muted-foreground">Pending Transfer</p>
					<p className="mt-2 text-2xl font-bold text-brand-yellow">
						{formatPrice(earnings.pendingTransferCents)}
					</p>
				</div>
				<div className="rounded-lg border border-border bg-cinema-surface p-6">
					<p className="text-sm text-muted-foreground">Transferred</p>
					<p className="mt-2 text-2xl font-bold text-brand-yellow">
						{formatPrice(earnings.transferredCents)}
					</p>
				</div>
			</div>

			{/* Connect Stripe Section */}
			<div className="mt-8 rounded-lg border border-border bg-cinema-surface p-6">
				<h2 className="text-lg font-semibold text-foreground">
					Stripe Connect
				</h2>
				{profile.stripe_onboarding_complete ? (
					<div className="mt-3 flex items-center gap-2">
						<span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
						<span className="text-sm text-green-400">Connected</span>
					</div>
				) : profile.stripe_account_id ? (
					<div className="mt-3">
						<p className="text-sm text-muted-foreground">
							Your Stripe account setup is incomplete. Complete the onboarding
							process to start receiving payouts.
						</p>
						<ConnectButton label="Complete Setup" className="mt-4" />
					</div>
				) : (
					<div className="mt-3">
						<p className="text-sm text-muted-foreground">
							Connect your Stripe account to withdraw your earnings. Revenue
							accumulates safely until you are ready.
						</p>
						<ConnectButton label="Connect Stripe" className="mt-4" />
					</div>
				)}
			</div>

			{/* Payout History */}
			<div className="mt-8">
				<h2 className="text-lg font-semibold text-foreground">
					Payout History
				</h2>
				{payoutRecords && payoutRecords.length > 0 ? (
					<div className="mt-4 overflow-hidden rounded-lg border border-border">
						<table className="w-full">
							<thead className="bg-cinema-surface">
								<tr>
									<th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
										Date
									</th>
									<th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
										Amount
									</th>
									<th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
										Status
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{payoutRecords.map((record) => (
									<tr key={record.id} className="bg-card">
										<td className="whitespace-nowrap px-4 py-3 text-sm text-foreground">
											{new Date(record.created_at).toLocaleDateString(
												"en-US",
												{
													year: "numeric",
													month: "short",
													day: "numeric",
												},
											)}
										</td>
										<td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-brand-yellow">
											{formatPrice(record.amount_cents)}
										</td>
										<td className="whitespace-nowrap px-4 py-3 text-sm">
											<span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
												<span className="h-1.5 w-1.5 rounded-full bg-green-500" />
												Completed
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<div className="mt-4 rounded-lg border border-border bg-cinema-surface p-8 text-center">
						<p className="text-sm text-muted-foreground">No payouts yet.</p>
						{!profile.stripe_onboarding_complete && (
							<p className="mt-2 text-xs text-muted-foreground">
								Connect your Stripe account and your accumulated earnings will
								be transferred automatically.
							</p>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
