import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import {
	type Persister,
	persistQueryClient,
} from "@tanstack/react-query-persist-client";
import { clear, createStore, del, get, set } from "idb-keyval";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";

const OFFLINE_USER_KEY = "verifind:offline-user";
const CACHE_KEY = "query-cache";
const CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;
const CACHE_BUSTER = "verifind-offline-v1";

function idbStore(ownerId: string, storeName: string) {
	return createStore(`verifind-${encodeURIComponent(ownerId)}`, storeName);
}

export function readOfflineOwnerId(): string | null {
	try {
		return window.localStorage.getItem(OFFLINE_USER_KEY);
	} catch {
		return null;
	}
}

export function rememberOfflineOwnerId(ownerId: string): void {
	try {
		window.localStorage.setItem(OFFLINE_USER_KEY, ownerId);
	} catch {
		// Private offline features remain unavailable when local storage is denied.
	}
}

export async function clearUserOfflineData(ownerId?: string): Promise<void> {
	const targetOwnerId = ownerId ?? readOfflineOwnerId();
	if (!targetOwnerId) {
		return;
	}

	await Promise.all([
		clear(idbStore(targetOwnerId, "query-cache")),
		clear(idbStore(targetOwnerId, "drafts")),
		clear(idbStore(targetOwnerId, "mutation-queue")),
	]);

	if (!ownerId || ownerId === readOfflineOwnerId()) {
		try {
			window.localStorage.removeItem(OFFLINE_USER_KEY);
		} catch {
			// Clearing IndexedDB data is the primary logout cleanup.
		}
	}
}

function createPersister(ownerId: string): Persister {
	const store = idbStore(ownerId, "query-cache");
	return {
		persistClient: async (client) => {
			await set(CACHE_KEY, client, store);
		},
		restoreClient: async () =>
			get<Awaited<ReturnType<Persister["restoreClient"]>>>(CACHE_KEY, store),
		removeClient: async () => {
			await del(CACHE_KEY, store);
		},
	};
}

export function OfflineQueryProvider({
	client,
	children,
}: {
	client: QueryClient;
	children: ReactNode;
}) {
	const session = authClient.useSession();
	const onlineOwnerId = session.data?.user.id;
	const ownerId =
		onlineOwnerId ??
		(session.error && !navigator.onLine ? readOfflineOwnerId() : null);
	const [storageAvailable, setStorageAvailable] = useState(false);
	const persister = useMemo(
		() => (ownerId ? createPersister(ownerId) : undefined),
		[ownerId]
	);

	useEffect(() => {
		if (onlineOwnerId) {
			rememberOfflineOwnerId(onlineOwnerId);
		} else if (!(session.isPending || session.error)) {
			// biome-ignore lint/complexity/noVoid: this is non-blocking logout cleanup.
			void clearUserOfflineData();
		}
	}, [onlineOwnerId, session.error, session.isPending]);

	useEffect(() => {
		if (typeof indexedDB === "undefined") {
			return;
		}

		let active = true;
		const persistStorage = navigator.storage?.persist;
		const persistenceRequest = persistStorage
			? persistStorage.call(navigator.storage)
			: Promise.resolve(false);

		// biome-ignore lint/complexity/noVoid: browser persistence is a best-effort startup request.
		void persistenceRequest
			.catch(() => false)
			.then(() => {
				if (active) {
					setStorageAvailable(true);
				}
			});

		return () => {
			active = false;
		};
	}, []);

	useEffect(() => {
		if (!(ownerId && persister && storageAvailable)) {
			return;
		}
		const [unsubscribe, restore] = persistQueryClient({
			queryClient: client,
			persister,
			maxAge: CACHE_MAX_AGE_MS,
			buster: CACHE_BUSTER,
			dehydrateOptions: {
				shouldDehydrateQuery: (query) =>
					query.state.status === "success" && query.meta?.offline === true,
			},
		});
		// Offline restore is best effort and must not hold the router subtree.
		// biome-ignore lint/complexity/noVoid: cache restore runs in the background.
		void restore.catch(() => undefined);
		return unsubscribe;
	}, [client, ownerId, persister, storageAvailable]);

	return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
