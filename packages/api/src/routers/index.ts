import type { RouterClient } from "@orpc/server";
import { notificationsRouter } from "./notifications";
import { tenantRouter } from "./tenant";

export const appRouter = {
	tenant: tenantRouter,
	notifications: notificationsRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
