import { readFileSync } from "node:fs";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const tokenSource = readFileSync(
	"../../packages/ui/src/styles/globals.css",
	"utf8"
);

function tokenColor(name: string): string {
	const fallback = new RegExp(
		`--${name}:\\s*[^;]+;\\s*/\\*\\s*(#[\\da-f]{3,8})`,
		"i"
	).exec(tokenSource)?.[1];
	if (!fallback) {
		throw new Error(`Missing color token --${name} in globals.css`);
	}
	return fallback;
}

const themeColor = tokenColor("primary");
const backgroundColor = tokenColor("background");

export default defineConfig({
	server: {
		port: 3001,
	},
	resolve: {
		tsconfigPaths: true,
	},
	plugins: [
		tailwindcss(),
		tanstackRouter({
			target: "react",
			autoCodeSplitting: true,
		}),
		react(),
		VitePWA({
			registerType: "prompt",
			injectRegister: false,
			workbox: {
				globPatterns: ["**/*.{js,css,html,png,svg,ico,webmanifest}"],
				globIgnores: ["**/apple-splash-*.png"],
				runtimeCaching: [
					{
						urlPattern: ({ url }) =>
							url.pathname === "/rpc" || url.pathname.startsWith("/api/"),
						handler: "NetworkOnly",
					},
					{
						urlPattern: ({ request }) => request.destination === "image",
						handler: "CacheFirst",
						options: {
							cacheName: "verifind-viewed-images",
							expiration: {
								maxEntries: 80,
								maxAgeSeconds: 60 * 60 * 24 * 30,
								purgeOnQuotaError: true,
							},
							cacheableResponse: { statuses: [0, 200] },
						},
					},
				],
			},
			manifest: {
				id: "/",
				name: "VeriFind",
				short_name: "VeriFind",
				description: "VeriFind rental trust platform",
				start_url: "/",
				scope: "/",
				display: "standalone",
				display_override: ["standalone", "minimal-ui"],
				orientation: "any",
				categories: ["lifestyle", "productivity"],
				theme_color: themeColor,
				background_color: backgroundColor,
				icons: [
					{
						src: "/pwa-192x192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "/pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
					},
					{
						src: "/maskable-icon-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable",
					},
					{
						src: "/monochrome-icon.svg",
						sizes: "any",
						type: "image/svg+xml",
						purpose: "monochrome",
					},
				],
				shortcuts: [
					{
						name: "Open VeriFind",
						short_name: "Open",
						description: "Open VeriFind",
						url: "/",
					},
				],
			},
			pwaAssets: { disabled: false, config: true },
			devOptions: { enabled: true },
		}),
	],
});
