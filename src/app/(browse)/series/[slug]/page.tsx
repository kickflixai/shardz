import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getSeriesBySlug } from "@/modules/content/queries/get-series-by-slug";
import { getUserSeasonPurchases } from "@/modules/purchases/queries/get-user-purchases";
import { generateSeriesJsonLd } from "@/lib/seo/structured-data";
import { SeriesDetail } from "@/components/series/series-detail";

// ISR: revalidate every 60 seconds
export const revalidate = 60;

interface SeriesPageProps {
	params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
	// Use direct Supabase client (no cookies) since generateStaticParams
	// runs at build time outside a request scope
	const supabase = createSupabaseClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
	);

	const { data: seriesList } = await supabase
		.from("series")
		.select("slug")
		.eq("status", "published");

	return (seriesList ?? []).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
	params,
}: SeriesPageProps): Promise<Metadata> {
	const { slug } = await params;
	const series = await getSeriesBySlug(slug);

	if (!series) {
		return { title: "Series Not Found" };
	}

	const siteUrl =
		process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
	const seriesUrl = `${siteUrl}/series/${slug}`;
	const description =
		series.description || `Watch ${series.title} on MicroShort`;

	return {
		title: series.title,
		description,
		openGraph: {
			title: series.title,
			description,
			url: seriesUrl,
			siteName: "MicroShort",
			type: "video.tv_show",
			locale: "en_US",
			images: series.thumbnail_url
				? [
						{
							url: series.thumbnail_url,
							width: 1200,
							height: 630,
							alt: series.title,
						},
					]
				: [],
		},
		twitter: {
			card: "summary_large_image",
			title: series.title,
			description,
		},
		alternates: {
			canonical: seriesUrl,
		},
	};
}

export default async function SeriesPage({ params }: SeriesPageProps) {
	const { slug } = await params;
	const series = await getSeriesBySlug(slug);

	if (!series) {
		notFound();
	}

	// Check auth and get purchased seasons
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const seasonIds = series.seasons.map((s: { id: string }) => s.id);
	const purchasedSeasonIds = user
		? await getUserSeasonPurchases(user.id, seasonIds)
		: new Set<string>();

	const siteUrl =
		process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

	const jsonLd = generateSeriesJsonLd({
		series,
		creator: series.profiles,
		seasons: series.seasons,
		siteUrl,
	});

	return (
		<div className="mx-auto max-w-7xl px-4 py-8">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
				}}
			/>
			<SeriesDetail
				series={series}
				purchasedSeasonIds={purchasedSeasonIds}
			/>
		</div>
	);
}
