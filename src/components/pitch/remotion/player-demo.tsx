import {
	AbsoluteFill,
	Img,
	staticFile,
	Sequence,
	useCurrentFrame,
	interpolate,
	spring,
	useVideoConfig,
} from "remotion";

const BRAND_YELLOW = "#E0B800";
const CINEMA_BLACK = "#141414";
const SURFACE_DARK = "#1a1a2e";
const SURFACE_LIGHT = "#2a2a3e";

export const PlayerDemo: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Phone container fade in
	const containerOpacity = interpolate(frame, [0, 20], [0, 1], {
		extrapolateRight: "clamp",
	});
	const containerScale = spring({
		frame,
		fps,
		config: { damping: 14, stiffness: 120 },
	});

	// Play button bounce in
	const playScale = spring({
		frame: Math.max(0, frame - 25),
		fps,
		config: { damping: 10, stiffness: 150 },
	});
	const playOpacity = interpolate(frame, [25, 35], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	// Progress bar fill
	const progressWidth = interpolate(frame, [40, 140], [0, 100], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	// Title text slide in
	const titleY = interpolate(frame, [15, 35], [30, 0], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const titleOpacity = interpolate(frame, [15, 30], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	// Episode info slide in
	const infoOpacity = interpolate(frame, [35, 50], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	return (
		<AbsoluteFill
			style={{
				backgroundColor: CINEMA_BLACK,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
			}}
		>
			<div
				style={{
					opacity: containerOpacity,
					transform: `scale(${containerScale})`,
					width: 280,
					height: 560,
					borderRadius: 28,
					background: `linear-gradient(180deg, ${SURFACE_DARK} 0%, #0d0d1a 100%)`,
					border: `1px solid ${SURFACE_LIGHT}`,
					overflow: "hidden",
					position: "relative",
					display: "flex",
					flexDirection: "column",
				}}
			>
				{/* Video area */}
				<div
					style={{
						flex: 1,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						position: "relative",
						overflow: "hidden",
					}}
				>
					{/* Thumbnail background */}
					<Img
						src={staticFile("thumbnails/mock-orbital-breach.png")}
						style={{
							position: "absolute",
							inset: 0,
							width: "100%",
							height: "100%",
							objectFit: "cover",
						}}
					/>
					{/* Subtle gradient overlay */}
					<div
						style={{
							position: "absolute",
							inset: 0,
							background: `radial-gradient(circle at ${30 + frame * 0.3}% ${40 + Math.sin(frame * 0.05) * 15}%, rgba(224,184,0,0.12) 0%, rgba(0,0,0,0.3) 60%)`,
						}}
					/>

					{/* Play button */}
					<Sequence from={25}>
						<div
							style={{
								opacity: playOpacity,
								transform: `scale(${playScale})`,
								width: 64,
								height: 64,
								borderRadius: 32,
								backgroundColor: BRAND_YELLOW,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								boxShadow: `0 0 30px rgba(224,184,0,0.4)`,
							}}
						>
							<div
								style={{
									width: 0,
									height: 0,
									borderLeft: "22px solid #141414",
									borderTop: "14px solid transparent",
									borderBottom: "14px solid transparent",
									marginLeft: 4,
								}}
							/>
						</div>
					</Sequence>
				</div>

				{/* Bottom info area */}
				<div style={{ padding: "16px 20px 20px" }}>
					{/* Title */}
					<div
						style={{
							opacity: titleOpacity,
							transform: `translateY(${titleY}px)`,
							fontSize: 16,
							fontWeight: 700,
							color: "#ffffff",
							marginBottom: 4,
						}}
					>
						ORBITAL BREACH
					</div>

					{/* Episode info */}
					<div
						style={{
							opacity: infoOpacity,
							fontSize: 12,
							color: "#888",
							marginBottom: 16,
						}}
					>
						S1 E5 &middot; "Cascade"
					</div>

					{/* Progress bar */}
					<div
						style={{
							height: 3,
							borderRadius: 2,
							backgroundColor: SURFACE_LIGHT,
							overflow: "hidden",
						}}
					>
						<div
							style={{
								height: "100%",
								width: `${progressWidth}%`,
								backgroundColor: BRAND_YELLOW,
								borderRadius: 2,
								transition: "none",
							}}
						/>
					</div>

					{/* Time display */}
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							marginTop: 6,
							fontSize: 10,
							color: "#666",
						}}
					>
						<span>
							{Math.floor((progressWidth / 100) * 2)}:
							{String(Math.floor(((progressWidth / 100) * 120) % 60)).padStart(2, "0")}
						</span>
						<span>2:00</span>
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

export default PlayerDemo;
