import { authClient } from "@/lib/auth-client";
import { clearUserOfflineData } from "@/lib/offline-persistence";
import { queryClient } from "@/utils/orpc";

export async function signOutAndClearOfflineData(): Promise<void> {
	const result = await authClient.signOut();
	if (!result.error) {
		queryClient.clear();
		await clearUserOfflineData();
	}
}
