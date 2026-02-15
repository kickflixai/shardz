"use client";

import dynamic from "next/dynamic";
import type { CompositionName } from "./remotion-feature";

const RemotionFeature = dynamic(
	() =>
		import("./remotion-feature").then((mod) => ({
			default: mod.RemotionFeature,
		})),
	{
		ssr: false,
		loading: () => (
			<div className="flex aspect-video items-center justify-center rounded-xl bg-cinema-dark">
				<div className="text-sm text-cinema-muted">Loading...</div>
			</div>
		),
	},
);

export function RemotionFeatureLazy({
	composition,
}: { composition: CompositionName }) {
	return <RemotionFeature composition={composition} />;
}
