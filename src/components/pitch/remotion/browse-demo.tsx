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

const GENRES = ["All", "Sci-Fi", "Action", "Fantasy", "Thriller", "Horror"];

const SERIES_CARDS = [
	{
		title: "ORBITAL BREACH",
		genre: "Sci-Fi",
		thumbnail: "mock-orbital-breach.png",
		episodes: 16,
	},
	{
		title: "Chrome Pursuit",
		genre: "Action",
		thumbnail: "mock-chrome-pursuit.png",
		episodes: 8,
	},
	{
		title: "The Last Summoner",
		genre: "Fantasy",
		thumbnail: "mock-the-last-summoner.png",
		episodes: 16,
	},
	{
		title: "TITAN FALL",
		genre: "Action",
		thumbnail: "mock-titan-fall.png",
		episodes: 8,
	},
	{
		title: "Sandstorm Kings",
		genre: "Sci-Fi",
		thumbnail: "mock-sandstorm-kings.png",
		episodes: 16,
	},
	{
		title: "Ashborn",
		genre: "Action",
		thumbnail: "mock-ashborn.png",
		episodes: 8,
	},
];

export const BrowseDemo: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Genre tabs slide in from top
	const tabsY = interpolate(frame, [0, 25], [-40, 0], {
		extrapolateRight: "clamp",
	});
	const tabsOpacity = interpolate(frame, [0, 20], [0, 1], {
		extrapolateRight: "clamp",
	});

	// Active tab highlight slides across
	const activeTab = Math.floor(
		interpolate(frame, [40, 60, 100, 120, 150, 170], [0, 1, 1, 2, 2, 0], {
			extrapolateLeft: "clamp",
			extrapolateRight: "clamp",
		}),
	);

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
			<div
				style={{
					opacity: tabsOpacity,
					transform: `translateY(${tabsY}px)`,
					marginBottom: 30,
				}}
			>
				<div
					style={{
						fontSize: 28,
						fontWeight: 800,
						color: "#ffffff",
						marginBottom: 20,
						letterSpacing: "-0.02em",
					}}
				>
					Browse
				</div>

				{/* Genre filter tabs */}
				<div style={{ display: "flex", gap: 8 }}>
					{GENRES.map((genre, i) => {
						const isActive = i === activeTab;
						return (
							<div
								key={genre}
								style={{
									padding: "8px 18px",
									borderRadius: 20,
									fontSize: 13,
									fontWeight: 600,
									backgroundColor: isActive ? BRAND_YELLOW : SURFACE_LIGHT,
									color: isActive ? CINEMA_BLACK : "#aaa",
									transition: "none",
								}}
							>
								{genre}
							</div>
						);
					})}
				</div>
			</div>

			{/* Series grid — portrait poster layout */}
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr 1fr",
					gap: 16,
					flex: 1,
				}}
			>
				{SERIES_CARDS.map((card, i) => {
					const staggerDelay = 15 + i * 12;
					const cardScale = spring({
						frame: Math.max(0, frame - staggerDelay),
						fps,
						config: { damping: 12, stiffness: 100 },
					});
					const cardOpacity = interpolate(
						frame,
						[staggerDelay, staggerDelay + 15],
						[0, 1],
						{
							extrapolateLeft: "clamp",
							extrapolateRight: "clamp",
						},
					);

					return (
						<div
							key={card.title}
							style={{
								opacity: cardOpacity,
								transform: `scale(${cardScale})`,
								borderRadius: 12,
								overflow: "hidden",
								backgroundColor: SURFACE_DARK,
								border: `1px solid ${SURFACE_LIGHT}`,
								display: "flex",
								flexDirection: "column",
							}}
						>
							{/* Thumbnail — portrait 3:4 aspect */}
							<div
								style={{
									aspectRatio: "3 / 4",
									position: "relative",
									overflow: "hidden",
								}}
							>
								<Img
									src={staticFile(`thumbnails/${card.thumbnail}`)}
									style={{
										position: "absolute",
										inset: 0,
										width: "100%",
										height: "100%",
										objectFit: "cover",
									}}
								/>
								{/* Episode count badge */}
								<div
									style={{
										position: "absolute",
										bottom: 8,
										right: 8,
										backgroundColor: "rgba(0,0,0,0.7)",
										padding: "3px 8px",
										borderRadius: 4,
										fontSize: 11,
										color: "#ccc",
									}}
								>
									{card.episodes} eps
								</div>
							</div>

							{/* Card info */}
							<div style={{ padding: "10px 12px" }}>
								<div
									style={{
										fontSize: 13,
										fontWeight: 700,
										color: "#fff",
										marginBottom: 3,
									}}
								>
									{card.title}
								</div>
								<div style={{ fontSize: 10, color: "#888" }}>{card.genre}</div>
							</div>
						</div>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

export default BrowseDemo;
