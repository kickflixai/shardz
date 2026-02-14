import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { stripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";

interface CheckoutSuccessPageProps {
	searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({
	searchParams,
}: CheckoutSuccessPageProps) {
	const { session_id: sessionId } = await searchParams;

	if (!sessionId) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center px-4">
				<div className="w-full max-w-md rounded-2xl border border-white/10 bg-cinema-surface p-8 text-center">
					<h1 className="text-xl font-bold text-foreground">
						Invalid Session
					</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						No checkout session found. Please try again.
					</p>
					<Link
						href="/"
						className="mt-6 inline-block rounded-lg bg-brand-yellow px-6 py-3 text-sm font-bold text-black transition-opacity hover:opacity-90"
					>
						Back to Browsing
					</Link>
				</div>
			</div>
		);
	}

	try {
		const session = await stripe.checkout.sessions.retrieve(sessionId);

		if (session.payment_status !== "paid") {
			return (
				<div className="flex min-h-[60vh] items-center justify-center px-4">
					<div className="w-full max-w-md rounded-2xl border border-white/10 bg-cinema-surface p-8 text-center">
						<h1 className="text-xl font-bold text-foreground">
							Payment Not Completed
						</h1>
						<p className="mt-2 text-sm text-muted-foreground">
							Your payment was not completed. Please try again.
						</p>
						<Link
							href="/"
							className="mt-6 inline-block rounded-lg bg-brand-yellow px-6 py-3 text-sm font-bold text-black transition-opacity hover:opacity-90"
						>
							Back to Browsing
						</Link>
					</div>
				</div>
			);
		}

		// Backup fulfillment: handle race condition where webhook hasn't fired yet
		const metadata = session.metadata;
		if (metadata?.user_id && metadata?.creator_id) {
			const supabase = createAdminClient();
			const purchaseType = metadata.purchase_type || "single";

			if (purchaseType === "single" && metadata.season_id) {
				// Check if purchase already exists (idempotency)
				const { data: existing } = await supabase
					.from("purchases")
					.select("id")
					.eq("stripe_session_id", session.id)
					.limit(1);

				if (!existing || existing.length === 0) {
					const amountCents = session.amount_total ?? 0;
					const platformFeeCents = Math.round(amountCents * 0.2);
					const creatorShareCents = amountCents - platformFeeCents;

					await supabase.from("purchases").insert({
						user_id: metadata.user_id,
						season_id: metadata.season_id,
						creator_id: metadata.creator_id,
						stripe_session_id: session.id,
						stripe_payment_intent_id:
							session.payment_intent as string | null,
						amount_cents: amountCents,
						platform_fee_cents: platformFeeCents,
						creator_share_cents: creatorShareCents,
						status: "completed",
					});
				}
			} else if (purchaseType === "bundle" && metadata.season_ids) {
				// Check if any bundle purchases already exist
				const { data: existing } = await supabase
					.from("purchases")
					.select("id")
					.like("stripe_session_id", `${session.id}_%`)
					.limit(1);

				if (!existing || existing.length === 0) {
					const seasonIds = metadata.season_ids.split(",");
					const totalAmount = session.amount_total ?? 0;

					// Fetch individual season prices for proportional distribution
					const { data: seasons } = await supabase
						.from("seasons")
						.select("id, price_cents")
						.in("id", seasonIds);

					let priceSum = 0;
					const seasonPriceMap = new Map<string, number>();
					for (const s of seasons ?? []) {
						const price = s.price_cents ?? 0;
						seasonPriceMap.set(s.id, price);
						priceSum += price;
					}

					const purchases = seasonIds.map((seasonId) => {
						const seasonPrice =
							seasonPriceMap.get(seasonId) ?? 0;
						const proportion =
							priceSum > 0
								? seasonPrice / priceSum
								: 1 / seasonIds.length;
						const amountCents = Math.round(
							totalAmount * proportion,
						);
						const platformFeeCents = Math.round(
							amountCents * 0.2,
						);
						const creatorShareCents =
							amountCents - platformFeeCents;

						return {
							user_id: metadata.user_id,
							season_id: seasonId,
							creator_id: metadata.creator_id,
							stripe_session_id: `${session.id}_${seasonId}`,
							stripe_payment_intent_id:
								session.payment_intent as string | null,
							amount_cents: amountCents,
							platform_fee_cents: platformFeeCents,
							creator_share_cents: creatorShareCents,
							status: "completed" as const,
						};
					});

					await supabase.from("purchases").insert(purchases);
				}
			}
		}

		// Extract display info from metadata
		const seriesSlug = metadata?.series_id
			? undefined
			: undefined;
		const purchaseType = metadata?.purchase_type || "single";

		// Determine series slug from the cancel_url (contains /series/{slug})
		const cancelUrl = session.cancel_url ?? "";
		const slugMatch = cancelUrl.match(/\/series\/([^/?]+)/);
		const slug = slugMatch?.[1] ?? "";

		return (
			<div className="flex min-h-[60vh] items-center justify-center px-4">
				<div className="w-full max-w-md rounded-2xl border border-white/10 bg-cinema-surface p-8 text-center">
					{/* Success icon */}
					<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-yellow/10">
						<CircleCheck className="h-10 w-10 text-brand-yellow" />
					</div>

					{/* Title */}
					<h1 className="mt-6 text-2xl font-bold text-brand-yellow">
						{purchaseType === "bundle"
							? "All Seasons Unlocked!"
							: "Season Unlocked!"}
					</h1>

					{/* Description */}
					<p className="mt-3 text-sm text-muted-foreground">
						{purchaseType === "bundle"
							? "You now have access to all episodes across every season."
							: "You now have access to all episodes in this season."}
					</p>

					{/* CTA */}
					{slug && (
						<Link
							href={`/series/${slug}`}
							className="mt-8 inline-block rounded-lg bg-brand-yellow px-8 py-4 text-base font-bold text-black transition-opacity hover:opacity-90"
						>
							Start Watching
						</Link>
					)}

					{!slug && (
						<Link
							href="/"
							className="mt-8 inline-block rounded-lg bg-brand-yellow px-8 py-4 text-base font-bold text-black transition-opacity hover:opacity-90"
						>
							Browse Series
						</Link>
					)}
				</div>
			</div>
		);
	} catch {
		return (
			<div className="flex min-h-[60vh] items-center justify-center px-4">
				<div className="w-full max-w-md rounded-2xl border border-white/10 bg-cinema-surface p-8 text-center">
					<h1 className="text-xl font-bold text-foreground">
						Something Went Wrong
					</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						We could not verify your payment. If you were charged,
						your purchase will be activated shortly.
					</p>
					<Link
						href="/"
						className="mt-6 inline-block rounded-lg bg-brand-yellow px-6 py-3 text-sm font-bold text-black transition-opacity hover:opacity-90"
					>
						Back to Browsing
					</Link>
				</div>
			</div>
		);
	}
}
