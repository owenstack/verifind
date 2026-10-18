import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@verifind/ui/components/button";
import { usePullToRefresh } from "@verifind/ui/hooks/use-pull-to-refresh";
import { AppBackButton } from "@verifind/ui/platform/app-back-button";
import { BottomSheet } from "@verifind/ui/platform/bottom-sheet";
import { useCallback, useState } from "react";
import { useAppBack } from "@/platform/use-app-back";

export const Route = createFileRoute("/platform")({
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
						Example 1 · navigation and shell
					</p>
				</div>
				<h1 className="font-semibold text-2xl">
					App shell and behavior primitives
				</h1>
				<p className="text-muted-foreground">
					The persistent header, safe-area-aware footer, offline host, and
					update host are wired in the root route. These examples show
					page-level behavior.
				</p>
			</header>

			<section
				aria-labelledby="pull-heading"
				className="grid gap-3 rounded-lg border bg-card p-4"
			>
				<h2 className="font-semibold" id="pull-heading">
					Pull to refresh
				</h2>
				<p className="text-muted-foreground text-sm">
					On touch devices, pull down from the top of this panel. The hook only
					refreshes when its element is at scroll position zero.
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
							Scrollable demo row {row}
						</p>
					))}
				</section>
				<Button
					disabled={pull.refreshing}
					onClick={refresh}
					type="button"
					variant="outline"
				>
					{pull.refreshing ? "Refreshing…" : "Refresh (accessible alternative)"}
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
					Bottom sheet and in-app back
				</h2>
				<p className="text-muted-foreground text-sm">
					BottomSheet handles modal focus, Escape/back dismissal, and an
					accessible title. The designer supplies its inner content and styling.
				</p>
				<div className="flex flex-wrap gap-3">
					<Button onClick={openSheet} type="button">
						Open bottom sheet
					</Button>
					<Button onClick={goBack} type="button" variant="outline">
						Use shell back
					</Button>
					<Link
						className="self-center text-primary text-sm underline"
						to="/offline"
						viewTransition
					>
						See route transition
					</Link>
				</div>
				<CodeExample>{`<BottomSheet open={open} onOpenChange={setOpen} title="…">\n  <DesignerContent />\n</BottomSheet>`}</CodeExample>
			</section>

			<BottomSheet
				description="The browser dialog provides modal behavior; provide screen content and token-based styling."
				onOpenChange={setSheetOpen}
				open={sheetOpen}
				title="Example sheet"
			>
				<div className="grid gap-4 p-4">
					<p className="text-muted-foreground text-sm">
						This sample sheet closes from Escape, the browser back gesture, or
						the button.
					</p>
					<Button onClick={closeSheet} type="button" variant="outline">
						Close
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
