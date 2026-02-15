import type { SupabaseClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";

/**
 * Upload a local thumbnail image to Supabase Storage and return the public URL.
 *
 * Uses the admin client (bypasses RLS) with upsert:true for idempotent re-runs.
 * Follows the existing path convention: {creator_id}/{filename} to match
 * storage RLS policy structure (though admin client bypasses RLS).
 */
export async function uploadThumbnail(
	adminDb: SupabaseClient,
	localPath: string,
	storagePath: string,
): Promise<string> {
	const fileBuffer = await readFile(localPath);

	const { error } = await adminDb.storage
		.from("thumbnails")
		.upload(storagePath, fileBuffer, {
			contentType: "image/png",
			cacheControl: "3600",
			upsert: true,
		});

	if (error) {
		throw new Error(`Failed to upload thumbnail ${storagePath}: ${error.message}`);
	}

	return getPublicUrl(adminDb, "thumbnails", storagePath);
}

/**
 * Get the public URL for a file in Supabase Storage.
 */
export function getPublicUrl(
	adminDb: SupabaseClient,
	bucket: string,
	path: string,
): string {
	const { data } = adminDb.storage.from(bucket).getPublicUrl(path);
	return data.publicUrl;
}
