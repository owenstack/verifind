import { createORPCClient } from "@orpc/client";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Link,
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
import { link, type orpc } from "@/utils/orpc";
import "../index.css";

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
				content: "VeriFind rental trust platform",
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
				<PwaUpdateProvider>
					<PlatformShell>
						<PageTransition>
							<Outlet />
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
			offlineHost={
				!offline.isOnline || offline.pendingCount > 0 ? (
					<div className="bg-muted px-4 py-2 text-muted-foreground text-sm">
						{offline.isOnline
							? `${offline.pendingCount} pending offline change${offline.pendingCount === 1 ? "" : "s"}`
							: "Offline · saved data remains available"}
					</div>
				) : null
			}
			tabBar={<DemoTabBar />}
			topBar={<DemoTopBar />}
			updateHost={
				updateAvailable ? (
					<button
						className="bg-primary px-4 py-2 text-primary-foreground"
						onClick={applyUpdate}
						type="button"
					>
						Update VeriFind
					</button>
				) : null
			}
		>
			{children}
		</AppShell>
	);
}

function DemoTopBar() {
	return (
		<header className="flex items-center justify-between border-b bg-background px-4 py-3">
			<Link className="font-semibold text-foreground" to="/" viewTransition>
				VeriFind · Platform examples
			</Link>
			<span className="text-muted-foreground text-sm">Component showcase</span>
		</header>
	);
}

function DemoTabBar() {
	return (
		<nav
			aria-label="Platform examples"
			className="grid grid-cols-4 border-t bg-background"
		>
			<DemoNavLink to="/">Overview</DemoNavLink>
			<DemoNavLink to="/platform">Shell</DemoNavLink>
			<DemoNavLink to="/offline">Offline</DemoNavLink>
			<DemoNavLink to="/capabilities">Capabilities</DemoNavLink>
		</nav>
	);
}

function DemoNavLink({
	children,
	to,
}: {
	children: string;
	to: "/" | "/platform" | "/offline" | "/capabilities";
}) {
	return (
		<Link
			activeProps={{ className: "bg-muted text-foreground" }}
			className="px-2 py-3 text-center text-muted-foreground text-xs"
			to={to as string}
			viewTransition
		>
			{children}
		</Link>
	);
}
