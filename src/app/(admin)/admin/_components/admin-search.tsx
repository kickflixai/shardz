"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";

export function AdminSearch({ currentSearch }: { currentSearch?: string }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const inputRef = useRef<HTMLInputElement>(null);

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const search = formData.get("search") as string;
		const params = new URLSearchParams(searchParams.toString());

		if (search) {
			params.set("search", search);
		} else {
			params.delete("search");
		}

		const queryString = params.toString();
		router.push(queryString ? `?${queryString}` : window.location.pathname);
	}

	return (
		<form onSubmit={handleSubmit} className="flex items-center gap-2">
			<input
				ref={inputRef}
				type="text"
				name="search"
				defaultValue={currentSearch ?? ""}
				placeholder="Search..."
				className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
			/>
			<button
				type="submit"
				className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
			>
				Search
			</button>
			{currentSearch && (
				<button
					type="button"
					onClick={() => {
						if (inputRef.current) inputRef.current.value = "";
						router.push(window.location.pathname);
					}}
					className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
				>
					Clear
				</button>
			)}
		</form>
	);
}
