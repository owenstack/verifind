import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { passkey } from "@better-auth/passkey";
import type { Database } from "@verifind/db";
import {
	account,
	session,
	user,
	verification as verificationTable,
} from "@verifind/db/schema/auth";
import { passkey as passkeyTable } from "@verifind/db/schema/passkey";
import { type Auth, type BetterAuthOptions, betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";

export interface AuthConfig {
	BETTER_AUTH_SECRET: string;
	BETTER_AUTH_URL: string;
	NODE_ENV: string;
}

export type EmailOtpSender = (message: {
	email: string;
	code: string;
	type: "sign-in" | "email-verification" | "forget-password" | "change-email";
}) => Promise<void>;

export function createAuth(
	env: AuthConfig,
	database: Database,
	emailOtpSender?: EmailOtpSender
): Auth<BetterAuthOptions> {
	const isDev = env.NODE_ENV === "development";
	const authBaseURL =
		env.NODE_ENV === "production"
			? "https://api.verifind.efobi.dev"
			: env.BETTER_AUTH_URL;
	const appOrigins = isDev
		? [
				"http://localhost:3000",
				"http://localhost:3001",
				"http://localhost:3002",
				"http://localhost:3003",
			]
		: [
				"https://app.verifind.efobi.dev",
				"https://landlord.verifind.efobi.dev",
				"https://agent.verifind.efobi.dev",
			];
	return betterAuth({
		database: drizzleAdapter(database, {
			provider: "sqlite",
			schema: {
				account,
				passkey: passkeyTable,
				session,
				user,
				verification: verificationTable,
			},
		}),
		trustedOrigins: appOrigins,
		secret: env.BETTER_AUTH_SECRET,
		baseURL: authBaseURL,
		advanced: {
			defaultCookieAttributes: {
				sameSite: "lax",
				secure: !isDev,
				httpOnly: true,
			},
			crossSubDomainCookies: {
				enabled: !isDev,
				domain: ".verifind.efobi.dev",
			},
		},
		plugins: [
			passkey({
				rpID: isDev ? "localhost" : "verifind.efobi.dev",
				rpName: "VeriFind",
				origin: appOrigins,
				authenticatorSelection: {
					authenticatorAttachment: "platform",
					residentKey: "required",
					requireResidentKey: true,
					userVerification: "required",
				},
				authentication: {
					afterVerification: ({ verification: result }) => {
						if (!result.authenticationInfo.userVerified) {
							throw new Error("Passkey user verification is required.");
						}
					},
				},
			}),
			emailOTP({
				otpLength: 6,
				expiresIn: 300,
				allowedAttempts: 5,
				async sendVerificationOTP({ email, otp: code, type }) {
					if (!emailOtpSender) {
						throw new Error("Email OTP delivery is not configured.");
					}
					await emailOtpSender({ email, code, type });
				},
			}),
		],
	}) as unknown as Auth<BetterAuthOptions>;
}

export type Session = ReturnType<typeof createAuth>["$Infer"]["Session"];
