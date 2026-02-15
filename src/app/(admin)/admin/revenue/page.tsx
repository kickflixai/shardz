import { requireAdmin } from "@/lib/admin/require-admin";
import { getAdminRevenue } from "@/modules/admin/queries/get-admin-entities";

function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function formatCents(cents: number): string {
	return `$${(cents / 100).toFixed(2)}`;
}

export default async function AdminRevenuePage() {
	await requireAdmin();
	const purchases = await getAdminRevenue();

	// Compute summary metrics
	const totalRevenueCents = purchases.reduce((sum, p) => sum + p.amount_cents, 0);
	const totalPlatformFeeCents = purchases.reduce((sum, p) => sum + p.platform_fee_cents, 0);
	const totalCreatorPayoutsCents = purchases.reduce((sum, p) => sum + p.creator_share_cents, 0);

	return (
		<div className="py-4">
			<h1 className="text-3xl font-bold text-foreground">Revenue</h1>
			<p className="mt-2 text-muted-foreground">
				Platform revenue overview and transaction history.
			</p>

			{/* Summary Cards */}
			<div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
				<div className="rounded-lg border border-border bg-card p-6">
					<p className="text-sm text-muted-foreground">Total Revenue</p>
					<p className="mt-2 text-2xl font-bold text-foreground">
						{formatCents(totalRevenueCents)}
					</p>
					<p className="mt-1 text-xs text-muted-foreground">
						{purchases.length} completed purchases
					</p>
				</div>
				<div className="rounded-lg border border-border bg-card p-6">
					<p className="text-sm text-muted-foreground">Platform Fees</p>
					<p className="mt-2 text-2xl font-bold text-foreground">
						{formatCents(totalPlatformFeeCents)}
					</p>
					<p className="mt-1 text-xs text-muted-foreground">20% of revenue</p>
				</div>
				<div className="rounded-lg border border-border bg-card p-6">
					<p className="text-sm text-muted-foreground">Creator Payouts</p>
					<p className="mt-2 text-2xl font-bold text-foreground">
						{formatCents(totalCreatorPayoutsCents)}
					</p>
					<p className="mt-1 text-xs text-muted-foreground">80% of revenue</p>
				</div>
			</div>

			{/* Purchase History Table */}
			<div className="mt-8">
				<h2 className="text-lg font-semibold text-foreground">Recent Purchases</h2>
				<div className="mt-4 overflow-x-auto">
					{purchases.length === 0 ? (
						<div className="rounded-lg border border-border bg-card p-8 text-center">
							<p className="text-muted-foreground">No completed purchases yet.</p>
						</div>
					) : (
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-border text-left text-muted-foreground">
									<th className="pb-3 pr-4 font-medium">Date</th>
									<th className="pb-3 pr-4 font-medium">User</th>
									<th className="pb-3 pr-4 font-medium">Series</th>
									<th className="pb-3 pr-4 font-medium">Amount</th>
									<th className="pb-3 pr-4 font-medium">Platform Fee</th>
									<th className="pb-3 pr-4 font-medium">Creator Share</th>
									<th className="pb-3 font-medium">Status</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{purchases.map((p) => (
									<tr key={p.id}>
										<td className="py-3 pr-4 text-muted-foreground">{formatDate(p.created_at)}</td>
										<td className="py-3 pr-4 text-foreground">
											{p.profiles?.username ?? "Unknown"}
										</td>
										<td className="py-3 pr-4 text-foreground">
											{p.seasons?.series?.title ?? "Unknown"}
										</td>
										<td className="py-3 pr-4 font-medium text-foreground">
											{formatCents(p.amount_cents)}
										</td>
										<td className="py-3 pr-4 text-muted-foreground">
											{formatCents(p.platform_fee_cents)}
										</td>
										<td className="py-3 pr-4 text-muted-foreground">
											{formatCents(p.creator_share_cents)}
										</td>
										<td className="py-3">
											<span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
												{p.status}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</div>
			</div>
		</div>
	);
}
