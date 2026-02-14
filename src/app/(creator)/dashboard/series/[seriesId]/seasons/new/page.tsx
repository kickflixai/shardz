import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { SeasonForm } from "@/components/creator/season-form";

interface SeasonNewPageProps {
	params: Promise<{ seriesId: string }>;
}

/**
 * Create new season page.
 *
 * Server component: auth + ownership check, fetches price tiers,
 * renders SeasonForm in create mode.
 */
export default async function SeasonNewPage({ params }: SeasonNewPageProps) {
	const { seriesId } = await params;

	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect(
			`/login?next=/dashboard/series/${seriesId}/seasons/new`,
		);
	}

	// Verify creator role
	const { data: profile } = await supabase
		.from("profiles")
		.select("role")
		.eq("id", user.id)
		.single();

	if (profile?.role !== "creator" && profile?.role !== "admin") {
		redirect("/dashboard/apply");
	}

	// Verify series ownership
	const { data: series } = await supabase
		.from("series")
		.select("id, title, creator_id")
		.eq("id", seriesId)
		.single();

	if (!series || series.creator_id !== user.id) {
		redirect("/dashboard/series");
	}

	// Fetch price tiers for the form
	const { data: priceTiers } = await supabase
		.from("price_tiers")
		.select("id, label, price_cents, sort_order")
		.eq("is_active", true)
		.order("sort_order", { ascending: true });

	return (
		<div className="mx-auto max-w-2xl py-8">
			<Card>
				<CardHeader>
					<CardTitle>Add Season</CardTitle>
					<CardDescription>
						Add a new season to &ldquo;{series.title}&rdquo;
					</CardDescription>
				</CardHeader>
				<CardContent>
					<SeasonForm
						mode="create"
						seriesId={seriesId}
						priceTiers={
							priceTiers?.map((t) => ({
								id: t.id,
								label: t.label,
								priceCents: t.price_cents,
							})) ?? []
						}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
