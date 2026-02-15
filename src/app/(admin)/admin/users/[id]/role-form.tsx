"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateUserRole } from "@/modules/admin/actions/users";

const ROLES = ["viewer", "creator", "admin"] as const;

export function RoleForm({ userId, currentRole }: { userId: string; currentRole: string }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [selectedRole, setSelectedRole] = useState(currentRole);

	function handleSave() {
		if (selectedRole === currentRole) return;
		startTransition(async () => {
			const result = await updateUserRole(userId, selectedRole as "viewer" | "creator" | "admin");
			if (result.success) {
				toast.success(result.message);
				router.refresh();
			} else {
				toast.error(result.message);
			}
		});
	}

	return (
		<div className="flex items-center gap-3">
			<select
				value={selectedRole}
				onChange={(e) => setSelectedRole(e.target.value)}
				disabled={isPending}
				className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
			>
				{ROLES.map((role) => (
					<option key={role} value={role}>
						{role.charAt(0).toUpperCase() + role.slice(1)}
					</option>
				))}
			</select>
			<Button onClick={handleSave} disabled={isPending || selectedRole === currentRole} size="sm">
				{isPending ? "Saving..." : "Save"}
			</Button>
		</div>
	);
}
