import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Footer } from "@/components/footer";

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
