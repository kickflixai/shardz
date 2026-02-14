import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCreatorAnalytics } from "@/modules/creator/queries/get-creator-analytics";
import { formatPrice } from "@/lib/stripe/prices";

function formatViewCount(count: number): string {
	if (count >= 1_000_000) {
		return `${(count / 1_000_000).toFixed(1)}M`;
	}
	if (count >= 1_000) {
		return `${(count / 1_000).toFixed(1)}K`;
	}
	return count.toString();
}

export default async function AnalyticsPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login");
	}

	// Verify creator role
	const { data: profile } = await supabase
		.from("profiles")
		.select("role")
		.eq("id", user.id)
		.single();

	if (!profile || (profile.role !== "creator" && profile.role !== "admin")) {
		redirect("/dashboard/apply");
	}

	const analytics = await getCreatorAnalytics(user.id);

	// Empty state
	if (
		analytics.totalViews === 0 &&
		analytics.totalUnlocks === 0 &&
		analytics.seriesBreakdown.length === 0
	) {
		return (
			<div className="py-4">
				<h1 className="text-3xl font-bold text-foreground">Analytics</h1>
				<div className="mt-8 rounded-lg border border-border bg-card p-12 text-center">
					<p className="text-lg font-medium text-foreground">
						No analytics yet
					</p>
					<p className="mt-2 text-sm text-muted-foreground">
						Upload and publish content to start tracking performance.
					</p>
					<Link
						href="/dashboard/series"
						className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
					>
						Manage Series
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="py-4">
			<h1 className="text-3xl font-bold text-foreground">Analytics</h1>
			<p className="mt-2 text-muted-foreground">
				Track your content performance and earnings.
			</p>

			{/* Top row: 4 metric cards */}
			<div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg border border-border bg-card p-6">
					<p className="text-sm text-muted-foreground">Total Views</p>
					<p className="mt-2 text-2xl font-bold text-foreground">
						{formatViewCount(analytics.totalViews)}
					</p>
				</div>
				<div className="rounded-lg border border-border bg-card p-6">
					<p className="text-sm text-muted-foreground">Total Revenue</p>
					<p className="mt-2 text-2xl font-bold text-brand-yellow">
						{formatPrice(analytics.totalRevenueCents)}
					</p>
				</div>
				<div className="rounded-lg border border-border bg-card p-6">
					<p className="text-sm text-muted-foreground">Creator Earnings</p>
					<p className="mt-2 text-2xl font-bold text-brand-yellow">
						{formatPrice(analytics.creatorEarningsCents)}
					</p>
					<p className="mt-1 text-xs text-muted-foreground">
						Your share after platform fee
					</p>
				</div>
				<div className="rounded-lg border border-border bg-card p-6">
					<p className="text-sm text-muted-foreground">Total Unlocks</p>
					<p className="mt-2 text-2xl font-bold text-foreground">
						{analytics.totalUnlocks.toLocaleString()}
					</p>
					<p className="mt-1 text-xs text-muted-foreground">
						Season purchases
					</p>
				</div>
			</div>

			{/* Per-series breakdown table */}
			{analytics.seriesBreakdown.length > 0 && (
				<div className="mt-8">
					<h2 className="text-lg font-semibold text-foreground">
						Per-Series Breakdown
					</h2>
					<div className="mt-4 overflow-hidden rounded-lg border border-border">
						<table className="w-full">
							<thead className="bg-cinema-surface">
								<tr>
									<th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
										Series
									</th>
									<th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
										Views
									</th>
									<th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
										Unlocks
									</th>
									<th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
										Revenue
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{analytics.seriesBreakdown.map((series) => (
									<tr key={series.seriesId} className="bg-card">
										<td className="px-4 py-3">
											<Link
												href={`/dashboard/series/${series.seriesId}`}
												className="text-sm font-medium text-foreground hover:text-primary transition-colors"
											>
												{series.title}
											</Link>
										</td>
										<td className="whitespace-nowrap px-4 py-3 text-right text-sm text-foreground">
											{formatViewCount(series.views)}
										</td>
										<td className="whitespace-nowrap px-4 py-3 text-right text-sm text-foreground">
											{series.unlocks.toLocaleString()}
										</td>
										<td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-brand-yellow">
											{formatPrice(series.revenueCents)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Recent Activity */}
			<div className="mt-8">
				<h2 className="text-lg font-semibold text-foreground">
					Recent Activity
				</h2>
				{analytics.recentPurchases.length > 0 ? (
					<div className="mt-4 overflow-hidden rounded-lg border border-border">
						<table className="w-full">
							<thead className="bg-cinema-surface">
								<tr>
									<th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
										Date
									</th>
									<th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
										Series
									</th>
									<th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
										Amount
									</th>
									<th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
										Your Share
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{analytics.recentPurchases.map((purchase) => (
									<tr key={purchase.id} className="bg-card">
										<td className="whitespace-nowrap px-4 py-3 text-sm text-foreground">
											{new Date(purchase.createdAt).toLocaleDateString(
												"en-US",
												{
													year: "numeric",
													month: "short",
													day: "numeric",
												},
											)}
										</td>
										<td className="px-4 py-3 text-sm text-foreground">
											{purchase.seriesTitle}
										</td>
										<td className="whitespace-nowrap px-4 py-3 text-right text-sm text-foreground">
											{formatPrice(purchase.amountCents)}
										</td>
										<td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-brand-yellow">
											{formatPrice(purchase.creatorShareCents)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<div className="mt-4 rounded-lg border border-border bg-card p-8 text-center">
						<p className="text-sm text-muted-foreground">
							No purchase activity yet.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
