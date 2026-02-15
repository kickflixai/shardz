import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/admin/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { RoleForm } from "./role-form";

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

interface PurchaseRow {
	id: string;
	amount_cents: number;
	creator_share_cents: number;
	status: string;
	created_at: string;
	seasons: { series: { title: string }[] }[];
}

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
	await requireAdmin();
	const { id } = await params;
	const adminDb = createAdminClient();

	const { data: user } = await adminDb.from("profiles").select("*").eq("id", id).single();

	if (!user) {
		notFound();
	}

	// Fetch user's purchases
	const { data: purchases } = await adminDb
		.from("purchases")
		.select(
			"id, amount_cents, creator_share_cents, status, created_at, seasons!inner(series!inner(title))",
		)
		.eq("user_id", id)
		.order("created_at", { ascending: false })
		.limit(20);

	const purchaseList = (purchases ?? []) as unknown as PurchaseRow[];

	return (
		<div className="py-4">
			<Link
				href="/admin/users"
				className="text-sm text-muted-foreground transition-colors hover:text-foreground"
			>
				&larr; Back to Users
			</Link>

			<div className="mt-6 flex items-start gap-6">
				{user.avatar_url ? (
					<Image
						src={user.avatar_url}
						alt={user.display_name || ""}
						width={80}
						height={80}
						className="rounded-full"
						unoptimized
					/>
				) : (
					<div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-2xl font-bold text-muted-foreground">
						{(user.display_name || user.username || "?")[0]?.toUpperCase()}
					</div>
				)}
				<div>
					<h1 className="text-3xl font-bold text-foreground">
						{user.display_name || "Unnamed User"}
					</h1>
					{user.username && <p className="mt-1 text-muted-foreground">@{user.username}</p>}
					<div className="mt-2 flex items-center gap-3">
						<Badge variant="outline" className={ROLE_STYLES[user.role] ?? ""}>
							{user.role}
						</Badge>
						<span className="text-sm text-muted-foreground">
							Joined {formatDate(user.created_at)}
						</span>
					</div>
				</div>
			</div>

			{user.bio && (
				<div className="mt-6 rounded-lg border border-border bg-card p-4">
					<p className="text-sm text-muted-foreground">Bio</p>
					<p className="mt-1 text-foreground">{user.bio}</p>
				</div>
			)}

			{/* Role Management */}
			<div className="mt-6 rounded-lg border border-border bg-card p-4">
				<h2 className="text-sm font-medium text-muted-foreground">Role Management</h2>
				<div className="mt-3">
					<RoleForm userId={user.id} currentRole={user.role} />
				</div>
			</div>

			{/* User's Purchases */}
			<div className="mt-8">
				<h2 className="text-lg font-semibold text-foreground">Purchases ({purchaseList.length})</h2>
				{purchaseList.length === 0 ? (
					<p className="mt-4 text-muted-foreground">No purchases yet.</p>
				) : (
					<div className="mt-4 overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-border text-left text-muted-foreground">
									<th className="pb-3 pr-4 font-medium">Series</th>
									<th className="pb-3 pr-4 font-medium">Amount</th>
									<th className="pb-3 pr-4 font-medium">Status</th>
									<th className="pb-3 font-medium">Date</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{purchaseList.map((p) => (
									<tr key={p.id}>
										<td className="py-3 pr-4 text-foreground">
											{p.seasons?.[0]?.series?.[0]?.title ?? "Unknown"}
										</td>
										<td className="py-3 pr-4 text-foreground">
											${(p.amount_cents / 100).toFixed(2)}
										</td>
										<td className="py-3 pr-4">
											<Badge
												variant="outline"
												className={
													p.status === "completed"
														? "bg-green-500/10 text-green-600 dark:text-green-400"
														: "bg-red-500/10 text-red-600 dark:text-red-400"
												}
											>
												{p.status}
											</Badge>
										</td>
										<td className="py-3 text-muted-foreground">{formatDate(p.created_at)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}
