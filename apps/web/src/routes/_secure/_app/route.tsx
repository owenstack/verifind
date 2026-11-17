import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Footer } from "@/components/others/footer";

export const Route = createFileRoute("/_secure/_app")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<Outlet />
			<Footer />
		</div>
	);
}
