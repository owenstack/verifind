import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@verifind/ui/components/button";
import { usePullToRefresh } from "@verifind/ui/hooks/use-pull-to-refresh";
import { AppBackButton } from "@verifind/ui/platform/app-back-button";
import { BottomSheet } from "@verifind/ui/platform/bottom-sheet";
import { useCallback, useState } from "react";
import { useAppBack } from "@/platform/use-app-back";

export const Route = createFileRoute("/examples/platform")({
	component: ShellExamplesPage,
});

function ShellExamplesPage() {
	const [sheetOpen, setSheetOpen] = useState(false);
	const [refreshCount, setRefreshCount] = useState(0);
	const goBack = useAppBack("/");
	const openSheet = useCallback(() => setSheetOpen(true), []);
	const closeSheet = useCallback(() => setSheetOpen(false), []);
	const refresh = useCallback(async () => {
		await new Promise((resolve) => window.setTimeout(resolve, 400));
		setRefreshCount((count) => count + 1);
	}, []);
	const pull = usePullToRefresh({ refresh });
	const rows = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight"];

	return (
		<div className="mx-auto grid w-full max-w-3xl gap-6 p-4 sm:p-6">
			<header className="grid gap-2">
				<div className="flex items-center gap-3">
					<AppBackButton
						className="text-primary text-sm underline"
						onBack={goBack}
					>
						Back
					</AppBackButton>
					<p className="text-muted-foreground text-sm">
						Example 1 · Navigation & App Layout
					</p>
				</div>
				<h1 className="font-semibold text-2xl">App Layout & Navigation</h1>
				<p className="text-muted-foreground">
					See how the app handles navigation, device safe areas, offline status,
					and updates. The examples below show features you can try on this
					page.
				</p>
			</header>

			<section
				aria-labelledby="pull-heading"
				className="grid gap-3 rounded-lg border bg-card p-4"
			>
				<h2 className="font-semibold" id="pull-heading">
					Pull to Refresh
				</h2>
				<p className="text-muted-foreground text-sm">
					On a touch screen, pull down from the top of this list to refresh it.
					You can also use the button below.
				</p>
				<section
					aria-label="Pull to refresh example"
					className="max-h-48 overflow-auto rounded-md border bg-background p-4"
					data-pull-distance={pull.pullDistance}
					ref={pull.elementRef}
				>
					<p aria-live="polite" className="text-primary text-sm">
						{pull.refreshing
							? "Refreshing…"
							: `Refreshed ${refreshCount} time${refreshCount === 1 ? "" : "s"}`}
					</p>
					{rows.map((row) => (
						<p
							className="border-b py-4 text-muted-foreground text-sm"
							key={row}
						>
							Sample list item {row}
						</p>
					))}
				</section>
				<Button
					disabled={pull.refreshing}
					onClick={refresh}
					type="button"
					variant="outline"
				>
					{pull.refreshing ? "Refreshing…" : "Refresh List"}
				</Button>
				<CodeExample>
					{
						"const pull = usePullToRefresh({ refresh });\n<div ref={pull.elementRef}>…</div>"
					}
				</CodeExample>
			</section>

			<section
				aria-labelledby="sheet-heading"
				className="grid gap-3 rounded-lg border bg-card p-4"
			>
				<h2 className="font-semibold" id="sheet-heading">
					Bottom Sheet & Back Navigation
				</h2>
				<p className="text-muted-foreground text-sm">
					Open a panel that supports keyboard and device back controls. Press
					Escape, use your device’s back gesture, or select the close button to
					dismiss it.
				</p>
				<div className="flex flex-wrap gap-3">
					<Button onClick={openSheet} type="button">
						Open Bottom Sheet
					</Button>
					<Button onClick={goBack} type="button" variant="outline">
						Go Back
					</Button>
					<Link
						className="self-center text-primary text-sm underline"
						to="/offline"
						viewTransition
					>
						View Offline Example
					</Link>
				</div>
				<CodeExample>{`<BottomSheet open={open} onOpenChange={setOpen} title="…">\n  <DesignerContent />\n</BottomSheet>`}</CodeExample>
			</section>

			<BottomSheet
				description="A panel that keeps keyboard and screen reader focus in the dialog."
				onOpenChange={setSheetOpen}
				open={sheetOpen}
				title="Sample Bottom Sheet"
			>
				<div className="grid gap-4 p-4">
					<p className="text-muted-foreground text-sm">
						Close this panel with Escape, your device’s back gesture, or the
						button.
					</p>
					<Button onClick={closeSheet} type="button" variant="outline">
						Close Panel
					</Button>
				</div>
			</BottomSheet>
		</div>
	);
}

function CodeExample({ children }: { children: string }) {
	return (
		<pre className="overflow-auto rounded-md bg-muted p-3 text-muted-foreground text-xs">
			<code>{children}</code>
		</pre>
	);
}
