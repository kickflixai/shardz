import {
	AbsoluteFill,
	Video,
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const clamp = {
	extrapolateLeft: "clamp" as const,
	extrapolateRight: "clamp" as const,
};

/** Typewriter: reveal N characters of a string */
const typewriter = (
	text: string,
	frame: number,
	startFrame: number,
	framesPerChar: number,
) => {
	const elapsed = Math.max(0, frame - startFrame);
	const chars = Math.min(text.length, Math.floor(elapsed / framesPerChar));
	return text.slice(0, chars);
};

// ─── Emoji data ───────────────────────────────────────────────────────────────

interface EmojiItem {
	emoji: string;
	/** X offset from center of burst column (px) */
	xOff: number;
	/** Delay within the wave (frames) */
	delay: number;
	/** How far it drifts upward (px) */
	drift: number;
}

const EMOJI_WAVES: { start: number; items: EmojiItem[] }[] = [
	{
		start: 30,
		items: [
			{ emoji: "🔥", xOff: 0, delay: 0, drift: 120 },
			{ emoji: "❤️", xOff: 18, delay: 3, drift: 140 },
			{ emoji: "💯", xOff: -12, delay: 6, drift: 110 },
		],
	},
	{
		start: 45,
		items: [
			{ emoji: "😂", xOff: 8, delay: 0, drift: 130 },
			{ emoji: "🔥", xOff: -16, delay: 4, drift: 150 },
			{ emoji: "❤️", xOff: 20, delay: 2, drift: 115 },
			{ emoji: "💯", xOff: -6, delay: 7, drift: 135 },
		],
	},
	{
		start: 60,
		items: [
			{ emoji: "🔥", xOff: 10, delay: 0, drift: 125 },
			{ emoji: "😂", xOff: -14, delay: 3, drift: 145 },
			{ emoji: "❤️", xOff: 4, delay: 5, drift: 110 },
		],
	},
	{
		start: 75,
		items: [
			{ emoji: "💯", xOff: -8, delay: 0, drift: 140 },
			{ emoji: "🔥", xOff: 16, delay: 2, drift: 120 },
			{ emoji: "❤️", xOff: -20, delay: 5, drift: 150 },
			{ emoji: "😂", xOff: 6, delay: 4, drift: 130 },
			{ emoji: "🔥", xOff: -2, delay: 8, drift: 115 },
		],
	},
];

// ─── Comments data ────────────────────────────────────────────────────────────

const COMMENTS = [
	{
		timestamp: "0:42",
		text: "This scene is insane! 🔥",
		user: "MK",
		color: "#e05050",
		startFrame: 95,
	},
	{
		timestamp: "0:45",
		text: "Plot twist!!",
		user: "JL",
		color: "#38b6ff",
		startFrame: 120,
	},
	{
		timestamp: "0:48",
		text: "Who else got chills?",
		user: "RA",
		color: "#8b5cf6",
		startFrame: 145,
	},
];

// ─── Loop emoji data for frames 345-420 ──────────────────────────────────────

const LOOP_EMOJI_WAVES: { start: number; items: EmojiItem[] }[] = [
	{
		start: 350,
		items: [
			{ emoji: "🔥", xOff: 4, delay: 0, drift: 120 },
			{ emoji: "❤️", xOff: -10, delay: 3, drift: 135 },
			{ emoji: "💯", xOff: 14, delay: 5, drift: 110 },
		],
	},
	{
		start: 370,
		items: [
			{ emoji: "😂", xOff: -6, delay: 0, drift: 130 },
			{ emoji: "🔥", xOff: 18, delay: 4, drift: 145 },
			{ emoji: "❤️", xOff: -14, delay: 2, drift: 115 },
			{ emoji: "💯", xOff: 8, delay: 6, drift: 140 },
		],
	},
	{
		start: 390,
		items: [
			{ emoji: "🔥", xOff: -4, delay: 0, drift: 125 },
			{ emoji: "❤️", xOff: 12, delay: 3, drift: 140 },
			{ emoji: "😂", xOff: -18, delay: 6, drift: 110 },
		],
	},
];

// ─── Heatmap hotspot data ─────────────────────────────────────────────────────

const HEATMAP_HOTSPOTS = [
	{ position: 0.15, intensity: 0.3 },
	{ position: 0.32, intensity: 0.6 },
	{ position: 0.48, intensity: 0.45 },
	{ position: 0.62, intensity: 1.0 },
	{ position: 0.75, intensity: 0.5 },
	{ position: 0.88, intensity: 0.35 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════════

export const SocialDemo: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// ── Loop crossfade (last 30 frames → first 30 frames) ────────────────
	const loopFadeOut = interpolate(frame, [390, 420], [1, 0], clamp);
	const loopFadeIn = interpolate(frame, [0, 30], [0, 1], clamp);
	const globalOpacity = frame <= 30 ? loopFadeIn : frame >= 390 ? loopFadeOut : 1;

	// ── Phone device constants ───────────────────────────────────────────
	const phoneW = 280;
	const phoneH = 520;
	const phoneScale = spring({
		frame,
		fps,
		config: { damping: 14, stiffness: 100, mass: 1 },
	});

	// ── Video progress bar (already mid-play, starts at ~35%) ────────────
	const progressPct = interpolate(frame, [0, 420], [35, 85], clamp);

	// ── Reaction counter ─────────────────────────────────────────────────
	const reactionBase = 2400;
	const reactionIncrement =
		frame < 30
			? 0
			: frame < 90
				? interpolate(frame, [30, 90], [0, 87], clamp)
				: 87;
	const reactionCount = Math.floor(reactionBase + reactionIncrement);
	const reactionCounterOpacity = interpolate(frame, [30, 40], [0, 1], clamp);

	// ── Comment input bar (frames 165-210) ───────────────────────────────
	const inputBarY = interpolate(frame, [165, 180], [60, 0], clamp);
	const inputBarOpacity = interpolate(frame, [165, 180], [0, 1], clamp);
	const inputFadeOut = interpolate(frame, [205, 215], [1, 0], clamp);
	const typingText = "Best episode yet 🎬";
	const placeholderText = "Type a comment...";
	const typedInput =
		frame >= 185
			? typewriter(typingText, frame, 185, 2)
			: "";
	const sendGlow =
		typedInput.length >= typingText.length
			? 0.6 + 0.3 * Math.sin((frame - 210) * 0.2)
			: 0;

	// ── Heatmap (frames 210-270) ─────────────────────────────────────────
	const heatmapOpacity = interpolate(frame, [210, 225], [0, 1], clamp) *
		interpolate(frame, [260, 275], [1, 0], clamp);
	const tooltipOpacity = interpolate(frame, [235, 245], [0, 1], clamp) *
		interpolate(frame, [260, 270], [1, 0], clamp);
	const tooltipScale = spring({
		frame: Math.max(0, frame - 235),
		fps,
		config: { damping: 12, stiffness: 140 },
	});

	// ── Community stats (frames 270-345) ─────────────────────────────────
	const statsData = [
		{ label: "384 comments", delay: 275, glow: "rgba(138,180,255,0.3)" },
		{ label: "2.4K reactions", delay: 290, glow: "rgba(224,184,0,0.3)" },
		{ label: "89 viewers right now", delay: 305, glow: "rgba(80,224,120,0.3)" },
	];
	const statsFadeOut = interpolate(frame, [335, 350], [1, 0], clamp);

	// ═════════════════════════════════════════════════════════════════════
	// RENDER
	// ═════════════════════════════════════════════════════════════════════
	return (
		<AbsoluteFill
			style={{
				backgroundColor: CINEMA_BLACK,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
				opacity: globalOpacity,
			}}
		>
			{/* ── Phone Device ─────────────────────────────────────────── */}
			<div
				style={{
					width: phoneW,
					height: phoneH,
					borderRadius: 32,
					background: `linear-gradient(170deg, ${SURFACE_DARK} 0%, #0d0d1a 100%)`,
					border: `1.5px solid ${SURFACE_LIGHT}`,
					overflow: "hidden",
					position: "relative",
					display: "flex",
					flexDirection: "column",
					boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)`,
					transform: `scale(${phoneScale})`,
				}}
			>
				{/* Notch */}
				<div
					style={{
						position: "absolute",
						top: 0,
						left: "50%",
						transform: "translateX(-50%)",
						width: 90,
						height: 22,
						borderRadius: "0 0 14px 14px",
						backgroundColor: CINEMA_BLACK,
						zIndex: 20,
					}}
				/>

				{/* ── Video area ──────────────────────────────────────── */}
				<div
					style={{
						flex: 1,
						position: "relative",
						overflow: "hidden",
					}}
				>
					{/* Video background */}
					<Video
						src={staticFile("videos/demo-aegis-protocol.mp4")}
						style={{
							position: "absolute",
							inset: -10,
							width: "calc(100% + 20px)",
							height: "calc(100% + 20px)",
							objectFit: "cover",
							objectPosition: "center top",
						}}
						volume={0}
						muted
						loop
					/>

					{/* Cinematic gradient overlay */}
					<div
						style={{
							position: "absolute",
							inset: 0,
							background: `linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 40%, rgba(0,0,0,0.5) 100%)`,
							zIndex: 2,
						}}
					/>

					{/* Episode title overlay */}
					<div
						style={{
							position: "absolute",
							top: 32,
							left: 14,
							zIndex: 5,
							fontSize: 11,
							fontWeight: 700,
							color: "rgba(255,255,255,0.8)",
							letterSpacing: 1.2,
						}}
					>
						ORBITAL BREACH
					</div>
					<div
						style={{
							position: "absolute",
							top: 46,
							left: 14,
							zIndex: 5,
							fontSize: 9,
							color: "rgba(255,255,255,0.45)",
						}}
					>
						S1 &middot; E5 — "Cascade"
					</div>

					{/* ── Emoji reactions (frames 30-90 + loop 345-420) ── */}
					{[...EMOJI_WAVES, ...LOOP_EMOJI_WAVES].map((wave, wIdx) =>
						wave.items.map((item, iIdx) => {
							const emojiStart = wave.start + item.delay;
							const emojiLife = 25;
							const localFrame = frame - emojiStart;
							if (localFrame < -2 || localFrame > emojiLife + 10) return null;

							const entryScale = spring({
								frame: Math.max(0, localFrame),
								fps,
								config: { damping: 8, stiffness: 200, mass: 0.6 },
							});
							const yDrift = interpolate(
								frame,
								[emojiStart, emojiStart + emojiLife],
								[0, -item.drift],
								clamp,
							);
							const fadeOut = interpolate(
								frame,
								[emojiStart + emojiLife - 8, emojiStart + emojiLife],
								[1, 0],
								clamp,
							);
							const fadeIn = interpolate(
								frame,
								[emojiStart, emojiStart + 3],
								[0, 1],
								clamp,
							);

							return (
								<div
									key={`emoji-${wIdx}-${iIdx}`}
									style={{
										position: "absolute",
										right: 24 + item.xOff,
										bottom: 60,
										transform: `translateY(${yDrift}px) scale(${entryScale})`,
										opacity: fadeIn * fadeOut,
										fontSize: 24,
										zIndex: 15,
										pointerEvents: "none",
									}}
								>
									{item.emoji}
								</div>
							);
						}),
					)}

					{/* Reaction counter pill */}
					<div
						style={{
							position: "absolute",
							right: 12,
							bottom: 34,
							zIndex: 15,
							opacity: reactionCounterOpacity,
							display: "flex",
							alignItems: "center",
							gap: 4,
							backgroundColor: "rgba(255,255,255,0.06)",
							border: "1px solid rgba(255,255,255,0.1)",
							backdropFilter: "blur(8px)",
							borderRadius: 16,
							padding: "4px 10px",
						}}
					>
						<span style={{ fontSize: 12 }}>🔥</span>
						<span
							style={{
								fontSize: 11,
								fontWeight: 700,
								color: "#fff",
							}}
						>
							{reactionCount >= 1000
								? `${(reactionCount / 1000).toFixed(1)}K`
								: reactionCount}
						</span>
					</div>

					{/* ── Timestamped comments (frames 90-165) ──────── */}
					{COMMENTS.map((comment, cIdx) => {
						const slideIn = interpolate(
							frame,
							[comment.startFrame, comment.startFrame + 15],
							[280, 0],
							clamp,
						);
						const commentOpacity = interpolate(
							frame,
							[comment.startFrame, comment.startFrame + 10],
							[0, 1],
							clamp,
						) * interpolate(
							frame,
							[comment.startFrame + 55, comment.startFrame + 70],
							[1, 0],
							clamp,
						);
						const commentScale = spring({
							frame: Math.max(0, frame - comment.startFrame),
							fps,
							config: { damping: 14, stiffness: 120 },
						});

						if (commentOpacity <= 0) return null;

						return (
							<div
								key={`comment-${cIdx}`}
								style={{
									position: "absolute",
									left: 10,
									right: 10,
									bottom: 70 + cIdx * 4,
									transform: `translateX(${slideIn}px) scale(${commentScale})`,
									opacity: commentOpacity,
									zIndex: 10 + cIdx,
									display: "flex",
									alignItems: "flex-start",
									gap: 8,
									backgroundColor: "rgba(255,255,255,0.06)",
									border: "1px solid rgba(255,255,255,0.1)",
									backdropFilter: "blur(12px)",
									borderRadius: 12,
									padding: "8px 10px",
								}}
							>
								{/* Avatar circle */}
								<div
									style={{
										width: 28,
										height: 28,
										borderRadius: 14,
										backgroundColor: comment.color,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										flexShrink: 0,
										fontSize: 10,
										fontWeight: 700,
										color: "#fff",
									}}
								>
									{comment.user}
								</div>
								<div style={{ flex: 1, minWidth: 0 }}>
									{/* Timestamp badge */}
									<div
										style={{
											display: "inline-block",
											backgroundColor: "rgba(224,184,0,0.15)",
											borderRadius: 4,
											padding: "1px 6px",
											marginBottom: 3,
										}}
									>
										<span
											style={{
												fontSize: 9,
												fontWeight: 700,
												color: BRAND_YELLOW,
											}}
										>
											{comment.timestamp}
										</span>
									</div>
									<div
										style={{
											fontSize: 11,
											color: "#ddd",
											fontWeight: 500,
											lineHeight: 1.3,
										}}
									>
										{comment.text}
									</div>
								</div>
							</div>
						);
					})}

					{/* ── Comment input bar (frames 165-210) ─────────── */}
					{frame >= 165 && frame <= 220 && (
						<div
							style={{
								position: "absolute",
								left: 8,
								right: 8,
								bottom: 8,
								zIndex: 18,
								opacity: inputBarOpacity * inputFadeOut,
								transform: `translateY(${inputBarY}px)`,
								display: "flex",
								alignItems: "center",
								gap: 8,
								backgroundColor: "rgba(255,255,255,0.06)",
								border: "1px solid rgba(255,255,255,0.1)",
								backdropFilter: "blur(12px)",
								borderRadius: 20,
								padding: "8px 10px 8px 14px",
							}}
						>
							<span
								style={{
									flex: 1,
									fontSize: 11,
									color: typedInput ? "#fff" : "#666",
									fontWeight: 400,
								}}
							>
								{typedInput || placeholderText}
								{frame >= 175 && frame < 210 && Math.floor(frame / 8) % 2 === 0 && (
									<span style={{ color: BRAND_YELLOW, fontWeight: 300 }}>|</span>
								)}
							</span>
							{/* Send button */}
							<div
								style={{
									width: 28,
									height: 28,
									borderRadius: 14,
									backgroundColor:
										typedInput.length > 0
											? BRAND_YELLOW
											: SURFACE_LIGHT,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									boxShadow:
										sendGlow > 0
											? `0 0 ${12 * sendGlow}px rgba(224,184,0,${sendGlow})`
											: "none",
								}}
							>
								{/* Arrow icon */}
								<div
									style={{
										width: 0,
										height: 0,
										borderLeft: "8px solid transparent",
										borderRight: "8px solid transparent",
										borderBottom: `10px solid ${
											typedInput.length > 0 ? CINEMA_BLACK : "#666"
										}`,
										transform: "rotate(0deg)",
										marginBottom: 1,
									}}
								/>
							</div>
						</div>
					)}

					{/* Progress bar at bottom of video area */}
					<div
						style={{
							position: "absolute",
							left: 0,
							right: 0,
							bottom: 0,
							height: 3,
							backgroundColor: "rgba(255,255,255,0.1)",
							zIndex: 5,
						}}
					>
						<div
							style={{
								height: "100%",
								width: `${progressPct}%`,
								backgroundColor: BRAND_YELLOW,
								borderRadius: 2,
								boxShadow: `0 0 6px rgba(224,184,0,0.4)`,
							}}
						/>
					</div>
				</div>

				{/* ── Bottom area below video ──────────────────────────── */}
				<div
					style={{
						padding: "12px 14px 16px",
						position: "relative",
						zIndex: 5,
					}}
				>
					{/* ── Reaction heatmap (frames 210-270) ───────────── */}
					{frame >= 210 && frame <= 275 && (
						<div
							style={{
								opacity: heatmapOpacity,
								marginBottom: 10,
							}}
						>
							<div
								style={{
									fontSize: 9,
									fontWeight: 600,
									color: "#888",
									textTransform: "uppercase",
									letterSpacing: 1,
									marginBottom: 6,
								}}
							>
								Reaction Timeline
							</div>
							{/* Heatmap bar */}
							<div
								style={{
									position: "relative",
									height: 20,
									borderRadius: 4,
									backgroundColor: SURFACE_DARK,
									overflow: "visible",
								}}
							>
								{/* Hotspot bars */}
								{HEATMAP_HOTSPOTS.map((spot, sIdx) => {
									const barAppear = interpolate(
										frame,
										[215 + sIdx * 3, 220 + sIdx * 3],
										[0, spot.intensity],
										clamp,
									);
									return (
										<div
											key={`hotspot-${sIdx}`}
											style={{
												position: "absolute",
												left: `${spot.position * 100}%`,
												bottom: 0,
												width: 16,
												height: `${barAppear * 100}%`,
												borderRadius: 2,
												backgroundColor: BRAND_YELLOW,
												opacity: 0.5 + spot.intensity * 0.5,
												transform: "translateX(-50%)",
												boxShadow:
													spot.intensity > 0.8
														? `0 0 8px rgba(224,184,0,${0.3 + 0.2 * Math.sin(frame * 0.15)})`
														: "none",
											}}
										/>
									);
								})}

								{/* "Most reacted moment" tooltip at peak hotspot */}
								<div
									style={{
										position: "absolute",
										left: "62%",
										bottom: 24,
										transform: `translateX(-50%) scale(${tooltipScale})`,
										opacity: tooltipOpacity,
										backgroundColor: "rgba(255,255,255,0.06)",
										border: "1px solid rgba(255,255,255,0.1)",
										backdropFilter: "blur(8px)",
										borderRadius: 6,
										padding: "3px 8px",
										whiteSpace: "nowrap",
									}}
								>
									<span
										style={{
											fontSize: 8,
											fontWeight: 600,
											color: BRAND_YELLOW,
										}}
									>
										Most reacted moment
									</span>
									{/* Tooltip arrow */}
									<div
										style={{
											position: "absolute",
											bottom: -4,
											left: "50%",
											transform: "translateX(-50%)",
											width: 0,
											height: 0,
											borderLeft: "4px solid transparent",
											borderRight: "4px solid transparent",
											borderTop: "4px solid rgba(255,255,255,0.1)",
										}}
									/>
								</div>
							</div>
						</div>
					)}

					{/* ── Community stats (frames 270-345) ────────────── */}
					{frame >= 270 && frame <= 355 && (
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: 8,
								opacity: statsFadeOut,
							}}
						>
							{statsData.map((stat, sIdx) => {
								const pillScale = spring({
									frame: Math.max(0, frame - stat.delay),
									fps,
									config: { damping: 12, stiffness: 140 },
								});
								const pillOpacity = interpolate(
									frame,
									[stat.delay, stat.delay + 12],
									[0, 1],
									clamp,
								);
								const pillY = interpolate(
									frame,
									[stat.delay, stat.delay + 18],
									[20, 0],
									clamp,
								);
								const glowPulse =
									0.4 + 0.2 * Math.sin((frame - stat.delay) * 0.1);

								return (
									<div
										key={`stat-${sIdx}`}
										style={{
											opacity: pillOpacity,
											transform: `translateY(${pillY}px) scale(${pillScale})`,
											display: "flex",
											alignItems: "center",
											gap: 8,
											backgroundColor: "rgba(255,255,255,0.06)",
											border: "1px solid rgba(255,255,255,0.1)",
											backdropFilter: "blur(8px)",
											borderRadius: 20,
											padding: "8px 14px",
											boxShadow: `0 0 ${10 * glowPulse}px ${stat.glow}`,
										}}
									>
										{/* Indicator dot */}
										<div
											style={{
												width: 6,
												height: 6,
												borderRadius: 3,
												backgroundColor:
													sIdx === 0
														? "#8ab4ff"
														: sIdx === 1
															? BRAND_YELLOW
															: "#50e078",
												boxShadow: `0 0 6px ${stat.glow}`,
											}}
										/>
										<span
											style={{
												fontSize: 12,
												fontWeight: 600,
												color: "#fff",
											}}
										>
											{stat.label}
										</span>
									</div>
								);
							})}
						</div>
					)}

					{/* Default bottom bar (engagement icons) — shown when no overlay */}
					{frame < 210 && (
						<div
							style={{
								display: "flex",
								gap: 16,
								alignItems: "center",
								opacity: interpolate(frame, [0, 15], [0.6, 1], clamp),
							}}
						>
							{/* Heart */}
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: 5,
									fontSize: 11,
									color: "#ccc",
								}}
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
									<path
										d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
										fill="#e05050"
									/>
								</svg>
								<span>
									{reactionCount >= 1000
										? `${(reactionCount / 1000).toFixed(1)}K`
										: reactionCount}
								</span>
							</div>
							{/* Comments */}
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: 5,
									fontSize: 11,
									color: "#ccc",
								}}
							>
								<svg width="15" height="15" viewBox="0 0 24 24" fill="none">
									<path
										d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
										stroke="#aaa"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
								<span>384</span>
							</div>
							{/* Share */}
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: 5,
									fontSize: 11,
									color: "#ccc",
								}}
							>
								<svg width="15" height="15" viewBox="0 0 24 24" fill="none">
									<path
										d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"
										stroke="#aaa"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
								<span>Share</span>
							</div>
						</div>
					)}

					{/* Bottom bar for phases 275+ (when stats are showing) */}
					{frame >= 275 && frame < 345 && (
						<div
							style={{
								marginTop: 8,
								display: "flex",
								gap: 16,
								alignItems: "center",
								opacity: statsFadeOut * 0.5,
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: 5,
									fontSize: 11,
									color: "#ccc",
								}}
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
									<path
										d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
										fill="#e05050"
									/>
								</svg>
								<span>2.5K</span>
							</div>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: 5,
									fontSize: 11,
									color: "#ccc",
								}}
							>
								<svg width="15" height="15" viewBox="0 0 24 24" fill="none">
									<path
										d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
										stroke="#aaa"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
								<span>384</span>
							</div>
						</div>
					)}

					{/* Loop phase bottom bar (345-420) */}
					{frame >= 345 && (
						<div
							style={{
								display: "flex",
								gap: 16,
								alignItems: "center",
								opacity: loopFadeOut * 0.8,
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: 5,
									fontSize: 11,
									color: "#ccc",
								}}
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
									<path
										d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
										fill="#e05050"
									/>
								</svg>
								<span>2.5K</span>
							</div>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: 5,
									fontSize: 11,
									color: "#ccc",
								}}
							>
								<svg width="15" height="15" viewBox="0 0 24 24" fill="none">
									<path
										d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
										stroke="#aaa"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
								<span>384</span>
							</div>
						</div>
					)}
				</div>
			</div>
		</AbsoluteFill>
	);
};

export default SocialDemo;
