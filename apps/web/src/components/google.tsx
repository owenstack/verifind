import { Button } from "@verifind/ui/components/button";
import { toast } from "@verifind/ui/components/toast";
import { Google } from "@verifind/ui/svgs/google";
import { useCallback, useState } from "react";
import { signIn } from "@/lib/auth-client";

export function GoogleSignIn({ next }: { next?: string }) {
	const [loading, setLoading] = useState(false);
	const handleSignIn = useCallback(() => {
		setLoading(true);
		toast.promise(
			signIn.social({
				provider: "google",
				callbackURL: `${window.location.origin}${next}`,
				newUserCallbackURL: `${window.location.origin}/onboard`,
			}),
			{
				loading: "Signing you in...",
				error: "Failed to sign you in",
				success: "Signed in successfully",
			}
		);
		setLoading(false);
	}, [next]);

	return (
		<Button disabled={loading} onClick={handleSignIn} variant={"outline"}>
			{loading ? (
				"Signing you in"
			) : (
				<span>
					<Google /> Continue with Google
				</span>
			)}
		</Button>
	);
}
