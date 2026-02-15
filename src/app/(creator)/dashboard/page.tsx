import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCreatorOverview } from "@/modules/creator/queries/get-creator-analytics";
import { formatPrice } from "@/lib/stripe/prices";
import { getEffectiveRole } from "@/lib/demo-role";

function formatViewCount(count: number): string {
	if (count >= 1_000_000) {
		return `${(count / 1_000_000).toFixed(1)}M`;
	}
	if (count >= 1_000) {
		return `${(count / 1_000).toFixed(1)}K`;
	}
	return count.toString();
}

const quickLinks = [
	{
		label: "Manage Series",
		href: "/dashboard/series",
		description: "Create and edit your series catalog",
		icon: "M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z",
	},
	{
		label: "Upload Episode",
		href: "/dashboard/series",
		description: "Add new episodes to your series",
		icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12",
	},
	{
		label: "View Analytics",
		href: "/dashboard/analytics",
		description: "Track views, revenue, and unlocks",
		icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
	},
	{
		label: "Payouts",
		href: "/dashboard/payouts",
		description: "Manage your earnings and Stripe account",
		icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
	},
];

export default async function CreatorDashboardPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	// Fetch profile if logged in
	let profile: { role: string; display_name: string | null } | null = null;
	if (user) {
		const { data } = await supabase
			.from("profiles")
			.select("role, display_name")
			.eq("id", user.id)
			.single();
		profile = data;
	}

	// Apply demo role override (only allows downgrade)
	const actualRole = (profile?.role ?? "admin") as "viewer" | "creator" | "admin";
	const effectiveRole = await getEffectiveRole(actualRole);

	// Viewer: show apply CTA
	if (effectiveRole === "viewer") {
		return (
			<div className="py-4">
				<h1 className="text-3xl font-bold text-foreground">
					Creator Dashboard
				</h1>
				<div className="mt-8 rounded-lg border border-border bg-card p-12 text-center">
					<h2 className="text-xl font-semibold text-foreground">
						Become a Creator
					</h2>
					<p className="mt-2 text-muted-foreground">
						Apply to become a creator and start sharing your short-form films
						with the world.
					</p>
					<Link
						href="/dashboard/apply"
						className="mt-6 inline-block rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
					>
						Apply Now
					</Link>
				</div>
			</div>
		);
	}

	// Creator/Admin: show overview
	// Use first mock creator as fallback for demo (unauthenticated) visitors
	const userId = user?.id ?? "00000000-0000-0000-0000-000000000000";
	const overview = await getCreatorOverview(userId);

	return (
		<div className="py-4">
			<h1 className="text-3xl font-bold text-foreground">
				{profile?.display_name ? `Welcome back, ${profile.display_name}` : "Creator Dashboard"}
			</h1>
			<p className="mt-2 text-muted-foreground">
				Here is an overview of your content performance.
			</p>

			{/* Overview metric cards */}
			<div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg border border-border bg-card p-6">
					<p className="text-sm text-muted-foreground">Total Views</p>
					<p className="mt-2 text-2xl font-bold text-foreground">
						{formatViewCount(overview.totalViews)}
					</p>
				</div>
				<div className="rounded-lg border border-border bg-card p-6">
					<p className="text-sm text-muted-foreground">Earnings</p>
					<p className="mt-2 text-2xl font-bold text-brand-yellow">
						{formatPrice(overview.totalEarningsCents)}
					</p>
				</div>
				<div className="rounded-lg border border-border bg-card p-6">
					<p className="text-sm text-muted-foreground">Unlocks</p>
					<p className="mt-2 text-2xl font-bold text-foreground">
						{overview.totalUnlocks.toLocaleString()}
					</p>
				</div>
				<div className="rounded-lg border border-border bg-card p-6">
					<p className="text-sm text-muted-foreground">Series</p>
					<p className="mt-2 text-2xl font-bold text-foreground">
						{overview.seriesCount}
					</p>
				</div>
			</div>

			{/* Quick Links */}
			<div className="mt-8">
				<h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
				<div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{quickLinks.map((link) => (
						<Link
							key={link.href + link.label}
							href={link.href}
							className="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/50 hover:bg-card/80"
						>
							<div className="flex items-center gap-3">
								<svg
									className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth="1.5"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d={link.icon}
									/>
								</svg>
								<p className="text-sm font-medium text-foreground">
									{link.label}
								</p>
							</div>
							<p className="mt-2 text-xs text-muted-foreground">
								{link.description}
							</p>
						</Link>
					))}
				</div>
			</div>

			{/* Recent Activity */}
			{overview.recentPurchases.length > 0 && (
				<div className="mt-8">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold text-foreground">
							Recent Activity
						</h2>
						<Link
							href="/dashboard/analytics"
							className="text-sm text-muted-foreground hover:text-primary transition-colors"
						>
							View all
						</Link>
					</div>
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
										Your Share
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{overview.recentPurchases.map((purchase) => (
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
										<td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-brand-yellow">
											{formatPrice(purchase.creatorShareCents)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	);
}
