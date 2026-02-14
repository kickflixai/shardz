import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
	getCreatorProfile,
	isFollowing,
} from "@/modules/creator/queries/get-creator-profile";
import { PublicProfile } from "@/components/profile/public-profile";

interface CreatorPageProps {
	params: Promise<{ username: string }>;
}

export async function generateMetadata({
	params,
}: CreatorPageProps): Promise<Metadata> {
	const { username } = await params;
	const profile = await getCreatorProfile(username);

	if (!profile) {
		return { title: "Creator Not Found" };
	}

	const displayName = profile.display_name || profile.username || "Creator";
	const description =
		profile.bio || `Watch ${displayName}'s series on MicroShort`;
	const siteUrl =
		process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
	const profileUrl = `${siteUrl}/creator/${username}`;

	return {
		title: `${displayName} on MicroShort`,
		description,
		openGraph: {
			title: `${displayName} on MicroShort`,
			description,
			url: profileUrl,
			siteName: "MicroShort",
			type: "profile",
			locale: "en_US",
			images: profile.avatar_url
				? [
						{
							url: profile.avatar_url,
							width: 400,
							height: 400,
							alt: displayName,
						},
					]
				: [],
		},
		twitter: {
			card: "summary",
			title: `${displayName} on MicroShort`,
			description,
		},
		alternates: {
			canonical: profileUrl,
		},
	};
}

export default async function CreatorPage({ params }: CreatorPageProps) {
	const { username } = await params;
	const profile = await getCreatorProfile(username);

	if (!profile) {
		notFound();
	}

	// Check if current user is following this creator
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const following = user ? await isFollowing(user.id, profile.id) : false;

	return (
		<div className="mx-auto max-w-5xl px-4 py-8">
			<PublicProfile
				profile={profile}
				isFollowing={following}
				isAuthenticated={!!user}
			/>
		</div>
	);
}
