import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { ProfileSettingsForm } from "./profile-settings-form";

export default async function ViewerSettingsPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login?next=/profile/settings");
	}

	const { data: profile } = await supabase
		.from("profiles")
		.select(
			"display_name, username, avatar_url, watch_history_public",
		)
		.eq("id", user.id)
		.single();

	if (!profile) {
		redirect("/login");
	}

	return (
		<div className="mx-auto max-w-2xl px-4 py-8">
			<div className="mb-6 flex items-center gap-4">
				<Link
					href="/profile"
					className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
				>
					<ArrowLeft className="size-4" />
					Back to Profile
				</Link>
			</div>

			<h1 className="text-2xl font-bold">Profile Settings</h1>
			<p className="mt-1 text-muted-foreground">
				Manage your public profile information.
			</p>

			<div className="mt-8 space-y-8">
				{/* Avatar Upload */}
				<section>
					<h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
						Profile Photo
					</h2>
					<AvatarUpload
						currentAvatarUrl={profile.avatar_url}
						displayName={profile.display_name || "User"}
					/>
				</section>

				{/* Profile Form */}
				<section>
					<h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
						Profile Details
					</h2>
					<ProfileSettingsForm
						initialValues={{
							displayName: profile.display_name ?? "",
							watchHistoryPublic:
								profile.watch_history_public ?? false,
						}}
					/>
				</section>
			</div>
		</div>
	);
}
