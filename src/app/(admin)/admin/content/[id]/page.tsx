import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/admin/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { ContentActions } from "./content-actions";

const STATUS_STYLES: Record<string, string> = {
	published: "bg-green-500/10 text-green-600 dark:text-green-400",
	draft: "bg-muted text-muted-foreground",
	archived: "bg-red-500/10 text-red-600 dark:text-red-400",
	processing: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
	ready: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

interface SeasonData {
	id: string;
	season_number: number;
	title: string | null;
	status: string;
	price_cents: number | null;
	episodes: {
		id: string;
		title: string;
		status: string;
		sort_order: number;
	}[];
}

interface CreatorProfile {
	display_name: string | null;
	username: string | null;
}

export default async function ContentDetailPage({ params }: { params: Promise<{ id: string }> }) {
	await requireAdmin();
	const { id } = await params;
	const adminDb = createAdminClient();

	const { data: series } = await adminDb
		.from("series")
		.select(
			"*, profiles!creator_id(display_name, username), seasons(id, season_number, title, status, price_cents, episodes(id, title, status, sort_order))",
		)
		.eq("id", id)
		.single();

	if (!series) {
		notFound();
	}

	const creator = (series.profiles as unknown as CreatorProfile[])?.[0] ?? {
		display_name: null,
		username: null,
	};
	const seasons = ((series.seasons ?? []) as unknown as SeasonData[]).sort(
		(a, b) => a.season_number - b.season_number,
	);

	return (
		<div className="py-4">
			<Link
				href="/admin/content"
				className="text-sm text-muted-foreground transition-colors hover:text-foreground"
			>
				&larr; Back to Content
			</Link>

			<div className="mt-6 flex items-start justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-foreground">{series.title}</h1>
					<p className="mt-1 text-muted-foreground">/{series.slug}</p>
				</div>
				<ContentActions seriesId={series.id} status={series.status} />
			</div>

			{/* Series Info */}
			<div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
				<div className="rounded-lg border border-border bg-card p-4">
					<p className="text-sm text-muted-foreground">Status</p>
					<Badge variant="outline" className={`mt-1 ${STATUS_STYLES[series.status] ?? ""}`}>
						{series.status}
					</Badge>
				</div>
				<div className="rounded-lg border border-border bg-card p-4">
					<p className="text-sm text-muted-foreground">Genre</p>
					<p className="mt-1 font-medium capitalize text-foreground">{series.genre}</p>
				</div>
				<div className="rounded-lg border border-border bg-card p-4">
					<p className="text-sm text-muted-foreground">Views</p>
					<p className="mt-1 font-medium text-foreground">{series.view_count.toLocaleString()}</p>
				</div>
				<div className="rounded-lg border border-border bg-card p-4">
					<p className="text-sm text-muted-foreground">Featured</p>
					<p className="mt-1 font-medium text-foreground">{series.is_featured ? "Yes" : "No"}</p>
				</div>
			</div>

			{/* Creator */}
			<div className="mt-4 rounded-lg border border-border bg-card p-4">
				<p className="text-sm text-muted-foreground">Creator</p>
				<p className="mt-1 font-medium text-foreground">
					{creator.display_name || creator.username || "Unknown"}
					{creator.username && (
						<span className="ml-2 text-muted-foreground">@{creator.username}</span>
					)}
				</p>
			</div>

			{series.description && (
				<div className="mt-4 rounded-lg border border-border bg-card p-4">
					<p className="text-sm text-muted-foreground">Description</p>
					<p className="mt-1 text-foreground">{series.description}</p>
				</div>
			)}

			<div className="mt-2 text-sm text-muted-foreground">
				Created {formatDate(series.created_at)}
			</div>

			{/* Seasons & Episodes */}
			<div className="mt-8">
				<h2 className="text-lg font-semibold text-foreground">Seasons ({seasons.length})</h2>
				{seasons.length === 0 ? (
					<p className="mt-4 text-muted-foreground">No seasons yet.</p>
				) : (
					<div className="mt-4 grid gap-4">
						{seasons.map((season) => {
							const episodes = [...season.episodes].sort((a, b) => a.sort_order - b.sort_order);
							return (
								<div key={season.id} className="rounded-lg border border-border bg-card">
									<div className="flex items-center justify-between border-b border-border px-4 py-3">
										<div className="flex items-center gap-3">
											<span className="font-medium text-foreground">
												Season {season.season_number}
												{season.title && `: ${season.title}`}
											</span>
											<Badge variant="outline" className={STATUS_STYLES[season.status] ?? ""}>
												{season.status}
											</Badge>
										</div>
										<span className="text-sm text-muted-foreground">
											{season.price_cents ? `$${(season.price_cents / 100).toFixed(2)}` : "Free"}
											{" | "}
											{episodes.length} episodes
										</span>
									</div>
									{episodes.length > 0 && (
										<div className="divide-y divide-border">
											{episodes.map((ep) => (
												<div
													key={ep.id}
													className="flex items-center justify-between px-4 py-2 text-sm"
												>
													<span className="text-foreground">{ep.title}</span>
													<Badge
														variant="outline"
														className={`text-xs ${STATUS_STYLES[ep.status] ?? ""}`}
													>
														{ep.status}
													</Badge>
												</div>
											))}
										</div>
									)}
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
