import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import type { Database } from "@verifind/db";
import * as schema from "@verifind/db/schema/auth";
import { betterAuth } from "better-auth";

export interface AuthConfig {
	BETTER_AUTH_SECRET: string;
	BETTER_AUTH_URL: string;
	NODE_ENV: string;
}

export function createAuth(
	env: AuthConfig,
	database: Database,
	desktopOrigins: readonly string[] = []
) {
	const isDev = env.NODE_ENV === "development";
	return betterAuth({
		database: drizzleAdapter(database, {
			provider: "sqlite",
			schema,
		}),
		trustedOrigins: [
			...desktopOrigins,
			...(isDev
				? [
						"http://localhost:3000",
						"http://localhost:3001",
						"http://localhost:3002",
					]
				: ["http://verifind.efobi.dev"]),
		],
		secret: env.BETTER_AUTH_SECRET,
		baseURL: env.BETTER_AUTH_URL,
		advanced: {
			defaultCookieAttributes: {
				sameSite: isDev ? "lax" : "none",
				secure: !isDev,
				httpOnly: true,
			},
			crossSubDomainCookies: {
				enabled: !isDev,
				domain: "verifind.efobi.dev",
			},
		},
		plugins: [],
	});
}

export type Session = ReturnType<typeof createAuth>["$Infer"]["Session"];
