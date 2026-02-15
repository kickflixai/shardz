import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";

// ============================================================================
// Types
// ============================================================================

export interface AdminCreator {
	id: string;
	username: string | null;
	display_name: string | null;
	avatar_url: string | null;
	bio: string | null;
	role: string;
	follower_count: number;
	created_at: string;
	series: { count: number }[];
}

export interface AdminSeries {
	id: string;
	title: string;
	slug: string;
	genre: string;
	status: string;
	is_featured: boolean;
	view_count: number;
	thumbnail_url: string | null;
	created_at: string;
	profiles: { display_name: string | null; username: string | null };
	seasons: { count: number }[];
}

export interface AdminUser {
	id: string;
	username: string | null;
	display_name: string | null;
	avatar_url: string | null;
	role: string;
	created_at: string;
}

export interface AdminPurchase {
	id: string;
	amount_cents: number;
	creator_share_cents: number;
	platform_fee_cents: number;
	status: string;
	created_at: string;
	season_id: string;
	user_id: string;
	creator_id: string;
	profiles: { username: string | null } | null;
	seasons: { series: { title: string } };
}

// ============================================================================
// Queries
// ============================================================================

/**
 * Fetch all creators (profiles with role='creator') with search and series count.
 */
export const getAdminCreators = cache(async (search?: string) => {
	const adminDb = createAdminClient();

	let query = adminDb
		.from("profiles")
		.select(
			"id, username, display_name, avatar_url, bio, role, follower_count, created_at, series(count)",
		)
		.eq("role", "creator")
		.order("created_at", { ascending: false })
		.limit(50);

	if (search) {
		query = query.or(`display_name.ilike.%${search}%,username.ilike.%${search}%`);
	}

	const { data, error } = await query;

	if (error) {
		console.error("getAdminCreators error:", error);
		return [];
	}

	return (data ?? []) as AdminCreator[];
});

/**
 * Fetch all series with creator info and season count, with optional search.
 */
export const getAdminSeries = cache(async (search?: string) => {
	const adminDb = createAdminClient();

	let query = adminDb
		.from("series")
		.select(
			"id, title, slug, genre, status, is_featured, view_count, thumbnail_url, created_at, profiles!inner(display_name, username), seasons(count)",
		)
		.order("created_at", { ascending: false })
		.limit(50);

	if (search) {
		query = query.ilike("title", `%${search}%`);
	}

	const { data, error } = await query;

	if (error) {
		console.error("getAdminSeries error:", error);
		return [];
	}

	return (data ?? []) as unknown as AdminSeries[];
});

/**
 * Fetch all users (all roles) with optional search.
 */
export const getAdminUsers = cache(async (search?: string) => {
	const adminDb = createAdminClient();

	let query = adminDb
		.from("profiles")
		.select("id, username, display_name, avatar_url, role, created_at")
		.order("created_at", { ascending: false })
		.limit(50);

	if (search) {
		query = query.or(`display_name.ilike.%${search}%,username.ilike.%${search}%`);
	}

	const { data, error } = await query;

	if (error) {
		console.error("getAdminUsers error:", error);
		return [];
	}

	return (data ?? []) as AdminUser[];
});

/**
 * Fetch completed purchases with user and series info for the revenue page.
 */
export const getAdminRevenue = cache(async () => {
	const adminDb = createAdminClient();

	const { data, error } = await adminDb
		.from("purchases")
		.select(
			"id, amount_cents, creator_share_cents, platform_fee_cents, status, created_at, season_id, user_id, creator_id, profiles!user_id(username), seasons!inner(series!inner(title))",
		)
		.eq("status", "completed")
		.order("created_at", { ascending: false })
		.limit(100);

	if (error) {
		console.error("getAdminRevenue error:", error);
		return [];
	}

	return (data ?? []) as unknown as AdminPurchase[];
});
