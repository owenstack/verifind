import { useEffect, useRef, useState } from "react";

export interface PullToRefreshOptions {
	enabled?: boolean;
	refresh: () => Promise<void> | void;
	threshold?: number;
}

export function usePullToRefresh({
	refresh,
	enabled = true,
	threshold = 72,
}: PullToRefreshOptions) {
	const elementRef = useRef<HTMLElement>(null);
	const startY = useRef<number | null>(null);
	const pullDistanceRef = useRef(0);
	const [pullDistance, setPullDistance] = useState(0);
	const [refreshing, setRefreshing] = useState(false);

	useEffect(() => {
		const element = elementRef.current;
		if (!(element && enabled)) {
			return;
		}

		const onTouchStart = (event: TouchEvent) => {
			if (element.scrollTop <= 0 && event.touches.length === 1) {
				startY.current = event.touches[0]?.clientY ?? null;
			}
		};
		const onTouchMove = (event: TouchEvent) => {
			const currentY = event.touches[0]?.clientY;
			if (startY.current === null || currentY === undefined || refreshing) {
				return;
			}
			const distance = Math.max(0, currentY - startY.current);
			const nextDistance = Math.min(distance * 0.5, threshold);
			pullDistanceRef.current = nextDistance;
			setPullDistance(nextDistance);
		};
		const onTouchEnd = () => {
			const shouldRefresh = pullDistanceRef.current >= threshold && !refreshing;
			startY.current = null;
			pullDistanceRef.current = 0;
			setPullDistance(0);
			if (!shouldRefresh) {
				return;
			}
			setRefreshing(true);
			// biome-ignore lint/complexity/noVoid: gesture handlers return before network refresh completes.
			void Promise.resolve(refresh())
				.catch(() => undefined)
				.finally(() => setRefreshing(false));
		};
		const onTouchCancel = () => {
			startY.current = null;
			pullDistanceRef.current = 0;
			setPullDistance(0);
		};

		element.addEventListener("touchstart", onTouchStart, { passive: true });
		element.addEventListener("touchmove", onTouchMove, { passive: true });
		element.addEventListener("touchend", onTouchEnd, { passive: true });
		element.addEventListener("touchcancel", onTouchCancel, { passive: true });
		return () => {
			element.removeEventListener("touchstart", onTouchStart);
			element.removeEventListener("touchmove", onTouchMove);
			element.removeEventListener("touchend", onTouchEnd);
			element.removeEventListener("touchcancel", onTouchCancel);
		};
	}, [enabled, refreshing, refresh, threshold]);

	return { elementRef, pullDistance, refreshing };
}
