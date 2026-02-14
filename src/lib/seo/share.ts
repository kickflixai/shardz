interface ShareLinkOptions {
	slug: string;
	episodeNumber?: number;
	source?: string;
	medium?: string;
	campaign?: string;
}

export function generateShareUrl({
	slug,
	episodeNumber,
	source = "share",
	medium = "social",
	campaign,
}: ShareLinkOptions): string {
	const siteUrl =
		process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
	const path = episodeNumber
		? `/series/${slug}/episode/${episodeNumber}`
		: `/series/${slug}`;

	const url = new URL(path, siteUrl);
	url.searchParams.set("utm_source", source);
	url.searchParams.set("utm_medium", medium);
	if (campaign) {
		url.searchParams.set("utm_campaign", campaign);
	}

	return url.toString();
}
