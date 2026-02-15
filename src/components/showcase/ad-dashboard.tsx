"use client";

import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	PieChart,
	Pie,
	Cell,
} from "recharts";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";

// --- Summary Metrics ---
const summaryMetrics = [
	{ label: "Total Spend", value: "$12,450" },
	{ label: "Total Impressions", value: "2.1M" },
	{ label: "Avg. CPM", value: "$5.93" },
	{ label: "Avg. CTR", value: "3.2%" },
	{ label: "ROAS", value: "4.8x" },
];

// --- Platform Performance ---
const platformData = [
	{ platform: "Meta", spend: 5200, revenue: 26000 },
	{ platform: "TikTok", spend: 3100, revenue: 17050 },
	{ platform: "YouTube", spend: 2800, revenue: 11200 },
	{ platform: "X", spend: 1350, revenue: 5400 },
];

const platformConfig: ChartConfig = {
	spend: { label: "Spend ($)", color: "hsl(262 83% 58%)" },
	revenue: { label: "Revenue ($)", color: "hsl(48 96% 53%)" },
};

// --- Content-as-Creative Performance ---
const creativeData = [
	{
		series: "SIGNAL LOST",
		platform: "Meta",
		impressions: "482K",
		ctr: "4.8%",
		conversions: 1_204,
		highlight: true,
	},
	{
		series: "SIGNAL LOST",
		platform: "TikTok",
		impressions: "365K",
		ctr: "5.2%",
		conversions: 986,
		highlight: true,
	},
	{
		series: "Last Call",
		platform: "Meta",
		impressions: "218K",
		ctr: "3.1%",
		conversions: 445,
		highlight: false,
	},
	{
		series: "Neon District",
		platform: "YouTube",
		impressions: "194K",
		ctr: "2.6%",
		conversions: 328,
		highlight: false,
	},
	{
		series: "After Hours",
		platform: "TikTok",
		impressions: "156K",
		ctr: "3.8%",
		conversions: 289,
		highlight: false,
	},
	{
		series: "The Wire Room",
		platform: "X",
		impressions: "98K",
		ctr: "2.1%",
		conversions: 134,
		highlight: false,
	},
];

// --- Audience Genre Preferences by Platform ---
const audienceByPlatform = [
	{
		platform: "Meta",
		genres: [
			{ name: "Drama", value: 35, color: "hsl(48 96% 53%)" },
			{ name: "Comedy", value: 28, color: "hsl(172 66% 50%)" },
			{ name: "Other", value: 37, color: "hsl(220 14% 46%)" },
		],
	},
	{
		platform: "TikTok",
		genres: [
			{ name: "Action", value: 32, color: "hsl(0 84% 60%)" },
			{ name: "Thriller", value: 29, color: "hsl(262 83% 58%)" },
			{ name: "Other", value: 39, color: "hsl(220 14% 46%)" },
		],
	},
	{
		platform: "YouTube",
		genres: [
			{ name: "Sci-Fi", value: 38, color: "hsl(48 96% 53%)" },
			{ name: "Documentary", value: 24, color: "hsl(172 66% 50%)" },
			{ name: "Other", value: 38, color: "hsl(220 14% 46%)" },
		],
	},
];

const demographics = [
	{ label: "18-34", value: "68%" },
	{ label: "Urban", value: "74%" },
	{ label: "Mobile", value: "89%" },
];

const pieConfig: ChartConfig = {
	genre: { label: "Genre" },
};

