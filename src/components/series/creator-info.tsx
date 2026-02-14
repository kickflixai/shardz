import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CreatorInfoProps {
	displayName: string;
	username?: string | null;
	avatarUrl?: string | null;
	bio?: string | null;
}

export function CreatorInfo({
	displayName,
	username,
	avatarUrl,
	bio,
}: CreatorInfoProps) {
	const initial = displayName.charAt(0).toUpperCase();

	return (
		<div className="flex items-start gap-3">
			<Avatar size="lg">
				{avatarUrl && (
					<AvatarImage src={avatarUrl} alt={displayName} />
				)}
				<AvatarFallback>{initial}</AvatarFallback>
			</Avatar>
			<div className="min-w-0 flex-1">
				<p className="text-sm font-medium text-foreground">
					{displayName}
				</p>
				{username && (
					<p className="text-xs text-muted-foreground">
						@{username}
					</p>
				)}
				{bio && (
					<p className="mt-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
						{bio}
					</p>
				)}
			</div>
		</div>
	);
}
