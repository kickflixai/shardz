"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Upload } from "lucide-react";

interface ThumbnailUploadProps {
	entityId: string;
	currentUrl: string | null;
	onUpload: (url: string) => void;
}

/**
 * Thumbnail upload component using Supabase Storage.
 *
 * Uploads images to the "thumbnails" bucket with creator-scoped paths:
 * `{user_id}/{entityId}/{timestamp}.{ext}`
 *
 * RLS policies on the storage bucket ensure only the file owner can write.
 */
export function ThumbnailUpload({
	entityId,
	currentUrl,
	onUpload,
}: ThumbnailUploadProps) {
	const [uploading, setUploading] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl);

	async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file");
			return;
		}

		// Validate file size (5MB limit)
		if (file.size > 5 * 1024 * 1024) {
			toast.error("Image must be under 5MB");
			return;
		}

		setUploading(true);
		const supabase = createClient();

		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			toast.error("Authentication required");
			setUploading(false);
			return;
		}

		const ext = file.name.split(".").pop() || "jpg";
		const filePath = `${user.id}/${entityId}/${Date.now()}.${ext}`;

		const { data, error } = await supabase.storage
			.from("thumbnails")
			.upload(filePath, file, {
				cacheControl: "3600",
				upsert: true,
				contentType: file.type,
			});

		if (error) {
			toast.error("Upload failed. Please try again.");
			setUploading(false);
			return;
		}

		const {
			data: { publicUrl },
		} = supabase.storage.from("thumbnails").getPublicUrl(data.path);

		setPreviewUrl(publicUrl);
		onUpload(publicUrl);
		toast.success("Thumbnail uploaded");
		setUploading(false);
	}

	return (
		<div className="space-y-3">
			{previewUrl && (
				<div className="relative aspect-[3/4] w-36 overflow-hidden rounded-md border border-border">
					<Image
						src={previewUrl}
						alt="Thumbnail preview"
						fill
						className="object-cover"
						unoptimized
					/>
				</div>
			)}

			<label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
				<Upload className="size-4" />
				<span>{uploading ? "Uploading..." : "Upload thumbnail"}</span>
				<input
					type="file"
					accept="image/*"
					onChange={handleUpload}
					disabled={uploading}
					className="sr-only"
				/>
			</label>

			{uploading && (
				<div className="h-1 w-48 overflow-hidden rounded-full bg-muted">
					<div className="h-full animate-pulse rounded-full bg-primary" />
				</div>
			)}
		</div>
	);
}
