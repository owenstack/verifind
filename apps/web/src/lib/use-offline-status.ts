import { useCallback, useEffect, useState } from "react";
import {
	drainOfflineMutations,
	getPendingMutationCount,
	subscribeOfflineData,
} from "./offline-data";
import { readOfflineOwnerId } from "./offline-persistence";

export function useOfflineStatus() {
	const [isOnline, setIsOnline] = useState(
		() => typeof navigator === "undefined" || navigator.onLine
	);
	const [pendingCount, setPendingCount] = useState(0);
	const [lastSyncFailed, setLastSyncFailed] = useState(false);

	const refreshPendingCount = useCallback(() => {
		const ownerId = readOfflineOwnerId();
		if (!ownerId) {
			setPendingCount(0);
			return;
		}
		// biome-ignore lint/complexity/noVoid: status refresh is background bookkeeping.
		void getPendingMutationCount(ownerId)
			.then(setPendingCount)
			.catch(() => {
				setLastSyncFailed(true);
			});
	}, []);

	useEffect(() => {
		const onOnline = () => {
			setIsOnline(true);
			const ownerId = readOfflineOwnerId();
			if (ownerId) {
				// biome-ignore lint/complexity/noVoid: online queue draining must not block the event listener.
				void drainOfflineMutations(ownerId)
					.then(() => setLastSyncFailed(false))
					.catch(() => setLastSyncFailed(true));
			}
		};
		const onOffline = () => setIsOnline(false);
		window.addEventListener("online", onOnline);
		window.addEventListener("offline", onOffline);
		const unsubscribe = subscribeOfflineData(refreshPendingCount);
		refreshPendingCount();
		if (navigator.onLine) {
			onOnline();
		}
		return () => {
			window.removeEventListener("online", onOnline);
			window.removeEventListener("offline", onOffline);
			unsubscribe();
		};
	}, [refreshPendingCount]);

	return {
		isOnline,
		pendingCount,
		lastSyncFailed,
		setLastSyncFailed,
	};
}
