"use client";

interface GlobalErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
	return (
		<html lang="en">
			<body
				style={{
					margin: 0,
					padding: 0,
					minHeight: "100vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: "#141414",
					color: "#f2f2f2",
					fontFamily: "system-ui, -apple-system, sans-serif",
				}}
			>
				<div style={{ textAlign: "center", padding: "2rem" }}>
					<h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
						Something went wrong
					</h2>
					<p style={{ color: "#a6a6a6", marginBottom: "1.5rem" }}>
						{error.message || "A critical error occurred."}
					</p>
					<button
						type="button"
						onClick={reset}
						style={{
							backgroundColor: "#E0B800",
							color: "#141414",
							border: "none",
							borderRadius: "0.375rem",
							padding: "0.5rem 1.5rem",
							fontSize: "0.875rem",
							fontWeight: 500,
							cursor: "pointer",
						}}
					>
						Try again
					</button>
				</div>
			</body>
		</html>
	);
}
