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

// ─── Inline SVG icon paths ─────────────────────────────────────────
const FilmIcon: React.FC<{ size?: number; color?: string }> = ({
	size = 24,
	color = "#fff",
}) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
		<line x1="7" y1="2" x2="7" y2="22" />
		<line x1="17" y1="2" x2="17" y2="22" />
		<line x1="2" y1="12" x2="22" y2="12" />
		<line x1="2" y1="7" x2="7" y2="7" />
		<line x1="2" y1="17" x2="7" y2="17" />
		<line x1="17" y1="7" x2="22" y2="7" />
		<line x1="17" y1="17" x2="22" y2="17" />
	</svg>
);

const CameraIcon: React.FC<{ size?: number; color?: string }> = ({
	size = 24,
	color = "#fff",
}) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
		<circle cx="12" cy="13" r="4" />
	</svg>
);

const StarIcon: React.FC<{ size?: number; color?: string }> = ({
	size = 24,
	color = "#fff",
}) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill={color}
		stroke={color}
		strokeWidth="1"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
	</svg>
);

// ─── Particle field seed data ──────────────────────────────────────
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
	x: ((i * 137.508) % 100),
	y: ((i * 73.137 + 20) % 100),
	size: 2 + (i % 4) * 1.2,
	speed: 0.15 + (i % 5) * 0.08,
	drift: (i % 2 === 0 ? 1 : -1) * (0.1 + (i % 3) * 0.05),
	opacity: 0.15 + (i % 4) * 0.08,
	parallax: 0.5 + (i % 3) * 0.3,
}));

