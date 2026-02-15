import { redirect } from "next/navigation";

interface BrowsePageProps {
	searchParams: Promise<{ genre?: string }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
	const { genre } = await searchParams;
	if (genre) {
		redirect(`/?genre=${genre}`);
	}
	redirect("/");
}
