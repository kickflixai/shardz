import {
	ClipboardList,
	DollarSign,
	Film,
	Home,
	LayoutGrid,
	Star,
	TrendingUp,
	Users,
} from "lucide-react";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/require-admin";
import { formatPrice } from "@/lib/stripe/prices";
import {
	getPlatformMetrics,
	getRecentActivity,
} from "@/modules/admin/queries/get-platform-metrics";

// ============================================================================
// Helpers
// ============================================================================

function formatRelativeTime(dateString: string): string {
	const now = Date.now();
	const then = new Date(dateString).getTime();
	const diffSeconds = Math.floor((now - then) / 1000);

	if (diffSeconds < 60) return `${diffSeconds}s ago`;
	const diffMinutes = Math.floor(diffSeconds / 60);
	if (diffMinutes < 60) return `${diffMinutes}m ago`;
	const diffHours = Math.floor(diffMinutes / 60);
	if (diffHours < 24) return `${diffHours}h ago`;
	const diffDays = Math.floor(diffHours / 24);
	if (diffDays < 30) return `${diffDays}d ago`;
	const diffMonths = Math.floor(diffDays / 30);
	return `${diffMonths}mo ago`;
}

const ROLE_STYLES: Record<string, string> = {
	admin: "bg-red-500/10 text-red-400",
	creator: "bg-brand-yellow/10 text-brand-yellow",
	viewer: "bg-blue-500/10 text-blue-400",
};

const STATUS_STYLES: Record<string, string> = {
	pending: "bg-yellow-500/10 text-yellow-400",
	approved: "bg-green-500/10 text-green-400",
	rejected: "bg-red-500/10 text-red-400",
};

const quickLinks = [
	{
		label: "Review Applications",
		href: "/admin/applications",
		icon: ClipboardList,
		description: "Review pending creator applications",
		badgeKey: "pendingApplications" as const,
	},
	{
		label: "Manage Content",
		href: "/admin/content",
		icon: LayoutGrid,
		description: "Browse and moderate all series",
	},
	{
		label: "Curate Homepage",
		href: "/admin/homepage",
		icon: Home,
		description: "Feature series and editorial picks",
	},
	{
		label: "View Revenue",
		href: "/admin/revenue",
		icon: TrendingUp,
		description: "Platform revenue and transactions",
	},
];

// ============================================================================
// Page Component
// ============================================================================

