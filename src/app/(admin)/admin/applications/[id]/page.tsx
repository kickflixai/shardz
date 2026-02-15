import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/admin/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { ApplicationReviewForm } from "./review-form";

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
		hour: "numeric",
		minute: "2-digit",
	});
}

export default async function ApplicationDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	await requireAdmin();
	const adminDb = createAdminClient();
	const { id } = await params;

	const { data: application } = await adminDb
		.from("creator_applications")
		.select("*, profiles!user_id(username, avatar_url, role, created_at)")
		.eq("id", id)
		.single();

	if (!application) {
		notFound();
	}

	const profile = application.profiles as unknown as {
		username: string | null;
		avatar_url: string | null;
		role: string;
		created_at: string;
	} | null;

	// Parse social links
	const socialLinks =
		typeof application.social_links === "object" && application.social_links
			? (application.social_links as Record<string, string>)
			: {};

	return (
		<div className="py-4">
			{/* Back link */}
			<Link
				href="/admin/applications"
				className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
			>
				<svg
					className="h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth="1.5"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
				</svg>
				Back to Applications
			</Link>

			<div className="mt-6 grid gap-6 lg:grid-cols-3">
				{/* Main content */}
				<div className="space-y-6 lg:col-span-2">
					{/* Applicant info */}
					<div className="rounded-lg border border-border bg-card p-6">
						<div className="flex items-center justify-between">
							<h1 className="text-2xl font-bold text-foreground">{application.display_name}</h1>
							<Badge variant="outline" className={STATUS_STYLES[application.status] || ""}>
								{application.status}
							</Badge>
						</div>

						<div className="mt-4 space-y-4">
							<div>
								<h3 className="text-sm font-medium text-muted-foreground">Bio</h3>
								<p className="mt-1 text-foreground whitespace-pre-wrap">{application.bio}</p>
							</div>

							{application.portfolio_description && (
								<div>
									<h3 className="text-sm font-medium text-muted-foreground">
										Portfolio Description
									</h3>
									<p className="mt-1 text-foreground whitespace-pre-wrap">
										{application.portfolio_description}
									</p>
								</div>
							)}

							{application.portfolio_url && (
								<div>
									<h3 className="text-sm font-medium text-muted-foreground">Portfolio URL</h3>
									<a
										href={application.portfolio_url}
										target="_blank"
										rel="noopener noreferrer"
										className="mt-1 text-primary hover:underline"
									>
										{application.portfolio_url}
									</a>
								</div>
							)}

							{Object.keys(socialLinks).length > 0 && (
								<div>
									<h3 className="text-sm font-medium text-muted-foreground">Social Links</h3>
									<div className="mt-1 flex flex-wrap gap-2">
										{Object.entries(socialLinks).map(([platform, url]) => (
											<a
												key={platform}
												href={url}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted/80 transition-colors"
											>
												{platform}
											</a>
										))}
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Review section */}
					{application.status === "pending" ? (
						<div className="rounded-lg border border-border bg-card p-6">
							<h2 className="text-lg font-semibold text-foreground">Review Application</h2>
							<p className="mt-1 text-sm text-muted-foreground">
								Approve to grant creator access or reject with feedback.
							</p>
							<div className="mt-4">
								<ApplicationReviewForm applicationId={application.id} />
							</div>
						</div>
					) : (
						<div className="rounded-lg border border-border bg-card p-6">
							<h2 className="text-lg font-semibold text-foreground">Review Result</h2>
							<div className="mt-4 space-y-3">
								{application.reviewer_notes && (
									<div>
										<h3 className="text-sm font-medium text-muted-foreground">Reviewer Notes</h3>
										<p className="mt-1 text-foreground whitespace-pre-wrap">
											{application.reviewer_notes}
										</p>
									</div>
								)}
								{application.reviewed_at && (
									<p className="text-sm text-muted-foreground">
										Reviewed on {formatDate(application.reviewed_at)}
									</p>
								)}
							</div>
						</div>
					)}
				</div>

				{/* Sidebar info */}
				<div className="space-y-6">
					<div className="rounded-lg border border-border bg-card p-6">
						<h3 className="font-semibold text-foreground">User Info</h3>
						<div className="mt-4 space-y-3">
							{profile?.username && (
								<div>
									<p className="text-xs text-muted-foreground">Username</p>
									<p className="text-sm text-foreground">@{profile.username}</p>
								</div>
							)}
							{profile && (
								<div>
									<p className="text-xs text-muted-foreground">Current Role</p>
									<p className="text-sm text-foreground capitalize">{profile.role}</p>
								</div>
							)}
							{profile?.created_at && (
								<div>
									<p className="text-xs text-muted-foreground">Account Created</p>
									<p className="text-sm text-foreground">{formatDate(profile.created_at)}</p>
								</div>
							)}
							<div>
								<p className="text-xs text-muted-foreground">Applied</p>
								<p className="text-sm text-foreground">{formatDate(application.created_at)}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
