import { createFileRoute, Link } from "@tanstack/react-router";
import { buttonVariants } from "@verifind/ui/components/button";
import welcomeImage from "@/assets/welcome.png";

export const Route = createFileRoute("/welcome")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="relative flex min-h-screen flex-col overflow-hidden bg-primary text-primary-foreground">
			<img
				alt=""
				className="absolute inset-0 size-full object-cover"
				src={welcomeImage}
			/>
			<div className="absolute inset-0 bg-linear-to-b from-black/10 via-primary/30 to-primary" />
			<div className="absolute top-[46%] left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4">
				<img
					alt="VeriFind"
					className="size-16 sm:size-20"
					src="/logo.png"
				/>
				<h1 className="font-bold text-5xl leading-none tracking-tight sm:text-6xl">
					VeriFind
				</h1>
			</div>
			<div className="relative z-10 mx-auto flex min-h-screen w-full max-w-lg flex-col justify-end px-6 pt-16 pb-20 text-center sm:px-10 sm:pb-24">
				<div className="mb-10 space-y-3">
					<p className="font-semibold text-2xl tracking-tight sm:text-3xl">
						Find verified homes.
					</p>
					<p className="text-base text-primary-foreground/80 sm:text-lg">
						Your safety is our priority.
					</p>
				</div>
				<Link className={buttonVariants({variant: 'secondary', className: 'w-full', size: 'lg'})} to="/signup">
					Get Started
				</Link>
				<p className="mt-5 text-primary-foreground/80 text-sm">
					Already have an account?{" "}
					<Link
						className="font-semibold underline underline-offset-2"
						to="/login"
					>
						Sign in
					</Link>
				</p>
			</div>
		</main>
	);
}
