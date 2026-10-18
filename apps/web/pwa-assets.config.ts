import {
	combinePresetAndAppleSplashScreens,
	defineConfig,
	minimal2023Preset as preset,
} from "@vite-pwa/assets-generator/config";
import { DARK_BACKGROUND, SPLASH_SHIELD_SIZE } from "./build-config/tokens.js";

const darkPreset = {
	...preset,
	maskable: {
		...preset.maskable,
		padding: 0.3,
		resizeOptions: { fit: "contain" as const, background: DARK_BACKGROUND },
	},
};

export default defineConfig({
	preset: combinePresetAndAppleSplashScreens(darkPreset, {
		resizeOptions: { fit: "contain", background: DARK_BACKGROUND },
		padding: 1 - SPLASH_SHIELD_SIZE,
		name: (landscape, size) =>
			`apple-splash-${landscape ? "landscape" : "portrait"}-${size.width}x${size.height}.png`,
	}),
	headLinkOptions: {
		preset: "2023",
	},
	images: ["public/logo.svg"],
	// TODO(design): approve the final VeriFind launcher icon.
});
