"use client";

import {
	AreaChart,
	Area,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
} from "recharts";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";

// --- Mock Data: Source Attribution Funnel ---
const sourceData = [
	{ month: "Jan", organic: 80, social: 40, paid: 100, direct: 30 },
	{ month: "Feb", organic: 130, social: 75, paid: 120, direct: 45 },
	{ month: "Mar", organic: 200, social: 140, paid: 150, direct: 60 },
	{ month: "Apr", organic: 290, social: 210, paid: 180, direct: 80 },
	{ month: "May", organic: 370, social: 280, paid: 220, direct: 100 },
	{ month: "Jun", organic: 450, social: 350, paid: 250, direct: 120 },
];

const sourceConfig: ChartConfig = {
	organic: { label: "Organic Search", color: "hsl(48 96% 53%)" },
	social: { label: "Social Shares", color: "hsl(172 66% 50%)" },
	paid: { label: "Paid Ads", color: "hsl(262 83% 58%)" },
	direct: { label: "Direct", color: "hsl(220 14% 46%)" },
};

// --- Mock Data: Genre Revenue Performance ---
const genreData = [
	{ genre: "Sci-Fi", revenue: 4280 },
	{ genre: "Comedy", revenue: 3150 },
	{ genre: "Thriller", revenue: 2890 },
	{ genre: "Drama", revenue: 2340 },
	{ genre: "Action", revenue: 1920 },
	{ genre: "Horror", revenue: 1650 },
	{ genre: "Romance", revenue: 1280 },
	{ genre: "Documentary", revenue: 980 },
];

const genreConfig: ChartConfig = {
	revenue: { label: "Revenue ($)", color: "hsl(48 96% 53%)" },
};

// --- Key Metrics ---
const metrics = [
	{ label: "Avg. Revenue Per Series", value: "$847" },
	{ label: "Avg. Conversion Rate", value: "12.3%" },
	{ label: "Avg. Subscriber Growth", value: "+34%/mo" },
];

