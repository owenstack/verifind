/**
 * Web Push sender (RFC 8030 message + RFC 8291 aes128gcm encryption +
 * RFC 8292 VAPID auth) built exclusively on WebCrypto so it runs on
 * Cloudflare Workers without node:crypto (workerd has no createECDH).
 */

const encoder = new TextEncoder();
const CONTENT_ENCODING = "aes128gcm";
/** Default record size; 17 bytes of overhead (16 auth tag + 1 delimiter). */
const RECORD_SIZE = 4096;
const MAX_PLAINTEXT = RECORD_SIZE - 17;

export interface PushPayload {
	body: string;
	tag?: string;
	title: string;
	/** In-app route to open when the notification is clicked. */
	url?: string;
}

export interface PushSubscriptionKeys {
	auth: string;
	p256dh: string;
}

export interface VapidKeys {
	privateKey: string;
	publicKey: string;
	subject: string;
}

export class WebPushError extends Error {
	statusCode?: number;

	constructor(message: string, statusCode?: number) {
		super(message);
		this.statusCode = statusCode;
	}
}

function base64UrlToBytes(value: string): Uint8Array {
	const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
	const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
	const binary = atob(padded);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i += 1) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}

function bytesToBase64Url(bytes: Uint8Array): string {
	let binary = "";
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}
	return btoa(binary)
		.replace(/\+/g, "-")
		.replace(/_/g, "/")
		.replace(/[=]+$/g, "");
}

function concat(...chunks: Uint8Array[]): Uint8Array {
	const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
	const out = new Uint8Array(total);
	let offset = 0;
	for (const chunk of chunks) {
		out.set(chunk, offset);
		offset += chunk.length;
	}
	return out;
}

async function hkdf(
	ikm: Uint8Array,
	salt: Uint8Array,
	info: Uint8Array,
	length: number
): Promise<Uint8Array> {
	const key = await crypto.subtle.importKey("raw", ikm, "HKDF", false, [
		"deriveBits",
	]);
	return new Uint8Array(
		await crypto.subtle.deriveBits(
			{ hash: "SHA-256", info, name: "HKDF", salt },
			key,
			length * 8
		)
	);
}

/**
 * Return the signature as raw 64-byte r||s. WebCrypto engines differ:
 * browsers/workerd follow the current spec (raw), some runtimes still
 * emit ASN.1 DER — detect and convert when needed.
 */
function signatureToRaw(signature: Uint8Array): Uint8Array {
	if (signature.length === 64) {
		return signature;
	}
	const trimLeadingZeros = (bytes: Uint8Array): Uint8Array => {
		let start = 0;
		while (start < bytes.length - 1 && bytes[start] === 0) {
			start += 1;
		}
		return bytes.slice(start);
	};
	let offset = 2;
	const rLength = signature[offset + 1] ?? 0;
	const r = trimLeadingZeros(signature.slice(offset + 2, offset + 2 + rLength));
	offset += 2 + rLength;
	const sLength = signature[offset + 1] ?? 0;
	const s = trimLeadingZeros(signature.slice(offset + 2, offset + 2 + sLength));
	const raw = new Uint8Array(64);
	raw.set(r, 32 - r.length);
	raw.set(s, 64 - s.length);
	return raw;
}

async function createVapidJwt(
	audience: string,
	vapid: VapidKeys
): Promise<string> {
	const now = Math.floor(Date.now() / 1000);
	const header = bytesToBase64Url(
		encoder.encode(JSON.stringify({ alg: "ES256", typ: "JWT" }))
	);
	const payload = bytesToBase64Url(
		encoder.encode(
			JSON.stringify({
				aud: audience,
				exp: now + 12 * 60 * 60,
				sub: vapid.subject,
			})
		)
	);
	const signingInput = `${header}.${payload}`;

	const publicKeyBytes = base64UrlToBytes(vapid.publicKey);
	const privateKeyBytes = base64UrlToBytes(vapid.privateKey);
	const jwk = {
		crv: "P-256",
		d: bytesToBase64Url(privateKeyBytes),
		kty: "EC",
		x: bytesToBase64Url(publicKeyBytes.slice(1, 33)),
		y: bytesToBase64Url(publicKeyBytes.slice(33, 65)),
	};
	const key = await crypto.subtle.importKey(
		"jwk",
		jwk,
		{ name: "ECDSA", namedCurve: "P-256" },
		false,
		["sign"]
	);
	const derSignature = new Uint8Array(
		await crypto.subtle.sign(
			{ hash: "SHA-256", name: "ECDSA" },
			key,
			encoder.encode(signingInput)
		)
	);
	return `${signingInput}.${bytesToBase64Url(signatureToRaw(derSignature))}`;
}

