import {
	AbsoluteFill,
	Img,
	staticFile,
	useCurrentFrame,
	interpolate,
	spring,
	useVideoConfig,
} from "remotion";

// ---------------------------------------------------------------------------
// Color constants
// ---------------------------------------------------------------------------
const BRAND_YELLOW = "#E0B800";
const CINEMA_BLACK = "#141414";
const SURFACE_DARK = "#1a1a2e";
const SURFACE_LIGHT = "#2a2a3e";

// ---------------------------------------------------------------------------
// Genre & card data
// ---------------------------------------------------------------------------
const GENRE_TABS = ["All", "Sci-Fi", "BTS/Vlogs"];

const GENRE_COLORS: Record<string, { bg: string; text: string; glow: string }> = {
	"Sci-Fi": { bg: "rgba(139,92,246,0.25)", text: "#a78bfa", glow: "rgba(139,92,246,0.5)" },
	Thriller: { bg: "rgba(239,68,68,0.25)", text: "#f87171", glow: "rgba(239,68,68,0.5)" },
	Comedy: { bg: "rgba(34,197,94,0.25)", text: "#4ade80", glow: "rgba(34,197,94,0.5)" },
	Action: { bg: "rgba(251,146,60,0.25)", text: "#fb923c", glow: "rgba(251,146,60,0.5)" },
	Drama: { bg: "rgba(56,189,248,0.25)", text: "#38bdf8", glow: "rgba(56,189,248,0.5)" },
	"BTS/Vlogs": { bg: "rgba(236,72,153,0.25)", text: "#ec4899", glow: "rgba(236,72,153,0.5)" },
};

const CARD_GRADIENT: Record<string, string> = {
	"Sci-Fi": "linear-gradient(135deg, #1a0533 0%, #3b0764 50%, #6b21a8 100%)",
	Thriller: "linear-gradient(135deg, #2a0a0a 0%, #7f1d1d 50%, #dc2626 100%)",
	Comedy: "linear-gradient(135deg, #052e16 0%, #166534 50%, #22c55e 100%)",
	Action: "linear-gradient(135deg, #2a1708 0%, #7c2d12 50%, #ea580c 100%)",
	Drama: "linear-gradient(135deg, #082f49 0%, #0c4a6e 50%, #0ea5e9 100%)",
	"BTS/Vlogs": "linear-gradient(135deg, #2a0a1e 0%, #831843 50%, #db2777 100%)",
};

interface CardData {
	title: string;
	genre: string;
	rating: number;
	episodes: number;
}

const CARD_THUMBNAILS: Record<string, string> = {
	"ORBITAL BREACH": "thumbnails/mock-orbital-breach.png",
	"Blood Circuit": "thumbnails/mock-dead-drop.png",
	"Laugh Track": "thumbnails/mock-office-hours.png",
	"Chrome Pursuit": "thumbnails/mock-chrome-pursuit.png",
	"The Last Signal": "thumbnails/mock-signal-lost.png",
	"Studio Sessions": "thumbnails/mock-glass-highway.png",
};

const SERIES_CARDS: CardData[] = [
	{ title: "ORBITAL BREACH", genre: "Sci-Fi", rating: 4.8, episodes: 16 },
	{ title: "Blood Circuit", genre: "Thriller", rating: 4.5, episodes: 12 },
	{ title: "Laugh Track", genre: "Comedy", rating: 4.2, episodes: 8 },
	{ title: "Chrome Pursuit", genre: "Action", rating: 4.7, episodes: 10 },
	{ title: "The Last Signal", genre: "Drama", rating: 4.9, episodes: 14 },
	{ title: "Studio Sessions", genre: "BTS/Vlogs", rating: 4.3, episodes: 6 },
];

