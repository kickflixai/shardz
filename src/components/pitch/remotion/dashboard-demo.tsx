import {
	AbsoluteFill,
	useCurrentFrame,
	interpolate,
	spring,
	useVideoConfig,
} from "remotion";

// ── Color Constants ──
const BRAND_YELLOW = "#E0B800";
const CINEMA_BLACK = "#141414";
const SURFACE_DARK = "#1a1a2e";
const SURFACE_LIGHT = "#2a2a3e";

// ── Data ──
const BAR_DATA = [
	{ label: "Mon", value: 320 },
	{ label: "Tue", value: 480 },
	{ label: "Wed", value: 290 },
	{ label: "Thu", value: 540 },
	{ label: "Fri", value: 410 },
	{ label: "Sat", value: 620 },
	{ label: "Sun", value: 510 },
];

const MAX_BAR = Math.max(...BAR_DATA.map((b) => b.value));

const METRICS = [
	{
		label: "Revenue",
		display: "$2,847",
		rawValue: 2847,
		prefix: "$",
		suffix: "",
		change: "+23%",
		color: "#4ade80",
		borderColor: "#4ade80",
	},
	{
		label: "Views",
		display: "12,483",
		rawValue: 12483,
		prefix: "",
		suffix: "",
		change: "+18%",
		color: BRAND_YELLOW,
		borderColor: BRAND_YELLOW,
	},
	{
		label: "Subscribers",
		display: "1,247",
		rawValue: 1247,
		prefix: "",
		suffix: "",
		change: "+12%",
		color: "#60a5fa",
		borderColor: "#60a5fa",
	},
	{
		label: "Conversion",
		display: "8.4%",
		rawValue: 84,
		prefix: "",
		suffix: "%",
		change: "+2.1%",
		color: "#c084fc",
		borderColor: "#c084fc",
	},
];

const DONUT_SEGMENTS = [
	{ label: "Series", pct: 60, color: BRAND_YELLOW },
	{ label: "BTS", pct: 25, color: "#2dd4bf" },
	{ label: "Shorts", pct: 15, color: "#a78bfa" },
];

// ── Helpers ──
function formatCount(
	label: string,
	rawValue: number,
	progress: number,
): string {
	const p = Math.min(Math.max(progress, 0), 1);
	if (label === "Conversion") {
		return `${(8.4 * p).toFixed(1)}%`;
	}
	const v = Math.floor(rawValue * p);
	if (label === "Revenue") return `$${v.toLocaleString()}`;
	return v.toLocaleString();
}

