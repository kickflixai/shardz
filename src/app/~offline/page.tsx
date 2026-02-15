export default function OfflinePage() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
			<h1 className="text-4xl font-bold text-primary">Shardz</h1>
			<h2 className="text-2xl font-semibold text-foreground">You&apos;re offline</h2>
			<p className="max-w-md text-muted-foreground">
				Please check your internet connection and try again.
			</p>
		</div>
	);
}
