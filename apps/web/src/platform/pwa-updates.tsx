import { useRegisterSW } from "virtual:pwa-register/react";
import { createContext, type ReactNode, useContext } from "react";

interface PwaUpdateContextValue {
	applyUpdate: () => Promise<void>;
	offlineReady: boolean;
	updateAvailable: boolean;
}

const PwaUpdateContext = createContext<PwaUpdateContextValue | null>(null);

export function PwaUpdateProvider({ children }: { children: ReactNode }) {
	const {
		needRefresh: [needRefresh, setNeedRefresh],
		offlineReady: [offlineReady],
		updateServiceWorker,
	} = useRegisterSW({});

	async function applyUpdate(): Promise<void> {
		setNeedRefresh(false);
		await updateServiceWorker(true);
	}

	return (
		<PwaUpdateContext.Provider
			value={{ updateAvailable: needRefresh, offlineReady, applyUpdate }}
		>
			{children}
		</PwaUpdateContext.Provider>
	);
}

export function usePwaUpdates(): PwaUpdateContextValue {
	const value = useContext(PwaUpdateContext);
	if (!value) {
		throw new Error("usePwaUpdates must be used inside PwaUpdateProvider.");
	}
	return value;
}
