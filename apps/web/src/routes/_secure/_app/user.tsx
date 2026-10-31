import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_secure/_app/user")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_secure/_app/user"!</div>;
}
