import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCommunityPosts } from "@/modules/creator/queries/get-community-posts";
import { CommunityFeed } from "@/components/creator/community-feed";

interface CommunityPageProps {
	params: Promise<{ seriesId: string }>;
}

/**
 * Community management page for a series.
 * Server component: auth check, verify creator owns series,
 * fetch initial posts, render CommunityFeed with isCreator=true.
 *
 * This same CommunityFeed component will later be used in the
 * public series page for viewers (isCreator=false).
 */
export default async function CommunityPage({ params }: CommunityPageProps) {
	const { seriesId } = await params;
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login");
	}

	// Verify the user is the series creator
	const { data: series } = await supabase
		.from("series")
		.select("id, title, creator_id")
		.eq("id", seriesId)
		.single();

	if (!series) {
		redirect("/dashboard");
	}

	const isCreator = series.creator_id === user.id;

	if (!isCreator) {
		redirect("/dashboard");
	}

	const initialPosts = await getCommunityPosts(seriesId);

	return (
		<div className="py-4">
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-foreground">
					Community
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Manage discussions and engage with your audience for{" "}
					<span className="font-medium text-foreground">
						{series.title}
					</span>
				</p>
			</div>

			<CommunityFeed
				seriesId={seriesId}
				initialPosts={initialPosts}
				currentUserId={user.id}
				isCreator={true}
			/>
		</div>
	);
}
