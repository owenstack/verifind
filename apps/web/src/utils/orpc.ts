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

// When VITE_SERVER_URL is empty the app talks to its own origin and
// the dev server proxies /rpc to the API worker (see vite.config.ts).
// RPCLink builds URLs with `new URL(base)`, so an absolute origin is
// required even for the same-origin case.
const TRAILING_SLASH = /\/$/;

function currentOrigin(): string {
	if (typeof window === "undefined") {
		return "";
	}
	return window.location.origin.replace(TRAILING_SLASH, "");
}

const serverBaseUrl = ENV.VITE_SERVER_URL
	? ENV.VITE_SERVER_URL.replace(TRAILING_SLASH, "")
	: currentOrigin();

export const link = new RPCLink({
	url: `${serverBaseUrl}/rpc`,
	fetch(_url, options) {
		return fetch(_url, {
			...options,
			credentials: "include",
		});
	},
});

export const client: AppRouterClient = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
