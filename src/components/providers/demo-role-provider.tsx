"use client";

import {
	createContext,
	useCallback,
	useContext,
	useState,
	type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
	getDemoRoleCookie,
	setDemoRoleCookie,
} from "@/lib/demo-role-client";

type UserRole = "viewer" | "creator" | "admin";

interface DemoRoleContextValue {
	demoRole: UserRole | null;
	setDemoRole: (role: UserRole | null) => void;
}

const DemoRoleContext = createContext<DemoRoleContextValue>({
	demoRole: null,
	setDemoRole: () => {},
});

export function DemoRoleProvider({ children }: { children: ReactNode }) {
	const router = useRouter();
	const [demoRole, setDemoRoleState] = useState<UserRole | null>(() =>
		getDemoRoleCookie(),
	);

	const setDemoRole = useCallback(
		(role: UserRole | null) => {
			setDemoRoleCookie(role);
			setDemoRoleState(role);
			router.refresh();
		},
		[router],
	);

	return (
		<DemoRoleContext.Provider value={{ demoRole, setDemoRole }}>
			{children}
		</DemoRoleContext.Provider>
	);
}

export function useDemoRole() {
	return useContext(DemoRoleContext);
}
