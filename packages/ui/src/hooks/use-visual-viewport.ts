import { useEffect, useState } from "react";

const KEYBOARD_OPEN_THRESHOLD_PX = 120;

export interface VisualViewportState {
	height: number;
	keyboardInset: number;
	keyboardOpen: boolean;
}

export function useVisualViewport(): VisualViewportState {
	const [viewportState, setViewportState] = useState<VisualViewportState>({
		height: typeof window === "undefined" ? 0 : window.innerHeight,
		keyboardInset: 0,
		keyboardOpen: false,
	});

	useEffect(() => {
		const viewport = window.visualViewport;
		const root = document.documentElement;

		function updateViewport(): void {
			const height = viewport?.height ?? window.innerHeight;
			const keyboardInset = viewport
				? Math.max(
						0,
						window.innerHeight - (viewport.height + viewport.offsetTop)
					)
				: 0;
			const keyboardOpen = keyboardInset > KEYBOARD_OPEN_THRESHOLD_PX;

			root.style.setProperty("--vf-visual-viewport-height", `${height}px`);
			root.style.setProperty("--vf-keyboard-inset", `${keyboardInset}px`);
			setViewportState({ height, keyboardInset, keyboardOpen });
		}

		updateViewport();
		viewport?.addEventListener("resize", updateViewport);
		viewport?.addEventListener("scroll", updateViewport);
		window.addEventListener("resize", updateViewport);

		return () => {
			viewport?.removeEventListener("resize", updateViewport);
			viewport?.removeEventListener("scroll", updateViewport);
			window.removeEventListener("resize", updateViewport);
			root.style.removeProperty("--vf-visual-viewport-height");
			root.style.removeProperty("--vf-keyboard-inset");
		};
	}, []);

	return viewportState;
}
