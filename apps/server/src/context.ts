import type { Context as ApiContext } from "@verifind/api/context";
import type { Context as HonoContext } from "hono";
import { ENV } from "./env.server";
import { createAuth, getDb } from "./services";

export interface CreateContextOptions {
	context: HonoContext;
}

export async function createContext({
	context,
}: CreateContextOptions): Promise<ApiContext> {
	const db = await getDb();
	const session = await (await createAuth(db)).api.getSession({
		headers: context.req.raw.headers,
	});
	const vapid =
		ENV.VAPID_PUBLIC_KEY && ENV.VAPID_PRIVATE_KEY
			? {
					publicKey: ENV.VAPID_PUBLIC_KEY,
					privateKey: ENV.VAPID_PRIVATE_KEY,
					subject: ENV.VAPID_SUBJECT || "mailto:ops@verifind.efobi.dev",
				}
			: null;
	return {
		config: { vapid },
		db,
		session,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
