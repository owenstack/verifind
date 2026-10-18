import { clearUserOfflineData } from "@/lib/offline-persistence";
import { queryClient } from "@/utils/orpc";
import { signOut } from "./auth-client";

export async function signOutAndClearOfflineData(): Promise<void> {
	const result = await signOut();
	if (!result.error) {
		queryClient.clear();
		await clearUserOfflineData();
	}
}
