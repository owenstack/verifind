import { passkey, signIn } from "@/lib/auth-client";

const PASSKEY_OFFER_DISMISSED_KEY = "verifind.passkey.offer-dismissed";

const IOS_USER_AGENT = /iPad|iPhone|iPod/;
const MAC_USER_AGENT = /Macintosh/;
const ANDROID_USER_AGENT = /Android/;

export function registerPlatformPasskey(name?: string) {
	return passkey.addPasskey({
		name,
		authenticatorAttachment: "platform",
	});
}

/**
 * True when the current browser on this device can create and verify
 * platform passkeys (Touch ID, Face ID, Windows Hello, Android fingerprint).
 */
export async function isPlatformPasskeyAvailable(): Promise<boolean> {
	if (typeof window === "undefined" || !window.PublicKeyCredential) {
		return false;
	}
	if (!PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
		return false;
	}
	return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
}

/** Human-readable name of the device’s biometric method. */
export function getBiometricLabel(): string {
	if (typeof navigator === "undefined") {
		return "biometrics";
	}
	const { userAgent } = navigator;
	if (
		IOS_USER_AGENT.test(userAgent) ||
		(MAC_USER_AGENT.test(userAgent) && "ontouchend" in document)
	) {
		return "Face ID or Touch ID";
	}
	if (ANDROID_USER_AGENT.test(userAgent)) {
		return "fingerprint";
	}
	return "biometrics";
}

export type PasskeySignInStatus =
	| "signed-in"
	| "cancelled"
	| "no-passkey"
	| "failed";

/**
 * Sign in with a passkey and classify the outcome. The better-auth client
 * never throws — it resolves `{ data, error }` — so the error is mapped to a
 * status the login UI can act on without guessing at exception shapes.
 */
export async function signInWithPasskey(): Promise<PasskeySignInStatus> {
	const result = await signIn.passkey();
	if (result.error) {
		const code = "code" in result.error ? result.error.code : undefined;
		if (code === "AUTH_CANCELLED") {
			return "cancelled";
		}
		if (code === "PASSKEY_NOT_FOUND" || code === "USER_NOT_FOUND") {
			return "no-passkey";
		}
		return "failed";
	}
	return result.data ? "signed-in" : "failed";
}

/**
 * Start the browser’s conditional-mediation (autofill) passkey prompt,
 * which attaches passkey suggestions to inputs marked
 * `autoComplete="username webauthn"`. Resolves `false` silently when
 * unsupported or when the user dismisses the suggestion.
 */
export async function startConditionalPasskeySignIn(): Promise<boolean> {
	if (
		typeof PublicKeyCredential === "undefined" ||
		!PublicKeyCredential.isConditionalMediationAvailable ||
		!(await PublicKeyCredential.isConditionalMediationAvailable())
	) {
		return false;
	}

	const result = await signIn.passkey({ autoFill: true });
	return !result.error && result.data !== null;
}

export async function hasRegisteredPasskey(): Promise<boolean> {
	const result = await passkey.listUserPasskeys();
	return !result.error && (result.data?.length ?? 0) > 0;
}

export function hasDismissedPasskeyOffer(): boolean {
	try {
		return window.localStorage.getItem(PASSKEY_OFFER_DISMISSED_KEY) === "1";
	} catch {
		return false;
	}
}

export function dismissPasskeyOffer(): void {
	try {
		window.localStorage.setItem(PASSKEY_OFFER_DISMISSED_KEY, "1");
	} catch {
		// Storage unavailable (private mode): the offer will simply reappear.
	}
}

export function listPasskeys() {
	return passkey.listUserPasskeys();
}

export function renamePasskey(id: string, name: string) {
	return passkey.updatePasskey({ id, name });
}

export function revokePasskey(id: string) {
	return passkey.deletePasskey({ id });
}