export function AttributionDashboard() {
	return (
		<div className="space-y-8">
			{/* Section 1: Source Attribution Funnel */}
			<div className="rounded-2xl border border-cinema-border bg-cinema-dark p-6">
				<h3 className="text-lg font-bold text-white">
					Source Attribution Funnel
				</h3>
				<p className="mt-1 text-sm text-cinema-muted">
					Viewer acquisition sources over 6 months
				</p>

				<ChartContainer
					config={sourceConfig}
					className="mt-6 aspect-[2/1] w-full"
				>
					<AreaChart data={sourceData}>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="rgba(255,255,255,0.06)"
						/>
						<XAxis
							dataKey="month"
							stroke="rgba(255,255,255,0.3)"
							fontSize={12}
						/>
						<YAxis
							stroke="rgba(255,255,255,0.3)"
							fontSize={12}
						/>
						<ChartTooltip
							content={<ChartTooltipContent indicator="dot" />}
						/>
						<Area
							type="monotone"
							dataKey="organic"
							stackId="1"
							stroke="var(--color-organic)"
							fill="var(--color-organic)"
							fillOpacity={0.4}
						/>
						<Area
							type="monotone"
							dataKey="social"
							stackId="1"
							stroke="var(--color-social)"
							fill="var(--color-social)"
							fillOpacity={0.4}
						/>
						<Area
							type="monotone"
							dataKey="paid"
							stackId="1"
							stroke="var(--color-paid)"
							fill="var(--color-paid)"
							fillOpacity={0.4}
						/>
						<Area
							type="monotone"
							dataKey="direct"
							stackId="1"
							stroke="var(--color-direct)"
							fill="var(--color-direct)"
							fillOpacity={0.4}
						/>
					</AreaChart>
				</ChartContainer>

				{/* Legend */}
				<div className="mt-4 flex flex-wrap gap-4">
					{Object.entries(sourceConfig).map(([key, config]) => (
						<div key={key} className="flex items-center gap-2">
							<div
								className="h-2.5 w-2.5 rounded-sm"
								style={{ backgroundColor: config.color as string }}
							/>
							<span className="text-xs text-cinema-muted">
								{config.label}
							</span>
						</div>
					))}
				</div>
			</div>

			{/* Section 2: Creator ROI Metrics */}
			<div className="rounded-2xl border border-cinema-border bg-cinema-dark p-6">
				<h3 className="text-lg font-bold text-white">
					Creator ROI by Genre
				</h3>
				<p className="mt-1 text-sm text-cinema-muted">
					Revenue performance across genre categories
				</p>

				<div className="mt-6 flex flex-col gap-8 lg:flex-row">
					{/* Bar chart */}
					<ChartContainer
						config={genreConfig}
						className="aspect-[3/2] flex-1"
					>
						<BarChart data={genreData}>
							<CartesianGrid
								strokeDasharray="3 3"
								stroke="rgba(255,255,255,0.06)"
							/>
							<XAxis
								dataKey="genre"
								stroke="rgba(255,255,255,0.3)"
								fontSize={11}
								angle={-30}
								textAnchor="end"
								height={50}
							/>
							<YAxis
								stroke="rgba(255,255,255,0.3)"
								fontSize={12}
								tickFormatter={(v) => `$${v}`}
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
								dataKey="revenue"
								fill="var(--color-revenue)"
								radius={[4, 4, 0, 0]}
							/>
						</BarChart>
					</ChartContainer>

					{/* Metric cards */}
					<div className="flex shrink-0 flex-col gap-4 lg:w-52">
						{metrics.map((metric) => (
							<div
								key={metric.label}
								className="rounded-xl border border-cinema-border bg-cinema-surface p-4"
							>
								<div className="text-2xl font-bold text-brand-yellow">
									{metric.value}
								</div>
								<div className="mt-1 text-xs text-cinema-muted">
									{metric.label}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Section 3: Content Performance Heatmap */}
			<div className="rounded-2xl border border-cinema-border bg-cinema-dark p-6">
				<h3 className="text-lg font-bold text-white">
					Peak Performance Windows
				</h3>
				<p className="mt-1 text-sm text-cinema-muted">
					Best-performing time slots by genre (engagement index)
				</p>

				<div className="mt-6 overflow-x-auto">
					<table className="w-full text-xs">
						<thead>
							<tr className="border-b border-cinema-border">
								<th className="px-3 py-2 text-left font-medium text-cinema-muted">
									Genre
								</th>
								<th className="px-3 py-2 text-center font-medium text-cinema-muted">
									Morning
								</th>
								<th className="px-3 py-2 text-center font-medium text-cinema-muted">
									Afternoon
								</th>
								<th className="px-3 py-2 text-center font-medium text-cinema-muted">
									Evening
								</th>
								<th className="px-3 py-2 text-center font-medium text-cinema-muted">
									Late Night
								</th>
							</tr>
						</thead>
						<tbody>
							{[
								{ genre: "Sci-Fi", slots: [42, 58, 94, 78] },
								{ genre: "Comedy", slots: [65, 82, 71, 45] },
								{ genre: "Thriller", slots: [28, 44, 88, 96] },
								{ genre: "Drama", slots: [38, 72, 85, 52] },
								{ genre: "Action", slots: [55, 68, 76, 60] },
							].map((row) => (
								<tr
									key={row.genre}
									className="border-b border-cinema-border/50"
								>
									<td className="px-3 py-2 font-medium text-white">
										{row.genre}
									</td>
									{row.slots.map((value, i) => (
										<td
											key={`${row.genre}-${i}`}
											className="px-3 py-2 text-center"
										>
											<span
												className="inline-block rounded px-2 py-0.5 text-xs font-medium"
												style={{
													backgroundColor: `rgba(224, 184, 0, ${value / 100 * 0.6})`,
													color:
														value > 70
															? "rgb(10,10,10)"
															: "rgba(255,255,255,0.7)",
												}}
											>
												{value}
											</span>
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
