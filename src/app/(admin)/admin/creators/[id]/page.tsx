import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/admin/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

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

export default async function CreatorDetailPage({ params }: { params: Promise<{ id: string }> }) {
	await requireAdmin();
	const { id } = await params;
	const adminDb = createAdminClient();

	const { data: creator } = await adminDb
		.from("profiles")
		.select("*, series(id, title, slug, status, view_count, created_at)")
		.eq("id", id)
		.single();

	if (!creator) {
		notFound();
	}

	const series = (creator.series ?? []) as {
		id: string;
		title: string;
		slug: string;
		status: string;
		view_count: number;
		created_at: string;
	}[];

	return (
		<div className="py-4">
			<Link
				href="/admin/creators"
				className="text-sm text-muted-foreground transition-colors hover:text-foreground"
			>
				&larr; Back to Creators
			</Link>

			<div className="mt-6 flex items-start gap-6">
				{creator.avatar_url ? (
					<Image
						src={creator.avatar_url}
						alt={creator.display_name || ""}
						width={80}
						height={80}
						className="rounded-full"
						unoptimized
					/>
				) : (
					<div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-2xl font-bold text-muted-foreground">
						{(creator.display_name || "?")[0]?.toUpperCase()}
					</div>
				)}
				<div>
					<h1 className="text-3xl font-bold text-foreground">
						{creator.display_name || "Unnamed Creator"}
					</h1>
					{creator.username && <p className="mt-1 text-muted-foreground">@{creator.username}</p>}
					<div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
						<span>Role: {creator.role}</span>
						<span>{creator.follower_count?.toLocaleString() ?? 0} followers</span>
						<span>Joined {formatDate(creator.created_at)}</span>
					</div>
				</div>
			</div>

			{creator.bio && (
				<div className="mt-6 rounded-lg border border-border bg-card p-4">
					<h2 className="text-sm font-medium text-muted-foreground">Bio</h2>
					<p className="mt-1 text-foreground">{creator.bio}</p>
				</div>
			)}

			{creator.social_links &&
				Object.keys(creator.social_links as Record<string, string>).length > 0 && (
					<div className="mt-4 rounded-lg border border-border bg-card p-4">
						<h2 className="text-sm font-medium text-muted-foreground">Social Links</h2>
						<div className="mt-2 flex flex-wrap gap-2">
							{Object.entries(creator.social_links as Record<string, string>).map(
								([platform, url]) => (
									<a
										key={platform}
										href={url}
										target="_blank"
										rel="noopener noreferrer"
										className="rounded-md bg-muted px-3 py-1 text-sm text-foreground transition-colors hover:bg-muted/80"
									>
										{platform}
									</a>
								),
							)}
						</div>
					</div>
				)}

			{/* Creator's Series */}
			<div className="mt-8">
				<h2 className="text-lg font-semibold text-foreground">Series ({series.length})</h2>
				{series.length === 0 ? (
					<p className="mt-4 text-muted-foreground">No series created yet.</p>
				) : (
					<div className="mt-4 grid gap-3">
						{series.map((s) => (
							<Link
								key={s.id}
								href={`/admin/content/${s.id}`}
								className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50"
							>
								<div>
									<span className="font-medium text-foreground">{s.title}</span>
									<span className="ml-3 text-sm text-muted-foreground">/{s.slug}</span>
								</div>
								<div className="flex items-center gap-4 text-sm">
									<span className="text-muted-foreground">
										{s.view_count.toLocaleString()} views
									</span>
									<Badge variant="outline" className={STATUS_STYLES[s.status] ?? ""}>
										{s.status}
									</Badge>
									<span className="text-muted-foreground">{formatDate(s.created_at)}</span>
								</div>
							</Link>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
