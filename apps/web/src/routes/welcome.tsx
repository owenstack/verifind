import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/welcome")({
	component: WelcomePlaceholder,
});

function WelcomePlaceholder() {
	return (
		<main className="grid min-h-svh place-content-center gap-5 bg-background p-8 text-center text-foreground">
			<p className="text-muted-foreground text-sm">
				Designer owned welcome screen placeholder
			</p>
			<h1 className="font-semibold text-3xl">Find Verified Homes</h1>
			<p>Your Safety, Our Priority</p>
			<Link
				className="rounded-full bg-secondary px-8 py-3 text-secondary-foreground"
				to="/login"
			>
				Get Started
			</Link>
			<p>
				Already have an account?{" "}
				<Link className="underline" to="/login">
					Sign in
				</Link>
			</p>
		</main>
	);
}
