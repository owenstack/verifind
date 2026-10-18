import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { getSession } from "@/lib/auth-client";
import { readOfflineOwnerId } from "@/lib/offline-persistence";

export const Route = createFileRoute("/")({
	beforeLoad: async () => {
		const session = await getSession();
		const offlineSession =
			Boolean(session.error) &&
			typeof navigator !== "undefined" &&
			!navigator.onLine &&
			Boolean(readOfflineOwnerId());
		if (!(session.data || offlineSession)) {
			throw redirect({ to: "/welcome" });
		}
	},
	component: OverviewPage,
});

const examples = [
	{
		to: "/platform" as const,
		title: "App shell and navigation",
		description:
			"Safe areas, bottom sheets, back handling, route transitions, and pull to refresh.",
	},
	{
		to: "/offline" as const,
		title: "Offline data and drafts",
		description:
			"Connection state, per-user local drafts, queued mutation status, and update prompts.",
	},
	{
		to: "/capabilities" as const,
		title: "Native-feeling capabilities",
		description:
			"Haptics, sharing, badges, wake lock, notifications, and camera fallbacks.",
	},
];

function OverviewPage() {
	return (
		<div className="mx-auto grid w-full max-w-3xl gap-6 p-4 sm:p-6">
			<header className="grid gap-2">
				<p className="text-muted-foreground text-sm">
					VeriFind engineering showcase
				</p>
				<h1 className="font-semibold text-2xl">Use the platform foundation</h1>
				<p className="max-w-prose text-muted-foreground">
					These working examples show how to connect the behavior primitives to
					a screen. The component visuals are examples only; replace them with
					the designer's screen treatment while keeping the hooks and
					accessibility behavior.
				</p>
			</header>
			<div className="grid gap-3">
				{examples.map((example, index) => (
					<Link
						className="grid gap-2 rounded-lg border bg-card p-4 text-card-foreground transition-colors hover:bg-muted"
						key={example.to}
						to={example.to as string}
					>
						<span className="text-muted-foreground text-sm">
							Example {index + 1}
						</span>
						<strong>{example.title}</strong>
						<span className="text-muted-foreground text-sm">
							{example.description}
						</span>
					</Link>
				))}
			</div>
			<section
				aria-labelledby="setup-heading"
				className="grid gap-3 rounded-lg border bg-muted p-4"
			>
				<h2 className="font-semibold" id="setup-heading">
					How to explore
				</h2>
				<ol className="list-inside list-decimal space-y-2 text-muted-foreground text-sm">
					<li>Use the bottom navigation to switch examples.</li>
					<li>
						Resize to a narrow viewport or open a mobile keyboard to inspect
						shell behavior.
					</li>
					<li>
						Try the interactive controls; denied or unsupported browser features
						report a graceful fallback.
					</li>
					<li>
						Open each file in <code>apps/web/src/routes</code> to see the
						component and hook wiring.
					</li>
				</ol>
			</section>
		</div>
	);
}
