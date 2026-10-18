import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { DARK_BACKGROUND } from "../build-config/tokens.js";

const OLD_SPLASH_ASSET = /apple-splash-.*-(light|dark)-.*\.png/;
const dist = join(process.cwd(), "dist");
const html = readFileSync(join(dist, "index.html"), "utf8");
const manifest = JSON.parse(
	readFileSync(join(dist, "manifest.webmanifest"), "utf8")
) as { background_color: string; theme_color: string };
const splashIndex = html.indexOf('id="vf-splash"');
const appIndex = html.indexOf('id="app"');
const startupLinks =
	html.match(/<link[^>]*apple-touch-startup-image[^>]*>/g) ?? [];

if (
	manifest.background_color !== DARK_BACKGROUND ||
	manifest.theme_color !== DARK_BACKGROUND
) {
	throw new Error(
		"Built manifest splash colors do not match the dark background token"
	);
}
if (splashIndex < 0 || appIndex < 0 || splashIndex > appIndex) {
	throw new Error("The built splash must be a sibling before #app");
}
if (
	!(
		html.includes("vf:splash-shown") &&
		html.includes("localStorage.getItem('theme')")
	)
) {
	throw new Error(
		"The built theme and once-per-session splash scripts are missing"
	);
}
if (
	!(
		html.includes('media="(prefers-color-scheme: dark)"') &&
		html.includes('media="(prefers-color-scheme: light)"')
	)
) {
	throw new Error("Theme-color media tags are missing");
}
if (
	startupLinks.length === 0 ||
	startupLinks.some((link) => link.includes("prefers-color-scheme"))
) {
	throw new Error("Apple startup-image links are missing or scheme-restricted");
}
if (
	readdirSync(join(process.cwd(), "public")).some((name) =>
		OLD_SPLASH_ASSET.test(name)
	)
) {
	throw new Error("Old light/dark Apple startup images remain in public/");
}

process.stdout.write("PWA splash build assertions passed\n");