export function AdDashboard() {
	return (
		<div className="space-y-8">
			{/* Section 1: Campaign Overview */}
			<div className="rounded-2xl border border-cinema-border bg-cinema-dark p-6">
				<h3 className="text-lg font-bold text-white">
					Campaign Overview
				</h3>
				<p className="mt-1 text-sm text-cinema-muted">
					Cross-platform advertising performance summary
				</p>

				{/* Summary metrics row */}
				<div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
					{summaryMetrics.map((metric) => (
						<div
							key={metric.label}
							className="rounded-xl border border-cinema-border bg-cinema-surface p-3 text-center"
						>
							<div className="text-xl font-bold text-brand-yellow sm:text-2xl">
								{metric.value}
							</div>
							<div className="mt-0.5 text-xs text-cinema-muted">
								{metric.label}
							</div>
						</div>
					))}
				</div>

				{/* Platform breakdown bar chart */}
				<div className="mt-8">
					<h4 className="mb-4 text-sm font-semibold text-cinema-muted">
						Spend vs. Revenue by Platform
					</h4>
					<ChartContainer
						config={platformConfig}
						className="aspect-[2.5/1] w-full"
					>
						<BarChart data={platformData}>
							<CartesianGrid
								strokeDasharray="3 3"
								stroke="rgba(255,255,255,0.06)"
							/>
							<XAxis
								dataKey="platform"
								stroke="rgba(255,255,255,0.3)"
								fontSize={12}
							/>
							<YAxis
								stroke="rgba(255,255,255,0.3)"
								fontSize={12}
								tickFormatter={(v) =>
									v >= 1000 ? `$${v / 1000}K` : `$${v}`
								}
							/>
							<ChartTooltip
								content={
									<ChartTooltipContent
										formatter={(value) =>
											`$${Number(value).toLocaleString()}`
										}
									/>
								}
							/>
							<Bar
								dataKey="spend"
								fill="var(--color-spend)"
								radius={[4, 4, 0, 0]}
							/>
							<Bar
								dataKey="revenue"
								fill="var(--color-revenue)"
								radius={[4, 4, 0, 0]}
							/>
						</BarChart>
					</ChartContainer>

					{/* Legend */}
					<div className="mt-3 flex gap-6">
						<div className="flex items-center gap-2">
							<div className="h-2.5 w-2.5 rounded-sm bg-[hsl(262_83%_58%)]" />
							<span className="text-xs text-cinema-muted">
								Spend
							</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="h-2.5 w-2.5 rounded-sm bg-[hsl(48_96%_53%)]" />
							<span className="text-xs text-cinema-muted">
								Revenue
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Section 2: Content-as-Creative Performance */}
			<div className="rounded-2xl border border-cinema-border bg-cinema-dark p-6">
				<h3 className="text-lg font-bold text-white">
					Content-as-Creative Performance
				</h3>
				<p className="mt-1 text-sm text-cinema-muted">
					Which series clips perform best as ad creative
				</p>

				<div className="mt-6 overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-cinema-border">
								<th className="px-3 py-2 text-left font-medium text-cinema-muted">
									Series
								</th>
								<th className="px-3 py-2 text-left font-medium text-cinema-muted">
									Platform
								</th>
								<th className="px-3 py-2 text-right font-medium text-cinema-muted">
									Impressions
								</th>
								<th className="px-3 py-2 text-right font-medium text-cinema-muted">
									CTR
								</th>
								<th className="px-3 py-2 text-right font-medium text-cinema-muted">
									Conversions
								</th>
							</tr>
						</thead>
						<tbody>
							{creativeData.map((row, i) => (
								<tr
									key={`${row.series}-${row.platform}`}
									className={`border-b border-cinema-border/50 ${row.highlight ? "bg-brand-yellow/5" : ""}`}
								>
									<td className="px-3 py-2.5">
										<span
											className={`font-medium ${row.highlight ? "text-brand-yellow" : "text-white"}`}
										>
											{row.series}
										</span>
									</td>
									<td className="px-3 py-2.5 text-cinema-muted">
										{row.platform}
									</td>
									<td className="px-3 py-2.5 text-right tabular-nums text-cinema-muted">
										{row.impressions}
									</td>
									<td className="px-3 py-2.5 text-right tabular-nums text-cinema-muted">
										{row.ctr}
									</td>
									<td className="px-3 py-2.5 text-right tabular-nums text-white">
										{row.conversions.toLocaleString()}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Section 3: Audience Insights */}
			<div className="rounded-2xl border border-cinema-border bg-cinema-dark p-6">
				<h3 className="text-lg font-bold text-white">
					Audience Insights
				</h3>
				<p className="mt-1 text-sm text-cinema-muted">
					Genre preferences by platform and demographic breakdown
				</p>

				<div className="mt-6 flex flex-col gap-8 lg:flex-row">
					{/* Pie charts per platform */}
					<div className="flex flex-1 flex-wrap justify-center gap-6">
						{audienceByPlatform.map((platform) => (
							<div key={platform.platform} className="text-center">
								<div className="mb-2 text-sm font-semibold text-white">
									{platform.platform}
								</div>
								<ChartContainer
									config={pieConfig}
									className="mx-auto h-[140px] w-[140px]"
								>
									<PieChart>
										<Pie
											data={platform.genres}
											cx="50%"
											cy="50%"
											innerRadius={30}
											outerRadius={55}
											dataKey="value"
											stroke="none"
										>
											{platform.genres.map(
												(genre, idx) => (
													<Cell
														key={genre.name}
														fill={genre.color}
													/>
												),
											)}
										</Pie>
										<ChartTooltip
											content={
												<ChartTooltipContent
													nameKey="name"
													formatter={(value) =>
														`${value}%`
													}
												/>
											}
										/>
									</PieChart>
								</ChartContainer>
								<div className="mt-1 flex flex-wrap justify-center gap-2">
									{platform.genres
										.filter((g) => g.name !== "Other")
										.map((genre) => (
											<span
												key={genre.name}
												className="text-[10px] text-cinema-muted"
											>
												<span
													className="mr-1 inline-block h-1.5 w-1.5 rounded-full"
													style={{
														backgroundColor:
															genre.color,
													}}
												/>
												{genre.name} {genre.value}%
											</span>
										))}
								</div>
							</div>
						))}
					</div>

					{/* Demographic cards */}
					<div className="flex shrink-0 flex-col gap-3 lg:w-40">
						{demographics.map((demo) => (
							<div
								key={demo.label}
								className="rounded-xl border border-cinema-border bg-cinema-surface p-4 text-center"
							>
								<div className="text-2xl font-bold text-teal-400">
									{demo.value}
								</div>
								<div className="mt-1 text-xs text-cinema-muted">
									{demo.label}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
