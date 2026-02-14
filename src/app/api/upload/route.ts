import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createDirectUpload } from "@/lib/mux/uploads";

/**
 * POST /api/upload
 *
 * Creates a Mux Direct Upload URL for an episode. The browser (via MuxUploader)
 * uploads video directly to Mux's CDN -- no video data passes through this server.
 *
 * Authentication: Supabase session cookie.
 * Authorization: Only the series creator can upload for their episodes.
 */
export async function POST(request: Request) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json(
			{ error: "Authentication required" },
			{ status: 401 },
		);
	}

	const { episodeId } = await request.json();

	if (!episodeId || typeof episodeId !== "string") {
		return NextResponse.json(
			{ error: "episodeId is required" },
			{ status: 400 },
		);
	}

	// Verify the user owns this episode via series -> creator_id
	const { data: episode } = await supabase
		.from("episodes")
		.select(
			"id, season_id, seasons!inner(series_id, series!inner(creator_id))",
		)
		.eq("id", episodeId)
		.single();

	if (
		!episode ||
		(episode.seasons as unknown as { series: { creator_id: string } }).series
			.creator_id !== user.id
	) {
		return NextResponse.json(
			{ error: "Not authorized" },
			{ status: 403 },
		);
	}

	// Mark episode as processing before generating the upload URL
	await supabase
		.from("episodes")
		.update({ status: "processing" })
		.eq("id", episodeId);

	const uploadUrl = await createDirectUpload({ episodeId });

	return NextResponse.json({ url: uploadUrl });
}
