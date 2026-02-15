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

export const PaywallDemo: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Phase 1 (0-70): Locked state with blur
	const lockedOpacity = interpolate(frame, [0, 15], [0, 1], {
		extrapolateRight: "clamp",
	});

	// Phase 2 (50-90): Unlock button appears with pulse
	const buttonScale = spring({
		frame: Math.max(0, frame - 50),
		fps,
		config: { damping: 10, stiffness: 120 },
	});
	const buttonOpacity = interpolate(frame, [50, 60], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	// Pulse effect on button
	const pulseScale =
		frame > 60 && frame < 100
			? 1 + Math.sin((frame - 60) * 0.15) * 0.04
			: 1;

	// Phase 3 (100-130): Transition - blur lifts, "Unlocked!" appears
	const blurAmount = interpolate(frame, [100, 120], [8, 0], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const isLocked = frame < 100;

	// Unlocked badge
	const unlockedScale = spring({
		frame: Math.max(0, frame - 105),
		fps,
		config: { damping: 8, stiffness: 150 },
	});
	const unlockedOpacity = interpolate(frame, [105, 115], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	// Phase 4 (120-170): Price tag and creator share
	const priceY = interpolate(frame, [125, 145], [20, 0], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const priceOpacity = interpolate(frame, [125, 140], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const shareOpacity = interpolate(frame, [140, 155], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	return (
		<AbsoluteFill
			style={{
				backgroundColor: CINEMA_BLACK,
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<div
				style={{
					width: 600,
					opacity: lockedOpacity,
					position: "relative",
				}}
			>
				{/* Episode card background */}
				<div
					style={{
						borderRadius: 16,
						overflow: "hidden",
						backgroundColor: SURFACE_DARK,
						border: `1px solid ${SURFACE_LIGHT}`,
					}}
				>
					{/* Blurred content area */}
					<div
						style={{
							height: 280,
							background: `linear-gradient(135deg, #0f3460 0%, #16213e 50%, #1a1a2e 100%)`,
							filter: isLocked ? `blur(${Math.max(blurAmount, 8)}px)` : `blur(${blurAmount}px)`,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							position: "relative",
						}}
					>
						{/* Fake content lines */}
						<div style={{ padding: 40, width: "100%" }}>
							<div
								style={{
									height: 20,
									width: "60%",
									backgroundColor: "rgba(255,255,255,0.15)",
									borderRadius: 4,
									marginBottom: 12,
								}}
							/>
							<div
								style={{
									height: 14,
									width: "80%",
									backgroundColor: "rgba(255,255,255,0.1)",
									borderRadius: 4,
									marginBottom: 8,
								}}
							/>
							<div
								style={{
									height: 14,
									width: "70%",
									backgroundColor: "rgba(255,255,255,0.1)",
									borderRadius: 4,
								}}
							/>
						</div>
					</div>

					{/* Episode info bar */}
					<div
						style={{
							padding: "16px 24px",
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<div>
							<div
								style={{
									fontSize: 18,
									fontWeight: 700,
									color: "#fff",
								}}
							>
								Episode 4: "Deep Signal"
							</div>
							<div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>
								SIGNAL LOST &middot; Season 1
							</div>
						</div>

						{/* Lock / Unlock indicator */}
						<div
							style={{
								fontSize: 12,
								fontWeight: 600,
								color: isLocked ? "#888" : "#4ade80",
								display: "flex",
								alignItems: "center",
								gap: 6,
							}}
						>
							<span style={{ fontSize: 16 }}>
								{isLocked ? "\u{1F512}" : "\u{1F513}"}
							</span>
							{isLocked ? "Locked" : "Unlocked"}
						</div>
					</div>
				</div>

				{/* Overlay: Unlock button (Phase 2) */}
				{frame >= 50 && frame < 110 && (
					<div
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							height: 280,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<div
							style={{
								opacity: buttonOpacity,
								transform: `scale(${buttonScale * pulseScale})`,
								backgroundColor: BRAND_YELLOW,
								color: CINEMA_BLACK,
								padding: "14px 32px",
								borderRadius: 12,
								fontSize: 16,
								fontWeight: 700,
								boxShadow: `0 0 40px rgba(224,184,0,0.3)`,
								display: "flex",
								alignItems: "center",
								gap: 8,
							}}
						>
							Unlock for $4.99
						</div>
					</div>
				)}

				{/* Overlay: Unlocked badge (Phase 3) */}
				{frame >= 105 && (
					<div
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							height: 280,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<div
							style={{
								opacity: unlockedOpacity,
								transform: `scale(${unlockedScale})`,
								backgroundColor: "#4ade80",
								color: CINEMA_BLACK,
								padding: "12px 28px",
								borderRadius: 12,
								fontSize: 18,
								fontWeight: 800,
								boxShadow: "0 0 40px rgba(74,222,128,0.3)",
							}}
						>
							Unlocked!
						</div>
					</div>
				)}

				{/* Price breakdown (Phase 4) */}
				{frame >= 125 && (
					<div
						style={{
							marginTop: 20,
							display: "flex",
							justifyContent: "center",
							gap: 24,
						}}
					>
						<div
							style={{
								opacity: priceOpacity,
								transform: `translateY(${priceY}px)`,
								textAlign: "center",
							}}
						>
							<div
								style={{
									fontSize: 28,
									fontWeight: 800,
									color: BRAND_YELLOW,
								}}
							>
								$4.99
							</div>
							<div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
								per season
							</div>
						</div>

						<div
							style={{
								width: 1,
								backgroundColor: SURFACE_LIGHT,
								opacity: priceOpacity,
							}}
						/>

						<div
							style={{
								opacity: shareOpacity,
								textAlign: "center",
							}}
						>
							<div
								style={{
									fontSize: 28,
									fontWeight: 800,
									color: "#4ade80",
								}}
							>
								$3.99
							</div>
							<div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
								creator keeps 80%
							</div>
						</div>
					</div>
				)}
			</div>
		</AbsoluteFill>
	);
};

export default PaywallDemo;
