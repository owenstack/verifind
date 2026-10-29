import { createORPCClient } from "@orpc/client";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { AppRouterClient } from "@verifind/api/routers/index";
import { AppShell } from "@verifind/ui/platform/app-shell";
import { PageTransition } from "@verifind/ui/platform/page-transition";
import { type ReactNode, useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { useOfflineStatus } from "@/lib/use-offline-status";
import { PwaUpdateProvider, usePwaUpdates } from "@/platform/pwa-updates";
import { SplashController } from "@/platform/splash-controller";
import { link, type orpc } from "@/utils/orpc";
import "../index.css";
import { Toaster } from "@verifind/ui/components/toast";
import { Offline } from "@/components/offline";

export interface RouterAppContext {
	orpc: typeof orpc;
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	component: RootComponent,
	head: () => ({
		meta: [
			{
				title: "VeriFind",
			},
			{
				name: "description",
				content: "Search rental homes with clear details on VeriFind.",
			},
		],
		links: [
			{
				rel: "icon",
				href: "/favicon.ico",
			},
		],
	}),
});

function RootComponent() {
	const [client] = useState<AppRouterClient>(() => createORPCClient(link));
	const [_orpcUtils] = useState(() => createTanstackQueryUtils(client));

	return (
		<>
			<HeadContent />
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				disableTransitionOnChange
			>
				<SplashController />
				<PwaUpdateProvider>
					<PlatformShell>
						<PageTransition>
							<Outlet />
							<Toaster />
						</PageTransition>
					</PlatformShell>
				</PwaUpdateProvider>
			</ThemeProvider>
			<TanStackRouterDevtools position="bottom-left" />
			<ReactQueryDevtools buttonPosition="bottom-right" position="bottom" />
		</>
	);
}

function PlatformShell({ children }: { children: ReactNode }) {
	const offline = useOfflineStatus();
	const { updateAvailable, applyUpdate } = usePwaUpdates();

	return (
		<AppShell
			updateHost={
				updateAvailable ? (
					<div
						className="absolute bottom-4 mx-4 mt-4 flex items-center gap-3 rounded-2xl border bg-popover p-4 text-popover-foreground shadow-lg sm:mx-auto sm:max-w-sm"
						role="status"
					>
						<div className="min-w-0 flex-1">
							<p className="font-medium text-sm">Update Available</p>
							<p className="text-muted-foreground text-sm">
								Restart VeriFind to finish installing the update.
							</p>
						</div>
						<button
							className="shrink-0 rounded-lg bg-primary px-3 py-2 font-medium text-primary-foreground text-sm"
							onClick={applyUpdate}
							type="button"
						>
							Restart VeriFind
						</button>
					</div>
				) : null
			}
		>
			{offline.isOnline ? children : <Offline />}
		</AppShell>
	);
}
