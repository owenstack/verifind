import { createAuth as createConfiguredAuth } from "@verifind/auth";
import { createDb, type Database } from "@verifind/db";

import { ENV } from "./env.server";

export function getDb(): Database {
	return createDb(ENV);
}
export async function createAuth(database?: Database) {
	return createConfiguredAuth(ENV, database ?? (await getDb()));
}
