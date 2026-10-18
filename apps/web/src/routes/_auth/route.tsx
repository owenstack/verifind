import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getSession } from "@/lib/auth-client";
import { readOfflineOwnerId } from "@/lib/offline-persistence";

export const Route = createFileRoute("/_auth")({
	component: AuthLayout,
	beforeLoad: async () => {
		const session = await getSession();
		const offlineSession =
			Boolean(session.error) &&
			typeof navigator !== "undefined" &&
			!navigator.onLine &&
			Boolean(readOfflineOwnerId());
		if (!session.data && !offlineSession) {
			throw redirect({
				to: "/login",
			});
		}
		return {
			session,
			offlineOwnerId: offlineSession ? readOfflineOwnerId() : null,
		};
	},
});

function AuthLayout() {
	return <Outlet />;
}
