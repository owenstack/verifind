import { createFileRoute } from "@tanstack/react-router";
import welcomeImage from "@/assets/welcome.png";

export const Route = createFileRoute("/_auth/signup")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="relative flex min-h-screen flex-col overflow-hidden">
			<img
				alt=""
				className="absolute inset-0 size-full object-cover"
				height={4000}
				src={welcomeImage}
				width={4000}
			/>
		</main>
	);
}
