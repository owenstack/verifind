import { passkey, signIn } from "@/lib/auth-client";

export function registerPlatformPasskey(name?: string) {
	return passkey.addPasskey({
		name,
		authenticatorAttachment: "platform",
	});
}

export function signInWithPasskey() {
	return signIn.passkey();
}

export async function startConditionalPasskeySignIn(): Promise<void> {
	if (
		typeof PublicKeyCredential === "undefined" ||
		!PublicKeyCredential.isConditionalMediationAvailable ||
		!(await PublicKeyCredential.isConditionalMediationAvailable())
	) {
		return;
	}

	await signIn.passkey({ autoFill: true });
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
