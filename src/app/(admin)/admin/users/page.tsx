import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/admin/require-admin";
import { getAdminUsers } from "@/modules/admin/queries/get-admin-entities";
import { AdminSearch } from "../_components/admin-search";

const ROLE_STYLES: Record<string, string> = {
	viewer: "bg-muted text-muted-foreground",
	creator: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
	admin: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
};

function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export default async function AdminUsersPage({
	searchParams,
}: {
	searchParams: Promise<{ search?: string }>;
}) {
	await requireAdmin();
	const { search } = await searchParams;
	const users = await getAdminUsers(search);

	return (
		<div className="py-4">
			<h1 className="text-3xl font-bold text-foreground">Users</h1>
			<p className="mt-2 text-muted-foreground">Browse and manage all user accounts.</p>

			<div className="mt-6">
				<AdminSearch currentSearch={search} />
			</div>

			<div className="mt-6 overflow-x-auto">
				{users.length === 0 ? (
					<div className="rounded-lg border border-border bg-card p-8 text-center">
						<p className="text-muted-foreground">No users found.</p>
					</div>
				) : (
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-border text-left text-muted-foreground">
								<th className="pb-3 pr-4 font-medium">User</th>
								<th className="pb-3 pr-4 font-medium">Username</th>
								<th className="pb-3 pr-4 font-medium">Role</th>
								<th className="pb-3 font-medium">Joined</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{users.map((user) => (
								<tr key={user.id} className="group">
									<td className="py-3 pr-4">
										<Link
											href={`/admin/users/${user.id}`}
											className="flex items-center gap-3 transition-colors group-hover:text-primary"
										>
											{user.avatar_url ? (
												<Image
													src={user.avatar_url}
													alt={user.display_name || ""}
													width={32}
													height={32}
													className="rounded-full"
													unoptimized
												/>
											) : (
												<div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
													{(user.display_name || user.username || "?")[0]?.toUpperCase()}
												</div>
											)}
											<span className="font-medium text-foreground">
												{user.display_name || "Unnamed"}
											</span>
										</Link>
									</td>
									<td className="py-3 pr-4 text-muted-foreground">
										{user.username ? `@${user.username}` : "--"}
									</td>
									<td className="py-3 pr-4">
										<Badge variant="outline" className={ROLE_STYLES[user.role] ?? ""}>
											{user.role}
										</Badge>
									</td>
									<td className="py-3 text-muted-foreground">{formatDate(user.created_at)}</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
}
