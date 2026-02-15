export function EconomicsSection() {
	return (
		<section className="bg-cinema-black px-6 py-24 md:py-32">
			<div className="mx-auto max-w-5xl">
				{/* Section header */}
				<h2 className="text-center text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
					Transparent Economics
				</h2>
				<p className="mx-auto mt-4 max-w-xl text-center text-lg text-cinema-muted">
					No hidden fees. No algorithmic throttling. You earn what you
					deserve.
				</p>

				{/* Revenue split visualization */}
				<div className="mt-16 flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
					{/* Visual split */}
					<div className="flex flex-1 flex-col items-center gap-8">
						<div className="flex w-full max-w-md items-end gap-4">
							{/* Creator 80% */}
							<div className="flex flex-1 flex-col items-center">
								<span className="text-6xl font-extrabold tracking-tight text-brand-yellow md:text-8xl">
									80%
								</span>
								<span className="mt-2 text-lg font-semibold text-white">
									Goes to you
								</span>
							</div>

							{/* Divider */}
							<div className="mb-4 h-24 w-px bg-cinema-border" />

							{/* Platform 20% */}
							<div className="flex flex-col items-center">
								<span className="text-3xl font-bold text-cinema-muted md:text-4xl">
									20%
								</span>
								<span className="mt-2 text-sm text-cinema-muted">
									Platform fee
								</span>
							</div>
						</div>

						{/* Visual split bar */}
						<div className="h-4 w-full max-w-md overflow-hidden rounded-full bg-cinema-dark">
							<div
								className="h-full rounded-full bg-brand-yellow"
								style={{ width: "80%" }}
							/>
						</div>
					</div>

					{/* Math breakdown */}
					<div className="flex-1 space-y-6">
						<p className="text-lg text-cinema-muted">
							You set the price.{" "}
							<span className="font-semibold text-white">
								$0.99 to $7.99 per season.
							</span>
						</p>

						{/* Example calculation */}
						<div className="rounded-2xl border border-cinema-border bg-cinema-dark p-6">
							<div className="text-sm font-semibold uppercase tracking-wider text-cinema-muted">
								Example
							</div>
							<div className="mt-3 text-2xl font-bold text-white">
								1,000 fans &times; $4.99 ={" "}
								<span className="text-brand-yellow">
									$3,992 to you
								</span>
							</div>
						</div>

						{/* Comparison */}
						<div className="rounded-2xl border border-cinema-border bg-cinema-dark p-6">
							<div className="text-sm font-semibold uppercase tracking-wider text-cinema-muted">
								Compare
							</div>
							<div className="mt-3 space-y-2 text-sm text-cinema-muted">
								<p>
									On social media, 1,000 views earns you{" "}
									<span className="font-bold text-white">
										~$0.04
									</span>
								</p>
								<p>
									On MicroShort, 1,000 unlocks at $4.99 earns
									you{" "}
									<span className="font-bold text-brand-yellow">
										$3,992
									</span>
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
