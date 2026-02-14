/**
 * Purchase-related types for the payments module.
 * These match the database schema defined in
 * supabase/migrations/00000000000003_purchases_and_pricing.sql
 */

export type PurchaseStatus = "completed" | "refunded";

export type PayoutStatus = "completed" | "failed";

export interface Purchase {
	id: string;
	user_id: string;
	season_id: string;
	creator_id: string;
	stripe_session_id: string;
	stripe_payment_intent_id: string | null;
	stripe_charge_id: string | null;
	amount_cents: number;
	platform_fee_cents: number;
	creator_share_cents: number;
	status: PurchaseStatus;
	transferred: boolean;
	stripe_transfer_id: string | null;
	created_at: string;
}

export interface PriceTier {
	id: string;
	label: string;
	price_cents: number;
	stripe_price_id: string | null;
	sort_order: number;
	is_active: boolean;
	created_at: string;
}

export interface PayoutRecord {
	id: string;
	creator_id: string;
	purchase_id: string;
	stripe_transfer_id: string;
	amount_cents: number;
	status: PayoutStatus;
	created_at: string;
}
