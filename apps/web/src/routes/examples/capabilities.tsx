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

const installStateLabels = {
	installed: "Installed",
	browser: "In browser",
} as const;

const pushStateLabels = {
	checking: "Checking notification status…",
	unsupported: "Not supported by this browser",
	denied: "Blocked in browser settings",
	subscribed: "Enabled",
	unsubscribed: "Not enabled",
} as const;

export const Route = createFileRoute("/examples/capabilities")({
	component: CapabilitiesPage,
});

function CapabilitiesPage() {
	const [status, setStatus] = useState(
		"Choose a feature below to see how it works on your device."
	);
	const [pushState, setPushState] =
		useState<keyof typeof pushStateLabels>("checking");
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
			title: "VeriFind Device Features",
			text: "Explore VeriFind’s device features.",
			url: window.location.href,
		});
		setStatus(
			shared
				? "Choose an app to share this page."
				: "Sharing isn’t available right now. You can keep using this page."
		);
	}, []);

	const toggleWakeLock = useCallback(async (): Promise<void> => {
		if (wakeLockActive) {
			await releaseWakeLock();
			setWakeLockActive(false);
			setStatus("Your screen can turn off normally now.");
			return;
		}
		const acquired = await requestWakeLock();
		setWakeLockActive(acquired);
		setStatus(
			acquired
				? "Your screen will stay awake while this page is open."
				: "Your browser couldn’t keep the screen awake. Check your device settings and try again."
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
					`Image ready: ${formatBytes(file.size)} → ${formatBytes(compressed.size)}. It’s saved only in this session; no upload was made.`
				);
			} catch {
				setStatus(
					"This image couldn’t be prepared. Choose another image and try again."
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
		setStatus("App badge updated if your device supports badges.");
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
					Example 3 · Features on Your Device
				</p>
				<h1 className="font-semibold text-2xl">Device Features</h1>
				<p className="text-muted-foreground">
					Try vibration, sharing, app badges, and screen wake controls. Your
					browser may not support every feature, and each one starts only when
					you choose it.
				</p>
			</header>

			<section
				aria-labelledby="capability-heading"
				className="grid gap-3 rounded-lg border bg-card p-4"
			>
				<h2 className="font-semibold" id="capability-heading">
					Try a Device Feature
				</h2>
				<div className="flex flex-wrap gap-3">
					<Button onClick={tryHaptic} type="button" variant="outline">
						Test Vibration
					</Button>
					<Button onClick={tryShare} type="button" variant="outline">
						Share This Page
					</Button>
					<Button onClick={setBadge} type="button" variant="outline">
						Set App Badge
					</Button>
					<Button onClick={toggleWakeLock} type="button" variant="outline">
						{wakeLockActive ? "Allow Screen to Turn Off" : "Keep Screen Awake"}
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
					Enable Vibration Feedback
				</label>
				<dl className="grid gap-2 text-sm sm:grid-cols-2">
					<StatusItem
						label="App installation"
						value={installStateLabels[getInstallState()]}
					/>
					<StatusItem
						label="Notifications"
						value={pushStateLabels[pushState]}
					/>
				</dl>
				<p aria-live="polite" className="text-muted-foreground text-sm">
					{status}
				</p>
				<p className="text-muted-foreground text-sm">
					Notifications aren’t enabled in this example yet.
				</p>
				<CodeExample>{`triggerHaptic("success");\nawait share({ title, text, url });\nawait setAppBadge(unreadCount);`}</CodeExample>
			</section>

			<section
				aria-labelledby="capture-heading"
				className="grid gap-3 rounded-lg border bg-card p-4"
			>
				<h2 className="font-semibold" id="capture-heading">
					Prepare an Image
				</h2>
				<p className="text-muted-foreground text-sm">
					Choose an image to reduce its file size on your device. The image
					stays in this session and isn’t uploaded.
				</p>
				<label className="grid gap-2 text-sm" htmlFor="evidence-image">
					Choose an Image
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
