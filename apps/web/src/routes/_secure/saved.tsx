import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_secure/saved")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_secure/saved"!</div>;
}
