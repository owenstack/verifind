import { authClient } from "@/lib/auth-client";

export function registerPlatformPasskey(name?: string) {
	return authClient.passkey.addPasskey({
		name,
		authenticatorAttachment: "platform",
	});
}

export function signInWithPasskey() {
	return authClient.signIn.passkey();
}

export async function startConditionalPasskeySignIn(): Promise<void> {
	if (
		typeof PublicKeyCredential === "undefined" ||
		!PublicKeyCredential.isConditionalMediationAvailable ||
		!(await PublicKeyCredential.isConditionalMediationAvailable())
	) {
		return;
	}

	await authClient.signIn.passkey({ autoFill: true });
}

export function listPasskeys() {
	return authClient.passkey.listUserPasskeys();
}

export function renamePasskey(id: string, name: string) {
	return authClient.passkey.updatePasskey({ id, name });
}

export function revokePasskey(id: string) {
	return authClient.passkey.deletePasskey({ id });
}
