import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { SeriesForm } from "@/components/creator/series-form";

/**
 * Create new series page.
 *
 * Server component: auth + role check, renders SeriesForm in create mode.
 */
export default async function SeriesNewPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login?next=/dashboard/series/new");
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

	return (
		<div className="mx-auto max-w-2xl py-8">
			<Card>
				<CardHeader>
					<CardTitle>Create New Series</CardTitle>
					<CardDescription>
						Set up a new series to start adding seasons and episodes.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<SeriesForm mode="create" />
				</CardContent>
			</Card>
		</div>
	);
}
