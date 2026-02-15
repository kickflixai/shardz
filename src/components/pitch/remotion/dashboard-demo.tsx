import {
	AbsoluteFill,
	useCurrentFrame,
	interpolate,
	spring,
	useVideoConfig,
} from "remotion";

const BRAND_YELLOW = "#E0B800";
const CINEMA_BLACK = "#141414";
const SURFACE_DARK = "#1a1a2e";
const SURFACE_LIGHT = "#2a2a3e";

const BAR_DATA = [
	{ label: "Mon", value: 65 },
	{ label: "Tue", value: 82 },
	{ label: "Wed", value: 45 },
	{ label: "Thu", value: 91 },
	{ label: "Fri", value: 78 },
	{ label: "Sat", value: 110 },
	{ label: "Sun", value: 95 },
];

function animateNumber(target: number, progress: number): string {
	const current = Math.floor(target * Math.min(progress, 1));
	if (target >= 1000) {
		return `$${(current / 100).toFixed(2)}`;
	}
	return current.toLocaleString();
}

export const DashboardDemo: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Header fade in
	const headerOpacity = interpolate(frame, [0, 20], [0, 1], {
		extrapolateRight: "clamp",
	});

	// Metric cards stagger in
	const metrics = [
		{
			label: "Revenue",
			value: "$2,847",
			rawValue: 284700,
			change: "+23%",
			color: "#4ade80",
		},
		{
			label: "Views",
			value: "12,483",
			rawValue: 12483,
			change: "+18%",
			color: BRAND_YELLOW,
		},
		{
			label: "Subscribers",
			value: "1,247",
			rawValue: 1247,
			change: "+12%",
			color: "#60a5fa",
		},
		{
			label: "Conversion",
			value: "8.4%",
			rawValue: 84,
			change: "+2.1%",
			color: "#c084fc",
		},
	];

	// Number counter animation progress
	const counterProgress = interpolate(frame, [30, 80], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	// Bar chart animation
	const barProgress = interpolate(frame, [60, 120], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	// Earnings card slide in
	const earningsX = interpolate(frame, [100, 130], [60, 0], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const earningsOpacity = interpolate(frame, [100, 120], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	return (
		<AbsoluteFill
			style={{
				backgroundColor: CINEMA_BLACK,
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
				padding: "30px 40px",
				display: "flex",
				flexDirection: "column",
			}}
		>
			{/* Header */}
			<div style={{ opacity: headerOpacity, marginBottom: 24 }}>
				<div
					style={{
						fontSize: 24,
						fontWeight: 800,
						color: "#ffffff",
						letterSpacing: "-0.02em",
					}}
				>
					Creator Dashboard
				</div>
				<div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>
					Last 30 days
				</div>
			</div>

			{/* Metric cards row */}
			<div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
				{metrics.map((metric, i) => {
					const cardDelay = 15 + i * 10;
					const cardScale = spring({
						frame: Math.max(0, frame - cardDelay),
						fps,
						config: { damping: 12, stiffness: 100 },
					});
					const cardOpacity = interpolate(
						frame,
						[cardDelay, cardDelay + 15],
						[0, 1],
						{
							extrapolateLeft: "clamp",
							extrapolateRight: "clamp",
						},
					);

					// Animated counter
					const displayValue =
						metric.label === "Revenue"
							? `$${Math.floor((2847 * counterProgress)).toLocaleString()}`
							: metric.label === "Views"
								? Math.floor(12483 * counterProgress).toLocaleString()
								: metric.label === "Subscribers"
									? Math.floor(1247 * counterProgress).toLocaleString()
									: `${(8.4 * counterProgress).toFixed(1)}%`;

					return (
						<div
							key={metric.label}
							style={{
								opacity: cardOpacity,
								transform: `scale(${cardScale})`,
								flex: 1,
								backgroundColor: SURFACE_DARK,
								borderRadius: 12,
								padding: "16px 18px",
								border: `1px solid ${SURFACE_LIGHT}`,
							}}
						>
							<div
								style={{
									fontSize: 11,
									color: "#888",
									marginBottom: 8,
									textTransform: "uppercase",
									letterSpacing: "0.05em",
								}}
							>
								{metric.label}
							</div>
							<div
								style={{
									fontSize: 22,
									fontWeight: 800,
									color: "#fff",
									marginBottom: 4,
								}}
							>
								{displayValue}
							</div>
							<div
								style={{
									fontSize: 12,
									fontWeight: 600,
									color: metric.color,
								}}
							>
								{metric.change}
							</div>
						</div>
					);
				})}
			</div>

			{/* Bottom row: Chart + Earnings */}
			<div style={{ display: "flex", gap: 16, flex: 1 }}>
				{/* Bar chart */}
				<div
					style={{
						flex: 2,
						backgroundColor: SURFACE_DARK,
						borderRadius: 12,
						padding: 20,
						border: `1px solid ${SURFACE_LIGHT}`,
						display: "flex",
						flexDirection: "column",
					}}
				>
					<div
						style={{
							fontSize: 14,
							fontWeight: 700,
							color: "#fff",
							marginBottom: 16,
						}}
					>
						Weekly Revenue
					</div>
					<div
						style={{
							flex: 1,
							display: "flex",
							alignItems: "flex-end",
							gap: 12,
							paddingBottom: 24,
						}}
					>
						{BAR_DATA.map((bar, i) => {
							const barHeight =
								(bar.value / 120) * 100 * barProgress;
							const barDelay = i * 0.08;
							const adjustedProgress = Math.max(
								0,
								Math.min(1, barProgress - barDelay),
							);
							const finalHeight =
								(bar.value / 120) * 100 * adjustedProgress;

							return (
								<div
									key={bar.label}
									style={{
										flex: 1,
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										gap: 8,
										height: "100%",
										justifyContent: "flex-end",
									}}
								>
									<div
										style={{
											width: "100%",
											height: `${finalHeight}%`,
											borderRadius: 6,
											background: `linear-gradient(180deg, ${BRAND_YELLOW} 0%, rgba(224,184,0,0.6) 100%)`,
											minHeight: 2,
										}}
									/>
									<div
										style={{
											fontSize: 10,
											color: "#888",
											position: "absolute",
											bottom: 0,
										}}
									>
										{bar.label}
									</div>
								</div>
							);
						})}
					</div>
					{/* Labels row */}
					<div style={{ display: "flex", gap: 12 }}>
						{BAR_DATA.map((bar) => (
							<div
								key={`label-${bar.label}`}
								style={{
									flex: 1,
									textAlign: "center",
									fontSize: 10,
									color: "#666",
								}}
							>
								{bar.label}
							</div>
						))}
					</div>
				</div>

				{/* Earnings breakdown card */}
				<div
					style={{
						flex: 1,
						opacity: earningsOpacity,
						transform: `translateX(${earningsX}px)`,
						backgroundColor: SURFACE_DARK,
						borderRadius: 12,
						padding: 20,
						border: `1px solid ${SURFACE_LIGHT}`,
						display: "flex",
						flexDirection: "column",
					}}
				>
					<div
						style={{
							fontSize: 14,
							fontWeight: 700,
							color: "#fff",
							marginBottom: 20,
						}}
					>
						Earnings Split
					</div>

					{/* Creator share */}
					<div style={{ marginBottom: 16 }}>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								marginBottom: 6,
							}}
						>
							<span style={{ fontSize: 12, color: "#888" }}>
								Your Earnings
							</span>
							<span
								style={{
									fontSize: 14,
									fontWeight: 700,
									color: "#4ade80",
								}}
							>
								$2,278
							</span>
						</div>
						<div
							style={{
								height: 8,
								borderRadius: 4,
								backgroundColor: SURFACE_LIGHT,
								overflow: "hidden",
							}}
						>
							<div
								style={{
									width: `${80 * barProgress}%`,
									height: "100%",
									backgroundColor: "#4ade80",
									borderRadius: 4,
								}}
							/>
						</div>
						<div
							style={{
								fontSize: 11,
								color: "#4ade80",
								marginTop: 4,
							}}
						>
							80% creator share
						</div>
					</div>

					{/* Platform fee */}
					<div style={{ marginBottom: 20 }}>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								marginBottom: 6,
							}}
						>
							<span style={{ fontSize: 12, color: "#888" }}>
								Platform Fee
							</span>
							<span
								style={{
									fontSize: 14,
									fontWeight: 700,
									color: "#888",
								}}
							>
								$569
							</span>
						</div>
						<div
							style={{
								height: 8,
								borderRadius: 4,
								backgroundColor: SURFACE_LIGHT,
								overflow: "hidden",
							}}
						>
							<div
								style={{
									width: `${20 * barProgress}%`,
									height: "100%",
									backgroundColor: "#666",
									borderRadius: 4,
								}}
							/>
						</div>
						<div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
							20% platform fee
						</div>
					</div>

					{/* Total */}
					<div
						style={{
							marginTop: "auto",
							paddingTop: 16,
							borderTop: `1px solid ${SURFACE_LIGHT}`,
						}}
					>
						<div
							style={{
								fontSize: 11,
								color: "#888",
								textTransform: "uppercase",
								letterSpacing: "0.05em",
								marginBottom: 4,
							}}
						>
							Total Revenue
						</div>
						<div
							style={{
								fontSize: 24,
								fontWeight: 800,
								color: BRAND_YELLOW,
							}}
						>
							$2,847
						</div>
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

export default DashboardDemo;
