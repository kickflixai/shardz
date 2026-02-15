import {
	AbsoluteFill,
	Img,
	staticFile,
	useCurrentFrame,
	interpolate,
	spring,
	useVideoConfig,
} from "remotion";

const BRAND_YELLOW = "#E0B800";
const CINEMA_BLACK = "#141414";
const SURFACE_DARK = "#1a1a2e";
const SURFACE_LIGHT = "#2a2a3e";

// ---------------------------------------------------------------------------
// Icon SVGs (inline paths)
// ---------------------------------------------------------------------------

const FilmReelIcon: React.FC<{ size?: number; color?: string }> = ({
	size = 24,
	color = "#fff",
}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
		<circle cx="12" cy="12" r="3" fill={color} />
		<circle cx="12" cy="5" r="1.5" fill={color} />
		<circle cx="12" cy="19" r="1.5" fill={color} />
		<circle cx="5" cy="12" r="1.5" fill={color} />
		<circle cx="19" cy="12" r="1.5" fill={color} />
	</svg>
);

const CameraIcon: React.FC<{ size?: number; color?: string }> = ({
	size = 24,
	color = "#fff",
}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<path
			d="M23 7l-7 5 7 5V7z"
			stroke={color}
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<rect
			x="1"
			y="5"
			width="15"
			height="14"
			rx="2"
			stroke={color}
			strokeWidth="1.5"
		/>
	</svg>
);

const StarIcon: React.FC<{ size?: number; color?: string }> = ({
	size = 24,
	color = "#fff",
}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<path
			d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
			fill={color}
		/>
	</svg>
);

const SparkleIcon: React.FC<{ size?: number; color?: string }> = ({
	size = 16,
	color = "#fff",
}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<path
			d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z"
			fill={color}
		/>
		<path
			d="M19 14l.75 3.25L23 18l-3.25.75L19 22l-.75-3.25L15 18l3.25-.75L19 14z"
			fill={color}
			opacity={0.6}
		/>
	</svg>
);

const FilmIcon: React.FC<{ size?: number; color?: string }> = ({
	size = 16,
	color = "#fff",
}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<rect
			x="2"
			y="2"
			width="20"
			height="20"
			rx="2"
			stroke={color}
			strokeWidth="1.5"
		/>
		<line x1="7" y1="2" x2="7" y2="22" stroke={color} strokeWidth="1.5" />
		<line x1="17" y1="2" x2="17" y2="22" stroke={color} strokeWidth="1.5" />
		<line x1="2" y1="7" x2="7" y2="7" stroke={color} strokeWidth="1.5" />
		<line x1="2" y1="12" x2="7" y2="12" stroke={color} strokeWidth="1.5" />
		<line x1="2" y1="17" x2="7" y2="17" stroke={color} strokeWidth="1.5" />
		<line x1="17" y1="7" x2="22" y2="7" stroke={color} strokeWidth="1.5" />
		<line x1="17" y1="12" x2="22" y2="12" stroke={color} strokeWidth="1.5" />
		<line x1="17" y1="17" x2="22" y2="17" stroke={color} strokeWidth="1.5" />
	</svg>
);

