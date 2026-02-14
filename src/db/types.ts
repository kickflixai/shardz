// MicroShort Database Type Definitions
// Hand-written types matching the Supabase content hierarchy schema.
// These will be used throughout the application until auto-generation
// from Supabase is configured in a later phase.

// ============================================================================
// Database Enums
// ============================================================================

export type Genre =
	| "drama"
	| "comedy"
	| "thriller"
	| "sci-fi"
	| "horror"
	| "romance"
	| "action"
	| "documentary"
	| "behind-the-scenes"
	| "music"
	| "sports";

export type ContentStatus = "draft" | "processing" | "ready" | "published" | "archived";

export type UserRole = "viewer" | "creator" | "admin";

// ============================================================================
// Database Row Types
// ============================================================================

export interface Series {
	id: string;
	slug: string;
	title: string;
	description: string | null;
	genre: Genre;
	thumbnail_url: string | null;
	trailer_url: string | null;
	creator_id: string;
	status: ContentStatus;
	is_featured: boolean;
	view_count: number;
	created_at: string;
	updated_at: string;
}

export interface Season {
	id: string;
	series_id: string;
	season_number: number;
	title: string | null;
	description: string | null;
	price_cents: number | null;
	status: ContentStatus;
	created_at: string;
	updated_at: string;
}

export interface Episode {
	id: string;
	season_id: string;
	episode_number: number;
	title: string;
	description: string | null;
	duration_seconds: number | null;
	mux_asset_id: string | null;
	mux_playback_id: string | null;
	thumbnail_url: string | null;
	subtitle_url: string | null;
	status: ContentStatus;
	created_at: string;
	updated_at: string;
}

export interface Profile {
	id: string;
	username: string | null;
	display_name: string | null;
	avatar_url: string | null;
	role: UserRole;
	bio: string | null;
	created_at: string;
	updated_at: string;
}

// ============================================================================
// Insert Types (omit auto-generated fields)
// ============================================================================

export type SeriesInsert = Omit<Series, "id" | "created_at" | "updated_at" | "view_count"> & {
	id?: string;
	view_count?: number;
};

export type SeasonInsert = Omit<Season, "id" | "created_at" | "updated_at"> & {
	id?: string;
};

export type EpisodeInsert = Omit<Episode, "id" | "created_at" | "updated_at"> & {
	id?: string;
};

export type ProfileInsert = Omit<Profile, "created_at" | "updated_at"> & {
	role?: UserRole;
};

// ============================================================================
// Update Types (all fields optional except id)
// ============================================================================

export type SeriesUpdate = Partial<Omit<Series, "id" | "created_at" | "updated_at">>;
export type SeasonUpdate = Partial<Omit<Season, "id" | "created_at" | "updated_at">>;
export type EpisodeUpdate = Partial<Omit<Episode, "id" | "created_at" | "updated_at">>;
export type ProfileUpdate = Partial<Omit<Profile, "id" | "created_at" | "updated_at">>;
