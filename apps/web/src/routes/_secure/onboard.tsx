import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_secure/onboard")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="mx-auto grid w-full max-w-lg gap-2 p-4 sm:p-6">
			<h1 className="font-semibold text-2xl">Set Up Your Profile</h1>
			<p className="text-muted-foreground">
				Add your details to personalize your VeriFind experience.
			</p>
		</main>
	);
}
