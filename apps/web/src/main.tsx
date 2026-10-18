import { createRouter, RouterProvider } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import { OfflineQueryProvider } from "./lib/offline-persistence";
import { routeTree } from "./routeTree.gen";
import { orpc, queryClient } from "./utils/orpc";

const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	scrollRestoration: true,
	defaultPendingComponent: () => (
		<div aria-label="Loading page" role="status" />
	),
	context: { orpc, queryClient },
	Wrap({ children }: { children: React.ReactNode }) {
		return (
			<OfflineQueryProvider client={queryClient}>
				{children}
			</OfflineQueryProvider>
		);
	},
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("app");

if (!rootElement) {
	throw new Error("Root element not found");
}

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(<RouterProvider router={router} />);
}
