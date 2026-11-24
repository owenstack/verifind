import { createFileRoute } from "@tanstack/react-router";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_secure/_app/explore/$id")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		const { id } = params;
		await context.queryClient.query(
			orpc.tenant.properties.get.queryOptions({ input: { id } })
		);
	},
});

function RouteComponent() {
	return <div>Hello "/_secure/_app/explore/$id"!</div>;
}