const TRENDING_CARDS = [
	{ title: "Neon Divide", genre: "Sci-Fi", rating: 4.6, thumbnail: "thumbnails/mock-neon-divide.png" },
	{ title: "Red Meridian", genre: "Thriller", rating: 4.4, thumbnail: "thumbnails/mock-flashpoint.png" },
	{ title: "Outtakes", genre: "Comedy", rating: 4.1, thumbnail: "thumbnails/mock-office-hours.png" },
	{ title: "Titan Fall", genre: "Action", rating: 4.8, thumbnail: "thumbnails/mock-titan-fall.png" },
	{ title: "Afterglow", genre: "Drama", rating: 4.7, thumbnail: "thumbnails/mock-the-hollow.png" },
	{ title: "Day in the Life", genre: "BTS/Vlogs", rating: 4.2, thumbnail: "thumbnails/mock-glass-highway.png" },
	{ title: "Starfield", genre: "Sci-Fi", rating: 4.5, thumbnail: "thumbnails/mock-void-runners.png" },
	{ title: "Ashborn", genre: "Action", rating: 4.3, thumbnail: "thumbnails/mock-ashborn.png" },
];

// ---------------------------------------------------------------------------
// Particles
// ---------------------------------------------------------------------------
interface Particle {
	x: number;
	y: number;
	size: number;
	speed: number;
	offset: number;
	opacity: number;
}

