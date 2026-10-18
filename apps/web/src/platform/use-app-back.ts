import { useRouter } from "@tanstack/react-router";
import { useCallback } from "react";

export function useAppBack(fallbackTo: string) {
	const router = useRouter();
	return useCallback(() => {
		if (router.history.canGoBack()) {
			router.history.back();
			return;
		}
		// biome-ignore lint/complexity/noVoid: navigation is initiated from a synchronous event callback.
		void router.navigate({ to: fallbackTo as never });
	}, [fallbackTo, router]);
}
