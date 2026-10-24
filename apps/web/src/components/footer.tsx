import { footerLinks } from "@/lib/constants";
import { TransitionLink } from "@/platform/transition-link";

export function Footer() {
	return (
		<nav
			aria-label="Main navigation"
			className="f-app-shell__chrome vf-app-shell__tab-bar fixed bottom-0 z-20 grid min-h-16 w-full grid-cols-5 border-t bg-background px-2"
		>
			{footerLinks.map(({ icon: Icon, label, to }) => (
				<TransitionLink
					activeProps={{
						className: "text-primary",
						"aria-current": "page",
					}}
					className="flex min-w-0 flex-col items-center justify-center gap-1 py-2 text-muted-foreground transition-colors hover:text-foreground [&.active]:text-primary"
					key={to}
					to={to as string}
				>
					<Icon aria-hidden="true" className="size-5" />
					<span className="text-xs leading-none">{label}</span>
				</TransitionLink>
			))}
		</nav>
	);
}