const UsersIcon: React.FC<{ size?: number; color?: string }> = ({
	size = 16,
	color = "#fff",
}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<path
			d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
			stroke={color}
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<circle
			cx="9"
			cy="7"
			r="4"
			stroke={color}
			strokeWidth="1.5"
		/>
		<path
			d="M23 21v-2a4 4 0 00-3-3.87"
			stroke={color}
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M16 3.13a4 4 0 010 7.75"
			stroke={color}
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

const MusicIcon: React.FC<{ size?: number; color?: string }> = ({
	size = 16,
	color = "#fff",
}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<path
			d="M9 18V5l12-2v13"
			stroke={color}
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<circle cx="6" cy="18" r="3" stroke={color} strokeWidth="1.5" />
		<circle cx="18" cy="16" r="3" stroke={color} strokeWidth="1.5" />
	</svg>
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Clamp-only interpolate shorthand */
const clamp = (
	frame: number,
	inputRange: number[],
	outputRange: number[],
) =>
	interpolate(frame, inputRange, outputRange, {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

/** Typewriter: returns substring visible at given frame */
const typewriter = (
	text: string,
	frame: number,
	startFrame: number,
	totalFrames: number,
) => {
	const progress = clamp(frame, [startFrame, startFrame + totalFrames], [0, 1]);
	return text.slice(0, Math.round(progress * text.length));
};

/** Format number with commas */
const formatNumber = (n: number): string => Math.floor(n).toLocaleString();

/** Format currency */
const formatCurrency = (n: number): string =>
	`$${Math.floor(n).toLocaleString()}`;

// ---------------------------------------------------------------------------
// Card data
// ---------------------------------------------------------------------------

const CONTENT_CARDS = [
	{
		title: "Scripted Series",
		icon: "reel" as const,
		gradientFrom: "#38b6ff",
		gradientTo: "#0055aa",
		badge: "16 eps \u2022 Sci-Fi",
		price: "$4.99/season",
		episodes: 16,
		views: 84200,
		revenue: 4990,
		thumbnail: "thumbnails/mock-orbital-breach.png",
	},
	{
		title: "Behind the Scenes",
		icon: "camera" as const,
		gradientFrom: "#ff6b6b",
		gradientTo: "#a83232",
		badge: "8 eps \u2022 Vlog",
		price: "$2.99/season",
		episodes: 8,
		views: 42100,
		revenue: 2990,
		thumbnail: "thumbnails/mock-glass-highway.png",
	},
	{
		title: "Creator Exclusives",
		icon: "star" as const,
		gradientFrom: "#c084fc",
		gradientTo: "#6b21a8",
		badge: "12 eps \u2022 Educational",
		price: "$3.99/season",
		episodes: 12,
		views: 63400,
		revenue: 3990,
		thumbnail: "thumbnails/mock-phantom-circuit.png",
	},
];

const CREATOR_BADGES = [
	{ label: "AI Filmmaker", color: "#38b6ff", icon: "sparkle" as const },
	{ label: "Indie Studio", color: "#4ade80", icon: "film" as const },
	{ label: "Influencer", color: "#f472b6", icon: "users" as const },
	{ label: "Musician", color: "#c084fc", icon: "music" as const },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const FormatsDemo: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// ─── Loop crossfade: last 30 frames blend into first 30 ─────────
	// Instead of fading to/from black, we crossfade the end into the start
	const loopFadeOut = clamp(frame, [360, 390], [1, 0]);
	const loopFadeIn = clamp(frame, [0, 30], [0, 1]);
	// During frames 360-390 we show a faded version; during 0-30 we fade in
	// The composition is meant to loop, so the player handles the overlap.
	// We just ensure no black: at frame 0 content is visible (opacity ramps from 0.3 to 1)
	const globalOpacity = frame >= 360
		? Math.max(loopFadeOut, 0.3)
		: frame <= 30
			? Math.max(loopFadeIn, 0.3)
			: 1;

	// ═══════════════════════════════════════════════════════════════════
	// PHASE 1 (0-30): Title "One Platform, Every Format" types in
	// ═══════════════════════════════════════════════════════════════════
	const titleText = "One Platform, Every Format";
	const typedTitle = typewriter(titleText, frame, 0, 25);
	const titleOpacity = clamp(frame, [0, 8], [0, 1]);
	const cursorVisible = frame < 30 && Math.sin(frame * 0.4) > 0;
	// Title fades out when cards phase takes over
	const titleFadeOut = clamp(frame, [100, 120], [1, 0]);
	// Title also fades for portfolio phase
	const titleVisibility = frame < 240 ? titleFadeOut : 0;

	// ═══════════════════════════════════════════════════════════════════
	// PHASE 2 (30-120): Three content cards cascade in from bottom
	// ═══════════════════════════════════════════════════════════════════
	const cardAnimations = CONTENT_CARDS.map((_, i) => {
		const staggerDelay = 35 + i * 25;
		const cardSpring = spring({
			frame: Math.max(0, frame - staggerDelay),
			fps,
			config: { damping: 12, stiffness: 100 },
		});
		const y = clamp(frame, [staggerDelay, staggerDelay + 20], [80, 0]);
		const opacity = clamp(frame, [staggerDelay, staggerDelay + 15], [0, 1]);
		return { scale: cardSpring, y, opacity };
	});

	// Cards overall visibility (fade out during portfolio merge)
	const cardsOverallOpacity = clamp(frame, [240, 270], [1, 0]);
	const cardsVisible = frame >= 30 && frame < 290;

	// ═══════════════════════════════════════════════════════════════════
	// PHASE 3 (120-180): Cards hover one-by-one with detail panels
	// ═══════════════════════════════════════════════════════════════════
	const getCardHover = (cardIndex: number) => {
		const hoverStart = 120 + cardIndex * 20;
		const hoverEnd = hoverStart + 20;
		const hoverScale = interpolate(
			frame,
			[hoverStart, hoverStart + 10, hoverEnd - 5, hoverEnd],
			[1, 1.06, 1.06, 1],
			{ extrapolateLeft: "clamp", extrapolateRight: "clamp" },
		);
		const detailSlide = clamp(
			frame,
			[hoverStart + 5, hoverStart + 18],
			[0, 1],
		);
		const detailFade = interpolate(
			frame,
			[hoverStart + 5, hoverStart + 15, hoverEnd - 3, hoverEnd + 5],
			[0, 1, 1, 0],
			{ extrapolateLeft: "clamp", extrapolateRight: "clamp" },
		);
		const glowIntensity = interpolate(
			frame,
			[hoverStart, hoverStart + 10, hoverEnd - 5, hoverEnd],
			[0, 1, 1, 0],
			{ extrapolateLeft: "clamp", extrapolateRight: "clamp" },
		);
		return { hoverScale, detailSlide, detailFade, glowIntensity };
	};

	// ═══════════════════════════════════════════════════════════════════
	// PHASE 4 (180-240): Creator type badges float in around cards
	// ═══════════════════════════════════════════════════════════════════
	const badgeAnimations = CREATOR_BADGES.map((_, i) => {
		const badgeDelay = 185 + i * 12;
		const badgeSpring = spring({
			frame: Math.max(0, frame - badgeDelay),
			fps,
			config: { damping: 8, stiffness: 120 },
		});
		const opacity = clamp(frame, [badgeDelay, badgeDelay + 15], [0, 1]);
		// Badges fade out with cards
		const fadeOut = clamp(frame, [240, 265], [1, 0]);
		return { scale: badgeSpring, opacity: opacity * fadeOut };
	});

	// Badge positions (floating around the card area)
	const badgePositions = [
		{ top: 30, left: 30 },
		{ top: 30, right: 30 },
		{ bottom: 50, left: 50 },
		{ bottom: 50, right: 50 },
	];

	// ═══════════════════════════════════════════════════════════════════
	// PHASE 5 (240-330): Cards merge into Creator Portfolio view
	// ═══════════════════════════════════════════════════════════════════
	const portfolioOpacity = clamp(frame, [260, 290], [0, 1]);
	const portfolioScale = spring({
		frame: Math.max(0, frame - 265),
		fps,
		config: { damping: 14, stiffness: 80 },
	});

	// Earnings counter: counts up to $12,847
	const earningsTarget = 12847;
	const earningsProgress = clamp(frame, [280, 330], [0, 1]);
	const earningsValue = earningsTarget * earningsProgress;

	// "From 3 formats" subtitle
	const subtitleOpacity = clamp(frame, [300, 320], [0, 1]);
	const subtitleY = clamp(frame, [300, 320], [15, 0]);

	// Portfolio fades out for loop
	const portfolioFadeOut = clamp(frame, [340, 365], [1, 0]);
	const portfolioVisible = frame >= 250;

	// Grid items spring in
	const gridItems = CONTENT_CARDS.map((_, i) => {
		const gridDelay = 275 + i * 10;
		const gridSpring = spring({
			frame: Math.max(0, frame - gridDelay),
			fps,
			config: { damping: 14, stiffness: 100 },
		});
		return { scale: gridSpring };
	});

	// ═══════════════════════════════════════════════════════════════════
	// PHASE 6 (330-390): Smooth crossfade loop
	// ═══════════════════════════════════════════════════════════════════
	// Title re-appears for the loop
	const loopTitleOpacity = clamp(frame, [350, 380], [0, 1]);

	// Pulsing glow effect (used across phases)
	const glowPulse = 0.5 + 0.3 * Math.sin(frame * 0.1);

	// ═══════════════════════════════════════════════════════════════════
	// RENDER
	// ═══════════════════════════════════════════════════════════════════
	return (
		<AbsoluteFill
			style={{
				backgroundColor: CINEMA_BLACK,
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
				overflow: "hidden",
				opacity: globalOpacity,
			}}
		>
			{/* Subtle ambient gradient */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					background: `radial-gradient(ellipse at ${40 + 20 * Math.sin(frame * 0.02)}% ${40 + 15 * Math.cos(frame * 0.015)}%, rgba(224,184,0,0.04) 0%, transparent 60%)`,
					pointerEvents: "none",
				}}
			/>

			{/* ═══════════════════════════════════════════════════════════ */}
			{/* TITLE (Phase 1 + loop re-entry) */}
			{/* ═══════════════════════════════════════════════════════════ */}
			<div
				style={{
					position: "absolute",
					top: 40,
					left: 0,
					right: 0,
					display: "flex",
					justifyContent: "center",
					opacity: Math.max(titleOpacity * titleVisibility, loopTitleOpacity * portfolioFadeOut),
					zIndex: 20,
				}}
			>
				<div
					style={{
						fontSize: 28,
						fontWeight: 800,
						color: "#ffffff",
						letterSpacing: "-0.02em",
						textAlign: "center",
					}}
				>
					{frame >= 350 ? titleText : typedTitle}
					{cursorVisible && (
						<span style={{ color: BRAND_YELLOW, fontWeight: 300 }}>|</span>
					)}
				</div>
			</div>

			{/* ═══════════════════════════════════════════════════════════ */}
			{/* CONTENT CARDS (Phases 2-4) */}
			{/* ═══════════════════════════════════════════════════════════ */}
			{cardsVisible && (
				<div
					style={{
						position: "absolute",
						top: 90,
						left: 0,
						right: 0,
						bottom: 0,
						display: "flex",
						justifyContent: "center",
						alignItems: "flex-start",
						gap: 20,
						padding: "0 40px",
						opacity: cardsOverallOpacity,
					}}
				>
					{CONTENT_CARDS.map((card, i) => {
						const anim = cardAnimations[i];
						const hover = getCardHover(i);

						const iconColor = card.gradientFrom;
						const cardGlowColor = `rgba(${card.gradientFrom === "#38b6ff" ? "56,182,255" : card.gradientFrom === "#ff6b6b" ? "255,107,107" : "192,132,252"}, ${0.3 * hover.glowIntensity})`;

						// Count-up values during hover
						const countEps = Math.floor(card.episodes * hover.detailSlide);
						const countViews = Math.floor(card.views * hover.detailSlide);
						const countRevenue = Math.floor(card.revenue * hover.detailSlide);

						return (
							<div
								key={card.title}
								style={{
									opacity: anim.opacity,
									transform: `translateY(${anim.y}px) scale(${anim.scale * hover.hoverScale})`,
									width: 270,
									borderRadius: 16,
									overflow: "visible",
									position: "relative",
								}}
							>
								{/* Card body */}
								<div
									style={{
										backgroundColor: "rgba(255,255,255,0.06)",
										border: "1px solid rgba(255,255,255,0.1)",
										borderRadius: 16,
										overflow: "hidden",
										boxShadow: hover.glowIntensity > 0
											? `0 0 ${20 * hover.glowIntensity}px ${cardGlowColor}, 0 8px 32px rgba(0,0,0,0.4)`
											: "0 8px 32px rgba(0,0,0,0.4)",
									}}
								>
									{/* Thumbnail with poster image (portrait) */}
									<div
										style={{
											height: 280,
											position: "relative",
											overflow: "hidden",
										}}
									>
										<Img
											src={staticFile(card.thumbnail)}
											style={{
												position: "absolute",
												inset: 0,
												width: "100%",
												height: "100%",
												objectFit: "cover",
												objectPosition: "center top",
											}}
										/>

										{/* Badge */}
										<div
											style={{
												position: "absolute",
												top: 10,
												left: 10,
												backgroundColor: "rgba(0,0,0,0.55)",
												padding: "4px 10px",
												borderRadius: 6,
												fontSize: 11,
												fontWeight: 600,
												color: "#fff",
												backdropFilter: "blur(8px)",
											}}
										>
											{card.badge}
										</div>
									</div>

									{/* Card info */}
									<div style={{ padding: "14px 16px" }}>
										<div
											style={{
												fontSize: 15,
												fontWeight: 700,
												color: "#fff",
												marginBottom: 4,
											}}
										>
											{card.title}
										</div>
										<div
											style={{
												fontSize: 13,
												color: iconColor,
												fontWeight: 600,
											}}
										>
											{card.price}
										</div>
									</div>
								</div>

								{/* Detail panel (slides out on hover) */}
								<div
									style={{
										opacity: hover.detailFade,
										transform: `translateY(${8 - 8 * hover.detailSlide}px)`,
										marginTop: 8,
										padding: "10px 14px",
										borderRadius: 12,
										backgroundColor: "rgba(255,255,255,0.06)",
										border: "1px solid rgba(255,255,255,0.1)",
										backdropFilter: "blur(12px)",
									}}
								>
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
											gap: 8,
										}}
									>
										<div style={{ textAlign: "center", flex: 1 }}>
											<div
												style={{
													fontSize: 16,
													fontWeight: 800,
													color: "#fff",
													fontVariantNumeric: "tabular-nums",
												}}
											>
												{countEps}
											</div>
											<div
												style={{
													fontSize: 9,
													color: "#888",
													textTransform: "uppercase",
													letterSpacing: "0.05em",
												}}
											>
												Episodes
											</div>
										</div>
										<div
											style={{
												width: 1,
												backgroundColor: "rgba(255,255,255,0.08)",
											}}
										/>
										<div style={{ textAlign: "center", flex: 1 }}>
											<div
												style={{
													fontSize: 16,
													fontWeight: 800,
													color: "#fff",
													fontVariantNumeric: "tabular-nums",
												}}
											>
												{formatNumber(countViews)}
											</div>
											<div
												style={{
													fontSize: 9,
													color: "#888",
													textTransform: "uppercase",
													letterSpacing: "0.05em",
												}}
											>
												Views
											</div>
										</div>
										<div
											style={{
												width: 1,
												backgroundColor: "rgba(255,255,255,0.08)",
											}}
										/>
										<div style={{ textAlign: "center", flex: 1 }}>
											<div
												style={{
													fontSize: 16,
													fontWeight: 800,
													color: BRAND_YELLOW,
													fontVariantNumeric: "tabular-nums",
												}}
											>
												{formatCurrency(countRevenue)}
											</div>
											<div
												style={{
													fontSize: 9,
													color: "#888",
													textTransform: "uppercase",
													letterSpacing: "0.05em",
												}}
											>
												Revenue
											</div>
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* ═══════════════════════════════════════════════════════════ */}
			{/* CREATOR TYPE BADGES (Phase 4: 180-240) */}
			{/* ═══════════════════════════════════════════════════════════ */}
			{frame >= 180 && frame < 270 && (
				<>
					{CREATOR_BADGES.map((badge, i) => {
						const anim = badgeAnimations[i];
						const pos = badgePositions[i];
						// Floating bob effect
						const bobY = 3 * Math.sin((frame - 185) * 0.08 + i * 1.5);

						const renderIcon = () => {
							switch (badge.icon) {
								case "sparkle":
									return <SparkleIcon size={14} color={badge.color} />;
								case "film":
									return <FilmIcon size={14} color={badge.color} />;
								case "users":
									return <UsersIcon size={14} color={badge.color} />;
								case "music":
									return <MusicIcon size={14} color={badge.color} />;
							}
						};

						return (
							<div
								key={badge.label}
								style={{
									position: "absolute",
									...(pos.top !== undefined ? { top: pos.top } : {}),
									...(pos.bottom !== undefined ? { bottom: pos.bottom } : {}),
									...(pos.left !== undefined ? { left: pos.left } : {}),
									...(pos.right !== undefined ? { right: pos.right } : {}),
									opacity: anim.opacity,
									transform: `scale(${anim.scale}) translateY(${bobY}px)`,
									zIndex: 15,
								}}
							>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										gap: 6,
										padding: "6px 14px",
										borderRadius: 20,
										backgroundColor: "rgba(255,255,255,0.06)",
										border: "1px solid rgba(255,255,255,0.1)",
										backdropFilter: "blur(12px)",
										boxShadow: `0 0 ${12 * glowPulse}px rgba(${badge.color === "#38b6ff" ? "56,182,255" : badge.color === "#4ade80" ? "74,222,128" : badge.color === "#f472b6" ? "244,114,182" : "192,132,252"}, ${0.2 * glowPulse})`,
									}}
								>
									{renderIcon()}
									<span
										style={{
											fontSize: 12,
											fontWeight: 600,
											color: badge.color,
										}}
									>
										{badge.label}
									</span>
								</div>
							</div>
						);
					})}
				</>
			)}

			{/* ═══════════════════════════════════════════════════════════ */}
			{/* CREATOR PORTFOLIO (Phase 5: 240-330) */}
			{/* ═══════════════════════════════════════════════════════════ */}
			{portfolioVisible && (
				<AbsoluteFill
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						opacity: portfolioOpacity * portfolioFadeOut,
						transform: `scale(${portfolioScale})`,
						padding: "0 60px",
					}}
				>
					{/* Portfolio header */}
					<div
						style={{
							fontSize: 22,
							fontWeight: 800,
							color: "#fff",
							letterSpacing: "-0.02em",
							marginBottom: 6,
						}}
					>
						Creator Portfolio
					</div>
					<div
						style={{
							fontSize: 12,
							color: "#888",
							marginBottom: 28,
						}}
					>
						All your content, one dashboard
					</div>

					{/* Grid of mixed content */}
					<div
						style={{
							display: "flex",
							gap: 14,
							marginBottom: 28,
							width: "100%",
							maxWidth: 700,
							justifyContent: "center",
						}}
					>
						{CONTENT_CARDS.map((card, i) => {
							const grid = gridItems[i];
							return (
								<div
									key={card.title}
									style={{
										flex: 1,
										transform: `scale(${grid.scale})`,
										borderRadius: 12,
										overflow: "hidden",
										backgroundColor: "rgba(255,255,255,0.06)",
										border: "1px solid rgba(255,255,255,0.1)",
									}}
								>
									{/* Mini poster thumbnail */}
									<div
										style={{
											height: 70,
											position: "relative",
											overflow: "hidden",
										}}
									>
										<Img
											src={staticFile(card.thumbnail)}
											style={{
												position: "absolute",
												inset: 0,
												width: "100%",
												height: "100%",
												objectFit: "cover",
												objectPosition: "center top",
											}}
										/>
									</div>
									<div style={{ padding: "8px 10px" }}>
										<div
											style={{
												fontSize: 11,
												fontWeight: 700,
												color: "#fff",
												marginBottom: 2,
											}}
										>
											{card.title}
										</div>
										<div
											style={{
												fontSize: 10,
												color: "#666",
											}}
										>
											{card.badge}
										</div>
									</div>
								</div>
							);
						})}
					</div>

					{/* Earnings counter */}
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: 4,
						}}
					>
						<div
							style={{
								fontSize: 48,
								fontWeight: 900,
								color: BRAND_YELLOW,
								letterSpacing: "-0.03em",
								fontVariantNumeric: "tabular-nums",
								textShadow: `0 0 ${30 * glowPulse}px rgba(224,184,0,${0.3 * glowPulse})`,
							}}
						>
							{formatCurrency(earningsValue)}
						</div>
						<div
							style={{
								fontSize: 11,
								fontWeight: 700,
								color: "#4ade80",
								textTransform: "uppercase",
								letterSpacing: "0.06em",
							}}
						>
							Total Earnings
						</div>
						<div
							style={{
								opacity: subtitleOpacity,
								transform: `translateY(${subtitleY}px)`,
								fontSize: 14,
								color: "#888",
								fontWeight: 500,
								marginTop: 4,
							}}
						>
							From 3 formats
						</div>
					</div>
				</AbsoluteFill>
			)}
		</AbsoluteFill>
	);
};

export default FormatsDemo;