export default async function AdminDashboardPage() {
	await requireAdmin();

	const [metrics, activity] = await Promise.all([getPlatformMetrics(), getRecentActivity()]);

	return (
		<div className="py-4">
			<h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
			<p className="mt-2 text-muted-foreground">Platform health overview and quick actions.</p>

			{/* Primary Metric Cards */}
			<div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg border border-border bg-card p-6">
					<div className="flex items-center justify-between">
						<p className="text-sm text-muted-foreground">Total Users</p>
						<Users className="h-5 w-5 text-muted-foreground" />
					</div>
					<p className="mt-2 text-2xl font-bold text-foreground">
						{metrics.totalUsers.toLocaleString()}
					</p>
				</div>
				<div className="rounded-lg border border-border bg-card p-6">
					<div className="flex items-center justify-between">
						<p className="text-sm text-muted-foreground">Active Creators</p>
						<Star className="h-5 w-5 text-muted-foreground" />
					</div>
					<p className="mt-2 text-2xl font-bold text-foreground">
						{metrics.activeCreators.toLocaleString()}
					</p>
				</div>
				<div className="rounded-lg border border-border bg-card p-6">
					<div className="flex items-center justify-between">
						<p className="text-sm text-muted-foreground">Published Series</p>
						<Film className="h-5 w-5 text-muted-foreground" />
					</div>
					<p className="mt-2 text-2xl font-bold text-foreground">
						{metrics.publishedSeries.toLocaleString()}
					</p>
				</div>
				<div className="rounded-lg border border-border bg-card p-6">
					<div className="flex items-center justify-between">
						<p className="text-sm text-muted-foreground">Total Revenue</p>
						<DollarSign className="h-5 w-5 text-muted-foreground" />
					</div>
					<p className="mt-2 text-2xl font-bold text-brand-yellow">
						{formatPrice(metrics.totalRevenueCents)}
					</p>
				</div>
			</div>

			{/* Secondary Stats Row */}
			<div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg border border-border bg-card p-6">
					<p className="text-sm text-muted-foreground">Platform Fees</p>
					<p className="mt-2 text-2xl font-bold text-foreground">
						{formatPrice(metrics.platformFeeCents)}
					</p>
				</div>
				<div className="rounded-lg border border-border bg-card p-6">
					<p className="text-sm text-muted-foreground">Creator Payouts</p>
					<p className="mt-2 text-2xl font-bold text-foreground">
						{formatPrice(metrics.creatorPayoutsCents)}
					</p>
				</div>
				<div className="rounded-lg border border-border bg-card p-6">
					<p className="text-sm text-muted-foreground">Total Purchases</p>
					<p className="mt-2 text-2xl font-bold text-foreground">
						{metrics.totalPurchases.toLocaleString()}
					</p>
				</div>
				<div className="rounded-lg border border-border bg-card p-6">
					<p className="text-sm text-muted-foreground">Pending Applications</p>
					<p className="mt-2 text-2xl font-bold text-foreground">
						<Link href="/admin/applications" className="hover:text-primary transition-colors">
							{metrics.pendingApplications.toLocaleString()}
						</Link>
					</p>
				</div>
			</div>

			{/* Quick Links */}
			<div className="mt-8">
				<h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
				<div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{quickLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/50 hover:bg-card/80"
						>
							<div className="flex items-center gap-3">
								<link.icon className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
								<p className="text-sm font-medium text-foreground">{link.label}</p>
								{link.badgeKey && metrics[link.badgeKey] > 0 && (
									<span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
										{metrics[link.badgeKey]}
									</span>
								)}
							</div>
							<p className="mt-2 text-xs text-muted-foreground">{link.description}</p>
						</Link>
					))}
				</div>
			</div>

			{/* Recent Activity */}
			<div className="mt-8">
				<h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
				<div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
					{/* Recent Signups */}
					<div className="rounded-lg border border-border bg-card">
						<div className="border-b border-border px-4 py-3">
							<h3 className="text-sm font-medium text-foreground">Recent Signups</h3>
						</div>
						<div className="divide-y divide-border">
							{activity.recentSignups.length === 0 ? (
								<p className="px-4 py-6 text-center text-sm text-muted-foreground">
									No signups yet
								</p>
							) : (
								activity.recentSignups.map((user) => (
									<div key={user.id} className="flex items-center justify-between px-4 py-3">
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-medium text-foreground">
												{user.display_name || user.username || "Anonymous"}
											</p>
											<p className="text-xs text-muted-foreground">
												{formatRelativeTime(user.created_at)}
											</p>
										</div>
										<span
											className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_STYLES[user.role] ?? "bg-muted text-muted-foreground"}`}
										>
											{user.role}
										</span>
									</div>
								))
							)}
						</div>
					</div>

					{/* Recent Purchases */}
					<div className="rounded-lg border border-border bg-card">
						<div className="border-b border-border px-4 py-3">
							<h3 className="text-sm font-medium text-foreground">Recent Purchases</h3>
						</div>
						<div className="divide-y divide-border">
							{activity.recentPurchases.length === 0 ? (
								<p className="px-4 py-6 text-center text-sm text-muted-foreground">
									No purchases yet
								</p>
							) : (
								activity.recentPurchases.map((purchase) => (
									<div key={purchase.id} className="flex items-center justify-between px-4 py-3">
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-medium text-foreground">
												{purchase.seasons.series.title}
											</p>
											<p className="text-xs text-muted-foreground">
												{formatRelativeTime(purchase.created_at)}
											</p>
										</div>
										<span className="ml-2 shrink-0 text-sm font-medium text-brand-yellow">
											{formatPrice(purchase.amount_cents)}
										</span>
									</div>
								))
							)}
						</div>
					</div>

					{/* Recent Applications */}
					<div className="rounded-lg border border-border bg-card">
						<div className="border-b border-border px-4 py-3">
							<h3 className="text-sm font-medium text-foreground">Recent Applications</h3>
						</div>
						<div className="divide-y divide-border">
							{activity.recentApplications.length === 0 ? (
								<p className="px-4 py-6 text-center text-sm text-muted-foreground">
									No applications yet
								</p>
							) : (
								activity.recentApplications.map((app) => (
									<div key={app.id} className="flex items-center justify-between px-4 py-3">
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-medium text-foreground">
												{app.display_name}
											</p>
											<p className="text-xs text-muted-foreground">
												{formatRelativeTime(app.created_at)}
											</p>
										</div>
										<span
											className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[app.status] ?? "bg-muted text-muted-foreground"}`}
										>
											{app.status}
										</span>
									</div>
								))
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
