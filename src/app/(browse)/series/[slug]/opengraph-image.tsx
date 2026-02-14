import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
	params,
}: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const supabase = await createClient();

	const { data: series } = await supabase
		.from("series")
		.select(
			"title, genre, profiles!inner(display_name)",
		)
		.eq("slug", slug)
		.eq("status", "published")
		.single();

	const title = series?.title || "MicroShort";
	const genre = series?.genre?.toUpperCase() || "";
	const profiles = series?.profiles as
		| { display_name: string | null }[]
		| { display_name: string | null }
		| null;
	const creatorName =
		(Array.isArray(profiles)
			? profiles[0]?.display_name
			: profiles?.display_name) || "MicroShort Creator";

	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					padding: "60px",
					background: "linear-gradient(135deg, #141414, #1a1a1a)",
					color: "#f2f2f2",
					fontFamily: "sans-serif",
				}}
			>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						justifyContent: "flex-end",
						flex: 1,
					}}
				>
					<div
						style={{
							fontSize: 64,
							fontWeight: 700,
							lineHeight: 1.1,
							maxWidth: "90%",
						}}
					>
						{title}
					</div>
					<div
						style={{
							fontSize: 28,
							color: "#facc15",
							marginTop: 20,
							display: "flex",
						}}
					>
						{genre}
						{genre && creatorName ? " | " : ""}
						{creatorName ? `by ${creatorName}` : ""}
					</div>
				</div>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-end",
					}}
				>
					<div style={{ fontSize: 22, color: "#a3a3a3" }}>
						microshort.tv
					</div>
					<div
						style={{
							fontSize: 18,
							color: "#525252",
							fontWeight: 600,
						}}
					>
						MICROSHORT
					</div>
				</div>
			</div>
		),
		{ ...size },
	);
}
