import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ApplicationForm } from "./application-form";

export default async function ApplyPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login?next=/dashboard/apply");
	}

	// Check if user is already a creator
	const { data: profile } = await supabase
		.from("profiles")
		.select("role")
		.eq("id", user.id)
		.single();

	if (profile?.role === "creator" || profile?.role === "admin") {
		redirect("/dashboard");
	}

	// Check for existing application
	const { data: application } = await supabase
		.from("creator_applications")
		.select("id, status, reviewer_notes, created_at")
		.eq("user_id", user.id)
		.single();

	if (application?.status === "pending") {
		return (
			<div className="mx-auto max-w-2xl py-8">
				<Card>
					<CardHeader>
						<CardTitle>Application Pending</CardTitle>
						<CardDescription>
							Your creator application is under review
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<p className="text-sm text-muted-foreground">
								We received your application on{" "}
								{new Date(application.created_at).toLocaleDateString()}. Our
								team will review it and get back to you soon.
							</p>
							<div className="rounded-md bg-primary/10 px-4 py-3 text-sm text-primary">
								Your application is currently being reviewed. You will be
								notified once a decision has been made.
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	const isReapply = application?.status === "rejected";

	return (
		<div className="mx-auto max-w-2xl py-8">
			{isReapply && (
				<div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3">
					<p className="text-sm font-medium text-destructive">
						Your previous application was not approved.
					</p>
					{application.reviewer_notes && (
						<p className="mt-1 text-sm text-muted-foreground">
							Feedback: {application.reviewer_notes}
						</p>
					)}
					<p className="mt-2 text-sm text-muted-foreground">
						You can submit a new application below.
					</p>
				</div>
			)}
			<Card>
				<CardHeader>
					<CardTitle>Apply to Become a Creator</CardTitle>
					<CardDescription>
						Tell us about yourself and your content. We review all applications
						within a few business days.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ApplicationForm />
				</CardContent>
			</Card>
		</div>
	);
}
