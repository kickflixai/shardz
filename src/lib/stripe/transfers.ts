import { stripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";

interface BatchTransferResult {
	transferred: number;
	totalCents: number;
}

interface CreatorEarnings {
	totalEarnedCents: number;
	pendingTransferCents: number;
	transferredCents: number;
}

/**
 * Transfer all accumulated, untransferred revenue to a creator's Connect account.
 * Iterates over each untransferred purchase, creates a Stripe transfer with
 * source_transaction linking, and records a payout_record for each.
 *
 * Individual transfer failures are caught and logged without stopping the batch.
 */
export async function batchTransferToCreator(
	creatorId: string,
	stripeAccountId: string,
): Promise<BatchTransferResult> {
	const supabase = createAdminClient();

	// Query all completed, untransferred purchases with a charge ID
	const { data: purchases, error: queryError } = await supabase
		.from("purchases")
		.select("id, creator_share_cents, stripe_charge_id, season_id")
		.eq("creator_id", creatorId)
		.eq("transferred", false)
		.eq("status", "completed")
		.not("stripe_charge_id", "is", null);

	if (queryError) {
		console.error(
			"[transfers] Failed to query untransferred purchases:",
			queryError,
		);
		return { transferred: 0, totalCents: 0 };
	}

	if (!purchases || purchases.length === 0) {
		console.log("[transfers] No untransferred purchases for creator:", creatorId);
		return { transferred: 0, totalCents: 0 };
	}

	let transferred = 0;
	let totalCents = 0;

	for (const purchase of purchases) {
		try {
			const transfer = await stripe.transfers.create({
				amount: purchase.creator_share_cents,
				currency: "usd",
				destination: stripeAccountId,
				source_transaction: purchase.stripe_charge_id!,
				transfer_group: `season_${purchase.season_id}`,
			});

			// Mark purchase as transferred
			await supabase
				.from("purchases")
				.update({
					transferred: true,
					stripe_transfer_id: transfer.id,
				})
				.eq("id", purchase.id);

			// Insert payout record for audit trail
			await supabase.from("payout_records").insert({
				creator_id: creatorId,
				purchase_id: purchase.id,
				stripe_transfer_id: transfer.id,
				amount_cents: purchase.creator_share_cents,
				status: "completed",
			});

			transferred++;
			totalCents += purchase.creator_share_cents;
		} catch (error) {
			console.error(
				"[transfers] Failed to transfer for purchase:",
				purchase.id,
				error,
			);

			// Record failed payout for audit trail
			await supabase.from("payout_records").insert({
				creator_id: creatorId,
				purchase_id: purchase.id,
				stripe_transfer_id: `failed_${purchase.id}`,
				amount_cents: purchase.creator_share_cents,
				status: "failed",
			});
		}
	}

	console.log(
		"[transfers] Batch complete for creator:",
		creatorId,
		`${transferred}/${purchases.length} transfers,`,
		`$${(totalCents / 100).toFixed(2)} total`,
	);

	return { transferred, totalCents };
}

/**
 * Get earnings summary for a creator.
 * Returns total earned, pending transfer, and already transferred amounts.
 */
export async function getCreatorEarnings(
	creatorId: string,
): Promise<CreatorEarnings> {
	const supabase = createAdminClient();

	const { data: purchases, error } = await supabase
		.from("purchases")
		.select("creator_share_cents, transferred")
		.eq("creator_id", creatorId)
		.eq("status", "completed");

	if (error || !purchases) {
		console.error("[transfers] Failed to query creator earnings:", error);
		return {
			totalEarnedCents: 0,
			pendingTransferCents: 0,
			transferredCents: 0,
		};
	}

	let totalEarnedCents = 0;
	let pendingTransferCents = 0;
	let transferredCents = 0;

	for (const purchase of purchases) {
		totalEarnedCents += purchase.creator_share_cents;
		if (purchase.transferred) {
			transferredCents += purchase.creator_share_cents;
		} else {
			pendingTransferCents += purchase.creator_share_cents;
		}
	}

	return { totalEarnedCents, pendingTransferCents, transferredCents };
}
