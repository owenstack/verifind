import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

const searchSchema = z.object({
	email: z.email().optional(),
	next: z.string().optional(),
});

export const Route = createFileRoute("/_auth/verify")({
	component: RouteComponent,
	validateSearch: searchSchema,
});

function RouteComponent() {
	return (
		<main className="mx-auto grid w-full max-w-lg gap-3 p-4 sm:p-6">
			<h1 className="font-semibold text-2xl">Email Verification</h1>
			<p className="text-muted-foreground">
				Complete the verification step to continue to VeriFind.
			</p>
		</main>
	);
}
