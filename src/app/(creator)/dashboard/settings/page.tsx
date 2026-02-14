import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileSettingsForm } from "./profile-settings-form";

export default async function SettingsPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login");
	}

	const { data: profile } = await supabase
		.from("profiles")
		.select(
			"display_name, username, bio, avatar_url, social_links, role",
		)
		.eq("id", user.id)
		.single();

	if (!profile) {
		redirect("/login");
	}

	if (profile.role !== "creator" && profile.role !== "admin") {
		redirect("/dashboard");
	}

	// Parse social links from JSONB
	const socialLinks = (profile.social_links as Record<string, string>) ?? {};

	return (
		<div className="py-4">
			<h1 className="text-3xl font-bold text-foreground">
				Profile Settings
			</h1>
			<p className="mt-2 text-muted-foreground">
				Manage your public profile information.
			</p>

			<div className="mt-8 max-w-2xl">
				{/* Avatar display */}
				{profile.avatar_url && (
					<div className="mb-6">
						<p className="mb-2 text-sm font-medium">Avatar</p>
						<div className="flex items-center gap-4">
							<img
								src={profile.avatar_url}
								alt="Current avatar"
								className="size-16 rounded-full object-cover"
							/>
							<p className="text-sm text-muted-foreground">
								Avatar is managed through your account settings.
							</p>
						</div>
					</div>
				)}

				<ProfileSettingsForm
					initialValues={{
						displayName: profile.display_name ?? "",
						username: profile.username ?? "",
						bio: profile.bio ?? "",
						twitter: socialLinks["twitter.com"] ?? "",
						instagram: socialLinks["instagram.com"] ?? "",
						youtube: socialLinks["youtube.com"] ?? "",
						tiktok: socialLinks["tiktok.com"] ?? "",
					}}
				/>
			</div>
		</div>
	);
}
