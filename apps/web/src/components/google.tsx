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
				loading: "Signing You In…",
				error:
					"Couldn’t sign you in with Google. Check your connection and try again.",
				success: "You’re signed in.",
			}
		);
		setLoading(false);
	}, [next]);

	return (
		<Button
			className={"h-12"}
			disabled={loading}
			onClick={handleSignIn}
			variant={"outline"}
		>
			{loading ? (
				"Signing You In…"
			) : (
				<span className="flex items-center gap-2">
					<Google /> Continue with Google
				</span>
			)}
		</Button>
	);
}