export const DashboardDemo: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// ── Loop crossfade: last 30 frames blend with first 30 ──
	const TOTAL = 420;
	const LOOP_WINDOW = 30;
	const loopAlpha =
		frame >= TOTAL - LOOP_WINDOW
			? interpolate(
					frame,
					[TOTAL - LOOP_WINDOW, TOTAL],
					[1, 0],
					{ extrapolateRight: "clamp", extrapolateLeft: "clamp" },
				)
			: 1;
	const loopFadeIn =
		frame < LOOP_WINDOW
			? interpolate(frame, [0, LOOP_WINDOW], [0, 1], {
					extrapolateRight: "clamp",
				})
			: 1;

	// ══════════════════════════════════════════════════
	// PHASE 1: Dashboard header + metric cards (0-45)
	// ══════════════════════════════════════════════════
	const headerOpacity = interpolate(frame, [0, 20], [0, 1], {
		extrapolateRight: "clamp",
	});
	const headerSlideY = interpolate(frame, [0, 20], [12, 0], {
		extrapolateRight: "clamp",
	});

	// Nav bar glass morphism fade
	const navOpacity = interpolate(frame, [5, 25], [0, 1], {
		extrapolateRight: "clamp",
	});

	// Metric card counter progress (counts up during 10-45)
	const counterProgress = interpolate(frame, [10, 45], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	// ══════════════════════════════════════════════════
	// PHASE 2: Zoom into Revenue card (45-120)
	// ══════════════════════════════════════════════════
	const zoomInScale = interpolate(frame, [45, 70], [1, 2.6], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const zoomInTX = interpolate(frame, [45, 70], [0, 340], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const zoomInTY = interpolate(frame, [45, 70], [0, 220], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	// Revenue big counter during zoom
	const revCounterProgress = interpolate(frame, [60, 110], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const revOverlayOpacity = interpolate(frame, [55, 75], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	// Green arrow bounce
	const arrowBounce = spring({
		frame: Math.max(0, frame - 80),
		fps,
		config: { damping: 8, stiffness: 120 },
	});

	// ══════════════════════════════════════════════════
	// PHASE 3: Zoom back out (120-150) elastic
	// ══════════════════════════════════════════════════
	const zoomOutScale = interpolate(frame, [120, 150], [2.6, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const zoomOutTX = interpolate(frame, [120, 150], [340, 0], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const zoomOutTY = interpolate(frame, [120, 150], [220, 0], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	// Elastic overshoot for zoom-out
	const elasticBounce = spring({
		frame: Math.max(0, frame - 120),
		fps,
		config: { damping: 8, stiffness: 100 },
	});

	// Combine zoom phases
	const isZoomIn = frame >= 45 && frame < 120;
	const isZoomOut = frame >= 120 && frame < 150;
	let dScale = 1;
	let dTX = 0;
	let dTY = 0;
	if (isZoomIn) {
		dScale = zoomInScale;
		dTX = zoomInTX;
		dTY = zoomInTY;
	} else if (isZoomOut) {
		// blend linear interpolation with elastic spring for overshoot feel
		const linearProgress = interpolate(frame, [120, 150], [0, 1], {
			extrapolateLeft: "clamp",
			extrapolateRight: "clamp",
		});
		const blended = linearProgress * 0.3 + elasticBounce * 0.7;
		dScale = 2.6 + (1 - 2.6) * blended;
		dTX = 340 + (0 - 340) * blended;
		dTY = 220 + (0 - 220) * blended;
	}

	// ══════════════════════════════════════════════════
	// PHASE 4: Bar chart builds (150-210)
	// ══════════════════════════════════════════════════
	const barChartVisible = interpolate(frame, [150, 155], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	// Spotlight glow on highest bar
	const spotlightPulse =
		frame >= 190
			? 0.5 + 0.5 * Math.sin((frame - 190) * 0.15)
			: 0;
	const spotlightOpacity = interpolate(frame, [190, 200], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	// Tooltip on highest bar
	const tooltipScale = spring({
		frame: Math.max(0, frame - 195),
		fps,
		config: { damping: 12, stiffness: 100 },
	});

	// Particle burst (8 particles around tooltip)
	const particleBurst = spring({
		frame: Math.max(0, frame - 198),
		fps,
		config: { damping: 14, stiffness: 120 },
	});

	// ══════════════════════════════════════════════════
	// PHASE 5: Earnings panel (210-280)
	// ══════════════════════════════════════════════════
	const earningsSlideX = interpolate(frame, [210, 235], [100, 0], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const earningsOpacity = interpolate(frame, [210, 230], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	// Green "80% creator share" bar fill
	const earningsBarFill = interpolate(frame, [225, 260], [0, 80], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	// Shimmer sweep across bar
	const shimmerX = interpolate(frame, [240, 270], [-100, 200], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	// Earnings counter
	const earningsCounterProg = interpolate(frame, [230, 265], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const earningsAmount = Math.floor(
		2278 * Math.min(Math.max(earningsCounterProg, 0), 1),
	);

	// "At this rate..." projection
	const projectionOpacity = interpolate(frame, [260, 278], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const projectionGlow =
		frame >= 265
			? 0.3 + 0.2 * Math.sin((frame - 265) * 0.12)
			: 0;
	const yearlyCounterProg = interpolate(frame, [262, 278], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const yearlyAmount = Math.floor(
		34000 * Math.min(Math.max(yearlyCounterProg, 0), 1),
	);

	// ══════════════════════════════════════════════════
	// PHASE 6: Content breakdown donut chart (280-360)
	// ══════════════════════════════════════════════════
	const donutOpacity = interpolate(frame, [280, 300], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const donutSlideY = interpolate(frame, [280, 300], [40, 0], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	// ══════════════════════════════════════════════════
	// PHASE 7: Smooth loop crossfade (360-420)
	// ══════════════════════════════════════════════════
	// Already handled by loopAlpha / loopFadeIn at top

	// Compute dashboard opacity as a blend of phases
	const dashboardBaseOpacity = Math.min(loopAlpha, loopFadeIn);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: CINEMA_BLACK,
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
				overflow: "hidden",
			}}
		>
			{/* ═══ MAIN DASHBOARD LAYER ═══ */}
			<AbsoluteFill
				style={{
					opacity: dashboardBaseOpacity,
					transform: `scale(${dScale}) translate(${dTX}px, ${dTY}px)`,
					transformOrigin: "top left",
					padding: "28px 36px",
					display: "flex",
					flexDirection: "column",
				}}
			>
				{/* ── Glass morphism nav bar ── */}
				<div
					style={{
						opacity: navOpacity,
						backgroundColor: "rgba(255,255,255,0.06)",
						border: "1px solid rgba(255,255,255,0.1)",
						borderRadius: 12,
						padding: "10px 20px",
						marginBottom: 20,
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						backdropFilter: "blur(12px)",
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 10,
						}}
					>
						<div
							style={{
								width: 8,
								height: 8,
								borderRadius: "50%",
								backgroundColor: BRAND_YELLOW,
								boxShadow: `0 0 8px ${BRAND_YELLOW}`,
							}}
						/>
						<span
							style={{
								fontSize: 14,
								fontWeight: 700,
								color: "#fff",
								letterSpacing: "-0.01em",
							}}
						>
							Shardz Studio
						</span>
					</div>
					<div style={{ display: "flex", gap: 18 }}>
						{["Dashboard", "Content", "Analytics", "Payouts"].map(
							(tab, i) => (
								<span
									key={tab}
									style={{
										fontSize: 12,
										color: i === 0 ? BRAND_YELLOW : "#888",
										fontWeight: i === 0 ? 700 : 500,
										letterSpacing: "0.01em",
									}}
								>
									{tab}
								</span>
							),
						)}
					</div>
				</div>

				{/* ── Dashboard header ── */}
				<div
					style={{
						opacity: headerOpacity,
						transform: `translateY(${headerSlideY}px)`,
						marginBottom: 18,
					}}
				>
					<div
						style={{
							fontSize: 22,
							fontWeight: 800,
							color: "#ffffff",
							letterSpacing: "-0.02em",
						}}
					>
						Creator Dashboard
					</div>
					<div
						style={{
							fontSize: 12,
							color: "#666",
							marginTop: 3,
						}}
					>
						Last 30 days performance
					</div>
				</div>

				{/* ── Metric cards row ── */}
				<div
					style={{
						display: "flex",
						gap: 14,
						marginBottom: 18,
					}}
				>
					{METRICS.map((metric, i) => {
						const cardDelay = 8 + i * 8;
						const cardSpring = spring({
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

						const displayVal = formatCount(
							metric.label,
							metric.rawValue,
							counterProgress,
						);

						const isRevenue = metric.label === "Revenue";
						const glowPulse =
							isRevenue && isZoomIn
								? 0.4 + 0.2 * Math.sin(frame * 0.15)
								: 0;
						const cardGlow =
							isRevenue && isZoomIn
								? `0 0 20px rgba(74, 222, 128, ${glowPulse}), 0 0 40px rgba(74, 222, 128, ${glowPulse * 0.5})`
								: "none";

						return (
							<div
								key={metric.label}
								style={{
									flex: 1,
									opacity: cardOpacity,
									transform: `scale(${cardSpring})`,
									backgroundColor: "rgba(255,255,255,0.06)",
									border: `1px solid rgba(255,255,255,0.1)`,
									borderLeft: `3px solid ${metric.borderColor}`,
									borderRadius: 10,
									padding: "14px 16px",
									boxShadow: cardGlow,
									position: "relative",
									overflow: "hidden",
								}}
							>
								<div
									style={{
										fontSize: 10,
										color: "#888",
										textTransform: "uppercase",
										letterSpacing: "0.06em",
										marginBottom: 6,
										fontWeight: 600,
									}}
								>
									{metric.label}
								</div>
								<div
									style={{
										fontSize: 20,
										fontWeight: 800,
										color: "#fff",
										fontVariantNumeric: "tabular-nums",
										marginBottom: 3,
									}}
								>
									{displayVal}
								</div>
								<div
									style={{
										fontSize: 11,
										fontWeight: 700,
										color: metric.color,
									}}
								>
									{metric.change}
								</div>

								{/* Zoomed-in Revenue overlay */}
								{isRevenue && isZoomIn && (
									<div
										style={{
											position: "absolute",
											top: 0,
											left: 0,
											right: 0,
											bottom: 0,
											display: "flex",
											flexDirection: "column",
											alignItems: "center",
											justifyContent: "center",
											opacity: revOverlayOpacity,
											backgroundColor:
												"rgba(26, 26, 46, 0.96)",
											borderRadius: 10,
										}}
									>
										<div
											style={{
												fontSize: 34,
												fontWeight: 900,
												color: "#fff",
												letterSpacing: "-0.02em",
												fontVariantNumeric:
													"tabular-nums",
											}}
										>
											$
											{Math.floor(
												2847 *
													Math.min(
														Math.max(
															revCounterProgress,
															0,
														),
														1,
													),
											).toLocaleString()}
										</div>
										<div
											style={{
												display: "flex",
												alignItems: "center",
												gap: 5,
												marginTop: 6,
												transform: `scale(${arrowBounce})`,
											}}
										>
											<span
												style={{
													fontSize: 16,
													color: "#4ade80",
													fontWeight: 700,
												}}
											>
												&#9650;
											</span>
											<span
												style={{
													fontSize: 16,
													color: "#4ade80",
													fontWeight: 700,
												}}
											>
												+23%
											</span>
										</div>
									</div>
								)}
							</div>
						);
					})}
				</div>

				{/* ── Bottom row: Chart + Earnings + Donut ── */}
				<div
					style={{
						display: "flex",
						gap: 14,
						flex: 1,
						minHeight: 0,
					}}
				>
					{/* ── Bar Chart Panel ── */}
					<div
						style={{
							flex: 2,
							opacity: barChartVisible,
							backgroundColor: "rgba(255,255,255,0.06)",
							border: "1px solid rgba(255,255,255,0.1)",
							borderRadius: 10,
							padding: "16px 18px",
							display: "flex",
							flexDirection: "column",
						}}
					>
						<div
							style={{
								fontSize: 13,
								fontWeight: 700,
								color: "#fff",
								marginBottom: 12,
							}}
						>
							Weekly Revenue
						</div>
						<div
							style={{
								flex: 1,
								display: "flex",
								alignItems: "flex-end",
								gap: 10,
								paddingBottom: 20,
								position: "relative",
							}}
						>
							{BAR_DATA.map((bar, i) => {
								const barDelay = i * 6;
								const barSpring = spring({
									frame: Math.max(
										0,
										frame - 155 - barDelay,
									),
									fps,
									config: {
										damping: 12,
										stiffness: 80,
									},
								});
								const heightPct =
									(bar.value / (MAX_BAR + 20)) *
									100 *
									barSpring;

								const isHighest = bar.value === MAX_BAR;
								const glowIntensity =
									isHighest
										? spotlightOpacity * spotlightPulse
										: 0;

								return (
									<div
										key={bar.label}
										style={{
											flex: 1,
											display: "flex",
											flexDirection: "column",
											alignItems: "center",
											height: "100%",
											justifyContent: "flex-end",
											position: "relative",
										}}
									>
										{/* Tooltip on highest bar */}
										{isHighest && frame >= 195 && (
											<div
												style={{
													position: "absolute",
													top: -6,
													transform: `scale(${tooltipScale}) translateY(-100%)`,
													backgroundColor:
														BRAND_YELLOW,
													color: CINEMA_BLACK,
													fontSize: 10,
													fontWeight: 800,
													padding: "3px 8px",
													borderRadius: 5,
													whiteSpace: "nowrap",
													zIndex: 10,
												}}
											>
												${bar.value}
												<div
													style={{
														position: "absolute",
														bottom: -4,
														left: "50%",
														marginLeft: -4,
														width: 0,
														height: 0,
														borderLeft:
															"4px solid transparent",
														borderRight:
															"4px solid transparent",
														borderTop: `4px solid ${BRAND_YELLOW}`,
													}}
												/>
											</div>
										)}

										{/* Particle burst around tooltip */}
										{isHighest &&
											frame >= 198 &&
											Array.from({ length: 8 }).map(
												(_, pi) => {
													const angle =
														(pi / 8) * Math.PI * 2;
													const dist =
														18 * particleBurst;
													const px =
														Math.cos(angle) * dist;
													const py =
														Math.sin(angle) * dist;
													const pOpacity = Math.max(
														0,
														1 - particleBurst * 1.2,
													);
													return (
														<div
															key={`p-${pi}`}
															style={{
																position:
																	"absolute",
																top: -12,
																left: "50%",
																width: 3,
																height: 3,
																borderRadius:
																	"50%",
																backgroundColor:
																	BRAND_YELLOW,
																transform: `translate(${px - 1.5}px, ${py - 1.5}px)`,
																opacity:
																	pOpacity,
																zIndex: 11,
															}}
														/>
													);
												},
											)}

										<div
											style={{
												width: "100%",
												height: `${heightPct}%`,
												borderRadius: 5,
												background: isHighest
													? `linear-gradient(180deg, ${BRAND_YELLOW} 0%, rgba(224,184,0,0.75) 100%)`
													: `linear-gradient(180deg, rgba(224,184,0,0.7) 0%, rgba(224,184,0,0.35) 100%)`,
												minHeight: 2,
												boxShadow: isHighest
													? `0 0 ${14 * glowIntensity}px ${6 * glowIntensity}px rgba(224, 184, 0, ${0.6 * glowIntensity})`
													: "none",
											}}
										/>
									</div>
								);
							})}
						</div>
						{/* Labels */}
						<div style={{ display: "flex", gap: 10 }}>
							{BAR_DATA.map((bar) => (
								<div
									key={`lbl-${bar.label}`}
									style={{
										flex: 1,
										textAlign: "center",
										fontSize: 9,
										color: "#555",
										fontWeight: 500,
									}}
								>
									{bar.label}
								</div>
							))}
						</div>
					</div>

					{/* ── Earnings Panel ── */}
					<div
						style={{
							flex: 1,
							opacity: earningsOpacity,
							transform: `translateX(${earningsSlideX}px)`,
							backgroundColor: "rgba(255,255,255,0.06)",
							border: "1px solid rgba(255,255,255,0.1)",
							borderRadius: 10,
							padding: "16px 18px",
							display: "flex",
							flexDirection: "column",
						}}
					>
						<div
							style={{
								fontSize: 13,
								fontWeight: 700,
								color: "#fff",
								marginBottom: 14,
							}}
						>
							Earnings Split
						</div>

						{/* Creator share bar */}
						<div style={{ marginBottom: 12 }}>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									marginBottom: 5,
								}}
							>
								<span
									style={{
										fontSize: 11,
										color: "#888",
									}}
								>
									80% creator share
								</span>
								<span
									style={{
										fontSize: 11,
										fontWeight: 700,
										color: "#4ade80",
									}}
								>
									80%
								</span>
							</div>
							<div
								style={{
									height: 8,
									borderRadius: 4,
									backgroundColor: SURFACE_LIGHT,
									overflow: "hidden",
									position: "relative",
								}}
							>
								<div
									style={{
										width: `${earningsBarFill}%`,
										height: "100%",
										backgroundColor: "#4ade80",
										borderRadius: 4,
										position: "relative",
										overflow: "hidden",
									}}
								>
									{/* Shimmer sweep */}
									<div
										style={{
											position: "absolute",
											top: 0,
											left: 0,
											right: 0,
											bottom: 0,
											background: `linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)`,
											transform: `translateX(${shimmerX}%)`,
										}}
									/>
								</div>
							</div>
						</div>

						{/* Your Earnings counter */}
						<div style={{ marginBottom: 12 }}>
							<div
								style={{
									fontSize: 11,
									color: "#888",
									marginBottom: 3,
								}}
							>
								Your Earnings
							</div>
							<div
								style={{
									fontSize: 22,
									fontWeight: 800,
									color: "#4ade80",
									fontVariantNumeric: "tabular-nums",
								}}
							>
								${earningsAmount.toLocaleString()}
							</div>
						</div>

						{/* Yearly projection */}
						<div
							style={{
								opacity: projectionOpacity,
								marginTop: "auto",
								paddingTop: 10,
								borderTop: `1px solid ${SURFACE_LIGHT}`,
							}}
						>
							<div
								style={{
									fontSize: 11,
									color: "#888",
									marginBottom: 3,
								}}
							>
								At this rate...
							</div>
							<div
								style={{
									fontSize: 18,
									fontWeight: 800,
									color: BRAND_YELLOW,
									fontVariantNumeric: "tabular-nums",
									textShadow: `0 0 ${20 * projectionGlow}px rgba(224, 184, 0, ${projectionGlow})`,
								}}
							>
								$
								{yearlyAmount.toLocaleString()}
								/year
							</div>
						</div>
					</div>

					{/* ── Donut Chart Panel ── */}
					<div
						style={{
							flex: 1,
							opacity: donutOpacity,
							transform: `translateY(${donutSlideY}px)`,
							backgroundColor: "rgba(255,255,255,0.06)",
							border: "1px solid rgba(255,255,255,0.1)",
							borderRadius: 10,
							padding: "16px 18px",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
						}}
					>
						<div
							style={{
								fontSize: 13,
								fontWeight: 700,
								color: "#fff",
								marginBottom: 14,
								alignSelf: "flex-start",
							}}
						>
							Content Breakdown
						</div>

						{/* SVG Donut */}
						<div
							style={{
								position: "relative",
								width: 120,
								height: 120,
								marginBottom: 12,
							}}
						>
							<svg
								viewBox="0 0 120 120"
								width={120}
								height={120}
								style={{
									transform: "rotate(-90deg)",
								}}
							>
								{(() => {
									const cx = 60;
									const cy = 60;
									const r = 48;
									const circumference =
										2 * Math.PI * r;
									let cumulativeOffset = 0;

									return DONUT_SEGMENTS.map(
										(seg, i) => {
											const segDelay = 290 + i * 20;
											const segSpring = spring({
												frame: Math.max(
													0,
													frame - segDelay,
												),
												fps,
												config: {
													damping: 14,
													stiffness: 80,
												},
											});

											const segLength =
												(seg.pct / 100) *
												circumference;
											const dashArr = `${segLength * segSpring} ${circumference}`;
											const dashOff = -cumulativeOffset;

											const result = (
												<circle
													key={seg.label}
													cx={cx}
													cy={cy}
													r={r}
													fill="none"
													stroke={seg.color}
													strokeWidth={14}
													strokeDasharray={dashArr}
													strokeDashoffset={dashOff}
													strokeLinecap="round"
													style={{
														opacity:
															segSpring > 0.01
																? 1
																: 0,
													}}
												/>
											);

											cumulativeOffset += segLength;
											return result;
										},
									);
								})()}
							</svg>
							{/* Center text */}
							<div
								style={{
									position: "absolute",
									top: "50%",
									left: "50%",
									transform: "translate(-50%, -50%)",
									textAlign: "center",
								}}
							>
								<div
									style={{
										fontSize: 14,
										fontWeight: 800,
										color: "#fff",
									}}
								>
									100%
								</div>
								<div
									style={{
										fontSize: 8,
										color: "#888",
										marginTop: 1,
									}}
								>
									Revenue
								</div>
							</div>
						</div>

						{/* Legend */}
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: 6,
								width: "100%",
							}}
						>
							{DONUT_SEGMENTS.map((seg) => (
								<div
									key={seg.label}
									style={{
										display: "flex",
										alignItems: "center",
										gap: 8,
									}}
								>
									<div
										style={{
											width: 8,
											height: 8,
											borderRadius: 2,
											backgroundColor: seg.color,
										}}
									/>
									<span
										style={{
											fontSize: 10,
											color: "#ccc",
											flex: 1,
										}}
									>
										{seg.label}
									</span>
									<span
										style={{
											fontSize: 10,
											fontWeight: 700,
											color: "#fff",
											fontVariantNumeric:
												"tabular-nums",
										}}
									>
										{seg.pct}%
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export default DashboardDemo;
