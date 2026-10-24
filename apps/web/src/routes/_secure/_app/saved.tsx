import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_secure/_app/saved")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="mx-auto grid w-full max-w-3xl gap-2 p-4 sm:p-6">
			<h1 className="font-semibold text-2xl">Saved Homes</h1>
			<p className="text-muted-foreground">
				Homes you save will appear here so you can find them again.
			</p>
		</main>
	);
}
