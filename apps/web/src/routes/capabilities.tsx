import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@verifind/ui/components/button";
import { type ChangeEvent, useCallback, useEffect, useState } from "react";
import {
	getInstallState,
	getPushState,
	preloadHaptics,
	readCapabilityPreferences,
	releaseWakeLock,
	requestWakeLock,
	saveCapabilityPreferences,
	setAppBadge,
	share,
	triggerHaptic,
} from "@/platform/capabilities";
import { readEvidenceFile } from "@/platform/evidence-capture";

export const Route = createFileRoute("/capabilities")({
	component: CapabilitiesPage,
});

function CapabilitiesPage() {
	const [status, setStatus] = useState(
		"Choose an action to try a browser capability."
	);
	const [pushState, setPushState] = useState("Checking…");
	const [wakeLockActive, setWakeLockActive] = useState(false);
	const [hapticsEnabled, setHapticsEnabled] = useState(
		() => readCapabilityPreferences().haptics
	);

	useEffect(() => {
		// Load the optional haptics chunk before a user taps its test button.
		// biome-ignore lint/complexity/noVoid: optional enhancement is loaded in the background.
		void preloadHaptics();
		getPushState().then(setPushState);
	}, []);

	const tryShare = useCallback(async (): Promise<void> => {
		const shared = await share({
			title: "VeriFind platform example",
			text: "Sharing from the VeriFind capability demo.",
			url: window.location.href,
		});
		setStatus(
			shared
				? "Share sheet opened."
				: "Share is unavailable or was dismissed; the page still works."
		);
	}, []);

	const toggleWakeLock = useCallback(async (): Promise<void> => {
		if (wakeLockActive) {
			await releaseWakeLock();
			setWakeLockActive(false);
			setStatus("Screen wake lock released.");
			return;
		}
		const acquired = await requestWakeLock();
		setWakeLockActive(acquired);
		setStatus(
			acquired
				? "Screen stays awake while this page is visible."
				: "Wake lock is unavailable or permission was denied."
		);
	}, [wakeLockActive]);

	const handleEvidenceFile = useCallback(
		async (file: File | undefined): Promise<void> => {
			if (!file) {
				return;
			}
			try {
				const compressed = await readEvidenceFile(file);
				setStatus(
					`Image ready: ${formatBytes(file.size)} → ${formatBytes(compressed.size)}. Upload is not wired until an authorized storage endpoint exists.`
				);
			} catch {
				setStatus(
					"This image could not be prepared. Choose another image or use the camera capture flow."
				);
			}
		},
		[]
	);

	const toggleHaptics = useCallback((enabled: boolean): void => {
		setHapticsEnabled(enabled);
		saveCapabilityPreferences({
			...readCapabilityPreferences(),
			haptics: enabled,
		});
	}, []);
	const tryHaptic = useCallback(() => triggerHaptic("success"), []);
	const setBadge = useCallback(async (): Promise<void> => {
		await setAppBadge(1);
		setStatus("Badge set if supported.");
	}, []);
	const onHapticsChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			toggleHaptics(event.target.checked);
		},
		[toggleHaptics]
	);
	const onEvidenceFileChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			// biome-ignore lint/complexity/noVoid: the async file preparation reports errors in the page status.
			void handleEvidenceFile(event.target.files?.[0]);
		},
		[handleEvidenceFile]
	);

	return (
		<div className="mx-auto grid w-full max-w-3xl gap-6 p-4 sm:p-6">
			<header className="grid gap-2">
				<p className="text-muted-foreground text-sm">
					Example 3 · progressive enhancement
				</p>
				<h1 className="font-semibold text-2xl">Native-feeling capabilities</h1>
				<p className="text-muted-foreground">
					Each adapter feature-detects support and can fail without blocking the
					core screen. All actions below are initiated by you.
				</p>
			</header>

			<section
				aria-labelledby="capability-heading"
				className="grid gap-3 rounded-lg border bg-card p-4"
			>
				<h2 className="font-semibold" id="capability-heading">
					Device capabilities
				</h2>
				<div className="flex flex-wrap gap-3">
					<Button onClick={tryHaptic} type="button" variant="outline">
						Try success haptic
					</Button>
					<Button onClick={tryShare} type="button" variant="outline">
						Share this page
					</Button>
					<Button onClick={setBadge} type="button" variant="outline">
						Set app badge
					</Button>
					<Button onClick={toggleWakeLock} type="button" variant="outline">
						{wakeLockActive ? "Release wake lock" : "Request wake lock"}
					</Button>
				</div>
				<label
					className="flex items-center gap-2 text-sm"
					htmlFor="haptics-setting"
				>
					<input
						checked={hapticsEnabled}
						id="haptics-setting"
						onChange={onHapticsChange}
						type="checkbox"
					/>
					Enable haptics preference
				</label>
				<dl className="grid gap-2 text-sm sm:grid-cols-2">
					<StatusItem label="Install state" value={getInstallState()} />
					<StatusItem label="Push permission/subscription" value={pushState} />
				</dl>
				<p aria-live="polite" className="text-muted-foreground text-sm">
					{status}
				</p>
				<p className="text-muted-foreground text-sm">
					Push subscription is intentionally not requested here: server VAPID
					configuration and a subscription endpoint are not available yet.
				</p>
				<CodeExample>{`triggerHaptic("success");\nawait share({ title, text, url });\nawait setAppBadge(unreadCount);`}</CodeExample>
			</section>

			<section
				aria-labelledby="capture-heading"
				className="grid gap-3 rounded-lg border bg-card p-4"
			>
				<h2 className="font-semibold" id="capture-heading">
					Evidence image preparation
				</h2>
				<p className="text-muted-foreground text-sm">
					This file input is the fallback when camera access is denied or
					unavailable. Images are compressed locally; nothing is uploaded.
				</p>
				<label className="grid gap-2 text-sm" htmlFor="evidence-image">
					Choose an image
				</label>
				<input
					accept="image/*"
					capture="environment"
					id="evidence-image"
					onChange={onEvidenceFileChange}
					type="file"
				/>
				<CodeExample>
					{
						"const camera = await openEvidenceCamera();\nconst jpeg = await compressEvidenceImage(videoElement);\n// Request a signed upload only when the server contract exists."
					}
				</CodeExample>
			</section>
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

function formatBytes(bytes: number): string {
	return `${(bytes / 1024).toFixed(0)} KiB`;
}