async function encryptPayload(
	payload: string,
	keys: PushSubscriptionKeys
): Promise<Uint8Array> {
	const plaintext = encoder.encode(payload);
	if (plaintext.length > MAX_PLAINTEXT) {
		throw new WebPushError(
			`Payload exceeds the ${MAX_PLAINTEXT}-byte single-record limit`
		);
	}

	const userAgentPublic = base64UrlToBytes(keys.p256dh);
	if (userAgentPublic.length !== 65 || userAgentPublic[0] !== 0x04) {
		throw new WebPushError("Invalid p256dh key: expected uncompressed P-256");
	}
	const authSecret = base64UrlToBytes(keys.auth);

	const userKey = await crypto.subtle.importKey(
		"raw",
		userAgentPublic,
		{ name: "ECDH", namedCurve: "P-256" },
		false,
		[]
	);
	const appServer = (await crypto.subtle.generateKey(
		{ name: "ECDH", namedCurve: "P-256" },
		true,
		["deriveBits"]
	)) as CryptoKeyPair;
	const ecdhSecret = new Uint8Array(
		await crypto.subtle.deriveBits(
			// workers-types types this param differently from DOM lib.
			{ name: "ECDH", public: userKey } as never,
			appServer.privateKey,
			256
		)
	);
	const appServerPublic = new Uint8Array(
		(await crypto.subtle.exportKey("raw", appServer.publicKey)) as ArrayBuffer
	);

	// RFC 8291 §3.3: PRK_key = HKDF(salt=0^32,
	//   IKM=ecdh_secret || auth_secret,
	//   info="WebPush: info" || ua_public || as_public)
	const ikm = await hkdf(
		concat(ecdhSecret, authSecret),
		new Uint8Array(32),
		concat(encoder.encode("WebPush: info"), userAgentPublic, appServerPublic),
		32
	);

	const salt = crypto.getRandomValues(new Uint8Array(16));
	const contentEncryptionKey = await hkdf(
		ikm,
		salt,
		encoder.encode(`Content-Encoding: ${CONTENT_ENCODING}\u0000`),
		16
	);
	const nonce = await hkdf(
		ikm,
		salt,
		encoder.encode("Content-Encoding: nonce\u0000"),
		12
	);

	const record = new Uint8Array(plaintext.length + 1);
	record.set(plaintext);
	record[plaintext.length] = 0x02;

	const ciphertext = new Uint8Array(
		await crypto.subtle.encrypt(
			{ iv: nonce, name: "AES-GCM" },
			await crypto.subtle.importKey(
				"raw",
				contentEncryptionKey,
				"AES-GCM",
				false,
				["encrypt"]
			),
			record
		)
	);

	const header = new Uint8Array(16 + 4 + 1 + appServerPublic.length);
	header.set(salt, 0);
	new DataView(header.buffer).setUint32(16, RECORD_SIZE);
	header[20] = appServerPublic.length;
	header.set(appServerPublic, 21);

	return concat(header, ciphertext);
}

/**
 * Send an encrypted Web Push message to a single subscription.
 * Returns true when delivered, false when the subscription is gone
 * (404/410 — the caller should delete it).
 */
export async function sendPushNotification(
	endpoint: string,
	keys: PushSubscriptionKeys,
	vapid: VapidKeys,
	payload: PushPayload,
	options?: { ttl?: number; urgency?: "very-low" | "low" | "normal" | "high" }
): Promise<boolean> {
	const body = await encryptPayload(JSON.stringify(payload), keys);
	const jwt = await createVapidJwt(new URL(endpoint).origin, vapid);

	const response = await fetch(endpoint, {
		body,
		headers: {
			Authorization: `vapid t=${jwt}, k=${vapid.publicKey}`,
			"Content-Encoding": CONTENT_ENCODING,
			"Content-Type": "application/octet-stream",
			TTL: String(options?.ttl ?? 60 * 60 * 24 * 28),
			Urgency: options?.urgency ?? "normal",
		},
		method: "POST",
	});

	if (response.status === 404 || response.status === 410) {
		return false;
	}
	if (!response.ok) {
		const detail = await response.text().catch(() => "");
		throw new WebPushError(
			`Push endpoint responded ${response.status}: ${detail.slice(0, 200)}`,
			response.status
		);
	}
	return true;
}
