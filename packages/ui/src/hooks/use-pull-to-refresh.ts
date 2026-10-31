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
	const indicatorRef = useRef<HTMLDivElement>(null);
	const startY = useRef<number | null>(null);
	const pullDistanceRef = useRef(0);
	const refreshingRef = useRef(false);
	const [ready, setReady] = useState(false);
	const [refreshing, setRefreshing] = useState(false);

	useEffect(() => {
		const element = elementRef.current;
		if (!(element && enabled)) {
			return;
		}
		const reduceMotionQuery = window.matchMedia(
			"(prefers-reduced-motion: reduce)"
		);

		const onTouchStart = (event: TouchEvent) => {
			const { target } = event;
			const isInsideOverlay =
				target instanceof Element &&
				target.closest(
					"[data-pull-refresh-ignore], .vf-bottom-sheet, [role=dialog]"
				);
			if (
				!isInsideOverlay &&
				element.scrollTop <= 0 &&
				event.touches.length === 1 &&
				!refreshingRef.current
			) {
				startY.current = event.touches[0]?.clientY ?? null;
				indicatorRef.current?.setAttribute("data-dragging", "");
			}
		};
		const onTouchMove = (event: TouchEvent) => {
			const currentY = event.touches[0]?.clientY;
			if (event.touches.length !== 1) {
				startY.current = null;
				pullDistanceRef.current = 0;
				setReady(false);
				const indicator = indicatorRef.current;
				if (indicator) {
					indicator.removeAttribute("data-dragging");
					indicator.style.transform = "translate3d(-50%, 0, 0)";
					indicator.style.opacity = "0";
				}
				return;
			}
			if (
				startY.current === null ||
				currentY === undefined ||
				refreshingRef.current
			) {
				return;
			}
			const distance = Math.max(0, currentY - startY.current);
			const nextDistance = Math.min(distance * 0.5, threshold);
			pullDistanceRef.current = nextDistance;
			const indicator = indicatorRef.current;
			if (indicator) {
				const visualDistance = reduceMotionQuery.matches
					? Math.min(nextDistance * 0.3, 18)
					: nextDistance;
				indicator.style.transform = `translate3d(-50%, ${visualDistance}px, 0)`;
				indicator.style.opacity = String(Math.min(distance / 24, 1));
			}
			setReady(nextDistance >= threshold);
		};
		const onTouchEnd = () => {
			const shouldRefresh = pullDistanceRef.current >= threshold;
			const indicator = indicatorRef.current;
			startY.current = null;
			indicator?.removeAttribute("data-dragging");
			setReady(false);
			if (!shouldRefresh) {
				pullDistanceRef.current = 0;
				if (indicator) {
					indicator.style.transform = "translate3d(-50%, 0, 0)";
					indicator.style.opacity = "0";
				}
				return;
			}
			if (indicator) {
				indicator.style.transform = `translate3d(-50%, ${threshold}px, 0)`;
				indicator.style.opacity = "1";
				indicator.dataset.refreshing = "";
			}
			refreshingRef.current = true;
			setRefreshing(true);
			// biome-ignore lint/complexity/noVoid: gesture handlers return before network refresh completes.
			void Promise.resolve(refresh())
				.catch(() => undefined)
				.finally(() => {
					pullDistanceRef.current = 0;
					refreshingRef.current = false;
					setRefreshing(false);
					if (indicator) {
						indicator.style.transform = "translate3d(-50%, 0, 0)";
						indicator.style.opacity = "0";
						delete indicator.dataset.refreshing;
					}
				});
		};
		const onTouchCancel = () => {
			startY.current = null;
			pullDistanceRef.current = 0;
			setReady(false);
			const indicator = indicatorRef.current;
			if (indicator) {
				indicator.removeAttribute("data-dragging");
				indicator.style.transform = "translate3d(-50%, 0, 0)";
				indicator.style.opacity = "0";
			}
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
	}, [enabled, refresh, threshold]);

	return { elementRef, indicatorRef, ready, refreshing };
}
