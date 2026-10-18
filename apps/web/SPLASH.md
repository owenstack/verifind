# Launch splash

The installed PWA splash is dark-first and appears once per browser session. Both generated iOS and inline splashes target a visible shield width of `31.3%`; the inline width is capped at 160 px. The measured visible fractions for the current PNG wrapper are recorded in `build-config/tokens.ts`. The minimum display is 200 ms, the readiness cap is 2500 ms, and the signed-out reveal takes about 800 ms. The asset source remains `public/logo.svg`; it currently wraps a PNG image rather than vector shield paths, and a designer supplied vector is still needed.

Tune the target and measured visible fractions in `build-config/tokens.ts`. Tune timing and circle positions/scales in `src/platform/splash-controller.tsx` and the critical CSS in `vite.config.ts`. The easing is `cubic-bezier(0.2, 0, 0, 1)`. Regenerate startup and launcher assets with `cd apps/web && bun run generate-pwa-assets`.

## Manual device matrix

- Installed Android Chrome with system dark and light.
- Installed iOS with dark and light, including an in-app theme that differs from system.
- First launch signed out and returning launch signed in.
- Reduced motion enabled.
- Throttled slow 3G and airplane-mode cold start; verify the 2500 ms cap.
- Service-worker update reload; verify splash does not replay in the same session.
- iOS light-mode status-bar legibility after the dark splash.
- Compare shield size and position between OS and inline splash on a real phone.
- Confirm Android's selected splash icon on device; Chrome's choice is device-dependent.

The iOS status-bar style remains unchanged until checked on a real device. Android's maskable launcher icon is provisional and needs designer approval.
