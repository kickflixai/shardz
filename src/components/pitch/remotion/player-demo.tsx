import {
	AbsoluteFill,
	Img,
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

// Particle field configuration
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
	x: ((i * 137.5) % 400) / 400, // golden-angle spread
	y: ((i * 97.3) % 700) / 700,
	size: 1.5 + (i % 4) * 0.8,
	speedX: 0.008 + (i % 5) * 0.004,
	speedY: 0.005 + (i % 3) * 0.003,
	phase: (i * 1.7) % (Math.PI * 2),
	opacity: 0.15 + (i % 4) * 0.1,
}));

// Genre montage configuration
const GENRES = [
	{ label: "Sci-Fi", color: "#4a9eff", bg: "#0a1a3e", episodes: 16, video: "videos/demo-neon-divide.mp4" },
	{ label: "Thriller", color: "#ff4a6a", bg: "#2a0a0e", episodes: 12, video: "videos/demo-dead-drop.mp4" },
	{ label: "Comedy", color: "#4aff8a", bg: "#0a2a16", episodes: 10, video: "videos/demo-office-hours.mp4" },
];

export const PlayerDemo: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// ── Loop crossfade: last 30 frames blend with first 30 frames ────
	const loopFadeOut = interpolate(frame, [510, 540], [1, 0], clamp);
	const loopFadeIn = interpolate(frame, [0, 30], [0, 1], clamp);
	const globalOpacity = frame >= 510 ? loopFadeOut : loopFadeIn < 1 ? loopFadeIn : 1;

	// ── Particle field (always present) ──────────────────────────────
	const renderParticles = () =>
		PARTICLES.map((p, i) => {
			const px = p.x * 400 + Math.sin(frame * p.speedX + p.phase) * 30;
			const py = p.y * 700 + Math.sin(frame * p.speedY + p.phase * 1.3) * 25;
			const pOpacity =
				p.opacity * interpolate(frame, [0, 20], [0, 1], clamp);
			return (
				<div
					key={i}
					style={{
						position: "absolute",
						left: px,
						top: py,
						width: p.size,
						height: p.size,
						borderRadius: "50%",
						backgroundColor: i % 3 === 0 ? BRAND_YELLOW : "#ffffff",
						opacity: pOpacity * (0.6 + 0.4 * Math.sin(frame * 0.04 + p.phase)),
						pointerEvents: "none",
					}}
				/>
			);
		});

	// ═══════════════════════════════════════════════════════════════════
	// PHASE 1 — Phone slides in (frames 0-30)
	// ═══════════════════════════════════════════════════════════════════
	const phoneSlideY = spring({
		frame,
		fps,
		config: { damping: 13, stiffness: 100, mass: 1 },
	});
	const phoneEntryY = interpolate(phoneSlideY, [0, 1], [120, 0], clamp);
	const phoneEntryOpacity = interpolate(frame, [0, 15], [0, 1], clamp);

	// Thumbnail fade + ken-burns
	const thumbOpacity = interpolate(frame, [10, 25], [0, 1], clamp);
	const kenBurnsX = interpolate(frame, [10, 120], [0, -6], clamp);
	const kenBurnsY = interpolate(frame, [10, 120], [0, -3], clamp);
	const kenBurnsScale = interpolate(frame, [10, 120], [1.05, 1.12], clamp);

	// ═══════════════════════════════════════════════════════════════════
	// PHASE 2 — Play button + title (frames 30-60)
	// ═══════════════════════════════════════════════════════════════════
	const playBtnScale = spring({
		frame: Math.max(0, frame - 30),
		fps,
		config: { damping: 8, stiffness: 180, mass: 0.8 },
	});
	const playBtnOpacity = interpolate(frame, [30, 40], [0, 1], clamp);
	const glowPulse =
		frame >= 30 ? 0.4 + 0.2 * Math.sin((frame - 30) * 0.12) : 0;

	// Ripple
	const rippleScale = interpolate(frame, [35, 55], [0.5, 2.5], clamp);
	const rippleOpacity = interpolate(frame, [35, 55], [0.6, 0], clamp);

	// Tap: play button shrinks at frame ~50
	const playShrink = interpolate(frame, [48, 60], [1, 0], clamp);

	// Title typewriter
	const titleText = "ORBITAL BREACH";
	const typedTitle = typewriter(titleText, frame, 38, 1.5);
	const titleOpacity = interpolate(frame, [38, 43], [0, 1], clamp);
	const cursorBlink =
		frame >= 38 && frame < 38 + titleText.length * 1.5 + 15
			? Math.sin(frame * 0.3) > 0
				? 1
				: 0
			: 0;

	// Progress bar appears
	const progressBarOpacity = interpolate(frame, [55, 65], [0, 1], clamp);

	// ═══════════════════════════════════════════════════════════════════
	// PHASE 3 — Video playing (frames 60-120)
	// ═══════════════════════════════════════════════════════════════════
	const progressWidth = interpolate(frame, [60, 120], [0, 100], clamp);
	const progressGlow =
		frame >= 60 ? 0.4 + 0.3 * Math.sin(frame * 0.08) : 0;

	// Timestamp ticking
	const elapsedSeconds = interpolate(frame, [60, 120], [0, 120], clamp);
	const timeMin = Math.floor(elapsedSeconds / 60);
	const timeSec = Math.floor(elapsedSeconds % 60);
	const timeStr = `${timeMin}:${String(timeSec).padStart(2, "0")}`;

	// Episode info
	const episodeInfoOpacity = interpolate(frame, [65, 80], [0, 1], clamp);
	const episodeInfoY = interpolate(frame, [65, 80], [8, 0], clamp);

	// Ambient light sweep across phone
	const sweepPos = interpolate(frame, [60, 120], [-20, 120], clamp);

	// ═══════════════════════════════════════════════════════════════════
	// PHASE 4 — Episode completes, "Up Next" card (frames 120-180)
	// ═══════════════════════════════════════════════════════════════════
	const nextEpSlideY = interpolate(frame, [125, 150], [80, 0], clamp);
	const nextEpOpacity = interpolate(frame, [125, 145], [0, 1], clamp);
	const nextEpScale = spring({
		frame: Math.max(0, frame - 125),
		fps,
		config: { damping: 14, stiffness: 100 },
	});

	// Countdown timer: 3 -> 2 -> 1
	const countdownValue =
		frame < 140 ? 3 : frame < 155 ? 2 : frame < 170 ? 1 : 0;
	const countdownOpacity = interpolate(frame, [130, 140], [0, 1], clamp);

	// ═══════════════════════════════════════════════════════════════════
	// PHASE 5 — Next episode auto-starts (frames 180-240)
	// ═══════════════════════════════════════════════════════════════════
	// Cross-fade thumbnail: old fades out, new appears
	const thumbCrossFade = interpolate(frame, [175, 195], [0, 1], clamp);
	// Progress resets
	const newProgressWidth = interpolate(frame, [195, 240], [0, 30], clamp);
	// Genre badge pops
	const genreBadgeScale = spring({
		frame: Math.max(0, frame - 200),
		fps,
		config: { damping: 8, stiffness: 200 },
	});
	const genreBadgeOpacity = interpolate(frame, [200, 210], [0, 1], clamp);

	// Next-ep card fades out
	const nextEpFadeOut = interpolate(frame, [170, 185], [1, 0], clamp);

	// ═══════════════════════════════════════════════════════════════════
	// PHASE 6 — Genre montage (frames 240-420)
	// ═══════════════════════════════════════════════════════════════════
	// Each genre gets 60 frames (~2 seconds)
	const genreIndex =
		frame < 300 ? 0 : frame < 360 ? 1 : 2;
	const genreLocalFrame =
		frame < 300
			? frame - 240
			: frame < 360
				? frame - 300
				: frame - 360;
	const genreEntryOpacity = interpolate(genreLocalFrame, [0, 12], [0, 1], clamp);
	const genreExitOpacity = interpolate(genreLocalFrame, [48, 60], [1, 0], clamp);
	const genreOpacity =
		frame >= 240 && frame < 420
			? Math.min(genreEntryOpacity, genreExitOpacity)
			: 0;
	const genrePillScale = spring({
		frame: Math.max(0, genreLocalFrame - 5),
		fps,
		config: { damping: 10, stiffness: 200 },
	});

	// Phase 5 genre badge fades out when montage starts
	const phase5FadeOut = interpolate(frame, [235, 245], [1, 0], clamp);

	// After montage ends, bring Orbital Breach video back
	const postMontageFadeIn = interpolate(frame, [415, 430], [0, 1], clamp);

	// ═══════════════════════════════════════════════════════════════════
	// PHASE 7 — Stats orbit (frames 420-490)
	// ═══════════════════════════════════════════════════════════════════
	const phoneScaleDown = interpolate(frame, [420, 445], [1, 0.78], clamp);
	const phoneScaleBackUp = interpolate(frame, [490, 520], [0.78, 1], clamp);
	const effectivePhoneScale =
		frame < 420 ? 1 : frame < 490 ? phoneScaleDown : phoneScaleBackUp;

	const statLabels = ["2-min episodes", "16 eps/season", "11 genres"];
	const statAnims = statLabels.map((_, i) => {
		const delay = 430 + i * 18;
		const s = spring({
			frame: Math.max(0, frame - delay),
			fps,
			config: { damping: 12, stiffness: 120 },
		});
		const o = interpolate(
			frame,
			[delay, delay + 12, 485, 505],
			[0, 1, 1, 0],
			clamp,
		);
		// Orbit around phone
		const angle =
			(i * ((Math.PI * 2) / 3)) + (frame - 430) * 0.02;
		const orbitX = Math.cos(angle) * 140;
		const orbitY = Math.sin(angle) * 60 - 40;
		return { scale: s, opacity: o, x: orbitX, y: orbitY };
	});

	// ═══════════════════════════════════════════════════════════════════
	// PHASE 8 — Loop transition (frames 490-540)
	// ═══════════════════════════════════════════════════════════════════
	// Stats fade handled above; phone scales back up (handled above)
	// The globalOpacity crossfade handles the seamless loop

	// ── Shimmer effect (diagonal gradient sweep) ─────────────────────
	const shimmerPos = interpolate(
		frame,
		[0, 540],
		[-100, 500],
		clamp,
	);

	// ═══════════════════════════════════════════════════════════════════
	// RENDER
	// ═══════════════════════════════════════════════════════════════════

	// Determine which thumbnail to show based on phase
	const showNewThumb = frame >= 180;
	// During montage, show genre videos instead
	const inMontage = frame >= 240 && frame < 420;
	// Determine progress width to display
	const displayProgress =
		frame < 120
			? progressWidth
			: frame < 180
				? 100
				: frame < 240
					? newProgressWidth
					: frame < 420
						? interpolate(genreLocalFrame, [0, 55], [0, 40], clamp)
						: interpolate(frame, [420, 490], [0, 25], clamp);

	// Determine title to show
	const displayTitle =
		frame < 180
			? typedTitle
			: frame < 240
				? "SIGNAL LOST"
				: frame < 300
					? GENRES[0].label.toUpperCase()
					: frame < 360
						? GENRES[1].label.toUpperCase()
						: frame < 420
							? GENRES[2].label.toUpperCase()
							: "ORBITAL BREACH";

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
				overflow: "hidden",
			}}
		>
			{/* ── Particle field ──────────────────────────────────────── */}
			{renderParticles()}

			{/* ── Phone Device ────────────────────────────────────────── */}
			<div
				style={{
					opacity: phoneEntryOpacity,
					transform: `translateY(${phoneEntryY}px) scale(${effectivePhoneScale})`,
					width: 240,
					height: 460,
					borderRadius: 28,
					background: `linear-gradient(170deg, ${SURFACE_DARK} 0%, #0d0d1a 100%)`,
					border: `1.5px solid ${SURFACE_LIGHT}`,
					overflow: "hidden",
					position: "relative",
					display: "flex",
					flexDirection: "column",
					boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)`,
				}}
			>
				{/* Notch */}
				<div
					style={{
						position: "absolute",
						top: 0,
						left: "50%",
						transform: "translateX(-50%)",
						width: 76,
						height: 20,
						borderRadius: "0 0 12px 12px",
						backgroundColor: CINEMA_BLACK,
						zIndex: 20,
					}}
				/>

				{/* ── Video Area ─────────────────────────────────────── */}
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
					{/* Video playing (original episode — Orbital Breach) */}
					{!inMontage && (
						<Video
							src={staticFile("videos/demo-orbital-breach.mp4")}
							style={{
								position: "absolute",
								inset: -10,
								width: "calc(100% + 20px)",
								height: "calc(100% + 20px)",
								objectFit: "cover",
								objectPosition: "center top",
								opacity:
									frame >= 420
										? postMontageFadeIn
										: showNewThumb
											? thumbOpacity * (1 - thumbCrossFade) * phase5FadeOut
											: thumbOpacity,
								transform: `translate(${kenBurnsX}px, ${kenBurnsY}px) scale(${kenBurnsScale})`,
							}}
							volume={0}
							muted
							loop
						/>
					)}

					{/* Video cross-fade (phase 5 — Signal Lost) */}
					{showNewThumb && !inMontage && frame < 420 && (
						<Video
							src={staticFile("videos/demo-signal-lost.mp4")}
							style={{
								position: "absolute",
								inset: -10,
								width: "calc(100% + 20px)",
								height: "calc(100% + 20px)",
								objectFit: "cover",
								objectPosition: "center top",
								opacity: thumbCrossFade * phase5FadeOut,
								transform: `translate(${interpolate(frame, [180, 240], [0, -4], clamp)}px, ${interpolate(frame, [180, 240], [0, -2], clamp)}px) scale(${interpolate(frame, [180, 240], [1.04, 1.1], clamp)})`,
							}}
							volume={0}
							muted
							loop
						/>
					)}

					{/* Genre videos during montage */}
					{inMontage && (
						<>
							<Video
								src={staticFile(GENRES[genreIndex].video)}
								style={{
									position: "absolute",
									inset: -10,
									width: "calc(100% + 20px)",
									height: "calc(100% + 20px)",
									objectFit: "cover",
									objectPosition: "center top",
									opacity: genreOpacity,
								}}
								volume={0}
								muted
							/>
							{/* Genre color overlay */}
							<div
								style={{
									position: "absolute",
									inset: 0,
									background: `linear-gradient(180deg, ${GENRES[genreIndex].bg}88 0%, transparent 40%, ${GENRES[genreIndex].bg}aa 100%)`,
									opacity: genreOpacity,
								}}
							/>
						</>
					)}

					{/* Cinematic gradient overlay */}
					<div
						style={{
							position: "absolute",
							inset: 0,
							background:
								"linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)",
							zIndex: 2,
						}}
					/>

					{/* Ambient light sweep */}
					<div
						style={{
							position: "absolute",
							inset: 0,
							background: `linear-gradient(90deg, transparent ${sweepPos - 30}%, rgba(255,255,255,0.06) ${sweepPos}%, transparent ${sweepPos + 30}%)`,
							zIndex: 3,
							opacity: interpolate(frame, [60, 75, 110, 120], [0, 1, 1, 0], clamp),
						}}
					/>

					{/* Shimmer overlay */}
					<div
						style={{
							position: "absolute",
							inset: 0,
							background: `linear-gradient(135deg, transparent ${shimmerPos - 40}%, rgba(255,255,255,0.03) ${shimmerPos - 20}%, rgba(255,255,255,0.06) ${shimmerPos}%, rgba(255,255,255,0.03) ${shimmerPos + 20}%, transparent ${shimmerPos + 40}%)`,
							zIndex: 4,
							pointerEvents: "none",
						}}
					/>

					{/* Play button + ripple (frames 30-60) */}
					{frame >= 30 && frame < 65 && (
						<div
							style={{
								position: "absolute",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								zIndex: 10,
							}}
						>
							{/* Ripple ring */}
							<div
								style={{
									position: "absolute",
									width: 56,
									height: 56,
									borderRadius: 28,
									border: `2px solid ${BRAND_YELLOW}`,
									opacity: rippleOpacity,
									transform: `scale(${rippleScale})`,
								}}
							/>
							{/* Button */}
							<div
								style={{
									opacity: playBtnOpacity * playShrink,
									transform: `scale(${playBtnScale * playShrink})`,
									width: 56,
									height: 56,
									borderRadius: 28,
									backgroundColor: BRAND_YELLOW,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									boxShadow: `0 0 ${24 + glowPulse * 16}px rgba(224,184,0,${glowPulse})`,
								}}
							>
								<div
									style={{
										width: 0,
										height: 0,
										borderLeft: `20px solid ${CINEMA_BLACK}`,
										borderTop: "12px solid transparent",
										borderBottom: "12px solid transparent",
										marginLeft: 4,
									}}
								/>
							</div>
						</div>
					)}

					{/* Genre pill during montage */}
					{inMontage && (
						<div
							style={{
								position: "absolute",
								top: 32,
								right: 12,
								zIndex: 15,
								transform: `scale(${genrePillScale})`,
								opacity: genreOpacity,
							}}
						>
							<div
								style={{
									padding: "4px 12px",
									borderRadius: 12,
									backgroundColor: GENRES[genreIndex].color + "22",
									border: `1px solid ${GENRES[genreIndex].color}44`,
									fontSize: 10,
									fontWeight: 700,
									color: GENRES[genreIndex].color,
									letterSpacing: 1,
									textTransform: "uppercase",
								}}
							>
								{GENRES[genreIndex].label}
							</div>
						</div>
					)}

					{/* Episode count badge during montage */}
					{inMontage && (
						<div
							style={{
								position: "absolute",
								top: 32,
								left: 12,
								zIndex: 15,
								opacity: genreOpacity,
								transform: `scale(${genrePillScale})`,
							}}
						>
							<div
								style={{
									padding: "4px 8px",
									borderRadius: 8,
									backgroundColor: "rgba(255,255,255,0.06)",
									border: "1px solid rgba(255,255,255,0.1)",
									fontSize: 9,
									fontWeight: 600,
									color: "#ccc",
								}}
							>
								{GENRES[genreIndex].episodes} eps
							</div>
						</div>
					)}

					{/* Genre badge pop in phase 5 */}
					{frame >= 200 && frame < 240 && (
						<div
							style={{
								position: "absolute",
								top: 32,
								right: 12,
								zIndex: 15,
								transform: `scale(${genreBadgeScale})`,
								opacity: genreBadgeOpacity * phase5FadeOut,
							}}
						>
							<div
								style={{
									padding: "4px 12px",
									borderRadius: 12,
									backgroundColor: "rgba(74,158,255,0.15)",
									border: "1px solid rgba(74,158,255,0.3)",
									fontSize: 10,
									fontWeight: 700,
									color: "#4a9eff",
									letterSpacing: 1,
								}}
							>
								Sci-Fi
							</div>
						</div>
					)}

					{/* "Up Next" card overlay (frames 120-180) */}
					{frame >= 120 && frame < 185 && (
						<div
							style={{
								position: "absolute",
								bottom: 10,
								left: 10,
								right: 10,
								zIndex: 15,
								opacity: nextEpOpacity * nextEpFadeOut,
								transform: `translateY(${nextEpSlideY}px) scale(${nextEpScale})`,
							}}
						>
							<div
								style={{
									padding: "10px 12px",
									borderRadius: 12,
									backgroundColor: "rgba(255,255,255,0.06)",
									border: "1px solid rgba(255,255,255,0.1)",
									backdropFilter: "blur(12px)",
									display: "flex",
									alignItems: "center",
									gap: 10,
								}}
							>
								{/* Mini thumbnail */}
								<div
									style={{
										width: 42,
										height: 42,
										borderRadius: 6,
										backgroundColor: SURFACE_DARK,
										overflow: "hidden",
										flexShrink: 0,
									}}
								>
									<Img
										src={staticFile("thumbnails/mock-signal-lost.png")}
										style={{
											width: "100%",
											height: "100%",
											objectFit: "cover",
										}}
									/>
								</div>
								<div style={{ flex: 1, minWidth: 0 }}>
									<div
										style={{
											fontSize: 8,
											color: BRAND_YELLOW,
											fontWeight: 700,
											textTransform: "uppercase",
											letterSpacing: 1,
											marginBottom: 2,
										}}
									>
										Up Next
									</div>
									<div
										style={{
											fontSize: 11,
											color: "#eee",
											fontWeight: 600,
										}}
									>
										Signal Lost
									</div>
									<div style={{ fontSize: 8, color: "#777" }}>S1 E6</div>
								</div>
								{/* Countdown */}
								<div
									style={{
										opacity: countdownOpacity,
										width: 30,
										height: 30,
										borderRadius: 15,
										border: `2px solid ${BRAND_YELLOW}`,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										fontSize: 14,
										fontWeight: 700,
										color: BRAND_YELLOW,
										flexShrink: 0,
									}}
								>
									{countdownValue > 0 ? countdownValue : ""}
								</div>
							</div>
						</div>
					)}
				</div>

				{/* ── Bottom Info Area ───────────────────────────────── */}
				<div
					style={{
						padding: "10px 16px 14px",
						position: "relative",
						zIndex: 5,
					}}
				>
					{/* Title */}
					<div
						style={{
							opacity: frame < 38 ? 0 : titleOpacity,
							fontSize: 13,
							fontWeight: 700,
							color: "#ffffff",
							letterSpacing: 1.5,
							marginBottom: 2,
							minHeight: 18,
						}}
					>
						{frame < 180 ? typedTitle : displayTitle}
						{/* Blinking cursor */}
						{cursorBlink > 0 && (
							<span
								style={{
									opacity: cursorBlink,
									color: BRAND_YELLOW,
									fontWeight: 300,
								}}
							>
								|
							</span>
						)}
					</div>

					{/* Episode info */}
					{frame >= 65 && frame < 240 && (
						<div
							style={{
								opacity: episodeInfoOpacity * (frame >= 230 ? interpolate(frame, [230, 240], [1, 0], clamp) : 1),
								transform: `translateY(${episodeInfoY}px)`,
								fontSize: 10,
								color: "#888",
								marginBottom: 10,
								display: "flex",
								alignItems: "center",
								gap: 5,
							}}
						>
							<span style={{ color: BRAND_YELLOW, fontWeight: 600 }}>
								S1
							</span>
							<span style={{ color: "#555" }}>&#183;</span>
							<span>
								{frame < 180
									? 'E5 \u2014 "Cascade"'
									: 'E6 \u2014 "Signal Lost"'}
							</span>
							<span style={{ color: "#555" }}>&#183;</span>
							<span style={{ color: "#666" }}>2:00</span>
						</div>
					)}

					{/* Progress bar */}
					<div
						style={{
							opacity:
								frame < 55
									? 0
									: progressBarOpacity,
							height: 3,
							borderRadius: 2,
							backgroundColor: SURFACE_LIGHT,
							overflow: "visible",
							marginBottom: 6,
							position: "relative",
						}}
					>
						<div
							style={{
								height: "100%",
								width: `${displayProgress}%`,
								backgroundColor: BRAND_YELLOW,
								borderRadius: 2,
								position: "relative",
							}}
						>
							{/* Glow head */}
							{displayProgress > 3 && (
								<div
									style={{
										position: "absolute",
										right: -3,
										top: -3,
										width: 9,
										height: 9,
										borderRadius: "50%",
										backgroundColor: BRAND_YELLOW,
										boxShadow: `0 0 ${6 + progressGlow * 8}px rgba(224,184,0,${0.5 + progressGlow * 0.3})`,
									}}
								/>
							)}
						</div>
					</div>

					{/* Time display */}
					<div
						style={{
							opacity:
								frame < 55
									? 0
									: progressBarOpacity,
							display: "flex",
							justifyContent: "space-between",
							fontSize: 8,
							color: "#555",
						}}
					>
						<span>{frame >= 60 && frame < 180 ? timeStr : "0:00"}</span>
						<span>2:00</span>
					</div>
				</div>
			</div>

			{/* ── Floating Stat Pills (Phase 7, frames 420-510) ──────── */}
			{frame >= 425 && frame < 510 && (
				<>
					{statLabels.map((stat, i) => (
						<div
							key={stat}
							style={{
								position: "absolute",
								left: `calc(50% + ${statAnims[i].x}px)`,
								top: `calc(50% + ${statAnims[i].y}px)`,
								transform: `translate(-50%, -50%) scale(${statAnims[i].scale})`,
								opacity: statAnims[i].opacity,
								zIndex: 30,
							}}
						>
							<div
								style={{
									padding: "5px 12px",
									borderRadius: 20,
									backgroundColor: "rgba(255,255,255,0.06)",
									border: "1px solid rgba(255,255,255,0.1)",
									fontSize: 10,
									fontWeight: 600,
									color: "#ffffff",
									letterSpacing: 0.3,
									whiteSpace: "nowrap",
									display: "flex",
									alignItems: "center",
									gap: 5,
									boxShadow: `0 0 ${12 + 4 * Math.sin(frame * 0.06 + i)}px rgba(224,184,0,${0.1 + 0.05 * Math.sin(frame * 0.06 + i)})`,
								}}
							>
								<div
									style={{
										width: 5,
										height: 5,
										borderRadius: "50%",
										backgroundColor: BRAND_YELLOW,
										boxShadow: `0 0 4px ${BRAND_YELLOW}`,
									}}
								/>
								{stat}
							</div>
							{/* Particle trail */}
							{[0, 1, 2].map((t) => (
								<div
									key={t}
									style={{
										position: "absolute",
										left: `calc(50% + ${Math.sin(frame * 0.05 + t * 2 + i) * 12}px)`,
										top: `calc(50% + ${Math.cos(frame * 0.04 + t * 1.5 + i) * 10}px)`,
										width: 2,
										height: 2,
										borderRadius: "50%",
										backgroundColor: BRAND_YELLOW,
										opacity: 0.3 - t * 0.08,
										pointerEvents: "none",
									}}
								/>
							))}
						</div>
					))}
				</>
			)}
		</AbsoluteFill>
	);
};

export default PlayerDemo;
