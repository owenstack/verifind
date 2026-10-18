import { useEffect, useState } from "react";

const VALUE_SEEN_KEY = "verifind:value-seen";

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

declare global {
	interface Navigator {
		standalone?: boolean;
	}
}

export type InstallPromptAvailability =
	| "unavailable"
	| "available"
	| "ios-instructions"
	| "installed";

let capturedInstallEvent: BeforeInstallPromptEvent | undefined;

if (typeof window !== "undefined") {
	window.addEventListener("beforeinstallprompt", (event) => {
		event.preventDefault();
		capturedInstallEvent = event as BeforeInstallPromptEvent;
		window.dispatchEvent(new Event("verifind:install-availability"));
	});
	window.addEventListener("appinstalled", () => {
		capturedInstallEvent = undefined;
		window.dispatchEvent(new Event("verifind:install-availability"));
	});
}

export function isStandaloneMode(): boolean {
	return (
		window.matchMedia("(display-mode: standalone)").matches ||
		navigator.standalone === true
	);
}

function supportsIOSInstallInstructions(): boolean {
	return "standalone" in navigator && !isStandaloneMode();
}

export function useInstallPrompt() {
	const [valueSeen, setValueSeen] = useState(false);
	const [availability, setAvailability] =
		useState<InstallPromptAvailability>("unavailable");

	useEffect(() => {
		try {
			setValueSeen(window.localStorage.getItem(VALUE_SEEN_KEY) === "true");
		} catch {
			setValueSeen(false);
		}

		function refreshAvailability(): void {
			if (isStandaloneMode()) {
				setAvailability("installed");
				return;
			}
			if (capturedInstallEvent) {
				setAvailability("available");
				return;
			}
			setAvailability(
				supportsIOSInstallInstructions() ? "ios-instructions" : "unavailable"
			);
		}

		refreshAvailability();
		window.addEventListener(
			"verifind:install-availability",
			refreshAvailability
		);
		window
			.matchMedia("(display-mode: standalone)")
			.addEventListener("change", refreshAvailability);

		return () => {
			window.removeEventListener(
				"verifind:install-availability",
				refreshAvailability
			);
			window
				.matchMedia("(display-mode: standalone)")
				.removeEventListener("change", refreshAvailability);
		};
	}, []);

	async function requestInstall(): Promise<void> {
		if (!(valueSeen && capturedInstallEvent)) {
			return;
		}

		const event = capturedInstallEvent;
		capturedInstallEvent = undefined;
		await event.prompt();
		await event.userChoice;
		setAvailability("unavailable");
	}

	function markValueSeen(): void {
		try {
			window.localStorage.setItem(VALUE_SEEN_KEY, "true");
		} catch {
			// The prompt can still be offered for this session if storage is denied.
		}
		setValueSeen(true);
	}

	return {
		availability,
		canOfferInstall: valueSeen && availability === "available",
		canOfferIOSInstructions: valueSeen && availability === "ios-instructions",
		markValueSeen,
		requestInstall,
		isInstalled: availability === "installed",
	};
}
