import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
	createSeasonCheckoutSession,
	createBundleCheckoutSession,
} from "@/lib/stripe/checkout";
import { calculateBundlePrice } from "@/lib/stripe/prices";

/**
 * POST /api/checkout
 *
 * Creates a Stripe Checkout session for season purchases.
 * Requires authenticated user. Supports single-season and bundle purchases.
 *
 * Body: { seasonId?: string, seriesSlug: string, purchaseType: 'single' | 'bundle' }
 * Returns: { url: string } -- Stripe Checkout URL for redirect
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
	const { seasonId, seriesSlug, purchaseType } = body as {
		seasonId?: string;
		seriesSlug: string;
		purchaseType: "single" | "bundle";
	};

	if (!seriesSlug || !purchaseType) {
		return NextResponse.json(
			{ error: "Missing required fields: seriesSlug and purchaseType" },
			{ status: 400 },
		);
	}

	if (purchaseType === "single") {
		if (!seasonId) {
			return NextResponse.json(
				{ error: "Missing seasonId for single purchase" },
				{ status: 400 },
			);
		}

		// Fetch season with price and series info
		const { data: season, error: seasonError } = await supabase
			.from("seasons")
			.select(
				"id, title, price_cents, series_id, series!inner(title, slug, creator_id)",
			)
			.eq("id", seasonId)
			.single();

		if (seasonError || !season) {
			return NextResponse.json(
				{ error: "Season not found" },
				{ status: 404 },
			);
		}

		if (!season.price_cents) {
			return NextResponse.json(
				{ error: "Season has no price set" },
				{ status: 400 },
			);
		}

		// Check for existing purchase
		const { data: existingPurchase } = await supabase
			.from("purchases")
			.select("id")
			.eq("user_id", user.id)
			.eq("season_id", seasonId)
			.eq("status", "completed")
			.limit(1)
			.single();

		if (existingPurchase) {
			return NextResponse.json(
				{ error: "Already purchased" },
				{ status: 409 },
			);
		}

		// The series field from the join comes as an object
		const series = season.series as unknown as {
			title: string;
			slug: string;
			creator_id: string;
		};

		const url = await createSeasonCheckoutSession({
			seasonId: season.id,
			seriesSlug: series.slug,
			userId: user.id,
			userEmail: user.email!,
			seasonTitle: season.title ?? `Season`,
			seriesTitle: series.title,
			priceCents: season.price_cents,
			creatorId: series.creator_id,
			seriesId: season.series_id,
		});

		return NextResponse.json({ url });
	}

	// Bundle purchase
	// Fetch series with its seasons and bundle discount
	const { data: series, error: seriesError } = await supabase
		.from("series")
		.select("id, title, slug, creator_id, bundle_discount_percent")
		.eq("slug", seriesSlug)
		.single();

	if (seriesError || !series) {
		return NextResponse.json(
			{ error: "Series not found" },
			{ status: 404 },
		);
	}

	// Fetch all seasons for this series with prices
	const { data: seasons } = await supabase
		.from("seasons")
		.select("id, price_cents")
		.eq("series_id", series.id)
		.not("price_cents", "is", null);

	if (!seasons || seasons.length === 0) {
		return NextResponse.json(
			{ error: "No priced seasons found for this series" },
			{ status: 404 },
		);
	}

	// Filter out already purchased seasons
	const { data: userPurchases } = await supabase
		.from("purchases")
		.select("season_id")
		.eq("user_id", user.id)
		.eq("status", "completed")
		.in(
			"season_id",
			seasons.map((s) => s.id),
		);

	const purchasedSeasonIds = new Set(
		(userPurchases ?? []).map((p) => p.season_id),
	);
	const unpurchasedSeasons = seasons.filter(
		(s) => !purchasedSeasonIds.has(s.id),
	);

	if (unpurchasedSeasons.length === 0) {
		return NextResponse.json(
			{ error: "Already purchased all seasons" },
			{ status: 409 },
		);
	}

	const seasonPrices = unpurchasedSeasons.map((s) => s.price_cents!);
	const discountPercent = series.bundle_discount_percent ?? 15;
	const totalPriceCents = calculateBundlePrice(seasonPrices, discountPercent);

	const url = await createBundleCheckoutSession({
		seasonIds: unpurchasedSeasons.map((s) => s.id),
		seasonPrices,
		seriesSlug: series.slug,
		userId: user.id,
		userEmail: user.email!,
		seriesTitle: series.title,
		totalPriceCents,
		creatorId: series.creator_id,
		seriesId: series.id,
	});

	return NextResponse.json({ url });
}
