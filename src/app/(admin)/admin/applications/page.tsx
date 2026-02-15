import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/admin/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

type StatusFilter = "pending" | "approved" | "rejected" | "all";

const STATUS_STYLES: Record<string, string> = {
	pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
	approved: "bg-green-500/10 text-green-600 dark:text-green-400",
	rejected: "bg-red-500/10 text-red-600 dark:text-red-400",
};

function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export default async function ApplicationsPage({
	searchParams,
}: {
	searchParams: Promise<{ status?: string }>;
}) {
	await requireAdmin();
	const adminDb = createAdminClient();
	const params = await searchParams;
	const filter = (params.status as StatusFilter) || "pending";

	let query = adminDb
		.from("creator_applications")
		.select("id, display_name, bio, portfolio_url, status, created_at")
		.order("created_at", { ascending: false });

	if (filter !== "all") {
		query = query.eq("status", filter);
	}

	const { data: applications } = await query;

	const filters: { label: string; value: StatusFilter }[] = [
		{ label: "Pending", value: "pending" },
		{ label: "Approved", value: "approved" },
		{ label: "Rejected", value: "rejected" },
		{ label: "All", value: "all" },
	];

	return (
		<div className="py-4">
			<h1 className="text-3xl font-bold text-foreground">Creator Applications</h1>
			<p className="mt-2 text-muted-foreground">Review and manage creator applications.</p>

			{/* Status filter tabs */}
			<div className="mt-6 flex gap-2">
				{filters.map((f) => (
					<Link
						key={f.value}
						href={
							f.value === "pending"
								? "/admin/applications"
								: `/admin/applications?status=${f.value}`
						}
						className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
							filter === f.value
								? "bg-primary text-primary-foreground"
								: "bg-muted text-muted-foreground hover:text-foreground"
						}`}
					>
						{f.label}
					</Link>
				))}
			</div>

			{/* Applications list */}
			<div className="mt-6 grid gap-4">
				{!applications || applications.length === 0 ? (
					<div className="rounded-lg border border-border bg-card p-8 text-center">
						<p className="text-muted-foreground">
							No {filter === "all" ? "" : filter} applications found.
						</p>
					</div>
				) : (
					applications.map((app) => (
						<Link
							key={app.id}
							href={`/admin/applications/${app.id}`}
							className="block rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/50"
						>
							<div className="flex items-start justify-between gap-4">
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-3">
										<h3 className="font-semibold text-foreground">{app.display_name}</h3>
										<Badge variant="outline" className={STATUS_STYLES[app.status] || ""}>
											{app.status}
										</Badge>
									</div>
									<p className="mt-1 text-sm text-muted-foreground line-clamp-2">
										{app.bio.length > 100 ? `${app.bio.slice(0, 100)}...` : app.bio}
									</p>
									<div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
										<span>Applied {formatDate(app.created_at)}</span>
										{app.portfolio_url && <span className="text-primary">Has portfolio</span>}
									</div>
								</div>
								<svg
									className="h-5 w-5 shrink-0 text-muted-foreground"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth="1.5"
									stroke="currentColor"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M8.25 4.5l7.5 7.5-7.5 7.5"
									/>
								</svg>
							</div>
						</Link>
					))
				)}
			</div>
		</div>
	);
}
