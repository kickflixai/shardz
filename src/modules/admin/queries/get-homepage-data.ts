import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// ============================================================================
// Types
// ============================================================================

export interface CurationSeries {
	id: string;
	title: string;
	slug: string;
	genre: string;
	status: string;
	is_featured: boolean;
	featured_sort_order: number | null;
	thumbnail_url: string | null;
	view_count: number;
	profiles: { display_name: string | null };
}

export interface FeaturedSeriesItem {
	id: string;
	title: string;
	slug: string;
	genre: string;
	thumbnail_url: string | null;
	description: string | null;
	view_count: number;
	profiles: {
		display_name: string | null;
		username: string | null;
		avatar_url: string | null;
	};
}

export interface EditorialPickItem {
	id: string;
	section: string;
	sort_order: number;
	series: {
		id: string;
		title: string;
		slug: string;
		genre: string;
		thumbnail_url: string | null;
		description: string | null;
		view_count: number;
		profiles: {
			display_name: string | null;
			username: string | null;
			avatar_url: string | null;
		};
	};
}

export interface EditorialPickAdmin {
	id: string;
	section: string;
	sort_order: number;
	series_id: string;
	series: {
		id: string;
		title: string;
		slug: string;
		thumbnail_url: string | null;
		profiles: { display_name: string | null };
	};
}

// ============================================================================
// Queries
// ============================================================================

/**
 * Fetch all published series for the admin curation page.
 * Uses admin client for cross-user access.
 */
export const getAllSeriesForCuration = cache(async () => {
	const adminDb = createAdminClient();

	const { data, error } = await adminDb
		.from("series")
		.select(
			"id, title, slug, genre, status, is_featured, featured_sort_order, thumbnail_url, view_count, profiles!inner(display_name)",
		)
		.eq("status", "published")
		.order("is_featured", { ascending: false })
		.order("featured_sort_order", { ascending: true })
		.order("view_count", { ascending: false });

	if (error) {
		console.error("getAllSeriesForCuration error:", error);
		return [];
	}

	return (data ?? []) as unknown as CurationSeries[];
});

/**
 * Fetch featured series for the public homepage.
 * Uses regular Supabase client (respects RLS, public query).
 */
export async function getFeaturedSeries() {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("series")
		.select(
			"id, title, slug, genre, thumbnail_url, description, view_count, profiles!inner(display_name, username, avatar_url)",
		)
		.eq("status", "published")
		.eq("is_featured", true)
		.order("featured_sort_order", { ascending: true })
		.limit(6);

	if (error) {
		console.error("getFeaturedSeries error:", error.message, error.details, error.hint, error.code);
		return [];
	}

	return (data ?? []) as unknown as FeaturedSeriesItem[];
}

/**
 * Fetch editorial picks for the public homepage, optionally filtered by section.
 * Uses regular Supabase client (editorial_picks has public read policy).
 */
export async function getEditorialPicks(section?: string) {
	const supabase = await createClient();

	let query = supabase
		.from("editorial_picks")
		.select(
			"id, section, sort_order, series!inner(id, title, slug, genre, thumbnail_url, description, view_count, profiles!inner(display_name, username, avatar_url))",
		)
		.order("sort_order", { ascending: true });

	if (section) {
		query = query.eq("section", section);
	}

	const { data, error } = await query;

	if (error) {
		console.error("getEditorialPicks error:", error.message, error.details, error.hint, error.code);
		return [];
	}

	return (data ?? []) as unknown as EditorialPickItem[];
}

/**
 * Fetch editorial picks for the admin curation page.
 * Uses admin client for cross-user access.
 */
export const getEditorialPicksAdmin = cache(async () => {
	const adminDb = createAdminClient();

	const { data, error } = await adminDb
		.from("editorial_picks")
		.select(
			"id, section, sort_order, series_id, series!inner(id, title, slug, thumbnail_url, profiles!inner(display_name))",
		)
		.order("section", { ascending: true })
		.order("sort_order", { ascending: true });

	if (error) {
		console.error("getEditorialPicksAdmin error:", error);
		return [];
	}

	return (data ?? []) as unknown as EditorialPickAdmin[];
});
