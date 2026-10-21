import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@verifind/ui/components/button";
import { type ChangeEvent, useCallback, useEffect, useState } from "react";
import { loadFormDraft, saveFormDraft } from "@/lib/offline-data";
import { readOfflineOwnerId } from "@/lib/offline-persistence";
import { useOfflineStatus } from "@/lib/use-offline-status";
import { usePwaUpdates } from "@/platform/pwa-updates";

export const Route = createFileRoute("/examples/offline")({
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
			setMessage("Sign in to save a private draft on this device.");
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
						saved
							? "Your draft is ready on this device."
							: "No saved draft yet."
					);
				}
			})
			.catch(() => {
				if (active) {
					setMessage("This browser session can’t access local storage.");
				}
			});
		return () => {
			active = false;
		};
	}, [ownerId]);

	const saveDraft = useCallback(async (): Promise<void> => {
		if (!ownerId) {
			setMessage("Sign in to save your draft privately on this device.");
			return;
		}
		try {
			await saveFormDraft(ownerId, draftId, draft);
			setMessage(
				"Draft saved on this device. It will be removed after 14 days."
			);
		} catch {
			setMessage(
				"Couldn’t save your draft. Check your device storage and try again."
			);
		}
	}, [draft, ownerId]);

	return (
		<div className="mx-auto grid w-full max-w-3xl gap-6 p-4 sm:p-6">
			<header className="grid gap-2">
				<p className="text-muted-foreground text-sm">
					Example 2 · Offline Access & Saved Drafts
				</p>
				<h1 className="font-semibold text-2xl">Offline Access & Drafts</h1>
				<p className="text-muted-foreground">
					Check your connection, see whether changes are waiting to sync, and
					apply an available app update. You can also save a private note on
					this device and reopen it later.
				</p>
			</header>

			<section
				aria-labelledby="status-heading"
				className="grid gap-3 rounded-lg border bg-card p-4"
			>
				<h2 className="font-semibold" id="status-heading">
					Connection & Update Status
				</h2>
				<dl className="grid gap-2 text-sm sm:grid-cols-2">
					<StatusItem label="Network" value={isOnline ? "Online" : "Offline"} />
					<StatusItem
						label="Changes waiting to sync"
						value={String(pendingCount)}
					/>
					<StatusItem
						label="Last sync"
						value={lastSyncFailed ? "Sync failed. Try again." : "Up to date"}
					/>
					<StatusItem
						label="App shell"
						value={
							offlineReady ? "Ready to use offline" : "Checking availability"
						}
					/>
					<StatusItem
						label="App update"
						value={updateAvailable ? "Update ready" : "No update available"}
					/>
				</dl>
				<div className="flex flex-wrap gap-3">
					<Button onClick={resetSyncStatus} type="button" variant="outline">
						Clear Sync Error
					</Button>
					{updateAvailable ? (
						<Button onClick={applyUpdate} type="button">
							Apply Update
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
					Save a Private Note
				</h2>
				<p className="text-muted-foreground text-sm">
					Your note is saved in this browser and linked to your account. Sign in
					to try it. Signing out removes saved data from this device.
				</p>
				<label className="grid gap-2 text-sm" htmlFor="demo-draft">
					Your Note
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
					Save Note
				</Button>
				<CodeExample>{`await saveFormDraft(ownerId, "verification", formValues);\nconst values = await loadFormDraft(ownerId, "verification");`}</CodeExample>
			</section>

			<p className="text-muted-foreground text-sm">
				Changes that need server confirmation may wait until you’re online.
				Don’t queue payments or identity documents for automatic replay.
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
