import { createFileRoute } from "@tanstack/react-router";
import { buttonVariants } from "@verifind/ui/components/button";
import { Logo } from "@/components/logo";
import { TransitionLink } from "@/platform/transition-link";

export const Route = createFileRoute("/_auth/welcome")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="z-10">
			<div className="absolute inset-0 bg-linear-to-b from-black/10 via-primary/30 to-primary" />
			<Logo
				className="absolute top-[46%] left-1/2 -translate-x-1/2 -translate-y-1/2"
				wordmark
			/>
			<div className="relative mx-auto flex min-h-screen w-full max-w-lg flex-col justify-end px-6 pt-16 pb-20 text-center sm:px-10 sm:pb-24">
				<div className="mb-10 space-y-3">
					<p className="font-semibold text-2xl tracking-tight sm:text-3xl">
						Find a Rental You Can Trust
					</p>
					<p className="text-base text-primary-foreground/80 sm:text-lg">
						Browse rental listings with clear details and contact property
						representatives directly.
					</p>
				</div>
				<TransitionLink
					className={buttonVariants({
						variant: "secondary",
						className: "w-full",
						size: "lg",
					})}
					to="/signup"
				>
					Create Account
				</TransitionLink>
				<p className="mt-5 text-primary-foreground/80 text-sm">
					Already have an account?{" "}
					<TransitionLink
						className="font-semibold underline underline-offset-2"
						to="/login"
					>
						Sign in
					</TransitionLink>
				</p>
			</div>
		</div>
	);
}
