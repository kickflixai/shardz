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

// ── Inline SVG icon paths ───────────────────────────────────────────────────
const SparkleIcon: React.FC<{ size?: number; color?: string }> = ({
	size = 20,
	color = BRAND_YELLOW,
}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
		<path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z" />
		<path
			d="M18 14l1.05 3.15L22.18 18l-3.13.85L18 22l-1.05-3.15L13.82 18l3.13-.85L18 14z"
			opacity={0.6}
		/>
	</svg>
);

const ImageIcon: React.FC<{ size?: number; color?: string }> = ({
	size = 20,
	color = "#60a5fa",
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
		<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
		<circle cx="8.5" cy="8.5" r="1.5" />
		<path d="M21 15l-5-5L5 21" />
	</svg>
);

const CaptionIcon: React.FC<{ size?: number; color?: string }> = ({
	size = 20,
	color = "#4ade80",
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
		<rect x="2" y="4" width="20" height="16" rx="2" />
		<path d="M7 15h4" />
		<path d="M13 15h4" />
		<path d="M7 11h10" />
	</svg>
);

const EyeIcon: React.FC<{ size?: number; color?: string }> = ({
	size = 20,
	color = "#c084fc",
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
		<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
		<circle cx="12" cy="12" r="3" />
	</svg>
);

// ── Sparkle particles component ─────────────────────────────────────────────
const PARTICLE_SEEDS = [
	{ x: 0.12, y: 0.18, size: 3, speed: 0.07, phase: 0 },
	{ x: 0.85, y: 0.22, size: 2.5, speed: 0.09, phase: 1.2 },
	{ x: 0.45, y: 0.08, size: 2, speed: 0.06, phase: 2.5 },
	{ x: 0.72, y: 0.85, size: 3.5, speed: 0.08, phase: 0.8 },
	{ x: 0.2, y: 0.75, size: 2, speed: 0.1, phase: 3.1 },
	{ x: 0.92, y: 0.55, size: 2.5, speed: 0.07, phase: 1.9 },
	{ x: 0.35, y: 0.92, size: 3, speed: 0.065, phase: 4.0 },
	{ x: 0.6, y: 0.15, size: 2, speed: 0.085, phase: 2.2 },
	{ x: 0.08, y: 0.48, size: 2.5, speed: 0.075, phase: 0.5 },
	{ x: 0.78, y: 0.42, size: 3, speed: 0.055, phase: 3.6 },
];

const SparkleParticles: React.FC<{ frame: number; opacity?: number }> = ({
	frame,
	opacity = 1,
}) => (
	<>
		{PARTICLE_SEEDS.map((p, i) => {
			const drift = Math.sin(frame * p.speed + p.phase) * 12;
			const driftY = Math.cos(frame * p.speed * 0.8 + p.phase) * 8;
			const sparkleOpacity =
				(0.3 + 0.7 * Math.abs(Math.sin(frame * 0.06 + p.phase))) * opacity;
			return (
				<div
					key={i}
					style={{
						position: "absolute",
						left: `${p.x * 100}%`,
						top: `${p.y * 100}%`,
						width: p.size,
						height: p.size,
						borderRadius: "50%",
						backgroundColor: BRAND_YELLOW,
						boxShadow: `0 0 ${p.size * 3}px ${p.size}px rgba(224, 184, 0, 0.4)`,
						opacity: sparkleOpacity,
						transform: `translate(${drift}px, ${driftY}px)`,
						pointerEvents: "none",
					}}
				/>
			);
		})}
	</>
);

// ── Tool card data ──────────────────────────────────────────────────────────
const TOOL_CARDS = [
	{
		title: "AI Script Assist",
		description: "Generate scripts, dialogue, and story arcs",
		Icon: SparkleIcon,
		accentColor: BRAND_YELLOW,
	},
	{
		title: "Smart Thumbnails",
		description: "Auto-generate eye-catching poster art",
		Icon: ImageIcon,
		accentColor: "#60a5fa",
	},
	{
		title: "Auto-Subtitles",
		description: "Accurate captions in 30+ languages",
		Icon: CaptionIcon,
		accentColor: "#4ade80",
	},
	{
		title: "Scene Analysis",
		description: "AI reviews pacing, engagement, and retention",
		Icon: EyeIcon,
		accentColor: "#c084fc",
	},
];

// ── Workflow steps ──────────────────────────────────────────────────────────
const WORKFLOW_STEPS = [
	{ label: "Learn at Shardz Studio", icon: "pencil" },
	{ label: "Create with AI", icon: "film" },
	{ label: "Publish & Earn", icon: "rocket" },
];

// ── Helpers ─────────────────────────────────────────────────────────────────
const clampOpts = {
	extrapolateLeft: "clamp" as const,
	extrapolateRight: "clamp" as const,
};

const clampInterp = (
	frame: number,
	inputRange: number[],
	outputRange: number[],
) => interpolate(frame, inputRange, outputRange, clampOpts);

// ── Typing animation helper ─────────────────────────────────────────────────
const typewriter = (
	frame: number,
	startFrame: number,
	text: string,
	framesToType: number,
) => {
	const progress = clampInterp(
		frame,
		[startFrame, startFrame + framesToType],
		[0, 1],
	);
	return text.slice(0, Math.round(progress * text.length));
};

// ── Mini workflow icons (inline SVG) ────────────────────────────────────────
const WorkflowIcon: React.FC<{ type: string; color: string }> = ({
	type,
	color,
}) => {
	if (type === "pencil") {
		return (
			<svg
				width="22"
				height="22"
				viewBox="0 0 24 24"
				fill="none"
				stroke={color}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path d="M12 20h9" />
				<path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
			</svg>
		);
	}
	if (type === "film") {
		return (
			<svg
				width="22"
				height="22"
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
	}
	// rocket
	return (
		<svg
			width="22"
			height="22"
			viewBox="0 0 24 24"
			fill="none"
			stroke={color}
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
			<path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
			<path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
			<path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
		</svg>
	);
};

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export const AiToolsDemo: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// ── LOOP CROSSFADE ──────────────────────────────────────────────────
	// Last 30 frames crossfade to first 30 frames (no black)
	const loopFadeOut = clampInterp(frame, [390, 420], [1, 0]);
	const loopFadeIn = clampInterp(frame, [390, 420], [0, 1]);

	// ════════════════════════════════════════════════════════════════════
	// PHASE 1: Title (0-30) — "AI-Powered Creation" fades in
	// ════════════════════════════════════════════════════════════════════
	const titleOpacity = clampInterp(frame, [0, 25], [0, 1]);
	const titleY = clampInterp(frame, [0, 25], [20, 0]);
	const titleScale = spring({
		frame,
		fps,
		config: { damping: 14, stiffness: 80 },
	});

	// ════════════════════════════════════════════════════════════════════
	// PHASE 2: Tool Cards (30-105) — 4 cards stagger in
	// ════════════════════════════════════════════════════════════════════
	const cardAnimations = TOOL_CARDS.map((_, i) => {
		const cardStart = 30 + i * 18;
		const scale = spring({
			frame: Math.max(0, frame - cardStart),
			fps,
			config: { damping: 12, stiffness: 100 },
		});
		const opacity = clampInterp(
			frame,
			[cardStart, cardStart + 15],
			[0, 1],
		);
		const y = clampInterp(frame, [cardStart, cardStart + 20], [30, 0]);
		return { scale, opacity, y };
	});

	// Typing animation for "AI Script Assist" card
	const typingText = typewriter(
		frame,
		48,
		"INT. STARSHIP — NIGHT\nThe captain stares at the void...",
		40,
	);
	const cursorVisible =
		frame >= 48 && frame < 100 ? Math.floor(frame / 6) % 2 === 0 : false;

	// Thumbnail morph for "Smart Thumbnails" card
	const thumbMorphProgress = clampInterp(frame, [60, 90], [0, 1]);

	// Subtitle bar for "Auto-Subtitles" card
	const subtitleBarWidth = clampInterp(frame, [72, 95], [0, 100]);
	const subtitleText = typewriter(
		frame,
		75,
		'"The signal is coming from inside."',
		25,
	);

	// Mini chart for "Scene Analysis" card
	const chartProgress = clampInterp(frame, [80, 105], [0, 1]);
	const CHART_BARS = [35, 55, 80, 65, 90, 70, 85];

	// Title fades out transitioning to cost section
	const titleFadeOut = clampInterp(frame, [95, 110], [1, 0]);

	// ════════════════════════════════════════════════════════════════════
	// PHASE 3: Cost Comparison (105-165)
	// ════════════════════════════════════════════════════════════════════
	const costSectionOpacity = clampInterp(frame, [105, 120], [0, 1]);
	const costSectionFadeOut = clampInterp(frame, [155, 170], [1, 0]);

	// Traditional cost — slides in, then gets crossed out
	const traditionalOpacity = clampInterp(frame, [108, 120], [0, 1]);
	const traditionalY = clampInterp(frame, [108, 120], [20, 0]);
	const strikethroughWidth = clampInterp(frame, [125, 140], [0, 100]);

	// AI-assisted cost — springs in large
	const aiCostScale = spring({
		frame: Math.max(0, frame - 132),
		fps,
		config: { damping: 8, stiffness: 120 },
	});
	const aiCostOpacity = clampInterp(frame, [132, 145], [0, 1]);

	// Cost reduction arrow
	const arrowY = clampInterp(frame, [138, 155], [-20, 0]);
	const arrowOpacity = clampInterp(frame, [138, 150], [0, 1]);
	const arrowBounce = spring({
		frame: Math.max(0, frame - 140),
		fps,
		config: { damping: 8, stiffness: 140 },
	});

	// ════════════════════════════════════════════════════════════════════
	// PHASE 4: Creator Workflow (165-240)
	// ════════════════════════════════════════════════════════════════════
	const workflowOpacity = clampInterp(frame, [165, 180], [0, 1]);
	const workflowFadeOut = clampInterp(frame, [230, 245], [1, 0]);

	const stepAnimations = WORKFLOW_STEPS.map((_, i) => {
		const stepStart = 175 + i * 20;
		const scale = spring({
			frame: Math.max(0, frame - stepStart),
			fps,
			config: { damping: 12, stiffness: 110 },
		});
		const opacity = clampInterp(
			frame,
			[stepStart, stepStart + 15],
			[0, 1],
		);
		return { scale, opacity };
	});

	// Dotted line connecting steps
	const lineProgress = clampInterp(frame, [185, 225], [0, 100]);

	// ════════════════════════════════════════════════════════════════════
	// PHASE 5: Result Showcase (240-330)
	// ════════════════════════════════════════════════════════════════════
	const showcaseOpacity = clampInterp(frame, [240, 255], [0, 1]);
	const showcaseFadeOut = clampInterp(frame, [320, 340], [1, 0]);

	const seriesCardScale = spring({
		frame: Math.max(0, frame - 245),
		fps,
		config: { damping: 14, stiffness: 90 },
	});
	const seriesCardOpacity = clampInterp(frame, [245, 260], [0, 1]);

	// "Created with AI" badge shimmer
	const badgeShimmerPosition = interpolate(
		frame,
		[260, 320],
		[-100, 200],
		clampOpts,
	);
	const badgeOpacity = clampInterp(frame, [260, 272], [0, 1]);
	const badgeScale = spring({
		frame: Math.max(0, frame - 262),
		fps,
		config: { damping: 12, stiffness: 130 },
	});

	// Stats count-up
	const viewsProgress = clampInterp(frame, [270, 310], [0, 1]);
	const viewsCount = Math.floor(12000 * viewsProgress);
	const earningsProgress = clampInterp(frame, [278, 318], [0, 1]);
	const earningsCount = Math.floor(2847 * earningsProgress);

	const statsOpacity = clampInterp(frame, [270, 285], [0, 1]);

	// ════════════════════════════════════════════════════════════════════
	// PHASE 6: Loop Crossfade (330-420)
	// ════════════════════════════════════════════════════════════════════
	// The showcase holds and gently fades while Phase 1 content re-appears

	// Glow pulse for AI elements
	const glowPulse = 0.4 + 0.3 * Math.sin(frame * 0.08);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: CINEMA_BLACK,
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
				overflow: "hidden",
			}}
		>
			{/* ═══ MAIN CONTENT LAYER ═══ */}
			<AbsoluteFill style={{ opacity: loopFadeOut }}>
				{/* ── Sparkle particles (always visible) ── */}
				<SparkleParticles frame={frame} opacity={0.5} />

				{/* ── PHASE 1: Title (0-30) ── */}
				<div
					style={{
						position: "absolute",
						top: 28,
						left: 0,
						right: 0,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						opacity: titleOpacity * titleFadeOut,
						transform: `translateY(${titleY}px) scale(${interpolate(titleScale, [0, 1], [0.9, 1], { extrapolateRight: "clamp" })})`,
					}}
				>
					<div
						style={{
							fontSize: 32,
							fontWeight: 900,
							color: "#ffffff",
							letterSpacing: "-0.02em",
							textAlign: "center",
						}}
					>
						AI-Powered{" "}
						<span
							style={{
								color: BRAND_YELLOW,
								textShadow: `0 0 30px rgba(224, 184, 0, ${glowPulse})`,
							}}
						>
							Creation
						</span>
					</div>
					<div
						style={{
							fontSize: 14,
							color: "#888",
							marginTop: 6,
							fontWeight: 500,
						}}
					>
						Build cinematic series with intelligent tools
					</div>
				</div>

				{/* ── PHASE 2: Tool Cards (30-105) ── */}
				{frame >= 25 && frame < 115 && (
					<div
						style={{
							position: "absolute",
							top: 100,
							left: 40,
							right: 40,
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: 14,
							opacity: titleFadeOut,
						}}
					>
						{TOOL_CARDS.map((card, i) => {
							const anim = cardAnimations[i];
							return (
								<div
									key={card.title}
									style={{
										opacity: anim.opacity,
										transform: `scale(${anim.scale}) translateY(${anim.y}px)`,
										backgroundColor: "rgba(255,255,255,0.06)",
										border: `1px solid rgba(255,255,255,0.1)`,
										borderLeft: `3px solid ${card.accentColor}`,
										borderRadius: 12,
										padding: "14px 16px",
										backdropFilter: "blur(12px)",
										position: "relative",
										overflow: "hidden",
									}}
								>
									{/* Card header */}
									<div
										style={{
											display: "flex",
											alignItems: "center",
											gap: 8,
											marginBottom: 8,
										}}
									>
										<card.Icon size={18} color={card.accentColor} />
										<span
											style={{
												fontSize: 15,
												fontWeight: 700,
												color: "#fff",
											}}
										>
											{card.title}
										</span>
									</div>
									<div
										style={{
											fontSize: 13,
											color: "#999",
											lineHeight: 1.4,
											marginBottom: 8,
										}}
									>
										{card.description}
									</div>

									{/* Per-card interactive element */}
									{i === 0 && (
										/* AI Script: typing animation */
										<div
											style={{
												backgroundColor: "rgba(0,0,0,0.3)",
												borderRadius: 6,
												padding: "6px 8px",
												fontSize: 11,
												color: "#ccc",
												fontFamily: "monospace",
												lineHeight: 1.5,
												minHeight: 28,
												whiteSpace: "pre-wrap",
											}}
										>
											{typingText}
											{cursorVisible && (
												<span
													style={{
														color: BRAND_YELLOW,
														fontWeight: 300,
													}}
												>
													|
												</span>
											)}
										</div>
									)}

									{i === 1 && (
										/* Smart Thumbnails: morphing gradient */
										<div
											style={{
												height: 36,
												borderRadius: 6,
												overflow: "hidden",
												position: "relative",
											}}
										>
											<div
												style={{
													position: "absolute",
													inset: 0,
													background: `linear-gradient(${135 + thumbMorphProgress * 90}deg, #1a1a3e ${10 - thumbMorphProgress * 10}%, #60a5fa ${40 + thumbMorphProgress * 20}%, ${BRAND_YELLOW} ${80 + thumbMorphProgress * 20}%)`,
													opacity:
														0.5 + thumbMorphProgress * 0.5,
													borderRadius: 6,
												}}
											/>
											{thumbMorphProgress > 0.5 && (
												<div
													style={{
														position: "absolute",
														bottom: 3,
														right: 6,
														fontSize: 8,
														color: "#fff",
														fontWeight: 600,
														opacity:
															(thumbMorphProgress - 0.5) * 2,
													}}
												>
													AI Generated
												</div>
											)}
										</div>
									)}

									{i === 2 && (
										/* Auto-Subtitles: subtitle bar */
										<div
											style={{
												position: "relative",
												height: 24,
											}}
										>
											<div
												style={{
													position: "absolute",
													bottom: 0,
													left: 0,
													width: `${subtitleBarWidth}%`,
													height: 22,
													backgroundColor:
														"rgba(0,0,0,0.6)",
													borderRadius: 4,
													display: "flex",
													alignItems: "center",
													paddingLeft: 8,
													overflow: "hidden",
												}}
											>
												<span
													style={{
														fontSize: 11,
														color: "#fff",
														whiteSpace: "nowrap",
													}}
												>
													{subtitleText}
												</span>
											</div>
										</div>
									)}

									{i === 3 && (
										/* Scene Analysis: mini chart */
										<div
											style={{
												display: "flex",
												alignItems: "flex-end",
												gap: 3,
												height: 30,
											}}
										>
											{CHART_BARS.map((barVal, bi) => {
												const barH =
													barVal *
													0.3 *
													chartProgress;
												return (
													<div
														key={bi}
														style={{
															flex: 1,
															height: barH,
															borderRadius: 2,
															backgroundColor:
																barVal >= 80
																	? "#c084fc"
																	: "rgba(192, 132, 252, 0.4)",
															minHeight: 1,
														}}
													/>
												);
											})}
										</div>
									)}

									{/* Subtle glow on accent color */}
									<div
										style={{
											position: "absolute",
											top: -20,
											right: -20,
											width: 60,
											height: 60,
											borderRadius: "50%",
											background: `radial-gradient(circle, ${card.accentColor}15 0%, transparent 70%)`,
											pointerEvents: "none",
										}}
									/>
								</div>
							);
						})}
					</div>
				)}

				{/* ── PHASE 3: Cost Comparison (105-165) ── */}
				{frame >= 100 && frame < 175 && (
					<AbsoluteFill
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							opacity: costSectionOpacity * costSectionFadeOut,
							gap: 24,
						}}
					>
						{/* Traditional cost */}
						<div
							style={{
								opacity: traditionalOpacity,
								transform: `translateY(${traditionalY}px)`,
								position: "relative",
								textAlign: "center",
							}}
						>
							<div
								style={{
									fontSize: 14,
									color: "#888",
									marginBottom: 6,
									fontWeight: 500,
								}}
							>
								Traditional Production
							</div>
							<div
								style={{
									fontSize: 38,
									fontWeight: 900,
									color: "#ef4444",
									fontVariantNumeric: "tabular-nums",
									position: "relative",
									display: "inline-block",
								}}
							>
								$50K–$500K
								{/* Strikethrough line */}
								<div
									style={{
										position: "absolute",
										top: "50%",
										left: 0,
										width: `${strikethroughWidth}%`,
										height: 3,
										backgroundColor: "#ef4444",
										borderRadius: 2,
										transform: "translateY(-50%)",
									}}
								/>
							</div>
						</div>

						{/* Downward arrow */}
						<div
							style={{
								opacity: arrowOpacity,
								transform: `translateY(${arrowY}px) scale(${arrowBounce})`,
							}}
						>
							<svg
								width="32"
								height="32"
								viewBox="0 0 24 24"
								fill="none"
								stroke={BRAND_YELLOW}
								strokeWidth="3"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<line x1="12" y1="5" x2="12" y2="19" />
								<polyline points="19 12 12 19 5 12" />
							</svg>
						</div>

						{/* AI-assisted cost */}
						<div
							style={{
								opacity: aiCostOpacity,
								transform: `scale(${interpolate(aiCostScale, [0, 1], [0.5, 1], { extrapolateRight: "clamp" })})`,
								textAlign: "center",
							}}
						>
							<div
								style={{
									fontSize: 14,
									color: "#888",
									marginBottom: 6,
									fontWeight: 500,
								}}
							>
								AI-Assisted on Shardz
							</div>
							<div
								style={{
									fontSize: 56,
									fontWeight: 900,
									color: "#4ade80",
									fontVariantNumeric: "tabular-nums",
									lineHeight: 1,
									textShadow: `0 0 40px rgba(74, 222, 128, 0.3)`,
								}}
							>
								Under $5K
							</div>
							<div
								style={{
									fontSize: 12,
									color: BRAND_YELLOW,
									marginTop: 10,
									fontWeight: 600,
									opacity: clampInterp(frame, [145, 158], [0, 1]),
								}}
							>
								This is what makes Shardz possible
							</div>
							<div
								style={{
									fontSize: 12,
									color: "#888",
									marginTop: 4,
									fontWeight: 400,
									opacity: clampInterp(frame, [150, 162], [0, 1]),
								}}
							>
								Free training for all creators at Shardz Studio
							</div>
						</div>
					</AbsoluteFill>
				)}

				{/* ── PHASE 4: Creator Workflow (165-240) ── */}
				{frame >= 160 && frame < 250 && (
					<AbsoluteFill
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							opacity: workflowOpacity * workflowFadeOut,
						}}
					>
						<div
							style={{
								fontSize: 22,
								fontWeight: 800,
								color: "#fff",
								marginBottom: 40,
								letterSpacing: "-0.01em",
							}}
						>
							From Idea to{" "}
							<span style={{ color: BRAND_YELLOW }}>Revenue</span>
						</div>

						{/* 3-step flow */}
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: 0,
								position: "relative",
							}}
						>
							{WORKFLOW_STEPS.map((step, i) => {
								const anim = stepAnimations[i];
								return (
									<div
										key={step.label}
										style={{
											display: "flex",
											alignItems: "center",
										}}
									>
										{/* Step circle + label */}
										<div
											style={{
												opacity: anim.opacity,
												transform: `scale(${anim.scale})`,
												display: "flex",
												flexDirection: "column",
												alignItems: "center",
												gap: 10,
											}}
										>
											<div
												style={{
													width: 56,
													height: 56,
													borderRadius: 16,
													backgroundColor:
														"rgba(255,255,255,0.06)",
													border: "1px solid rgba(255,255,255,0.1)",
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													boxShadow:
														i === 2
															? `0 0 20px rgba(224, 184, 0, ${glowPulse * 0.5})`
															: "none",
												}}
											>
												<WorkflowIcon
													type={step.icon}
													color={
														i === 2
															? BRAND_YELLOW
															: "#ccc"
													}
												/>
											</div>
											<span
												style={{
													fontSize: 14,
													fontWeight: 600,
													color:
														i === 2
															? BRAND_YELLOW
															: "#ccc",
													whiteSpace: "nowrap",
												}}
											>
												{step.label}
											</span>
										</div>

										{/* Dotted connector */}
										{i < WORKFLOW_STEPS.length - 1 && (
											<div
												style={{
													width: 80,
													height: 2,
													marginLeft: 16,
													marginRight: 16,
													marginBottom: 28,
													position: "relative",
													overflow: "hidden",
												}}
											>
												<div
													style={{
														position: "absolute",
														top: 0,
														left: 0,
														width: `${clampInterp(lineProgress, [i * 40, (i + 1) * 40 + 20], [0, 100])}%`,
														height: "100%",
														backgroundImage: `repeating-linear-gradient(90deg, ${BRAND_YELLOW} 0px, ${BRAND_YELLOW} 6px, transparent 6px, transparent 12px)`,
														opacity: 0.6,
													}}
												/>
											</div>
										)}
									</div>
								);
							})}
						</div>
					</AbsoluteFill>
				)}

				{/* ── PHASE 5: Result Showcase (240-330) ── */}
				{frame >= 235 && frame < 345 && (
					<AbsoluteFill
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							opacity: showcaseOpacity * showcaseFadeOut,
						}}
					>
						{/* Series card */}
						<div
							style={{
								opacity: seriesCardOpacity,
								transform: `scale(${interpolate(seriesCardScale, [0, 1], [0.85, 1], { extrapolateRight: "clamp" })})`,
								width: 320,
								borderRadius: 16,
								overflow: "hidden",
								backgroundColor: SURFACE_DARK,
								border: `1px solid ${SURFACE_LIGHT}`,
								boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(224, 184, 0, ${glowPulse * 0.15})`,
							}}
						>
							{/* Thumbnail area with gradient */}
							<div
								style={{
									height: 180,
									position: "relative",
									overflow: "hidden",
								}}
							>
								<div
									style={{
										position: "absolute",
										inset: 0,
										background: `linear-gradient(135deg, ${SURFACE_DARK} 0%, #2a1a4e 30%, #1a3a5e 60%, ${SURFACE_DARK} 100%)`,
									}}
								/>
								{/* Film grain overlay */}
								<div
									style={{
										position: "absolute",
										inset: 0,
										background:
											"radial-gradient(ellipse at 40% 40%, rgba(224,184,0,0.15) 0%, transparent 60%)",
									}}
								/>
								{/* Title on thumbnail */}
								<div
									style={{
										position: "absolute",
										bottom: 14,
										left: 16,
										right: 16,
									}}
								>
									<div
										style={{
											fontSize: 20,
											fontWeight: 900,
											color: "#fff",
											letterSpacing: 1,
											textShadow:
												"0 2px 8px rgba(0,0,0,0.6)",
										}}
									>
										NEON ASCENT
									</div>
									<div
										style={{
											fontSize: 11,
											color: "#bbb",
											marginTop: 3,
										}}
									>
										Sci-Fi Thriller &middot; 8 Episodes
									</div>
								</div>

								{/* "Created with AI" badge */}
								<div
									style={{
										position: "absolute",
										top: 12,
										right: 12,
										opacity: badgeOpacity,
										transform: `scale(${badgeScale})`,
									}}
								>
									<div
										style={{
											backgroundColor:
												"rgba(224, 184, 0, 0.2)",
											border: `1px solid ${BRAND_YELLOW}`,
											borderRadius: 6,
											padding: "4px 10px",
											fontSize: 10,
											fontWeight: 700,
											color: BRAND_YELLOW,
											position: "relative",
											overflow: "hidden",
										}}
									>
										Created with AI
										{/* Shimmer sweep */}
										<div
											style={{
												position: "absolute",
												inset: 0,
												background: `linear-gradient(105deg, transparent ${badgeShimmerPosition - 30}%, rgba(255,255,255,0.25) ${badgeShimmerPosition}%, transparent ${badgeShimmerPosition + 30}%)`,
												pointerEvents: "none",
											}}
										/>
									</div>
								</div>
							</div>

							{/* Stats area */}
							<div
								style={{
									padding: "14px 16px",
									opacity: statsOpacity,
								}}
							>
								<div
									style={{
										display: "flex",
										gap: 20,
										alignItems: "center",
									}}
								>
									<div>
										<div
											style={{
												fontSize: 22,
												fontWeight: 800,
												color: "#fff",
												fontVariantNumeric:
													"tabular-nums",
											}}
										>
											{viewsCount.toLocaleString()}
										</div>
										<div
											style={{
												fontSize: 11,
												color: "#888",
												marginTop: 2,
											}}
										>
											views
										</div>
									</div>
									<div
										style={{
											width: 1,
											height: 32,
											backgroundColor: SURFACE_LIGHT,
										}}
									/>
									<div>
										<div
											style={{
												fontSize: 22,
												fontWeight: 800,
												color: "#4ade80",
												fontVariantNumeric:
													"tabular-nums",
											}}
										>
											$
											{earningsCount.toLocaleString()}
										</div>
										<div
											style={{
												fontSize: 11,
												color: "#888",
												marginTop: 2,
											}}
										>
											earned
										</div>
									</div>
								</div>
							</div>
						</div>
					</AbsoluteFill>
				)}
			</AbsoluteFill>

			{/* ═══ LOOP LAYER: Re-show Phase 1 content fading in ═══ */}
			{frame >= 390 && (
				<AbsoluteFill style={{ opacity: loopFadeIn }}>
					<SparkleParticles frame={frame} opacity={0.5} />

					{/* Re-render the title for seamless loop */}
					<div
						style={{
							position: "absolute",
							top: 28,
							left: 0,
							right: 0,
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
						}}
					>
						<div
							style={{
								fontSize: 32,
								fontWeight: 900,
								color: "#ffffff",
								letterSpacing: "-0.02em",
								textAlign: "center",
							}}
						>
							AI-Powered{" "}
							<span
								style={{
									color: BRAND_YELLOW,
									textShadow: `0 0 30px rgba(224, 184, 0, ${glowPulse})`,
								}}
							>
								Creation
							</span>
						</div>
						<div
							style={{
								fontSize: 14,
								color: "#888",
								marginTop: 6,
								fontWeight: 500,
							}}
						>
							Build cinematic series with intelligent tools
						</div>
					</div>

					{/* Re-render tool cards for loop */}
					<div
						style={{
							position: "absolute",
							top: 100,
							left: 40,
							right: 40,
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: 14,
						}}
					>
						{TOOL_CARDS.map((card, i) => {
							const loopCardProgress = clampInterp(
								frame,
								[395 + i * 5, 415 + i * 5],
								[0, 1],
							);
							return (
								<div
									key={`loop-${card.title}`}
									style={{
										opacity: loopCardProgress,
										transform: `scale(${0.95 + loopCardProgress * 0.05})`,
										backgroundColor:
											"rgba(255,255,255,0.06)",
										border: "1px solid rgba(255,255,255,0.1)",
										borderLeft: `3px solid ${card.accentColor}`,
										borderRadius: 12,
										padding: "14px 16px",
										backdropFilter: "blur(12px)",
										position: "relative",
										overflow: "hidden",
									}}
								>
									<div
										style={{
											display: "flex",
											alignItems: "center",
											gap: 8,
											marginBottom: 8,
										}}
									>
										<card.Icon
											size={18}
											color={card.accentColor}
										/>
										<span
											style={{
												fontSize: 15,
												fontWeight: 700,
												color: "#fff",
											}}
										>
											{card.title}
										</span>
									</div>
									<div
										style={{
											fontSize: 11,
											color: "#999",
											lineHeight: 1.4,
										}}
									>
										{card.description}
									</div>

									{/* Subtle glow */}
									<div
										style={{
											position: "absolute",
											top: -20,
											right: -20,
											width: 60,
											height: 60,
											borderRadius: "50%",
											background: `radial-gradient(circle, ${card.accentColor}15 0%, transparent 70%)`,
											pointerEvents: "none",
										}}
									/>
								</div>
							);
						})}
					</div>
				</AbsoluteFill>
			)}
		</AbsoluteFill>
	);
};

export default AiToolsDemo;
