import { stripe } from "@/lib/stripe/client";

interface SeasonCheckoutParams {
	seasonId: string;
	seriesSlug: string;
	userId: string;
	userEmail: string;
	seasonTitle: string;
	seriesTitle: string;
	priceCents: number;
	creatorId: string;
	seriesId: string;
}

interface BundleCheckoutParams {
	seasonIds: string[];
	seasonPrices: number[];
	seriesSlug: string;
	userId: string;
	userEmail: string;
	seriesTitle: string;
	totalPriceCents: number;
	creatorId: string;
	seriesId: string;
}

/**
 * Create a Stripe Checkout session for a single season purchase.
 * Returns the checkout URL for client-side redirect.
 */
export async function createSeasonCheckoutSession(
	params: SeasonCheckoutParams,
): Promise<string | null> {
	const appUrl = process.env.NEXT_PUBLIC_APP_URL;

	const session = await stripe.checkout.sessions.create({
		mode: "payment",
		customer_email: params.userEmail,
		line_items: [
			{
				price_data: {
					currency: "usd",
					unit_amount: params.priceCents,
					product_data: {
						name: `${params.seriesTitle} - ${params.seasonTitle || "Full Season"}`,
						description: "Unlock all episodes",
					},
				},
				quantity: 1,
			},
		],
		metadata: {
			season_id: params.seasonId,
			series_id: params.seriesId,
			user_id: params.userId,
			creator_id: params.creatorId,
			purchase_type: "single",
		},
		success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${appUrl}/series/${params.seriesSlug}`,
	});

	return session.url;
}

/**
 * Create a Stripe Checkout session for a bundle purchase (all seasons of a series).
 * Returns the checkout URL for client-side redirect.
 */
export async function createBundleCheckoutSession(
	params: BundleCheckoutParams,
): Promise<string | null> {
	const appUrl = process.env.NEXT_PUBLIC_APP_URL;

	const session = await stripe.checkout.sessions.create({
		mode: "payment",
		customer_email: params.userEmail,
		line_items: [
			{
				price_data: {
					currency: "usd",
					unit_amount: params.totalPriceCents,
					product_data: {
						name: `Unlock all seasons of ${params.seriesTitle}`,
						description: `${params.seasonIds.length} seasons included`,
					},
				},
				quantity: 1,
			},
		],
		metadata: {
			season_ids: params.seasonIds.join(","),
			series_id: params.seriesId,
			user_id: params.userId,
			creator_id: params.creatorId,
			purchase_type: "bundle",
		},
		success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${appUrl}/series/${params.seriesSlug}`,
	});

	return session.url;
}
