import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useTheme } from "@/components/theme-provider";
import { authClient } from "@/lib/auth-client";

const MINIMUM_MS = 200;
const HARD_CAP_MS = 2500;
const EASING = "cubic-bezier(0.2, 0, 0, 1)";

export function SplashController() {
	const session = authClient.useSession();
	const location = useRouterState({ select: (state) => state.location });
	const status = useRouterState({ select: (state) => state.status });
	const { resolvedTheme } = useTheme();
	const startedAt = useRef(performance.now());
	const exiting = useRef(false);

	useEffect(() => {
		if (
			resolvedTheme !==
			(document.documentElement.classList.contains("dark") ? "dark" : "light")
		) {
			return;
		}
		const color = getComputedStyle(document.documentElement)
			.getPropertyValue("--background")
			.trim();
		for (const meta of document.querySelectorAll<HTMLMetaElement>(
			'meta[name="theme-color"]'
		)) {
			meta.content = color;
		}
	}, [resolvedTheme]);

	useEffect(() => {
		const splash = document.getElementById("vf-splash");
		if (!splash) {
			return;
		}
		let removed = false;
		let capTimer: number;
		let taglineTimer: number;
		let readyTimer: number;
		const remove = () => {
			if (removed || exiting.current) {
				return;
			}
			exiting.current = true;
			removed = true;
			splash.remove();
			window.dispatchEvent(new Event("vf:splash-done"));
		};
		const showTagline = () => splash.classList.add("show-tagline");
		const exitAtCap = () => {
			exiting.current = true;
			splash.classList.add("exiting");
			window.setTimeout(remove, 180);
		};
		const exit = () => {
			if (removed) {
				return;
			}
			const reducedMotion = matchMedia(
				"(prefers-reduced-motion: reduce)"
			).matches;
			if ((session.data?.user && !session.isPending) || reducedMotion) {
				splash.classList.add("exiting");
				window.setTimeout(remove, reducedMotion ? 150 : 180);
				return;
			}
			const solid = document.createElement("div");
			solid.className = "solid";
			const top = document.createElement("div");
			top.className = "vf-circle top";
			top.style.opacity = "0";
			const bottom = document.createElement("div");
			bottom.className = "vf-circle bottom";
			bottom.style.opacity = "0";
			splash.append(solid, top, bottom);
			splash.querySelector("img")?.animate([{ opacity: 1 }, { opacity: 0 }], {
				duration: 180,
				delay: 120,
				fill: "forwards",
				easing: EASING,
			});
			const scale =
				Math.hypot(innerWidth, innerHeight) / ((88 * innerWidth) / 100);
			for (const circle of [top, bottom]) {
				circle.animate([{ opacity: 0 }, { opacity: 1 }], {
					duration: 1,
					delay: 120,
					fill: "forwards",
				});
				const scaleAnimation = circle.animate(
					[{ transform: "scale(1)" }, { transform: `scale(${scale * 1.4})` }],
					{ duration: 440, delay: 120, fill: "forwards", easing: EASING }
				);
				scaleAnimation.onfinish = () => {
					circle.style.willChange = "auto";
				};
			}
			solid.animate([{ opacity: 0 }, { opacity: 1 }], {
				duration: 150,
				delay: 410,
				fill: "forwards",
				easing: EASING,
			});
			window.setTimeout(() => splash.classList.add("exiting"), 620);
			window.setTimeout(remove, 800);
		};
		const ready = !session.isPending && status === "idle" && Boolean(location);
		if (ready) {
			readyTimer = window.setTimeout(
				exit,
				Math.max(0, MINIMUM_MS - (performance.now() - startedAt.current))
			);
		} else {
			taglineTimer = window.setTimeout(showTagline, 500);
			capTimer = window.setTimeout(
				exitAtCap,
				Math.max(0, HARD_CAP_MS - (performance.now() - startedAt.current))
			);
		}
		return () => {
			window.clearTimeout(capTimer);
			window.clearTimeout(taglineTimer);
			window.clearTimeout(readyTimer);
		};
	}, [location, session.data, session.isPending, status]);
	return null;
}
