"use client";

import { useRef, useState, useTransition, useEffect } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { uploadAvatar } from "@/modules/social/actions/profile";

function getInitials(name: string | null): string {
	if (!name) return "?";
	return name
		.split(" ")
		.map((word) => word[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

interface AvatarUploadProps {
	currentAvatarUrl: string | null;
	displayName: string;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export function AvatarUpload({ currentAvatarUrl, displayName }: AvatarUploadProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	// Cleanup preview URL on unmount
	useEffect(() => {
		return () => {
			if (preview) {
				URL.revokeObjectURL(preview);
			}
		};
	}, [preview]);

	function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;

		// Client-side validation
		if (!ALLOWED_TYPES.includes(file.type)) {
			toast.error("File must be JPEG, PNG, or WebP");
			return;
		}

		if (file.size > MAX_SIZE) {
			toast.error("File must be smaller than 2MB");
			return;
		}

		// Revoke previous preview
		if (preview) {
			URL.revokeObjectURL(preview);
		}

		const objectUrl = URL.createObjectURL(file);
		setPreview(objectUrl);
	}

	function handleConfirmUpload() {
		const file = fileInputRef.current?.files?.[0];
		if (!file) return;

		startTransition(async () => {
			const formData = new FormData();
			formData.set("avatar", file);

			const result = await uploadAvatar(formData);

			if (result.success) {
				toast.success(result.message);
				// Clear preview after successful upload
				if (preview) {
					URL.revokeObjectURL(preview);
				}
				setPreview(null);
				// Reset file input
				if (fileInputRef.current) {
					fileInputRef.current.value = "";
				}
			} else {
				toast.error(result.message);
			}
		});
	}

	function handleCancel() {
		if (preview) {
			URL.revokeObjectURL(preview);
		}
		setPreview(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}

	const displaySrc = preview ?? currentAvatarUrl;

	return (
		<div className="flex flex-col items-center gap-4">
			{/* Avatar with hover overlay */}
			<button
				type="button"
				className="group relative cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow"
				onClick={() => fileInputRef.current?.click()}
				disabled={isPending}
			>
				<Avatar className="size-24 md:size-32 ring-2 ring-transparent transition-all group-hover:ring-brand-yellow/20">
					{displaySrc && <AvatarImage src={displaySrc} alt={displayName} />}
					<AvatarFallback className="text-lg md:text-xl">
						{getInitials(displayName)}
					</AvatarFallback>
				</Avatar>

				{/* Hover overlay */}
				<div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
					<Camera className="size-6 text-white" />
				</div>
			</button>

			{/* Hidden file input */}
			<input
				ref={fileInputRef}
				type="file"
				accept="image/jpeg,image/png,image/webp"
				className="hidden"
				onChange={handleFileSelect}
			/>

			{/* Preview confirm/cancel buttons */}
			{preview && (
				<div className="flex gap-2">
					<Button
						size="sm"
						onClick={handleConfirmUpload}
						disabled={isPending}
					>
						{isPending ? "Uploading..." : "Save Photo"}
					</Button>
					<Button
						size="sm"
						variant="outline"
						onClick={handleCancel}
						disabled={isPending}
					>
						Cancel
					</Button>
				</div>
			)}

			{/* Upload hint */}
			{!preview && (
				<p className="text-xs text-muted-foreground">
					Click to upload a photo (JPEG, PNG, or WebP, max 2MB)
				</p>
			)}
		</div>
	);
}
