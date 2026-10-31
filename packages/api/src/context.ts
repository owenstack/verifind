import type { Session } from "@verifind/auth";
import type { Database } from "@verifind/db";

/** RFC 8292 Voluntary Application Server Identification keys. */
export interface VapidConfig {
	/** Base64url-encoded P-256 private key scalar (32 bytes). */
	privateKey: string;
	/** Base64url-encoded uncompressed P-256 public key (65 bytes). */
	publicKey: string;
	/** Contact URI, e.g. "mailto:ops@verifind.efobi.dev". */
	subject: string;
}

export interface Context {
	config: {
		/** Null when VAPID keys are not configured — push features degrade gracefully. */
		vapid: VapidConfig | null;
	};
	db: Database;
	session: Session | null;
}
