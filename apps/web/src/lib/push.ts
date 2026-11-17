import { client } from "@/utils/orpc";

interface PushOutcome {
	ok: boolean;
	reason?:
		| "unsupported"
		| "denied"
		| "unconfigured"
		| "subscribe-failed"
		| "register-failed";
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = `${base64String.replace(/-/g, "+").replace(/_/g, "/")}${padding}`;
	const raw = window.atob(base64);
	const output = new Uint8Array(raw.length);
	for (let i = 0; i < raw.length; i += 1) {
		output[i] = raw.charCodeAt(i);
	}
	return output;
}

/**
 * Ask for notification permission, create (or reuse) a push
 * subscription on the app service worker and register it with the
 * VeriFind API so this device can receive Web Push messages.
 */
export async function enablePushNotifications(): Promise<PushOutcome> {
	if (typeof window === "undefined") {
		return { ok: false, reason: "unsupported" };
	}
	if (!("serviceWorker" in navigator && "PushManager" in window)) {
		return { ok: false, reason: "unsupported" };
	}
	try {
		const permission = await Notification.requestPermission();
		if (permission !== "granted") {
			return { ok: false, reason: "denied" };
		}
		const registration = await navigator.serviceWorker.ready;
		const config = await client.notifications.push.config();
		if (!config.publicKey) {
			return { ok: false, reason: "unconfigured" };
		}

		let subscription = await registration.pushManager.getSubscription();
		if (!subscription) {
			subscription = await registration.pushManager.subscribe({
				applicationServerKey: urlBase64ToUint8Array(
					config.publicKey
				) as BufferSource,
				userVisibleOnly: true,
			});
		}
		const json = subscription.toJSON();
		const keys = json.keys as { auth: string; p256dh: string };
		await client.notifications.push.subscribe({
			endpoint: subscription.endpoint,
			keys: { auth: keys.auth, p256dh: keys.p256dh },
			userAgent: navigator.userAgent,
		});
		return { ok: true };
	} catch {
		return { ok: false, reason: "subscribe-failed" };
	}
}

/** Remove this device's push subscription from the browser and the API. */
export async function disablePushNotifications(): Promise<PushOutcome> {
	if (!("serviceWorker" in navigator && "PushManager" in window)) {
		return { ok: false, reason: "unsupported" };
	}
	try {
		const registration = await navigator.serviceWorker.ready;
		const subscription = await registration.pushManager.getSubscription();
		if (subscription) {
			await client.notifications.push
				.unsubscribe({ endpoint: subscription.endpoint })
				.catch(() => undefined);
			await subscription.unsubscribe();
		}
		return { ok: true };
	} catch {
		return { ok: false, reason: "register-failed" };
	}
}

/** Whether the browser currently holds an active push subscription. */
export async function getPushSubscriptionState(): Promise<boolean> {
	if (!("serviceWorker" in navigator && "PushManager" in window)) {
		return false;
	}
	try {
		const registration = await navigator.serviceWorker.ready;
		return Boolean(await registration.pushManager.getSubscription());
	} catch {
		return false;
	}
}

export function describePushFailure(
	reason:
		| "denied"
		| "register-failed"
		| "subscribe-failed"
		| "unconfigured"
		| "unsupported"
		| undefined
): string {
	switch (reason) {
		case "denied":
			return "Notification permission was denied. Enable it in your browser settings.";
		case "unconfigured":
			return "Push is not set up on this server yet.";
		case "unsupported":
			return "This browser does not support push notifications.";
		default:
			return "Could not enable push notifications.";
	}
}
