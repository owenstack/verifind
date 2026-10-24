import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { getSession } from "@/lib/auth-client";
import { readOfflineOwnerId } from "@/lib/offline-persistence";

export const Route = createFileRoute("/examples/")({
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
		title: "App Navigation & Layout",
		description:
			"Try the back controls, bottom sheets, and pull-to-refresh behavior.",
	},
	{
		to: "/offline" as const,
		title: "Offline Access & Drafts",
		description:
			"Check your connection, save a private draft, and see when updates are ready.",
	},
	{
		to: "/capabilities" as const,
		title: "Device Features",
		description:
			"Try vibration feedback, sharing, screen wake, app badges, and image capture.",
	},
];

function OverviewPage() {
	return (
		<div className="mx-auto grid w-full max-w-3xl gap-6 p-4 sm:p-6">
			<header className="grid gap-2">
				<p className="text-muted-foreground text-sm">
					VeriFind App Examples
				</p>
				<h1 className="font-semibold text-2xl">
					Explore VeriFind’s App Features
				</h1>
				<p className="max-w-prose text-muted-foreground">
					Explore navigation, offline access, and device features through these
					interactive examples.
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
					How to Try These Examples
				</h2>
				<ol className="list-inside list-decimal space-y-2 text-muted-foreground text-sm">
					<li>Choose an example above to explore its features.</li>
					<li>
						Open an example on your phone or resize your browser to see how the
						layout adapts.
					</li>
					<li>
						Try the controls. If your browser doesn’t support a feature, the
						page will explain what happened.
					</li>
					<li>
						Developers can inspect the route files in{" "}
						<code>apps/web/src/routes</code>
						to see how each example works.
					</li>
				</ol>
			</section>
		</div>
	);
}
