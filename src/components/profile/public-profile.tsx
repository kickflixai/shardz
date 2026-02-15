"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FollowButton } from "@/components/profile/follow-button";
import { getGenreLabel } from "@/config/genres";
import type { Genre } from "@/db/types";
import type { CreatorProfileData } from "@/modules/creator/queries/get-creator-profile";

interface PublicProfileProps {
	profile: CreatorProfileData;
	isFollowing: boolean;
	isAuthenticated: boolean;
}

const PLATFORM_ICONS: Record<
	string,
	{ label: string; icon: (props: { className?: string }) => React.ReactNode }
> = {
	"twitter.com": {
		label: "X (Twitter)",
		icon: ({ className }) => (
			<svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
				<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
			</svg>
		),
	},
	"x.com": {
		label: "X (Twitter)",
		icon: ({ className }) => (
			<svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
				<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
			</svg>
		),
	},
	"instagram.com": {
		label: "Instagram",
		icon: ({ className }) => (
			<svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
				<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
			</svg>
		),
	},
	"youtube.com": {
		label: "YouTube",
		icon: ({ className }) => (
			<svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
				<path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
			</svg>
		),
	},
	"tiktok.com": {
		label: "TikTok",
		icon: ({ className }) => (
			<svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
				<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
			</svg>
		),
	},
};

function getSocialPlatform(url: string, key: string) {
	// Try to match by key first (e.g., "twitter.com", "instagram.com")
	const keyNormalized = key.toLowerCase().replace("www.", "");
	if (PLATFORM_ICONS[keyNormalized]) {
		return { ...PLATFORM_ICONS[keyNormalized], url };
	}

	// Try to match by URL hostname
	try {
		const hostname = new URL(url).hostname.replace("www.", "");
		if (PLATFORM_ICONS[hostname]) {
			return { ...PLATFORM_ICONS[hostname], url };
		}
	} catch {
		// Invalid URL
	}

	return null;
}

function formatFollowerCount(count: number): string {
	if (count >= 1_000_000) {
		return `${(count / 1_000_000).toFixed(1)}M`;
	}
	if (count >= 1_000) {
		return `${(count / 1_000).toFixed(1)}K`;
	}
	return count.toString();
}

export function PublicProfile({
	profile,
	isFollowing,
	isAuthenticated,
}: PublicProfileProps) {
	const displayName = profile.display_name || profile.username || "Creator";
	const initials = displayName
		.split(" ")
		.map((w) => w[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	// Parse social links
	const socialLinks = Object.entries(profile.social_links ?? {})
		.map(([key, url]) => getSocialPlatform(url, key))
		.filter(
			(s): s is NonNullable<typeof s> => s !== null,
		);

	// Count total episodes across all series
	const totalEpisodes = profile.series.reduce(
		(total, s) =>
			total + s.seasons.reduce((sum, season) => sum + season.episodes.length, 0),
		0,
	);

	return (
		<div className="space-y-8">
			{/* Profile header */}
			<div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
				<Avatar className="size-24 text-2xl">
					{profile.avatar_url && (
						<AvatarImage src={profile.avatar_url} alt={displayName} />
					)}
					<AvatarFallback className="text-2xl">{initials}</AvatarFallback>
				</Avatar>

				<div className="flex flex-1 flex-col items-center gap-3 sm:items-start">
					<div className="flex flex-col items-center gap-2 sm:flex-row">
						<h1 className="text-2xl font-bold">{displayName}</h1>
						{profile.username && (
							<span className="text-muted-foreground">@{profile.username}</span>
						)}
					</div>

					{profile.bio && (
						<p className="max-w-xl text-center text-muted-foreground sm:text-left">
							{profile.bio}
						</p>
					)}

					<div className="flex items-center gap-4 text-sm text-muted-foreground">
						<span className="flex items-center gap-1.5">
							<Users className="size-4" />
							{formatFollowerCount(profile.follower_count)}{" "}
							{profile.follower_count === 1 ? "follower" : "followers"}
						</span>
						<span>
							{profile.series.length}{" "}
							{profile.series.length === 1 ? "series" : "series"}
						</span>
						<span>
							{totalEpisodes}{" "}
							{totalEpisodes === 1 ? "episode" : "episodes"}
						</span>
					</div>

					<div className="flex items-center gap-3">
						<FollowButton
							creatorId={profile.id}
							initialIsFollowing={isFollowing}
							isAuthenticated={isAuthenticated}
							username={profile.username || ""}
						/>

						{/* Social links */}
						{socialLinks.length > 0 && (
							<div className="flex items-center gap-2">
								{socialLinks.map((social) => (
									<a
										key={social.url}
										href={social.url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-muted-foreground transition-colors hover:text-foreground"
										title={social.label}
									>
										<social.icon className="size-5" />
									</a>
								))}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Series grid */}
			<div>
				<h2 className="mb-4 text-xl font-semibold">Published Series</h2>
				{profile.series.length === 0 ? (
					<div className="py-12 text-center">
						<p className="text-lg text-muted-foreground">
							No published series yet
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{profile.series.map((series) => {
							const episodeCount = series.seasons.reduce(
								(sum, season) => sum + season.episodes.length,
								0,
							);
							return (
								<Link
									key={series.id}
									href={`/series/${series.slug}`}
									className="group block overflow-hidden rounded-xl border border-border bg-card transition-transform hover:scale-[1.02]"
								>
									<div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
										{series.thumbnail_url ? (
											<img
												src={series.thumbnail_url}
												alt={series.title}
												className="h-full w-full object-cover transition-transform group-hover:scale-105"
											/>
										) : (
											<div className="flex h-full w-full items-center justify-center text-muted-foreground">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="48"
													height="48"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="1.5"
													strokeLinecap="round"
													strokeLinejoin="round"
													className="opacity-40"
													aria-hidden="true"
												>
													<title>Video placeholder</title>
													<polygon points="6 3 20 12 6 21 6 3" />
												</svg>
											</div>
										)}
									</div>
									<div className="p-4">
										<h3 className="line-clamp-1 text-base font-semibold text-foreground">
											{series.title}
										</h3>
										<Badge variant="secondary" className="mt-2">
											{getGenreLabel(series.genre as Genre)}
										</Badge>
										<div className="mt-3 text-sm text-muted-foreground">
											{episodeCount}{" "}
											{episodeCount === 1 ? "episode" : "episodes"}
										</div>
									</div>
								</Link>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
