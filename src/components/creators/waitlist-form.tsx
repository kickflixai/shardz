"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { joinWaitlist, type WaitlistState } from "./waitlist-actions";

const initialState: WaitlistState = {
	success: false,
	error: null,
	duplicate: false,
};

export function WaitlistForm() {
	const [state, formAction, isPending] = useActionState(
		joinWaitlist,
		initialState,
	);

	return (
		<section
			id="waitlist"
			className="bg-cinema-black px-6 py-24 md:py-32"
		>
			<div className="mx-auto max-w-lg text-center">
				<h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
					Join the Waitlist
				</h2>
				<p className="mt-4 text-lg text-cinema-muted">
					Be the first to know when we open the doors to new creators.
				</p>

				{state.success ? (
					<div className="mt-10 flex flex-col items-center gap-3">
						<CheckCircle2 className="h-12 w-12 text-green-500" />
						<p className="text-lg font-semibold text-white">
							You&apos;re on the list!
						</p>
						<p className="text-cinema-muted">
							We&apos;ll be in touch.
						</p>
					</div>
				) : (
					<>
						{state.duplicate && (
							<div className="mt-6 rounded-xl border border-brand-yellow/30 bg-brand-yellow/10 p-4 text-sm text-brand-yellow">
								You&apos;re already on the list! We&apos;ll
								reach out soon.
							</div>
						)}

						<form action={formAction} className="mt-8">
							<div className="flex flex-col gap-3 sm:flex-row">
								<input
									type="email"
									name="email"
									placeholder="you@email.com"
									required
									className="flex-1 rounded-xl border border-cinema-border bg-cinema-dark px-4 py-3 text-white placeholder:text-cinema-muted focus:border-brand-yellow focus:outline-none focus:ring-1 focus:ring-brand-yellow"
								/>
								<button
									type="submit"
									disabled={isPending}
									className="rounded-xl bg-brand-yellow px-6 py-3 font-bold text-cinema-black transition-colors hover:bg-brand-yellow-light disabled:opacity-50"
								>
									{isPending ? "Joining..." : "Join Waitlist"}
								</button>
							</div>
							{state.error && (
								<p className="mt-3 text-sm text-red-400">
									{state.error}
								</p>
							)}
						</form>
					</>
				)}

				<p className="mt-8 text-sm text-cinema-muted">
					Ready now?{" "}
					<a
						href="/dashboard/apply"
						className="font-semibold text-brand-yellow underline underline-offset-4 hover:text-brand-yellow-light"
					>
						Apply to create on Shardz
					</a>
				</p>
			</div>
		</section>
	);
}
