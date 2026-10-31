/**
 * Generate a VAPID key pair for Web Push (RFC 8292).
 *
 *   bun run apps/server/scripts/generate-vapid-keys.ts
 *
 * Put the printed values in the server environment (.dev.vars locally,
 * Alchemy/GitHub secrets in production) as VAPID_PUBLIC_KEY,
 * VAPID_PRIVATE_KEY and VAPID_SUBJECT.
 */
export {};

const pair = (await crypto.subtle.generateKey(
	{ name: "ECDSA", namedCurve: "P-256" },
	true,
	["sign", "verify"]
)) as CryptoKeyPair;
const publicKey = new Uint8Array(
	(await crypto.subtle.exportKey("raw", pair.publicKey)) as ArrayBuffer
);
const jwk = (await crypto.subtle.exportKey("jwk", pair.privateKey)) as {
	d: string;
};

const toBase64Url = (bytes: Uint8Array): string =>
	Buffer.from(bytes).toString("base64url");

console.log(`VAPID_PUBLIC_KEY=${toBase64Url(publicKey)}`);
console.log(`VAPID_PRIVATE_KEY=${jwk.d}`);
