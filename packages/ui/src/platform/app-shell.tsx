import type { ReactNode } from "react";
import { useVisualViewport } from "../hooks/use-visual-viewport";

export interface AppShellProps {
	children: ReactNode;
	className?: string;
	isLoading?: boolean;
	launchScreen?: ReactNode;
	offlineHost?: ReactNode;
	topBar?: ReactNode;
	updateHost?: ReactNode;
}

export function AppShell({
	children,
	topBar,
	launchScreen,
	offlineHost,
	updateHost,
	isLoading = false,
	className,
}: AppShellProps) {
	const { keyboardOpen } = useVisualViewport();
	const classNames = ["vf-app-shell", className].filter(Boolean).join(" ");

	return (
		<div className={classNames} data-keyboard-open={keyboardOpen || undefined}>
			{topBar ? (
				<header className="vf-app-shell__chrome vf-app-shell__top-bar">
					{topBar}
				</header>
			) : null}
			<main className="vf-app-shell__content">
				<ShellContent isLoading={isLoading} launchScreen={launchScreen}>
					{children}
				</ShellContent>
			</main>
			{offlineHost || updateHost ? (
				<aside aria-live="polite" className="vf-app-shell__status-host">
					{offlineHost}
					{updateHost}
				</aside>
			) : null}
		</div>
	);
}

function ShellContent({
	children,
	isLoading,
	launchScreen,
}: {
	children: ReactNode;
	isLoading: boolean;
	launchScreen?: ReactNode;
}) {
	if (isLoading && launchScreen) {
		return <>{launchScreen}</>;
	}
	return <>{children}</>;
}
