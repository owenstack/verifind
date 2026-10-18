export type HapticEvent =
	| "success"
	| "error"
	| "warning"
	| "selection"
	| "impact-light";

export interface CapabilityPreferences {
	haptics: boolean;
	notifications: boolean;
	sound: boolean;
}

export interface ShareDetails {
	text?: string;
	title?: string;
	url: string;
}

const PREFERENCES_KEY = "verifind:capability-preferences";
const hapticPatterns: Record<HapticEvent, string> = {
	success: "success",
	error: "error",
	warning: "warning",
	selection: "selection",
	"impact-light": "light",
};

const defaultPreferences: CapabilityPreferences = {
	haptics: true,
	sound: true,
	notifications: true,
};

let hapticsInstance: import("web-haptics").WebHaptics | undefined;
let hapticsLoad: Promise<void> | undefined;
let wakeLock: WakeLockSentinel | undefined;

declare global {
	interface Navigator {
		standalone?: boolean;
	}
}

export function readCapabilityPreferences(): CapabilityPreferences {
	try {
		const saved = window.localStorage.getItem(PREFERENCES_KEY);
		if (saved) {
			return { ...defaultPreferences, ...JSON.parse(saved) };
		}
	} catch {
		// Preferences fall back to defaults when storage is unavailable or malformed.
	}
	return { ...defaultPreferences };
}

export function saveCapabilityPreferences(
	preferences: CapabilityPreferences
): void {
	try {
		window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
	} catch {
		// Capability preferences remain session-only when storage is unavailable.
	}
}

export function preloadHaptics(): Promise<void> | undefined {
	if (hapticsInstance || hapticsLoad || typeof window === "undefined") {
		return hapticsLoad;
	}
	hapticsLoad = import("web-haptics")
		.then(({ WebHaptics }) => {
			hapticsInstance = new WebHaptics({ showSwitch: false });
		})
		.catch(() => undefined)
		.finally(() => {
			hapticsLoad = undefined;
		});
	return hapticsLoad;
}

export function triggerHaptic(event: HapticEvent): void {
	const preferences = readCapabilityPreferences();
	if (
		!preferences.haptics ||
		window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
		!hapticsInstance
	) {
		return;
	}
	// biome-ignore lint/complexity/noVoid: event feedback must not block the interaction.
	void hapticsInstance.trigger(hapticPatterns[event]).catch(() => undefined);
}

export function getInstallState(): "installed" | "browser" {
	return window.matchMedia("(display-mode: standalone)").matches ||
		navigator.standalone === true
		? "installed"
		: "browser";
}

export async function share(details: ShareDetails): Promise<boolean> {
	if (!navigator.share) {
		return false;
	}
	try {
		await navigator.share(details);
		return true;
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError") {
			return false;
		}
		return false;
	}
}

export async function setAppBadge(count: number): Promise<void> {
	if (!navigator.setAppBadge) {
		return;
	}
	try {
		if (count <= 0) {
			await navigator.clearAppBadge?.();
		} else {
			await navigator.setAppBadge(count);
		}
	} catch {
		// Badging is an optional enhancement.
	}
}

export async function requestWakeLock(): Promise<boolean> {
	if (!navigator.wakeLock || document.visibilityState !== "visible") {
		return false;
	}
	try {
		wakeLock = await navigator.wakeLock.request("screen");
		wakeLock.addEventListener("release", () => {
			wakeLock = undefined;
		});
		return true;
	} catch {
		return false;
	}
}

export async function releaseWakeLock(): Promise<void> {
	try {
		await wakeLock?.release();
	} catch {
		// Wake lock release is best effort.
	} finally {
		wakeLock = undefined;
	}
}

export async function getPushState(): Promise<
	"unsupported" | "denied" | "subscribed" | "unsubscribed"
> {
	if (!("Notification" in window && "serviceWorker" in navigator)) {
		return "unsupported";
	}
	if (Notification.permission === "denied") {
		return "denied";
	}
	try {
		const registration = await navigator.serviceWorker.getRegistration();
		const subscription = await registration?.pushManager.getSubscription();
		return subscription ? "subscribed" : "unsubscribed";
	} catch {
		return "unsupported";
	}
}

export async function subscribeToPush(
	applicationServerKey: ArrayBuffer
): Promise<PushSubscription | undefined> {
	if (
		!(
			"Notification" in window &&
			"serviceWorker" in navigator &&
			readCapabilityPreferences().notifications
		)
	) {
		return undefined;
	}
	try {
		const registration = await navigator.serviceWorker.ready;
		if (!registration.pushManager) {
			return undefined;
		}
		const permission = await Notification.requestPermission();
		if (permission !== "granted") {
			return undefined;
		}
		return await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey,
		});
	} catch {
		return undefined;
	}
}
