import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryClient } from "@tanstack/react-query";
import type { AppRouterClient } from "@verifind/api/routers/index";

import { ENV } from "../env.public";

export function createQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				gcTime: 1000 * 60 * 60 * 24 * 7,
			},
		},
	});
}

export const queryClient = createQueryClient();

export const link = new RPCLink({
	url: `${ENV.VITE_SERVER_URL.replace(/\/$/, "")}/rpc`,
	fetch(_url, options) {
		return fetch(_url, {
			...options,
			credentials: "include",
		});
	},
});

export const client: AppRouterClient = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
