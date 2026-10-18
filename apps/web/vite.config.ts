import { readFileSync } from "node:fs";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import {
	BRAND_GREEN,
	DARK_BACKGROUND,
	LIGHT_BACKGROUND,
	SPLASH_SHIELD_SIZE,
} from "./build-config/tokens.js";

const splashLogo = readFileSync(
	new URL("./public/logo.svg", import.meta.url),
	"utf8"
)
	.replace("<svg ", '<svg class="vf-shield" ')
	.replace(/\s+/g, " ");

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
		{
			name: "verifind-launch-html",
			transformIndexHtml: {
				order: "pre",
				handler(html) {
					return html
						.replace(
							"</head>",
							`<meta name="theme-color" content="${DARK_BACKGROUND}" media="(prefers-color-scheme: dark)"><meta name="theme-color" content="${LIGHT_BACKGROUND}" media="(prefers-color-scheme: light)"><style>html{background:${DARK_BACKGROUND}}#vf-splash{--vf-brand:${BRAND_GREEN};--vf-light:${LIGHT_BACKGROUND};position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:${DARK_BACKGROUND};opacity:1;transition:opacity 180ms cubic-bezier(.2,0,0,1)}#vf-splash .vf-shield{width:${SPLASH_SHIELD_SIZE * 100}vw;height:auto}#vf-splash.exiting{opacity:0;pointer-events:none}#vf-splash .vf-tagline{position:absolute;top:55%;left:0;width:100%;margin:0;text-align:center;color:${LIGHT_BACKGROUND};font:400 12px/1.4 system-ui;opacity:0;transition:opacity 180ms}#vf-splash.show-tagline .vf-tagline{opacity:1}#vf-splash .vf-circle{position:absolute;width:88vw;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,var(--vf-brand) 10%,transparent 72%);transform:scale(1);will-change:transform,opacity}#vf-splash .top{top:calc(8vh - 44vw);right:calc(7vw - 44vw);background:radial-gradient(circle at 100% 0%,transparent 15%,var(--vf-brand) 80%)}#vf-splash .bottom{bottom:calc(4vh - 44vw);left:calc(5vw - 44vw);background:radial-gradient(circle at 0% 100%,transparent 15%,var(--vf-brand) 80%)}#vf-splash .solid{position:absolute;inset:0;background:var(--vf-brand);opacity:0}</style><script>try{var t=localStorage.getItem('theme'),d=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);document.querySelectorAll('meta[name="theme-color"]').forEach(function(m){m.content=d?'${DARK_BACKGROUND}':'${LIGHT_BACKGROUND}'})}catch(e){}</script><noscript><style>#vf-splash{display:none}</style></noscript></head>`
						)
						.replace(
							"<body>",
							`<body><div id="vf-splash" aria-hidden="true">${splashLogo}<p class="vf-tagline">Physical Vetting. Verified Results</p></div><script>try{var s=document.getElementById('vf-splash'),i=matchMedia('(display-mode: standalone)').matches||navigator.standalone;if(!i||sessionStorage.getItem('vf:splash-shown'))s.remove();else sessionStorage.setItem('vf:splash-shown','1')}catch(e){document.getElementById('vf-splash')?.remove()}</script>`
						);
				},
			},
		},
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
				theme_color: DARK_BACKGROUND,
				background_color: DARK_BACKGROUND,
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
