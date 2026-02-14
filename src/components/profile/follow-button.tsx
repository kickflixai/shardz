"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { followCreator, unfollowCreator } from "@/modules/creator/actions/follow";
import { Button } from "@/components/ui/button";

interface FollowButtonProps {
	creatorId: string;
	initialIsFollowing: boolean;
	isAuthenticated: boolean;
	username: string;
}

export function FollowButton({
	creatorId,
	initialIsFollowing,
	isAuthenticated,
	username,
}: FollowButtonProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [optimisticFollowing, setOptimisticFollowing] = useOptimistic(
		initialIsFollowing,
	);

	function handleClick() {
		if (!isAuthenticated) {
			router.push(`/login?next=/creator/${username}`);
			return;
		}

		startTransition(async () => {
			setOptimisticFollowing(!optimisticFollowing);
			if (optimisticFollowing) {
				await unfollowCreator(creatorId);
			} else {
				await followCreator(creatorId);
			}
		});
	}

	return (
		<Button
			variant={optimisticFollowing ? "outline" : "default"}
			size="sm"
			onClick={handleClick}
			disabled={isPending}
		>
			{optimisticFollowing ? "Following" : "Follow"}
		</Button>
	);
}
