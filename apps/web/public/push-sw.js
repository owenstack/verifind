/**
 * VeriFind push handler, loaded from the generated Workbox service
 * worker via importScripts. Handles incoming Web Push messages and
 * notification clicks; caching strategies live in the generated worker.
 */

self.addEventListener("push", (event) => {
	let payload = {};
	try {
		payload = event.data ? event.data.json() : {};
	} catch {
		payload = { body: event.data ? event.data.text() : "" };
	}
	const title = payload.title || "VeriFind";
	const options = {
		badge: "/pwa-192x192.png",
		body: payload.body || "",
		data: { url: payload.url || "/" },
		icon: "/pwa-192x192.png",
		tag: payload.tag,
	};
	event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
	event.notification.close();
	const target = event.notification.data?.url || "/";
	event.waitUntil(
		(async () => {
			const windowClients = await self.clients.matchAll({
				includeUncontrolled: true,
				type: "window",
			});
			for (const client of windowClients) {
				const clientUrl = new URL(client.url);
				if (clientUrl.pathname === target) {
					return client.focus();
				}
			}
			return self.clients.openWindow(target);
		})()
	);
});

// Best-effort: when the subscription is refreshed by the browser, the
// next app session re-registers it through the notifications drawer.
self.addEventListener("pushsubscriptionchange", (event) => {
	event.waitUntil(Promise.resolve());
});