const PARTICLES: Particle[] = Array.from({ length: 18 }, (_, i) => ({
	x: (i * 73 + 17) % 100,
	y: (i * 47 + 31) % 100,
	size: 2 + (i % 3),
	speed: 0.008 + (i % 5) * 0.004,
	offset: i * 1.3,
	opacity: 0.15 + (i % 4) * 0.08,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Clamped interpolate shorthand */
const ci = (
	frame: number,
	inputRange: [number, number],
	outputRange: [number, number],
) =>
	interpolate(frame, inputRange, outputRange, {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

/** Multi-point clamped interpolate */
const cim = (
	frame: number,
	inputRange: number[],
	outputRange: number[],
) =>
	interpolate(frame, inputRange, outputRange, {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const BrowseDemo: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// ── Loop crossfade (last 30 frames blend with first 30) ──────────
	const loopFadeOut = ci(frame, [360, 390], [1, 0]);
	const loopFadeIn = ci(frame, [360, 390], [0, 1]);

	// ── Particle field ───────────────────────────────────────────────
	const particleGlobalOpacity = ci(frame, [0, 15], [0, 0.6]);

	// ── Shimmer sweep position (diagonal, loops) ─────────────────────
	const shimmerX = ((frame * 3) % 500) - 100;

	// ═════════════════════════════════════════════════════════════════
	// PHASE 1: Header + search bar + genre pills (frames 0-30)
	// ═════════════════════════════════════════════════════════════════
	const headerY = ci(frame, [0, 20], [-50, 0]);
	const headerOpacity = ci(frame, [0, 20], [0, 1]);

	const searchBarX = ci(frame, [5, 25], [60, 0]);
	const searchBarOpacity = ci(frame, [5, 25], [0, 1]);

	// Genre pills cascade with stagger
	const genrePillAnims = GENRE_TABS.map((_, i) => {
		const start = 10 + i * 6;
		return {
			opacity: ci(frame, [start, start + 15], [0, 1]),
			y: ci(frame, [start, start + 15], [20, 0]),
			scale: spring({
				frame: Math.max(0, frame - start),
				fps,
				config: { damping: 14, stiffness: 120 },
			}),
		};
	});

	// ═════════════════════════════════════════════════════════════════
	// PHASE 2: 6 portrait cards spring in (frames 30-90)
	// ═════════════════════════════════════════════════════════════════
	const cardAnims = SERIES_CARDS.map((_, i) => {
		const col = i % 3;
		const row = Math.floor(i / 3);
		const delay = 30 + (row * 3 + col) * 8;
		const s = spring({
			frame: Math.max(0, frame - delay),
			fps,
			config: { damping: 12, stiffness: 100 },
		});
		const opacity = ci(frame, [delay, delay + 18], [0, 1]);
		const y = ci(frame, [delay, delay + 20], [40, 0]);
		return { scale: s, opacity, y };
	});

	// Genre badge glow pulse per card
	const genreGlowPulse = (i: number) => {
		const base = 50 + i * 8;
		if (frame < base) return 0;
		return 0.4 + 0.3 * Math.sin((frame - base) * 0.1);
	};

	// ═════════════════════════════════════════════════════════════════
	// PHASE 3: Hover simulation on card 0 (frames 90-135)
	// ═════════════════════════════════════════════════════════════════
	const HOVER_CARD = 0;
	const hoverScale = cim(frame, [90, 105, 125, 135], [1, 1.12, 1.12, 1]);
	const hoverGlow = cim(frame, [90, 105, 125, 135], [0, 1, 1, 0]);
	const hoverOverlayOpacity = cim(frame, [95, 110, 120, 135], [0, 1, 1, 0]);

	// ═════════════════════════════════════════════════════════════════
	// PHASE 4: Genre filtering with 3D flip (frames 135-195)
	// ═════════════════════════════════════════════════════════════════
	// Tab transitions: "All" -> "Sci-Fi" -> "BTS/Vlogs"
	const activeTabIndex =
		frame < 135 ? 0
			: frame < 155 ? 0
				: frame < 165 ? 1
					: frame < 175 ? 1
						: 2;

	// Tab highlight animation
	const tabSwitchPulse1 = cim(frame, [135, 145, 150, 160], [0, 1, 1, 0]);
	const tabSwitchPulse2 = cim(frame, [165, 172, 178, 188], [0, 1, 1, 0]);

	// 3D flip transition for cards during genre switch
	const flipProgress1 = cim(frame, [140, 155], [0, 1]);
	const flipProgress2 = cim(frame, [170, 185], [0, 1]);

	const getCardFlipRotation = (cardIndex: number) => {
		// Stagger flip per card
		const stagger = cardIndex * 0.12;
		if (frame >= 140 && frame <= 160) {
			const p = Math.min(1, Math.max(0, flipProgress1 - stagger));
			// Flip out and back
			if (p < 0.5) return p * 2 * 180;
			return (1 - p) * 2 * 180;
		}
		if (frame >= 170 && frame <= 190) {
			const p = Math.min(1, Math.max(0, flipProgress2 - stagger));
			if (p < 0.5) return p * 2 * 180;
			return (1 - p) * 2 * 180;
		}
		return 0;
	};

	// Card visibility based on active genre
	const getCardFilterOpacity = (card: CardData) => {
		if (activeTabIndex === 0) return 1;
		const activeGenre = GENRE_TABS[activeTabIndex];
		return card.genre === activeGenre ? 1 : 0.15;
	};

	// ═════════════════════════════════════════════════════════════════
	// PHASE 5: Featured Creator row (frames 195-255)
	// ═════════════════════════════════════════════════════════════════
	const creatorRowY = ci(frame, [195, 220], [80, 0]);
	const creatorRowOpacity = ci(frame, [195, 218], [0, 1]);
	const creatorRowScale = spring({
		frame: Math.max(0, frame - 195),
		fps,
		config: { damping: 14, stiffness: 90 },
	});

	// Avatar ring glow pulse
	const avatarGlow = frame >= 205
		? 0.5 + 0.3 * Math.sin((frame - 205) * 0.12)
		: 0;

	// Creator stats stagger in
	const creatorNameOpacity = ci(frame, [210, 222], [0, 1]);
	const creatorStatsOpacity = ci(frame, [218, 230], [0, 1]);

	// ═════════════════════════════════════════════════════════════════
	// PHASE 6: Trending Now horizontal scroll (frames 255-330)
	// ═════════════════════════════════════════════════════════════════
	const trendingRowOpacity = ci(frame, [255, 272], [0, 1]);
	const trendingRowY = ci(frame, [255, 275], [50, 0]);

	// Continuous scroll left
	const scrollOffset = frame >= 255
		? (frame - 255) * 2.8
		: 0;

	// ═════════════════════════════════════════════════════════════════
	// PHASE 7: Smooth loop crossfade (frames 330-390)
	// ═════════════════════════════════════════════════════════════════
	// The loopFadeOut / loopFadeIn at the top handles the crossfade.
	// During 330-390 we re-render the "beginning state" at increasing opacity.
	const isLooping = frame >= 330;

	// "Beginning state" replicas for crossfade
	const loopHeaderY = ci(frame, [330, 350], [-50, 0]);
	const loopHeaderOpacity = ci(frame, [330, 350], [0, 1]);
	const loopSearchBarX = ci(frame, [335, 355], [60, 0]);
	const loopSearchBarOpacity = ci(frame, [335, 355], [0, 1]);
	const loopGenrePills = GENRE_TABS.map((_, i) => {
		const start = 340 + i * 6;
		return {
			opacity: ci(frame, [start, start + 15], [0, 1]),
			y: ci(frame, [start, start + 15], [20, 0]),
		};
	});
	const loopCardAnims = SERIES_CARDS.map((_, i) => {
		const col = i % 3;
		const row = Math.floor(i / 3);
		const delay = 360 + (row * 3 + col) * 5;
		return {
			opacity: ci(frame, [delay, delay + 15], [0, 1]),
			y: ci(frame, [delay, delay + 15], [30, 0]),
		};
	});

	// ═════════════════════════════════════════════════════════════════
	// RENDER
	// ═════════════════════════════════════════════════════════════════
	return (
		<AbsoluteFill
			style={{
				backgroundColor: CINEMA_BLACK,
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
				overflow: "hidden",
			}}
		>
			{/* ── Particle field ──────────────────────────────────────── */}
			{PARTICLES.map((p, i) => {
				const px = p.x + 4 * Math.sin(frame * p.speed + p.offset);
				const py = p.y + 3 * Math.sin(frame * p.speed * 0.7 + p.offset + 2);
				return (
					<div
						key={`p-${i}`}
						style={{
							position: "absolute",
							left: `${px}%`,
							top: `${py}%`,
							width: p.size,
							height: p.size,
							borderRadius: "50%",
							backgroundColor: i % 3 === 0 ? BRAND_YELLOW : "#ffffff",
							opacity: p.opacity * particleGlobalOpacity,
							pointerEvents: "none",
						}}
					/>
				);
			})}

			{/* ── Shimmer sweep ───────────────────────────────────────── */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					background: `linear-gradient(115deg, transparent ${shimmerX - 60}%, rgba(255,255,255,0.03) ${shimmerX}%, transparent ${shimmerX + 60}%)`,
					pointerEvents: "none",
					zIndex: 1,
				}}
			/>

			{/* ═══════════════════════════════════════════════════════════ */}
			{/* MAIN CONTENT LAYER (fades out during loop) */}
			{/* ═══════════════════════════════════════════════════════════ */}
			<AbsoluteFill
				style={{
					opacity: isLooping ? loopFadeOut : 1,
					padding: "28px 40px",
					display: "flex",
					flexDirection: "column",
					zIndex: 2,
				}}
			>
				{/* ── Header ──────────────────────────────────────────── */}
				<div
					style={{
						opacity: headerOpacity,
						transform: `translateY(${headerY}px)`,
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						marginBottom: 12,
					}}
				>
					<div
						style={{
							fontSize: 26,
							fontWeight: 800,
							color: "#ffffff",
							letterSpacing: "-0.02em",
						}}
					>
						Discover
					</div>
					<div
						style={{
							fontSize: 11,
							color: "#666",
							fontWeight: 500,
						}}
					>
						Explore 11 genres
					</div>
				</div>

				{/* ── Search bar (glass morphism) ─────────────────────── */}
				<div
					style={{
						opacity: searchBarOpacity,
						transform: `translateX(${searchBarX}px)`,
						marginBottom: 14,
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							backgroundColor: "rgba(255,255,255,0.06)",
							border: "1px solid rgba(255,255,255,0.1)",
							backdropFilter: "blur(12px)",
							borderRadius: 10,
							padding: "9px 14px",
							gap: 10,
						}}
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#666"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<circle cx="11" cy="11" r="8" />
							<line x1="21" y1="21" x2="16.65" y2="16.65" />
						</svg>
						<span style={{ fontSize: 13, color: "#555", fontWeight: 400 }}>
							Search series, creators, genres...
						</span>
					</div>
				</div>

				{/* ── Genre pills ─────────────────────────────────────── */}
				<div
					style={{
						display: "flex",
						gap: 8,
						marginBottom: 16,
					}}
				>
					{GENRE_TABS.map((tab, i) => {
						const anim = genrePillAnims[i];
						const isActive =
							(frame >= 135 && i === activeTabIndex) ||
							(frame < 135 && i === 0);
						// Pulse highlight during tab switch
						const pulse =
							i === 1 ? tabSwitchPulse1 :
								i === 2 ? tabSwitchPulse2 : 0;
						const bgOpacity = isActive ? 1 : pulse > 0.5 ? 0.7 : 0;

						return (
							<div
								key={tab}
								style={{
									opacity: anim.opacity,
									transform: `translateY(${anim.y}px) scale(${anim.scale})`,
									padding: "7px 18px",
									borderRadius: 20,
									fontSize: 12,
									fontWeight: 600,
									backgroundColor: bgOpacity > 0
										? BRAND_YELLOW
										: "rgba(255,255,255,0.06)",
									border: `1px solid ${bgOpacity > 0 ? BRAND_YELLOW : "rgba(255,255,255,0.1)"}`,
									color: bgOpacity > 0 ? CINEMA_BLACK : "#aaa",
									boxShadow: bgOpacity > 0
										? `0 0 12px rgba(224,184,0,${0.3 * bgOpacity})`
										: "none",
								}}
							>
								{tab}
							</div>
						);
					})}
				</div>

				{/* ── Series grid (3x2 portrait cards) ────────────────── */}
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(3, 1fr)",
						gap: 12,
						flex: frame < 195 ? 1 : undefined,
						height: frame >= 195 ? 280 : undefined,
					}}
				>
					{SERIES_CARDS.map((card, i) => {
						const anim = cardAnims[i];
						const colors = GENRE_COLORS[card.genre] || GENRE_COLORS["Sci-Fi"];
						const glowIntensity = genreGlowPulse(i);
						const flipRot = getCardFlipRotation(i);
						const filterOpacity = getCardFilterOpacity(card);

						const isHovered = i === HOVER_CARD && frame >= 90 && frame <= 135;
						const cardScale = isHovered ? anim.scale * hoverScale : anim.scale;
						const borderColor = isHovered
							? `rgba(224,184,0,${0.3 + hoverGlow * 0.7})`
							: "rgba(255,255,255,0.1)";

						return (
							<div
								key={card.title}
								style={{
									opacity: anim.opacity * filterOpacity,
									transform: `scale(${cardScale}) translateY(${anim.y}px) perspective(600px) rotateY(${flipRot}deg)`,
									borderRadius: 10,
									overflow: "hidden",
									backgroundColor: "rgba(255,255,255,0.06)",
									border: `1px solid ${borderColor}`,
									display: "flex",
									flexDirection: "column",
									position: "relative",
									zIndex: isHovered ? 10 : 1,
									boxShadow: isHovered
										? `0 0 ${20 * hoverGlow}px rgba(224,184,0,${0.35 * hoverGlow}), 0 8px 32px rgba(0,0,0,0.4)`
										: `0 4px 16px rgba(0,0,0,0.3)`,
									backfaceVisibility: "hidden",
								}}
							>
								{/* Thumbnail with poster image */}
								<div
									style={{
										aspectRatio: "3 / 4",
										position: "relative",
										overflow: "hidden",
									}}
								>
									<Img
										src={staticFile(CARD_THUMBNAILS[card.title] || "")}
										style={{
											position: "absolute",
											inset: 0,
											width: "100%",
											height: "100%",
											objectFit: "cover",
											objectPosition: "center top",
										}}
									/>
									{/* Gradient overlay at bottom */}
									<div
										style={{
											position: "absolute",
											bottom: 0,
											left: 0,
											right: 0,
											height: "45%",
											background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
										}}
									/>

									{/* Genre badge with colored glow */}
									<div
										style={{
											position: "absolute",
											top: 7,
											left: 7,
											backgroundColor: colors.bg,
											padding: "2px 8px",
											borderRadius: 4,
											fontSize: 9,
											fontWeight: 700,
											color: colors.text,
											boxShadow: `0 0 ${8 * glowIntensity}px ${colors.glow}`,
										}}
									>
										{card.genre}
									</div>

									{/* Episode badge */}
									<div
										style={{
											position: "absolute",
											bottom: 7,
											right: 7,
											backgroundColor: "rgba(0,0,0,0.7)",
											padding: "2px 7px",
											borderRadius: 4,
											fontSize: 9,
											fontWeight: 600,
											color: "#ccc",
										}}
									>
										{card.episodes} eps
									</div>
								</div>

								{/* Card title */}
								<div style={{ padding: "8px 10px" }}>
									<div
										style={{
											fontSize: 11,
											fontWeight: 700,
											color: "#fff",
											whiteSpace: "nowrap",
											overflow: "hidden",
											textOverflow: "ellipsis",
											marginBottom: 2,
										}}
									>
										{card.title}
									</div>
									<div style={{ fontSize: 9, color: "#777" }}>
										{card.genre}
									</div>
								</div>

								{/* Hover overlay: rating + episode count */}
								{isHovered && (
									<div
										style={{
											position: "absolute",
											inset: 0,
											display: "flex",
											flexDirection: "column",
											alignItems: "center",
											justifyContent: "center",
											backgroundColor: "rgba(0,0,0,0.55)",
											opacity: hoverOverlayOpacity,
											borderRadius: 10,
											gap: 6,
										}}
									>
										<div
											style={{
												display: "flex",
												alignItems: "center",
												gap: 4,
											}}
										>
											<span style={{ color: BRAND_YELLOW, fontSize: 16 }}>
												&#9733;
											</span>
											<span
												style={{
													color: "#fff",
													fontSize: 18,
													fontWeight: 800,
												}}
											>
												{card.rating}
											</span>
										</div>
										<div
											style={{
												fontSize: 12,
												color: "#ccc",
												fontWeight: 600,
											}}
										>
											{card.episodes} eps
										</div>
									</div>
								)}
							</div>
						);
					})}
				</div>

				{/* ── Featured Creator row (Phase 5: 195-255) ─────────── */}
				{frame >= 195 && frame < 330 && (
					<div
						style={{
							opacity: creatorRowOpacity,
							transform: `translateY(${creatorRowY}px) scale(${creatorRowScale})`,
							marginTop: 14,
							padding: "12px 16px",
							borderRadius: 12,
							backgroundColor: "rgba(255,255,255,0.06)",
							border: "1px solid rgba(255,255,255,0.1)",
							display: "flex",
							alignItems: "center",
							gap: 14,
						}}
					>
						{/* "Featured Creator" label */}
						<div
							style={{
								position: "absolute",
								top: -8,
								left: 16,
								fontSize: 9,
								fontWeight: 700,
								color: BRAND_YELLOW,
								textTransform: "uppercase",
								letterSpacing: "0.08em",
								backgroundColor: CINEMA_BLACK,
								padding: "0 6px",
							}}
						>
							Featured Creator
						</div>

						{/* Avatar with ring glow */}
						<div
							style={{
								width: 44,
								height: 44,
								borderRadius: 22,
								background: `linear-gradient(135deg, ${BRAND_YELLOW}, #f5d442)`,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontSize: 18,
								fontWeight: 800,
								color: CINEMA_BLACK,
								flexShrink: 0,
								boxShadow: `0 0 ${12 + avatarGlow * 16}px rgba(224,184,0,${avatarGlow})`,
							}}
						>
							AK
						</div>

						{/* Creator info */}
						<div style={{ flex: 1, minWidth: 0 }}>
							<div
								style={{
									opacity: creatorNameOpacity,
									fontSize: 14,
									fontWeight: 700,
									color: "#fff",
									marginBottom: 2,
								}}
							>
								Alex Kondratiev
							</div>
							<div
								style={{
									opacity: creatorStatsOpacity,
									fontSize: 11,
									color: "#888",
									display: "flex",
									gap: 8,
								}}
							>
								<span>
									<span style={{ color: "#ccc", fontWeight: 600 }}>12</span>{" "}
									series
								</span>
								<span style={{ color: "#555" }}>&middot;</span>
								<span>
									<span style={{ color: "#ccc", fontWeight: 600 }}>4.2K</span>{" "}
									followers
								</span>
							</div>
						</div>

						{/* Follow button */}
						<div
							style={{
								padding: "6px 16px",
								borderRadius: 20,
								backgroundColor: BRAND_YELLOW,
								color: CINEMA_BLACK,
								fontSize: 11,
								fontWeight: 700,
								flexShrink: 0,
							}}
						>
							Follow
						</div>
					</div>
				)}

				{/* ── Trending Now horizontal row (Phase 6: 255-330) ──── */}
				{frame >= 255 && frame < 330 && (
					<div
						style={{
							opacity: trendingRowOpacity,
							transform: `translateY(${trendingRowY}px)`,
							marginTop: 14,
							overflow: "hidden",
						}}
					>
						{/* Section title */}
						<div
							style={{
								fontSize: 14,
								fontWeight: 700,
								color: "#fff",
								marginBottom: 10,
								display: "flex",
								alignItems: "center",
								gap: 8,
							}}
						>
							<span style={{ color: BRAND_YELLOW }}>&#9650;</span>
							Trending Now
						</div>

						{/* Scrolling card row */}
						<div
							style={{
								display: "flex",
								gap: 10,
								transform: `translateX(-${scrollOffset}px)`,
								width: "max-content",
							}}
						>
							{/* Duplicate for seamless scroll */}
							{[...TRENDING_CARDS, ...TRENDING_CARDS].map((card, i) => {
								const colors = GENRE_COLORS[card.genre] || GENRE_COLORS["Sci-Fi"];
								return (
									<div
										key={`t-${i}`}
										style={{
											width: 110,
											borderRadius: 8,
											overflow: "hidden",
											backgroundColor: "rgba(255,255,255,0.06)",
											border: "1px solid rgba(255,255,255,0.1)",
											flexShrink: 0,
										}}
									>
										{/* Mini thumbnail */}
										<div
											style={{
												height: 65,
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
											<div
												style={{
													position: "absolute",
													bottom: 4,
													left: 5,
													fontSize: 8,
													fontWeight: 700,
													color: colors.text,
													backgroundColor: colors.bg,
													padding: "1px 5px",
													borderRadius: 3,
												}}
											>
												{card.genre}
											</div>
										</div>
										<div style={{ padding: "5px 7px" }}>
											<div
												style={{
													fontSize: 10,
													fontWeight: 700,
													color: "#fff",
													whiteSpace: "nowrap",
													overflow: "hidden",
													textOverflow: "ellipsis",
												}}
											>
												{card.title}
											</div>
											<div
												style={{
													fontSize: 9,
													color: "#888",
													display: "flex",
													alignItems: "center",
													gap: 3,
													marginTop: 2,
												}}
											>
												<span style={{ color: BRAND_YELLOW, fontSize: 8 }}>
													&#9733;
												</span>
												{card.rating}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}
			</AbsoluteFill>

			{/* ═══════════════════════════════════════════════════════════ */}
			{/* LOOP CROSSFADE LAYER (frames 330-390) */}
			{/* Replays beginning state fading in on top */}
			{/* ═══════════════════════════════════════════════════════════ */}
			{isLooping && (
				<AbsoluteFill
					style={{
						opacity: loopFadeIn,
						padding: "28px 40px",
						display: "flex",
						flexDirection: "column",
						zIndex: 3,
					}}
				>
					{/* Header (replay) */}
					<div
						style={{
							opacity: loopHeaderOpacity,
							transform: `translateY(${loopHeaderY}px)`,
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							marginBottom: 12,
						}}
					>
						<div
							style={{
								fontSize: 26,
								fontWeight: 800,
								color: "#ffffff",
								letterSpacing: "-0.02em",
							}}
						>
							Discover
						</div>
						<div style={{ fontSize: 11, color: "#666", fontWeight: 500 }}>
							Explore 11 genres
						</div>
					</div>

					{/* Search bar (replay) */}
					<div
						style={{
							opacity: loopSearchBarOpacity,
							transform: `translateX(${loopSearchBarX}px)`,
							marginBottom: 14,
						}}
					>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								backgroundColor: "rgba(255,255,255,0.06)",
								border: "1px solid rgba(255,255,255,0.1)",
								borderRadius: 10,
								padding: "9px 14px",
								gap: 10,
							}}
						>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="#666"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<circle cx="11" cy="11" r="8" />
								<line x1="21" y1="21" x2="16.65" y2="16.65" />
							</svg>
							<span style={{ fontSize: 13, color: "#555", fontWeight: 400 }}>
								Search series, creators, genres...
							</span>
						</div>
					</div>

					{/* Genre pills (replay) */}
					<div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
						{GENRE_TABS.map((tab, i) => {
							const lp = loopGenrePills[i];
							return (
								<div
									key={`loop-${tab}`}
									style={{
										opacity: lp.opacity,
										transform: `translateY(${lp.y}px)`,
										padding: "7px 18px",
										borderRadius: 20,
										fontSize: 12,
										fontWeight: 600,
										backgroundColor: i === 0
											? BRAND_YELLOW
											: "rgba(255,255,255,0.06)",
										border: `1px solid ${i === 0 ? BRAND_YELLOW : "rgba(255,255,255,0.1)"}`,
										color: i === 0 ? CINEMA_BLACK : "#aaa",
									}}
								>
									{tab}
								</div>
							);
						})}
					</div>

					{/* Cards grid (replay) */}
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(3, 1fr)",
							gap: 12,
							flex: 1,
						}}
					>
						{SERIES_CARDS.map((card, i) => {
							const la = loopCardAnims[i];
							const colors = GENRE_COLORS[card.genre] || GENRE_COLORS["Sci-Fi"];
							return (
								<div
									key={`loop-${card.title}`}
									style={{
										opacity: la.opacity,
										transform: `translateY(${la.y}px)`,
										borderRadius: 10,
										overflow: "hidden",
										backgroundColor: "rgba(255,255,255,0.06)",
										border: "1px solid rgba(255,255,255,0.1)",
										display: "flex",
										flexDirection: "column",
										boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
									}}
								>
									<div
										style={{
											aspectRatio: "3 / 4",
											position: "relative",
											overflow: "hidden",
										}}
									>
										<Img
											src={staticFile(CARD_THUMBNAILS[card.title] || "")}
											style={{
												position: "absolute",
												inset: 0,
												width: "100%",
												height: "100%",
												objectFit: "cover",
												objectPosition: "center top",
											}}
										/>
										<div
											style={{
												position: "absolute",
												bottom: 0,
												left: 0,
												right: 0,
												height: "45%",
												background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
											}}
										/>
										<div
											style={{
												position: "absolute",
												top: 7,
												left: 7,
												backgroundColor: colors.bg,
												padding: "2px 8px",
												borderRadius: 4,
												fontSize: 9,
												fontWeight: 700,
												color: colors.text,
											}}
										>
											{card.genre}
										</div>
										<div
											style={{
												position: "absolute",
												bottom: 7,
												right: 7,
												backgroundColor: "rgba(0,0,0,0.7)",
												padding: "2px 7px",
												borderRadius: 4,
												fontSize: 9,
												fontWeight: 600,
												color: "#ccc",
											}}
										>
											{card.episodes} eps
										</div>
									</div>
									<div style={{ padding: "8px 10px" }}>
										<div
											style={{
												fontSize: 11,
												fontWeight: 700,
												color: "#fff",
												whiteSpace: "nowrap",
												overflow: "hidden",
												textOverflow: "ellipsis",
												marginBottom: 2,
											}}
										>
											{card.title}
										</div>
										<div style={{ fontSize: 9, color: "#777" }}>
											{card.genre}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</AbsoluteFill>
			)}
		</AbsoluteFill>
	);
};

export default BrowseDemo;