export const PaywallDemo: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// ─── Loop crossfade: last 30 frames blend with first 30 frames ──
	const loopFadeIn = interpolate(frame, [330, 360], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	// ─── Phase 1 (0-30): Blurred episode card scales in ─────────────
	const cardSpring = spring({
		frame,
		fps,
		config: { damping: 14, stiffness: 80 },
	});
	const cardScale = interpolate(cardSpring, [0, 1], [0.6, 1], {
		extrapolateRight: "clamp",
	});
	const cardOpacity = interpolate(frame, [0, 20], [0, 1], {
		extrapolateRight: "clamp",
	});
	// Lock icon bouncy spring
	const lockSpring = spring({
		frame: Math.max(0, frame - 8),
		fps,
		config: { damping: 8, stiffness: 150 },
	});
	// Shimmer sweep across blur (0-30)
	const shimmerPos = interpolate(frame, [0, 30], [-40, 140], {
		extrapolateRight: "clamp",
	});
	const shimmerOpacity = interpolate(frame, [0, 5, 25, 30], [0, 0.7, 0.7, 0], {
		extrapolateRight: "clamp",
	});

	// Card visibility for phases 1-3 (0-105)
	const cardPhaseOpacity = interpolate(frame, [95, 105], [1, 0], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	// ─── Phase 2 (30-60): Price + Unlock button ─────────────────────
	const priceSlideY = interpolate(frame, [30, 50], [30, 0], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const priceOpacity = interpolate(frame, [30, 48], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const unlockBtnSpring = spring({
		frame: Math.max(0, frame - 40),
		fps,
		config: { damping: 12, stiffness: 120 },
	});
	const unlockBtnOpacity = interpolate(frame, [38, 52], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	// Pulse glow on button
	const btnGlow =
		frame >= 45 && frame < 60
			? 1 + Math.sin((frame - 45) * 0.35) * 0.08
			: 1;

	// ─── Phase 3 (60-105): Purchase animation ───────────────────────
	// Tap ripple (60-70)
	const rippleScale = interpolate(frame, [60, 72], [0, 3], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const rippleOpacity = interpolate(frame, [60, 72], [0.6, 0], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	// Spinner (70-88)
	const spinnerOpacity = interpolate(frame, [68, 72, 85, 90], [0, 1, 1, 0], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const spinnerRotation = (frame - 70) * 14;
	// "Unlocked!" badge (88-105)
	const unlockedSpring = spring({
		frame: Math.max(0, frame - 86),
		fps,
		config: { damping: 8, stiffness: 140 },
	});
	const unlockedOpacity = interpolate(frame, [86, 94], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	// Blur lift (88-105): 12px -> 0
	const blurAmount = frame < 88
		? 12
		: interpolate(frame, [88, 105], [12, 0], {
			extrapolateLeft: "clamp",
			extrapolateRight: "clamp",
		});

	// ─── Phase 4 (105-165): Three monetization cards fan in ─────────
	const cardsPhaseOpacity = interpolate(
		frame,
		[105, 115, 155, 165],
		[0, 1, 1, 0],
		{
			extrapolateLeft: "clamp",
			extrapolateRight: "clamp",
		}
	);
	const monetCards = [
		{ label: "Series Pass", price: "$4.99", icon: "film", delay: 0 },
		{ label: "BTS Access", price: "$2.99", icon: "camera", delay: 6 },
		{ label: "Creator Bundle", price: "$9.99", icon: "star", delay: 12 },
	];

	// ─── Phase 5 (165-240): Revenue split ───────────────────────────
	const revenuePhaseOpacity = interpolate(
		frame,
		[165, 178, 230, 240],
		[0, 1, 1, 0],
		{
			extrapolateLeft: "clamp",
			extrapolateRight: "clamp",
		}
	);
	// Bar fill animation
	const barFillProgress = interpolate(frame, [175, 215], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	// Creator earns count-up
	const creatorCountProgress = interpolate(frame, [180, 220], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const creatorEarns = (creatorCountProgress * 3.99).toFixed(2);
	// "80% REVENUE SHARE" zoom
	const revShareSpring = spring({
		frame: Math.max(0, frame - 200),
		fps,
		config: { damping: 12, stiffness: 60 },
	});
	const revShareScale = interpolate(revShareSpring, [0, 1], [0.5, 1], {
		extrapolateRight: "clamp",
	});
	const revShareOpacity = interpolate(frame, [198, 215], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	// Glow pulse on 80%
	const revGlow = frame >= 210 && frame < 240
		? 0.3 + Math.sin((frame - 210) * 0.2) * 0.15
		: 0.3;

	// ─── Phase 6 (240-310): Comparison bars ─────────────────────────
	const compPhaseOpacity = interpolate(
		frame,
		[240, 252, 300, 310],
		[0, 1, 1, 0],
		{
			extrapolateLeft: "clamp",
			extrapolateRight: "clamp",
		}
	);
	const shardzBarW = interpolate(frame, [252, 280], [0, 80], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const youtubeBarW = interpolate(frame, [258, 283], [0, 45], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const tiktokBarW = interpolate(frame, [264, 286], [0, 33], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	// Spotlight pulse on Shardz bar
	const spotlightPulse = frame >= 282 && frame < 310
		? 0.25 + Math.sin((frame - 282) * 0.25) * 0.15
		: 0;

	// ─── Render ─────────────────────────────────────────────────────

	return (
		<AbsoluteFill
			style={{
				backgroundColor: CINEMA_BLACK,
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
				overflow: "hidden",
			}}
		>
			{/* ── Particle field ─────────────────────────────────────── */}
			{PARTICLES.map((p, i) => {
				const px =
					(p.x + frame * p.drift + 100) % 100;
				const py =
					(p.y + frame * p.speed * p.parallax + 100) % 100;
				return (
					<div
						key={i}
						style={{
							position: "absolute",
							left: `${px}%`,
							top: `${py}%`,
							width: p.size,
							height: p.size,
							borderRadius: "50%",
							backgroundColor: `rgba(224, 184, 0, ${p.opacity})`,
							pointerEvents: "none",
						}}
					/>
				);
			})}

			{/* ── Phases 1-3 (0-105): Episode card with paywall ──────── */}
			{frame < 105 && (
				<div
					style={{
						position: "absolute",
						inset: 0,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						opacity: cardPhaseOpacity,
					}}
				>
					<div
						style={{
							transform: `scale(${cardScale})`,
							opacity: cardOpacity,
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
						}}
					>
						{/* Card container */}
						<div
							style={{
								width: 260,
								borderRadius: 20,
								overflow: "hidden",
								backgroundColor: SURFACE_DARK,
								border: "1px solid rgba(255,255,255,0.1)",
								boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
								position: "relative",
							}}
						>
							{/* Episode thumbnail area (color block placeholder) */}
							<div
								style={{
									width: "100%",
									aspectRatio: "16 / 10",
									position: "relative",
									overflow: "hidden",
								}}
							>
								{/* Color block gradient as episode placeholder */}
								<div
									style={{
										position: "absolute",
										inset: 0,
										background: `linear-gradient(135deg, #2a1a4e 0%, #1a2a3e 40%, #1e3a2e 100%)`,
										filter: `blur(${blurAmount}px)`,
										transform: "scale(1.08)",
									}}
								/>
								{/* Faux content lines on the card */}
								<div
									style={{
										position: "absolute",
										top: "30%",
										left: "15%",
										width: "70%",
										height: 8,
										borderRadius: 4,
										backgroundColor: "rgba(255,255,255,0.15)",
										filter: `blur(${blurAmount}px)`,
									}}
								/>
								<div
									style={{
										position: "absolute",
										top: "45%",
										left: "15%",
										width: "50%",
										height: 6,
										borderRadius: 3,
										backgroundColor: "rgba(255,255,255,0.1)",
										filter: `blur(${blurAmount}px)`,
									}}
								/>
								<div
									style={{
										position: "absolute",
										top: "60%",
										left: "15%",
										width: "35%",
										height: 6,
										borderRadius: 3,
										backgroundColor: "rgba(255,255,255,0.08)",
										filter: `blur(${blurAmount}px)`,
									}}
								/>

								{/* Shimmer sweep (Phase 1: 0-30) */}
								{frame < 30 && (
									<div
										style={{
											position: "absolute",
											inset: 0,
											opacity: shimmerOpacity,
											background: `linear-gradient(
												110deg,
												transparent ${shimmerPos - 30}%,
												rgba(255,255,255,0.12) ${shimmerPos - 10}%,
												rgba(255,255,255,0.3) ${shimmerPos}%,
												rgba(255,255,255,0.12) ${shimmerPos + 10}%,
												transparent ${shimmerPos + 30}%
											)`,
											pointerEvents: "none",
										}}
									/>
								)}

								{/* Lock icon centered */}
								{frame < 88 && (
									<div
										style={{
											position: "absolute",
											inset: 0,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
										}}
									>
										<div
											style={{
												transform: `scale(${lockSpring})`,
												filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.6))",
											}}
										>
											<svg
												width="44"
												height="44"
												viewBox="0 0 24 24"
												fill="none"
												stroke="white"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											>
												<rect
													x="3"
													y="11"
													width="18"
													height="11"
													rx="2"
													ry="2"
												/>
												<path d="M7 11V7a5 5 0 0 1 10 0v4" />
											</svg>
										</div>
									</div>
								)}

								{/* Phase 2 overlay: price pill + unlock button */}
								{frame >= 30 && frame < 60 && (
									<div
										style={{
											position: "absolute",
											inset: 0,
											display: "flex",
											flexDirection: "column",
											alignItems: "center",
											justifyContent: "center",
											gap: 14,
											background: "rgba(0,0,0,0.25)",
										}}
									>
										{/* Price glass pill */}
										<div
											style={{
												opacity: priceOpacity,
												transform: `translateY(${priceSlideY}px)`,
												backgroundColor: "rgba(255,255,255,0.06)",
												border: "1px solid rgba(255,255,255,0.1)",
												backdropFilter: "blur(12px)",
												borderRadius: 24,
												padding: "8px 22px",
												fontSize: 18,
												fontWeight: 700,
												color: "#fff",
												textShadow: "0 2px 6px rgba(0,0,0,0.4)",
											}}
										>
											$4.99/season
										</div>
										{/* Unlock button */}
										<div
											style={{
												opacity: unlockBtnOpacity,
												transform: `scale(${unlockBtnSpring * btnGlow})`,
												backgroundColor: BRAND_YELLOW,
												color: CINEMA_BLACK,
												padding: "10px 30px",
												borderRadius: 12,
												fontSize: 15,
												fontWeight: 800,
												boxShadow: `0 0 ${24 + Math.sin(frame * 0.3) * 8}px rgba(224,184,0,0.4)`,
												letterSpacing: 0.5,
											}}
										>
											Unlock
										</div>
									</div>
								)}

								{/* Phase 3: Purchase animation */}
								{frame >= 60 && frame < 105 && (
									<div
										style={{
											position: "absolute",
											inset: 0,
											display: "flex",
											flexDirection: "column",
											alignItems: "center",
											justifyContent: "center",
											gap: 12,
											background: "rgba(0,0,0,0.25)",
										}}
									>
										{/* Tap ripple */}
										{frame < 72 && (
											<div
												style={{
													position: "absolute",
													width: 40,
													height: 40,
													borderRadius: "50%",
													border: "2px solid rgba(224,184,0,0.5)",
													transform: `scale(${rippleScale})`,
													opacity: rippleOpacity,
												}}
											/>
										)}
										{/* Spinner */}
										{frame >= 68 && frame < 90 && (
											<div
												style={{
													opacity: spinnerOpacity,
													width: 32,
													height: 32,
													borderRadius: "50%",
													border: "3px solid rgba(255,255,255,0.2)",
													borderTopColor: BRAND_YELLOW,
													transform: `rotate(${spinnerRotation}deg)`,
												}}
											/>
										)}
										{/* Unlocked! badge */}
										{frame >= 86 && (
											<div
												style={{
													opacity: unlockedOpacity,
													transform: `scale(${unlockedSpring})`,
													backgroundColor: "#4ade80",
													color: CINEMA_BLACK,
													padding: "10px 28px",
													borderRadius: 12,
													fontSize: 17,
													fontWeight: 800,
													boxShadow:
														"0 0 30px rgba(74,222,128,0.4)",
													letterSpacing: 0.5,
												}}
											>
												Unlocked!
											</div>
										)}
									</div>
								)}
							</div>

							{/* Episode info bar below thumbnail */}
							<div
								style={{
									padding: "12px 16px",
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								<div>
									<div
										style={{
											fontSize: 13,
											fontWeight: 700,
											color: "#fff",
										}}
									>
										Ep. 4: &quot;Cascade&quot;
									</div>
									<div
										style={{
											fontSize: 10,
											color: "#888",
											marginTop: 2,
										}}
									>
										ORBITAL BREACH &middot; Season 1
									</div>
								</div>
								<div
									style={{
										fontSize: 10,
										fontWeight: 600,
										color:
											frame >= 88 ? "#4ade80" : "#888",
									}}
								>
									{frame >= 88 ? "Unlocked" : "Locked"}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* ── Phase 4 (105-165): Monetization cards fan in ───────── */}
			{frame >= 105 && frame < 165 && (
				<div
					style={{
						position: "absolute",
						inset: 0,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						opacity: cardsPhaseOpacity,
					}}
				>
					<div
						style={{
							display: "flex",
							gap: 20,
							alignItems: "center",
						}}
					>
						{monetCards.map((card, idx) => {
							const cardFrame = Math.max(0, frame - 108 - card.delay);
							const fanSpring = spring({
								frame: cardFrame,
								fps,
								config: { damping: 12, stiffness: 100 },
							});
							const fanRotation = interpolate(
								fanSpring,
								[0, 1],
								[(idx - 1) * 15, (idx - 1) * 1.5],
								{ extrapolateRight: "clamp" }
							);
							const fanY = interpolate(fanSpring, [0, 1], [60, 0], {
								extrapolateRight: "clamp",
							});
							const fanOpacity = interpolate(
								fanSpring,
								[0, 0.4],
								[0, 1],
								{ extrapolateRight: "clamp" }
							);
							// Shimmer on each card
							const cardShimmer = interpolate(
								frame,
								[115 + card.delay, 145 + card.delay],
								[-50, 150],
								{
									extrapolateLeft: "clamp",
									extrapolateRight: "clamp",
								}
							);

							const iconEl =
								card.icon === "film" ? (
									<FilmIcon size={28} color={BRAND_YELLOW} />
								) : card.icon === "camera" ? (
									<CameraIcon size={28} color={BRAND_YELLOW} />
								) : (
									<StarIcon size={28} color={BRAND_YELLOW} />
								);

							return (
								<div
									key={card.label}
									style={{
										opacity: fanOpacity,
										transform: `translateY(${fanY}px) rotate(${fanRotation}deg)`,
										width: 180,
										padding: "24px 16px",
										borderRadius: 16,
										backgroundColor: "rgba(255,255,255,0.06)",
										border: "1px solid rgba(255,255,255,0.1)",
										backdropFilter: "blur(8px)",
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										gap: 12,
										position: "relative",
										overflow: "hidden",
									}}
								>
									{/* Shimmer overlay */}
									<div
										style={{
											position: "absolute",
											inset: 0,
											background: `linear-gradient(
												115deg,
												transparent ${cardShimmer - 25}%,
												rgba(255,255,255,0.08) ${cardShimmer - 5}%,
												rgba(255,255,255,0.15) ${cardShimmer}%,
												rgba(255,255,255,0.08) ${cardShimmer + 5}%,
												transparent ${cardShimmer + 25}%
											)`,
											pointerEvents: "none",
										}}
									/>
									{iconEl}
									<div
										style={{
											fontSize: 14,
											fontWeight: 700,
											color: "#fff",
											textAlign: "center",
										}}
									>
										{card.label}
									</div>
									<div
										style={{
											fontSize: 20,
											fontWeight: 800,
											color: BRAND_YELLOW,
										}}
									>
										{card.price}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* ── Phase 5 (165-240): Revenue split ──────────────────── */}
			{frame >= 165 && frame < 240 && (
				<div
					style={{
						position: "absolute",
						inset: 0,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						gap: 20,
						opacity: revenuePhaseOpacity,
					}}
				>
					{/* Animated split bar */}
					<div
						style={{
							width: 500,
							height: 40,
							borderRadius: 12,
							backgroundColor: "rgba(255,255,255,0.06)",
							border: "1px solid rgba(255,255,255,0.1)",
							overflow: "hidden",
							display: "flex",
							position: "relative",
						}}
					>
						{/* Green portion (80%) */}
						<div
							style={{
								width: `${barFillProgress * 80}%`,
								height: "100%",
								backgroundColor: "#4ade80",
								borderRadius:
									barFillProgress < 1
										? "12px 0 0 12px"
										: "12px 0 0 12px",
								transition: "none",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							{barFillProgress > 0.5 && (
								<span
									style={{
										fontSize: 13,
										fontWeight: 800,
										color: CINEMA_BLACK,
									}}
								>
									Creator 80%
								</span>
							)}
						</div>
						{/* Gray portion (20%) */}
						<div
							style={{
								width: `${barFillProgress * 20}%`,
								height: "100%",
								backgroundColor: "#555",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							{barFillProgress > 0.8 && (
								<span
									style={{
										fontSize: 11,
										fontWeight: 700,
										color: "#ccc",
									}}
								>
									20%
								</span>
							)}
						</div>
					</div>

					{/* "$3.99 creator earns" count-up */}
					<div
						style={{
							fontSize: 36,
							fontWeight: 800,
							color: "#4ade80",
							fontVariantNumeric: "tabular-nums",
						}}
					>
						${creatorEarns}{" "}
						<span
							style={{
								fontSize: 16,
								fontWeight: 600,
								color: "#888",
							}}
						>
							creator earns
						</span>
					</div>

					{/* "80% REVENUE SHARE" large text with glow */}
					<div
						style={{
							opacity: revShareOpacity,
							transform: `scale(${revShareScale})`,
							textAlign: "center",
						}}
					>
						<div
							style={{
								fontSize: 64,
								fontWeight: 900,
								color: "#fff",
								letterSpacing: -1,
								lineHeight: 1,
								textShadow: `0 0 40px rgba(74,222,128,${revGlow})`,
							}}
						>
							80%
						</div>
						<div
							style={{
								fontSize: 18,
								fontWeight: 700,
								color: BRAND_YELLOW,
								letterSpacing: 6,
								textTransform: "uppercase",
								marginTop: 6,
							}}
						>
							Revenue Share
						</div>
					</div>
				</div>
			)}

			{/* ── Phase 6 (240-310): Comparison bars ─────────────────── */}
			{frame >= 240 && frame < 310 && (
				<div
					style={{
						position: "absolute",
						inset: 0,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						opacity: compPhaseOpacity,
					}}
				>
					<div
						style={{
							width: 500,
							display: "flex",
							flexDirection: "column",
							gap: 18,
						}}
					>
						{/* Section header */}
						<div
							style={{
								fontSize: 14,
								fontWeight: 600,
								color: "#888",
								letterSpacing: 3,
								textTransform: "uppercase",
								textAlign: "center",
								marginBottom: 8,
							}}
						>
							Creator Revenue Share
						</div>

						{/* Shardz bar */}
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: 14,
							}}
						>
							<div
								style={{
									width: 90,
									textAlign: "right",
									fontSize: 15,
									fontWeight: 700,
									color: "#fff",
									flexShrink: 0,
								}}
							>
								Shardz
							</div>
							<div
								style={{
									flex: 1,
									height: 38,
									backgroundColor: "rgba(255,255,255,0.06)",
									borderRadius: 10,
									overflow: "hidden",
									position: "relative",
								}}
							>
								<div
									style={{
										width: `${shardzBarW}%`,
										height: "100%",
										backgroundColor: "#4ade80",
										borderRadius: 10,
										display: "flex",
										alignItems: "center",
										justifyContent: "flex-end",
										paddingRight: 12,
										boxShadow: `0 0 ${16 + spotlightPulse * 40}px rgba(74,222,128,${spotlightPulse + 0.1})`,
									}}
								>
									{shardzBarW > 30 && (
										<span
											style={{
												fontSize: 14,
												fontWeight: 800,
												color: CINEMA_BLACK,
											}}
										>
											80%
										</span>
									)}
								</div>
							</div>
						</div>

						{/* YouTube bar */}
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: 14,
							}}
						>
							<div
								style={{
									width: 90,
									textAlign: "right",
									fontSize: 15,
									fontWeight: 700,
									color: "#666",
									flexShrink: 0,
								}}
							>
								YouTube
							</div>
							<div
								style={{
									flex: 1,
									height: 38,
									backgroundColor: "rgba(255,255,255,0.06)",
									borderRadius: 10,
									overflow: "hidden",
								}}
							>
								<div
									style={{
										width: `${youtubeBarW}%`,
										height: "100%",
										backgroundColor: "#555",
										borderRadius: 10,
										display: "flex",
										alignItems: "center",
										justifyContent: "flex-end",
										paddingRight: 12,
									}}
								>
									{youtubeBarW > 20 && (
										<span
											style={{
												fontSize: 14,
												fontWeight: 800,
												color: "#ccc",
											}}
										>
											~45%
										</span>
									)}
								</div>
							</div>
						</div>

						{/* TikTok bar */}
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: 14,
							}}
						>
							<div
								style={{
									width: 90,
									textAlign: "right",
									fontSize: 15,
									fontWeight: 700,
									color: "#666",
									flexShrink: 0,
								}}
							>
								TikTok
							</div>
							<div
								style={{
									flex: 1,
									height: 38,
									backgroundColor: "rgba(255,255,255,0.06)",
									borderRadius: 10,
									overflow: "hidden",
								}}
							>
								<div
									style={{
										width: `${tiktokBarW}%`,
										height: "100%",
										backgroundColor: "#555",
										borderRadius: 10,
										display: "flex",
										alignItems: "center",
										justifyContent: "flex-end",
										paddingRight: 12,
									}}
								>
									{tiktokBarW > 15 && (
										<span
											style={{
												fontSize: 14,
												fontWeight: 800,
												color: "#ccc",
											}}
										>
											~33%
										</span>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* ── Phase 7 (310-360): Smooth loop crossfade ───────────── */}
			{/* In frames 330-360, we crossfade to the beginning state */}
			{frame >= 330 && (
				<div
					style={{
						position: "absolute",
						inset: 0,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						opacity: loopFadeIn,
					}}
				>
					{/* Re-render the Phase 1 opening card state */}
					<div
						style={{
							transform: `scale(${interpolate(
								loopFadeIn,
								[0, 1],
								[0.6, 1],
								{ extrapolateRight: "clamp" }
							)})`,
							opacity: loopFadeIn,
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
						}}
					>
						<div
							style={{
								width: 260,
								borderRadius: 20,
								overflow: "hidden",
								backgroundColor: SURFACE_DARK,
								border: "1px solid rgba(255,255,255,0.1)",
								boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
								position: "relative",
							}}
						>
							<div
								style={{
									width: "100%",
									aspectRatio: "16 / 10",
									position: "relative",
									overflow: "hidden",
								}}
							>
								<div
									style={{
										position: "absolute",
										inset: 0,
										background:
											"linear-gradient(135deg, #2a1a4e 0%, #1a2a3e 40%, #1e3a2e 100%)",
										filter: "blur(12px)",
										transform: "scale(1.08)",
									}}
								/>
								<div
									style={{
										position: "absolute",
										top: "30%",
										left: "15%",
										width: "70%",
										height: 8,
										borderRadius: 4,
										backgroundColor: "rgba(255,255,255,0.15)",
										filter: "blur(12px)",
									}}
								/>
								<div
									style={{
										position: "absolute",
										top: "45%",
										left: "15%",
										width: "50%",
										height: 6,
										borderRadius: 3,
										backgroundColor: "rgba(255,255,255,0.1)",
										filter: "blur(12px)",
									}}
								/>
								{/* Shimmer sweep (mirror of opening) */}
								<div
									style={{
										position: "absolute",
										inset: 0,
										opacity: interpolate(
											frame,
											[335, 340, 355, 360],
											[0, 0.6, 0.6, 0],
											{
												extrapolateLeft: "clamp",
												extrapolateRight: "clamp",
											}
										),
										background: `linear-gradient(
											110deg,
											transparent ${interpolate(frame, [335, 360], [-40, 140], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) - 30}%,
											rgba(255,255,255,0.12) ${interpolate(frame, [335, 360], [-40, 140], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) - 10}%,
											rgba(255,255,255,0.3) ${interpolate(frame, [335, 360], [-40, 140], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}%,
											rgba(255,255,255,0.12) ${interpolate(frame, [335, 360], [-40, 140], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) + 10}%,
											transparent ${interpolate(frame, [335, 360], [-40, 140], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) + 30}%
										)`,
										pointerEvents: "none",
									}}
								/>
								{/* Lock icon */}
								<div
									style={{
										position: "absolute",
										inset: 0,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<div
										style={{
											transform: `scale(${interpolate(
												loopFadeIn,
												[0, 1],
												[0.5, 1],
												{ extrapolateRight: "clamp" }
											)})`,
											filter:
												"drop-shadow(0 4px 12px rgba(0,0,0,0.6))",
										}}
									>
										<svg
											width="44"
											height="44"
											viewBox="0 0 24 24"
											fill="none"
											stroke="white"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<rect
												x="3"
												y="11"
												width="18"
												height="11"
												rx="2"
												ry="2"
											/>
											<path d="M7 11V7a5 5 0 0 1 10 0v4" />
										</svg>
									</div>
								</div>
							</div>
							<div
								style={{
									padding: "12px 16px",
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								<div>
									<div
										style={{
											fontSize: 13,
											fontWeight: 700,
											color: "#fff",
										}}
									>
										Ep. 4: &quot;Cascade&quot;
									</div>
									<div
										style={{
											fontSize: 10,
											color: "#888",
											marginTop: 2,
										}}
									>
										ORBITAL BREACH &middot; Season 1
									</div>
								</div>
								<div
									style={{
										fontSize: 10,
										fontWeight: 600,
										color: "#888",
									}}
								>
									Locked
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* During crossfade zone (310-330), current content is still fully visible */}
			{/* The comparison bars phase runs through 310 with its own fade-out, */}
			{/* and the loop fade-in starts at 330 — giving a smooth 310-360 transition */}
		</AbsoluteFill>
	);
};

export default PaywallDemo;
