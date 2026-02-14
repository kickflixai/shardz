import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface CheckoutCancelPageProps {
	searchParams: Promise<{ series?: string }>;
}

export default async function CheckoutCancelPage({
	searchParams,
}: CheckoutCancelPageProps) {
	const { series: seriesSlug } = await searchParams;

	return (
		<div className="flex min-h-[60vh] items-center justify-center px-4">
			<div className="w-full max-w-md rounded-2xl border border-white/10 bg-cinema-surface p-8 text-center">
				<h1 className="text-xl font-bold text-foreground">
					Checkout Cancelled
				</h1>
				<p className="mt-3 text-sm text-muted-foreground">
					Your checkout was cancelled and you have not been charged.
					You can try again anytime.
				</p>

				<div className="mt-8 flex flex-col items-center gap-3">
					{seriesSlug && (
						<Link
							href={`/series/${seriesSlug}`}
							className="inline-block rounded-lg bg-brand-yellow px-6 py-3 text-sm font-bold text-black transition-opacity hover:opacity-90"
						>
							Try Again
						</Link>
					)}
					<Link
						href="/"
						className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to Browsing
					</Link>
				</div>
			</div>
		</div>
	);
}
