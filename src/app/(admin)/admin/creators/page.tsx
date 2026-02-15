import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/require-admin";
import { getAdminCreators } from "@/modules/admin/queries/get-admin-entities";
import { AdminSearch } from "../_components/admin-search";

function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export default async function AdminCreatorsPage({
	searchParams,
}: {
	searchParams: Promise<{ search?: string }>;
}) {
	await requireAdmin();
	const { search } = await searchParams;
	const creators = await getAdminCreators(search);

	return (
		<div className="py-4">
			<h1 className="text-3xl font-bold text-foreground">Creators</h1>
			<p className="mt-2 text-muted-foreground">Browse and manage all creator accounts.</p>

			<div className="mt-6">
				<AdminSearch currentSearch={search} />
			</div>

			<div className="mt-6 overflow-x-auto">
				{creators.length === 0 ? (
					<div className="rounded-lg border border-border bg-card p-8 text-center">
						<p className="text-muted-foreground">No creators found.</p>
					</div>
				) : (
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-border text-left text-muted-foreground">
								<th className="pb-3 pr-4 font-medium">Creator</th>
								<th className="pb-3 pr-4 font-medium">Username</th>
								<th className="pb-3 pr-4 font-medium">Series</th>
								<th className="pb-3 pr-4 font-medium">Followers</th>
								<th className="pb-3 font-medium">Joined</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{creators.map((creator) => (
								<tr key={creator.id} className="group">
									<td className="py-3 pr-4">
										<Link
											href={`/admin/creators/${creator.id}`}
											className="flex items-center gap-3 transition-colors group-hover:text-primary"
										>
											{creator.avatar_url ? (
												<Image
													src={creator.avatar_url}
													alt={creator.display_name || ""}
													width={32}
													height={32}
													className="rounded-full"
													unoptimized
												/>
											) : (
												<div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
													{(creator.display_name || "?")[0]?.toUpperCase()}
												</div>
											)}
											<span className="font-medium text-foreground">
												{creator.display_name || "Unnamed"}
											</span>
										</Link>
									</td>
									<td className="py-3 pr-4 text-muted-foreground">
										{creator.username ? `@${creator.username}` : "--"}
									</td>
									<td className="py-3 pr-4 text-muted-foreground">
										{creator.series?.[0]?.count ?? 0}
									</td>
									<td className="py-3 pr-4 text-muted-foreground">
										{creator.follower_count.toLocaleString()}
									</td>
									<td className="py-3 text-muted-foreground">{formatDate(creator.created_at)}</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
}
