import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mux } from "@/lib/mux/client";

/**
 * POST /api/upload/trailer
 *
 * Creates a Mux Direct Upload URL for a series trailer.
 * Trailers use **public** playback policy (no signed tokens) since
 * they are promotional content meant to be shared freely.
 *
 * The passthrough uses a `trailer_` prefix so the Mux webhook handler
 * can distinguish trailer uploads from episode uploads.
 *
 * Authentication: Supabase session cookie.
 * Authorization: Only the series creator can upload a trailer.
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

	const body = await request.json();
	const { seriesId } = body;

	if (!seriesId || typeof seriesId !== "string") {
		return NextResponse.json(
			{ error: "seriesId is required" },
			{ status: 400 },
		);
	}

	// Verify ownership: user must be the series creator
	const { data: series } = await supabase
		.from("series")
		.select("id, creator_id")
		.eq("id", seriesId)
		.single();

	if (!series || series.creator_id !== user.id) {
		return NextResponse.json(
			{ error: "Not authorized" },
			{ status: 403 },
		);
	}

	// Create Mux Direct Upload with public playback (trailers are promotional)
	const directUpload = await mux.video.uploads.create({
		cors_origin: process.env.NEXT_PUBLIC_APP_URL || "*",
		new_asset_settings: {
			playback_policies: ["public"],
			passthrough: `trailer_${seriesId}`,
			video_quality: "basic",
		},
	});

	return NextResponse.json({ url: directUpload.url });
}
