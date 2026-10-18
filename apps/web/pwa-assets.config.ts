import { readFileSync } from "node:fs";
import {
	combinePresetAndAppleSplashScreens,
	defineConfig,
	minimal2023Preset as preset,
} from "@vite-pwa/assets-generator/config";

const tokenSource = readFileSync(
	"../../packages/ui/src/styles/globals.css",
	"utf8"
);

function tokenHex(name: string, mode: "light" | "dark"): string {
	const source =
		mode === "dark" ? tokenSource.split(".dark {")[1] : tokenSource;
	const fallback = source
		? new RegExp(`--${name}:\\s*[^;]+;\\s*/\\*\\s*(#[\\da-f]{3,8})`, "i").exec(
				source
			)?.[1]
		: undefined;
	if (!fallback) {
		throw new Error(`Missing fallback color for --${name} in globals.css`);
	}
	return fallback;
}

const lightColor = tokenHex("background", "light");
const darkColor = tokenHex("background", "dark");

export default defineConfig({
	preset: combinePresetAndAppleSplashScreens(preset, {
		resizeOptions: { fit: "contain", background: lightColor },
		darkResizeOptions: { fit: "contain", background: darkColor },
		linkMediaOptions: { addMediaScreen: true },
	}),
	headLinkOptions: {
		preset: "2023",
	},
	images: ["public/logo.svg"],
});
