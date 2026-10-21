import { Link } from "@tanstack/react-router";
import { Button, buttonVariants } from "@verifind/ui/components/button";
import { Info, WifiOff } from "lucide-react";

export function Offline() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
			<div className="flex w-full max-w-lg flex-col items-center gap-6 text-center">
				<div className="flex size-48 items-center justify-center rounded-full border border-secondary/40 bg-secondary/10 sm:size-56">
					<div className="flex size-36 items-center justify-center rounded-full border border-secondary/40 sm:size-44">
						<WifiOff className="size-24 text-primary/60 sm:size-28" />
					</div>
				</div>
				<div className="space-y-2">
					<h1 className="font-semibold text-3xl tracking-tight sm:text-4xl">
						You're currently offline
					</h1>
					<p className="text-base text-muted-foreground leading-relaxed">
						It looks like your internet connection is unavailable. Reconnect to
						keep finding verified homes and contacting landlords.
					</p>
				</div>
				<div className="flex w-full flex-col gap-3 pt-1">
					<Button className="w-full" size="lg">
						Try again
					</Button>
					<Link
						className={buttonVariants({
							size: "lg",
							variant: "outline",
							className: "w-full",
						})}
						to="/saved"
					>
						View saved homes
					</Link>
				</div>
				<p className="flex items-start justify-center gap-2 text-muted-foreground text-sm leading-relaxed">
					<Info className="mt-0.5 size-4 shrink-0 text-primary" />
					<span>Saved homes may be available if they were loaded earlier.</span>
				</p>
			</div>
		</div>
	);
}
