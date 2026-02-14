import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { batchTransferToCreator } from "@/lib/stripe/transfers";

/**
 * Stripe webhook endpoint.
 * Receives payment lifecycle events, verifies signatures via the Stripe SDK,
 * and records purchases in Supabase.
 *
 * Authentication: Stripe webhook signature verification (not user auth).
 * This route must NOT be behind auth middleware.
 */
export async function POST(request: Request) {
	const body = await request.text();
	const sig = request.headers.get("stripe-signature");

	if (!sig) {
		console.error("[stripe-webhook] Missing stripe-signature header");
		return new Response("Missing signature", { status: 400 });
	}

	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(
			body,
			sig,
			process.env.STRIPE_WEBHOOK_SECRET!,
		);
	} catch (error) {
		console.error("[stripe-webhook] Signature verification failed:", error);
		return new Response("Invalid signature", { status: 400 });
	}

	const supabase = createAdminClient();

	switch (event.type) {
		case "checkout.session.completed": {
			const session = event.data.object as Stripe.Checkout.Session;

			if (session.payment_status !== "paid") {
				console.log(
					"[stripe-webhook] Session not paid, skipping:",
					session.id,
				);
				break;
			}

			const metadata = session.metadata;
			if (!metadata?.user_id || !metadata?.creator_id) {
				console.error(
					"[stripe-webhook] Missing metadata on session:",
					session.id,
				);
				break;
			}

			const purchaseType = metadata.purchase_type || "single";

			// Idempotency: check if purchase already recorded by session ID
			const { data: existing } = await supabase
				.from("purchases")
				.select("id")
				.eq("stripe_session_id", session.id)
				.limit(1);

			if (existing && existing.length > 0) {
				console.log(
					"[stripe-webhook] Purchase already recorded for session:",
					session.id,
				);
				break;
			}

			// Retrieve PaymentIntent with latest_charge expanded to get charge_id
			let chargeId: string | null = null;
			const paymentIntentId = session.payment_intent as string | null;
			if (paymentIntentId) {
				try {
					const paymentIntent = await stripe.paymentIntents.retrieve(
						paymentIntentId,
						{ expand: ["latest_charge"] },
					);
					const charge = paymentIntent.latest_charge as Stripe.Charge | null;
					chargeId = charge?.id ?? null;
				} catch (error) {
					console.error(
						"[stripe-webhook] Failed to retrieve PaymentIntent:",
						error,
					);
				}
			}

			if (purchaseType === "bundle") {
				// Bundle purchase: insert a row for each season
				const seasonIdsStr = metadata.season_ids;
				if (!seasonIdsStr) {
					console.error(
						"[stripe-webhook] Bundle purchase missing season_ids metadata",
					);
					break;
				}

				const seasonIds = seasonIdsStr.split(",");
				const totalAmount = session.amount_total ?? 0;

				// Fetch individual season prices to distribute proportionally
				const { data: seasons } = await supabase
					.from("seasons")
					.select("id, price_cents")
					.in("id", seasonIds);

				const seasonPriceMap = new Map<string, number>();
				let priceSum = 0;
				for (const s of seasons ?? []) {
					const price = s.price_cents ?? 0;
					seasonPriceMap.set(s.id, price);
					priceSum += price;
				}

				const purchases = seasonIds.map((seasonId) => {
					const seasonPrice = seasonPriceMap.get(seasonId) ?? 0;
					// Distribute total proportionally by each season's price
					const proportion = priceSum > 0 ? seasonPrice / priceSum : 1 / seasonIds.length;
					const amountCents = Math.round(totalAmount * proportion);
					const platformFeeCents = Math.round(amountCents * 0.2);
					const creatorShareCents = amountCents - platformFeeCents;

					return {
						user_id: metadata.user_id,
						season_id: seasonId,
						creator_id: metadata.creator_id,
						stripe_session_id: `${session.id}_${seasonId}`,
						stripe_payment_intent_id: paymentIntentId,
						stripe_charge_id: chargeId,
						amount_cents: amountCents,
						platform_fee_cents: platformFeeCents,
						creator_share_cents: creatorShareCents,
						status: "completed" as const,
					};
				});

				const { error } = await supabase.from("purchases").insert(purchases);
				if (error) {
					console.error(
						"[stripe-webhook] Failed to insert bundle purchases:",
						error,
					);
				} else {
					console.log(
						"[stripe-webhook] Bundle purchase recorded:",
						session.id,
						"seasons:",
						seasonIds.length,
					);
				}
			} else {
				// Single season purchase
				const seasonId = metadata.season_id;
				if (!seasonId) {
					console.error(
						"[stripe-webhook] Single purchase missing season_id metadata",
					);
					break;
				}

				const amountCents = session.amount_total ?? 0;
				const platformFeeCents = Math.round(amountCents * 0.2);
				const creatorShareCents = amountCents - platformFeeCents;

				const { error } = await supabase.from("purchases").insert({
					user_id: metadata.user_id,
					season_id: seasonId,
					creator_id: metadata.creator_id,
					stripe_session_id: session.id,
					stripe_payment_intent_id: paymentIntentId,
					stripe_charge_id: chargeId,
					amount_cents: amountCents,
					platform_fee_cents: platformFeeCents,
					creator_share_cents: creatorShareCents,
					status: "completed",
				});

				if (error) {
					console.error(
						"[stripe-webhook] Failed to insert purchase:",
						error,
					);
				} else {
					console.log(
						"[stripe-webhook] Purchase recorded:",
						session.id,
						"season:",
						seasonId,
					);
				}
			}
			break;
		}

		case "account.updated": {
			// Stripe Connect account status change -- backup path for onboarding completion.
			// The return URL (onboarding route) may fail if the user navigates away,
			// but this webhook will still fire reliably.
			const account = event.data.object as Stripe.Account;

			if (account.charges_enabled && account.payouts_enabled) {
				// Find the creator with this Connect account
				const { data: profile } = await supabase
					.from("profiles")
					.select("id, stripe_onboarding_complete")
					.eq("stripe_account_id", account.id)
					.single();

				if (profile && !profile.stripe_onboarding_complete) {
					// Mark onboarding as complete
					await supabase
						.from("profiles")
						.update({ stripe_onboarding_complete: true })
						.eq("id", profile.id);

					// Trigger batch transfer of accumulated revenue
					const result = await batchTransferToCreator(
						profile.id,
						account.id,
					);

					console.log(
						"[stripe-webhook] account.updated: onboarding complete for",
						profile.id,
						"- transferred:",
						result.transferred,
						"purchases,",
						`$${(result.totalCents / 100).toFixed(2)}`,
					);
				}
			}
			break;
		}

		default: {
			// Acknowledge unhandled event types gracefully
			console.log("[stripe-webhook] Unhandled event type:", event.type);
		}
	}

	return new Response("OK", { status: 200 });
}
