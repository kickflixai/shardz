import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/admin/require-admin";
import { getAdminSeries } from "@/modules/admin/queries/get-admin-entities";
import { AdminSearch } from "../_components/admin-search";

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

export default async function AdminContentPage({
	searchParams,
}: {
	searchParams: Promise<{ search?: string }>;
}) {
	await requireAdmin();
	const { search } = await searchParams;
	const seriesList = await getAdminSeries(search);

	return (
		<div className="py-4">
			<h1 className="text-3xl font-bold text-foreground">Content</h1>
			<p className="mt-2 text-muted-foreground">Browse and moderate all series on the platform.</p>

			<div className="mt-6">
				<AdminSearch currentSearch={search} />
			</div>

			<div className="mt-6 overflow-x-auto">
				{seriesList.length === 0 ? (
					<div className="rounded-lg border border-border bg-card p-8 text-center">
						<p className="text-muted-foreground">No series found.</p>
					</div>
				) : (
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-border text-left text-muted-foreground">
								<th className="pb-3 pr-4 font-medium">Series</th>
								<th className="pb-3 pr-4 font-medium">Creator</th>
								<th className="pb-3 pr-4 font-medium">Genre</th>
								<th className="pb-3 pr-4 font-medium">Status</th>
								<th className="pb-3 pr-4 font-medium">Views</th>
								<th className="pb-3 pr-4 font-medium">Featured</th>
								<th className="pb-3 font-medium">Created</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{seriesList.map((s) => (
								<tr key={s.id} className="group">
									<td className="py-3 pr-4">
										<Link
											href={`/admin/content/${s.id}`}
											className="flex items-center gap-3 transition-colors group-hover:text-primary"
										>
											{s.thumbnail_url ? (
												<Image
													src={s.thumbnail_url}
													alt={s.title}
													width={40}
													height={24}
													className="rounded object-cover"
													unoptimized
												/>
											) : (
												<div className="flex h-6 w-10 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
													--
												</div>
											)}
											<span className="font-medium text-foreground">{s.title}</span>
										</Link>
									</td>
									<td className="py-3 pr-4 text-muted-foreground">
										{s.profiles?.display_name || s.profiles?.username || "--"}
									</td>
									<td className="py-3 pr-4 text-muted-foreground capitalize">{s.genre}</td>
									<td className="py-3 pr-4">
										<Badge variant="outline" className={STATUS_STYLES[s.status] ?? ""}>
											{s.status}
										</Badge>
									</td>
									<td className="py-3 pr-4 text-muted-foreground">
										{s.view_count.toLocaleString()}
									</td>
									<td className="py-3 pr-4">
										{s.is_featured && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
									</td>
									<td className="py-3 text-muted-foreground">{formatDate(s.created_at)}</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
}
