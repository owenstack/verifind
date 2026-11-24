// biome-ignore-all lint/performance/noJsxPropsBind: filter chips bind inline setters

import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@verifind/ui/components/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
	FieldSet,
	FieldTitle,
} from "@verifind/ui/components/field";
import { Input } from "@verifind/ui/components/input";
import { toast } from "@verifind/ui/components/toast";
import { FingerprintPattern, ScanFace } from "lucide-react";
import { useEffect, useState } from "react";
import z from "zod";
import { GoogleSignIn } from "@/components/others/google";
import { emailOtp } from "@/lib/auth-client";
import {
	getBiometricLabel,
	isPlatformPasskeyAvailable,
	signInWithPasskey,
	startConditionalPasskeySignIn,
} from "@/lib/passkeys";
import { Link } from "@/platform/transition-link";

export const Route = createFileRoute("/_auth/login")({
	component: RouteComponent,
	validateSearch: z.object({
		next: z.string().optional(),
	}),
});

function RouteComponent() {
	const navigate = useNavigate();
	const { next } = Route.useSearch();
	const biometricLabel = getBiometricLabel();
	const [biometricsAvailable, setBiometricsAvailable] = useState(false);
	const [passkeyLoading, setPasskeyLoading] = useState(false);

	useEffect(() => {
		let active = true;
		const startConditionalSignIn = async () => {
			const available = await isPlatformPasskeyAvailable();
			if (!active) {
				return;
			}
			setBiometricsAvailable(available);
			if (!available) {
				return;
			}
			// Offer the browser’s autofill passkey suggestion while the user
			// focuses the email field. Silent when dismissed or unsupported.
			if (await startConditionalPasskeySignIn()) {
				if (!active) {
					return;
				}
				toast.add({ title: "You’re signed in.", type: "success" });
				navigate({ to: next ?? "/" });
			}
		};
		startConditionalSignIn();
		return () => {
			active = false;
		};
	}, [navigate, next]);

	const handlePasskeySignIn = async () => {
		if (passkeyLoading) {
			return;
		}
		setPasskeyLoading(true);
		try {
			const status = await signInWithPasskey();
			if (status === "signed-in") {
				toast.add({ title: "You’re signed in.", type: "success" });
				await navigate({ to: next ?? "/" });
			} else if (status === "no-passkey") {
				toast.add({
					description:
						"No passkey was found on this device. Sign in with an email code instead.",
					title: "No passkey found",
					type: "error",
				});
			} else if (status === "failed") {
				toast.add({
					description: "Sign in with an email code instead.",
					title: "Biometric sign-in failed",
					type: "error",
				});
			}
			// "cancelled": the user backed out of the biometric prompt — stay silent.
		} finally {
			setPasskeyLoading(false);
		}
	};

	const form = useForm({
		defaultValues: {
			email: "",
		},
		validators: {
			onSubmit: z.object({
				email: z.string(),
			}),
		},
		onSubmit: ({ value }) => {
			const { email } = value;
			toast.promise(
				emailOtp.sendVerificationOtp({
					email,
					type: "sign-in",
				}),
				{
					loading: "Sending Sign-In Code…",
					success: (res) => {
						if (res.error) {
							return {
								title: "Couldn’t send the code.",
								description: res.error.message,
								type: "error",
							};
						}
						navigate({
							to: "/verify",
							search: {
								email,
								next,
								type: "sign-in",
							},
						});
						return "Check your email for a sign-in code.";
					},
					error:
						"Couldn’t send your sign-in code. Check your email address and try again.",
				}
			);
		},
	});
	return (
		<div className="absolute inset-x-0 bottom-0 z-10 flex min-h-[66.67vh] flex-col rounded-t-3xl bg-background px-5 py-6 sm:bottom-8 sm:mx-auto sm:max-w-md sm:rounded-3xl sm:px-8 sm:py-8">
			<div className="flex flex-col gap-6">
				<FieldSet className="gap-6">
					<div className="space-y-1.5">
						<FieldTitle className="font-semibold text-3xl tracking-tight sm:text-4xl">
							Welcome Back
						</FieldTitle>
						<FieldDescription className="text-base text-muted-foreground sm:text-lg">
							Enter your email address and we’ll send you a sign-in code.
						</FieldDescription>
					</div>
					<FieldGroup className="gap-5">
						{biometricsAvailable ? (
							<>
								<Button
									className="h-11 w-full font-medium"
									disabled={passkeyLoading}
									onClick={handlePasskeySignIn}
									variant="outline"
								>
									{passkeyLoading ? (
										"Waiting for Biometrics…"
									) : (
										<span className="flex items-center gap-2">
											{biometricLabel === "fingerprint" ? (
												<FingerprintPattern className="size-4" />
											) : (
												<ScanFace className="size-4" />
											)}
											Use {biometricLabel}
										</span>
									)}
								</Button>
								<FieldSeparator className="text-muted-foreground text-xs">
									OR
								</FieldSeparator>
							</>
						) : null}
						<form
							className="w-full"
							onSubmit={(e) => {
								e.preventDefault();
								form.handleSubmit();
							}}
						>
							<FieldGroup className="gap-4">
								<form.Field name="email">
									{(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field className="gap-2" data-invalid={isInvalid}>
												<FieldLabel
													className="font-medium"
													htmlFor={field.name}
												>
													Email address
												</FieldLabel>
												<Input
													aria-invalid={isInvalid}
													autoComplete="username webauthn"
													className="h-11"
													id={field.name}
													name={field.name}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													placeholder="you@example.com…"
													required
													type="email"
												/>
												{isInvalid ? (
													<FieldError errors={field.state.meta.errors} />
												) : null}
											</Field>
										);
									}}
								</form.Field>
								<form.Subscribe selector={(s) => s.isSubmitting}>
									{(isSubmitting) => (
										<Button
											className="h-11 w-full font-medium"
											disabled={isSubmitting}
										>
											{isSubmitting
												? "Sending Code…"
												: "Email Me a Sign-In Code"}
										</Button>
									)}
								</form.Subscribe>
							</FieldGroup>
						</form>
						<FieldSeparator className="text-muted-foreground text-xs">
							OR
						</FieldSeparator>
						<GoogleSignIn next={next} />
					</FieldGroup>
					<FieldDescription className="flex flex-wrap items-center gap-x-2 gap-y-0 text-center text-sm">
						<span className="text-muted-foreground">
							Don’t have an account?
						</span>
						<Link className="font-medium text-primary" to="/signup">
							Create Account
						</Link>
					</FieldDescription>
				</FieldSet>
				<FieldDescription className="mt-auto pt-6 text-center text-muted-foreground text-sm leading-6">
					By continuing, you agree to VeriFind’s Terms of Service and Privacy
					Policy.
				</FieldDescription>
			</div>
		</div>
	);
}
