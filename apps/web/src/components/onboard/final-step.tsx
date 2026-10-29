import { useNavigate } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { Logo } from "../logo";

const loadingMessages = [
	"Checking listings and payment options…",
	"Finding homes in your preferred areas…",
	"Matching listings to your budget…",
	"Getting your home search ready…",
	"Your home search is ready.",
] as const;

export function FinalStep() {
	const navigate = useNavigate();

	return (
		<div className="flex min-h-[calc(100dvh-40px)] items-center justify-center">
			<div className="flex max-w-sm flex-col items-center gap-4 text-center">
				<Logo />
				<h3 className="text-xl tracking-tight">
					Finding Homes That Match Your Preferences…
				</h3>
				<p className="text-muted-foreground">
					Your home type, budget, and preferred area will guide your search.
				</p>
				<div className="flex w-full flex-col gap-2">
					<div className="flex items-center justify-between text-muted-foreground text-xs">
						<span>Preparing your search</span>
						<span
							aria-label="Preparing your search"
							className="onboard-progress-count tabular-nums"
							role="status"
						/>
					</div>
					<div
						aria-hidden="true"
						className="h-2 w-full overflow-hidden rounded-2xl bg-muted"
					>
						<div className="onboard-progress-bar h-full rounded-2xl bg-primary" />
					</div>
					<div
						aria-live="polite"
						className="grid text-muted-foreground text-xs"
					>
						{loadingMessages.map((message, index) => (
							<p
								className="onboard-message col-start-1 row-start-1 opacity-0"
								key={message}
								onAnimationEnd={
									index === loadingMessages.length - 1
										? () => navigate({ to: "/" })
										: undefined
								}
								style={{ "--message-index": index } as CSSProperties}
							>
								{message}
							</p>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
