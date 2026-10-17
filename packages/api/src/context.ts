import type { Session } from "@verifind/auth";
import type { Database } from "@verifind/db";

export type Context = {
  session: Session | null;
  db: Database;
};
