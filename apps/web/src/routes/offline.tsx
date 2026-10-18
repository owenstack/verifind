import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@verifind/ui/components/button";
import { type ChangeEvent, useCallback, useEffect, useState } from "react";
import { loadFormDraft, saveFormDraft } from "@/lib/offline-data";
import { readOfflineOwnerId } from "@/lib/offline-persistence";
import { useOfflineStatus } from "@/lib/use-offline-status";
import { usePwaUpdates } from "@/platform/pwa-updates";

export const Route = createFileRoute("/offline")({
	component: OfflineExamplesPage,
});

const draftId = "platform-demo-note";

function OfflineExamplesPage() {
	const { isOnline, lastSyncFailed, pendingCount, setLastSyncFailed } =
		useOfflineStatus();
	const { offlineReady, updateAvailable, applyUpdate } = usePwaUpdates();
	const ownerId = readOfflineOwnerId();
	const [draft, setDraft] = useState("");
	const [message, setMessage] = useState("Checking for a saved draft…");
	const resetSyncStatus = useCallback(
		() => setLastSyncFailed(false),
		[setLastSyncFailed]
	);
	const onDraftChange = useCallback(
		(event: ChangeEvent<HTMLTextAreaElement>) => {
			setDraft(event.target.value);
		},
		[]
	);

	useEffect(() => {
		if (!ownerId) {
			setMessage("Sign in once to enable private, user-scoped draft storage.");
			return;
		}
		let active = true;
		loadFormDraft(ownerId, draftId)
			.then((saved) => {
				if (active) {
					if (typeof saved === "string") {
						setDraft(saved);
					}
					setMessage(
						saved ? "Draft restored from this device." : "No saved draft yet."
					);
				}
			})
			.catch(() => {
				if (active) {
					setMessage("Local storage is unavailable in this browser session.");
				}
			});
		return () => {
			active = false;
		};
	}, [ownerId]);

	const saveDraft = useCallback(async (): Promise<void> => {
		if (!ownerId) {
			setMessage("A signed-in user is required to save a private draft.");
			return;
		}
		try {
			await saveFormDraft(ownerId, draftId, draft);
			setMessage("Draft saved on this device for up to 14 days.");
		} catch {
			setMessage("Draft could not be saved on this device.");
		}
	}, [draft, ownerId]);

	return (
		<div className="mx-auto grid w-full max-w-3xl gap-6 p-4 sm:p-6">
			<header className="grid gap-2">
				<p className="text-muted-foreground text-sm">
					Example 2 · connectivity and persistence
				</p>
				<h1 className="font-semibold text-2xl">Offline data and drafts</h1>
				<p className="text-muted-foreground">
					This page reads live connectivity, queued mutation count, and
					service-worker update state. The banner at the top of the app is
					supplied to AppShell's offline/update slots.
				</p>
			</header>

			<section
				aria-labelledby="status-heading"
				className="grid gap-3 rounded-lg border bg-card p-4"
			>
				<h2 className="font-semibold" id="status-heading">
					Current platform state
				</h2>
				<dl className="grid gap-2 text-sm sm:grid-cols-2">
					<StatusItem label="Network" value={isOnline ? "Online" : "Offline"} />
					<StatusItem label="Pending mutations" value={String(pendingCount)} />
					<StatusItem
						label="Last sync"
						value={lastSyncFailed ? "Needs retry" : "No error reported"}
					/>
					<StatusItem
						label="App shell"
						value={offlineReady ? "Available offline" : "Not yet confirmed"}
					/>
					<StatusItem
						label="App update"
						value={updateAvailable ? "Ready to apply" : "No update waiting"}
					/>
				</dl>
				<div className="flex flex-wrap gap-3">
					<Button onClick={resetSyncStatus} type="button" variant="outline">
						Clear demo sync status
					</Button>
					{updateAvailable ? (
						<Button onClick={applyUpdate} type="button">
							Apply update
						</Button>
					) : null}
				</div>
				<CodeExample>
					{
						"const { isOnline, pendingCount } = useOfflineStatus();\nconst { updateAvailable, applyUpdate } = usePwaUpdates();"
					}
				</CodeExample>
			</section>

			<section
				aria-labelledby="draft-heading"
				className="grid gap-3 rounded-lg border bg-card p-4"
			>
				<h2 className="font-semibold" id="draft-heading">
					Private draft example
				</h2>
				<p className="text-muted-foreground text-sm">
					This sample saves only under the remembered account ID. Sign in to try
					IndexedDB persistence; signing out clears this draft store.
				</p>
				<label className="grid gap-2 text-sm" htmlFor="demo-draft">
					A note you are working on
				</label>
				<textarea
					className="min-h-24 rounded-md border bg-background p-3 text-foreground"
					id="demo-draft"
					onChange={onDraftChange}
					value={draft}
				/>
				<div aria-live="polite" className="text-muted-foreground text-sm">
					{message}
				</div>
				<Button
					disabled={!ownerId}
					onClick={saveDraft}
					type="button"
					variant="outline"
				>
					Save draft to this device
				</Button>
				<CodeExample>{`await saveFormDraft(ownerId, "verification", formValues);\nconst values = await loadFormDraft(ownerId, "verification");`}</CodeExample>
			</section>

			<p className="text-muted-foreground text-sm">
				Queued mutations need a screen-specific handler and an idempotency
				strategy. Do not queue payments, identity evidence, or other
				irreversible actions for blind replay.
			</p>
		</div>
	);
}

function StatusItem({ label, value }: { label: string; value: string }) {
	return (
		<div className="grid gap-1 rounded-md bg-muted p-3">
			<dt className="text-muted-foreground">{label}</dt>
			<dd className="font-medium text-foreground">{value}</dd>
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
