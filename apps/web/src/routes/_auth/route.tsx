import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getSession } from "@/lib/auth-client";

export const Route = createFileRoute("/_auth")({
	component: AuthLayout,
	beforeLoad: async () => {
		const session = await getSession();
		if (!session.data) {
			throw redirect({
				to: "/login",
			});
		}
		return { session };
	},
});

function AuthLayout() {
	return <Outlet />;
}
