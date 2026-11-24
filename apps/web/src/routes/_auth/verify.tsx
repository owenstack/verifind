// biome-ignore-all lint/performance/noJsxPropsBind: field handlers bind form state inline
// biome-ignore-all lint/suspicious/noArrayIndexKey: six fixed, non-reorderable OTP slots

import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@verifind/ui/components/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSet,
	FieldTitle,
} from "@verifind/ui/components/field";
import { Input } from "@verifind/ui/components/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@verifind/ui/components/input-otp";
import { toast } from "@verifind/ui/components/toast";
import { BottomSheet } from "@verifind/ui/platform/bottom-sheet";
import { useEffect, useState } from "react";
import z from "zod";
import { emailOtp, signIn } from "@/lib/auth-client";
import {
	dismissPasskeyOffer,
	getBiometricLabel,
	hasDismissedPasskeyOffer,
	hasRegisteredPasskey,
	isPlatformPasskeyAvailable,
	registerPlatformPasskey,
} from "@/lib/passkeys";
import { Link } from "@/platform/transition-link";

const RESEND_COOLDOWN_SECONDS = 60;
const OTP_LENGTH = 6;
const OTP_PATTERN = /^\d{6}$/;

const searchSchema = z.object({
	email: z.email().optional(),
	next: z.string().optional(),
	type: z.enum(["sign-in", "sign-up"]).default("sign-in"),
});

export const Route = createFileRoute("/_auth/verify")({
	component: RouteComponent,
	validateSearch: searchSchema,
});

const emailSchema = z.email("Enter a valid email address.");
const otpSchema = z
	.string()
	.regex(OTP_PATTERN, `Enter the ${OTP_LENGTH}-digit code.`);

function createFormSchema(codeSent: boolean, type: "sign-in" | "sign-up") {
	const otp = codeSent ? otpSchema : z.string();

	if (type === "sign-up") {
		return z.object({
			firstName: z.string().trim().min(1, "First name is required."),
			lastName: z.string().trim().min(1, "Surname is required."),
			email: emailSchema,
			otp,
		});
	}

	return z.object({
		firstName: z.string(),
		lastName: z.string(),
		email: emailSchema,
		otp,
	});
}

function getVerificationError(error: unknown): string {
	return error instanceof Error && error.message
		? error.message
		: "That code didn’t work. Check it and try again.";
}

function getButtonLabel(
	codeSent: boolean,
	isSubmitting: boolean,
	type: "sign-in" | "sign-up"
): string {
	if (isSubmitting) {
		return codeSent ? "Verifying…" : "Sending Code…";
	}
	if (!codeSent) {
		return "Send Verification Code";
	}
	if (type === "sign-up") {
		return "Create Account";
	}
	return "Verify & Sign In";
}

function RouteComponent() {
	const { next, email, type } = Route.useSearch();
	const navigate = useNavigate();
	const biometricLabel = getBiometricLabel();
	const [codeSent, setCodeSent] = useState(Boolean(email));
	const [resendCooldown, setResendCooldown] = useState(
		email ? RESEND_COOLDOWN_SECONDS : 0
	);
	const [verificationError, setVerificationError] = useState<string | null>(
		null
	);
	const [passkeyOffer, setPasskeyOffer] = useState<{
		redirectTo: string;
	} | null>(null);
	const [enablingPasskey, setEnablingPasskey] = useState(false);

	const shouldOfferPasskeyRegistration = async () => {
		if (hasDismissedPasskeyOffer()) {
			return false;
		}
		if (!(await isPlatformPasskeyAvailable())) {
			return false;
		}
		// Already set up? Then there is nothing to offer.
		return !(await hasRegisteredPasskey());
	};

	const handleOfferDismiss = () => {
		if (!passkeyOffer) {
			return;
		}
		// “Not now” is remembered for good — the offer only ever appears on a
		// first sign-in without a passkey, never as a recurring nag.
		dismissPasskeyOffer();
		const { redirectTo } = passkeyOffer;
		setPasskeyOffer(null);
		navigate({ to: redirectTo });
	};

	const handleEnablePasskey = async () => {
		if (!passkeyOffer || enablingPasskey) {
			return;
		}
		setEnablingPasskey(true);
		try {
			const result = await registerPlatformPasskey();
			if (result.error) {
				throw result.error;
			}
			toast.add({
				title: "Biometric sign-in is on for this device.",
				type: "success",
			});
			setPasskeyOffer(null);
			navigate({ to: passkeyOffer.redirectTo });
		} catch (error) {
			const code =
				typeof error === "object" && error !== null && "code" in error
					? String((error as { code: unknown }).code)
					: "";
			if (code.includes("CANCEL")) {
				// The user backed out of the biometric prompt — keep the offer up.
				return;
			}
			toast.add({
				description: "You can try again, or continue with an email code.",
				title: `Couldn’t set up ${biometricLabel.toLowerCase()} sign-in`,
				type: "error",
			});
		} finally {
			setEnablingPasskey(false);
		}
	};

	useEffect(() => {
		if (resendCooldown <= 0) {
			return;
		}
		const timer = setTimeout(() => {
			setResendCooldown((seconds) => seconds - 1);
		}, 1000);
		return () => clearTimeout(timer);
	}, [resendCooldown]);

	const sendCode = (to: string) => {
		setVerificationError(null);
		toast.promise(
			emailOtp
				.sendVerificationOtp({ email: to, type: "sign-in" })
				// The better-auth client resolves `{ data, error }` instead of
				// rejecting, so rethrow to reach the error toast below.
				.then((result) => {
					if (result.error) {
						throw new Error(
							result.error.message ??
								"Couldn’t send the code. Check the email address and try again."
						);
					}
					return result;
				}),
			{
				loading: "Sending Code…",
				success: () => {
					setCodeSent(true);
					setResendCooldown(RESEND_COOLDOWN_SECONDS);
					return "Check your email for a new code.";
				},
				error: "Couldn’t send the code. Check the email address and try again.",
			}
		);
	};

	const form = useForm({
		defaultValues: {
			firstName: "",
			lastName: "",
			email: email ?? "",
			otp: "",
		},
		validators: {
			onSubmit: createFormSchema(codeSent, type),
		},
		onSubmit: async ({ value }) => {
			setVerificationError(null);
			if (!codeSent) {
				await sendCode(value.email);
				return;
			}

			const name = `${value.firstName} ${value.lastName}`.trim();
			toast.promise(
				signIn
					.emailOtp({
						email: value.email,
						otp: value.otp,
						...(type === "sign-up" && name ? { name } : {}),
					})
					// The better-auth client resolves `{ data, error }` instead of
					// rejecting, so rethrow to reach the error handler below.
					.then((result) => {
						if (result.error) {
							throw new Error(getVerificationError(result.error));
						}
						return result;
					}),
				{
					loading: "Verifying Code…",
					success: () => {
						const redirectTo = next ?? (type === "sign-up" ? "/onboard" : "/");
						if (type === "sign-in") {
							// First sign-in on a biometric-capable device: offer to
							// register a passkey before leaving the page. Navigation
							// continues when the offer sheet is resolved.
							const continueSignIn = async () => {
								if (await shouldOfferPasskeyRegistration()) {
									setPasskeyOffer({ redirectTo });
									return;
								}
								navigate({ to: redirectTo });
							};
							continueSignIn();
							return "You’re signed in.";
						}
						navigate({ to: redirectTo });
						return "Your account is ready.";
					},
					error: (error: unknown) => {
						setVerificationError(getVerificationError(error));
						return "That code didn’t work. Check it and try again.";
					},
				}
			);
		},
	});

	const handleResend = async () => {
		await sendCode(form.state.values.email);
		form.setFieldValue("otp", "");
	};

	return (
		<>
			<div className="absolute inset-x-0 bottom-0 z-10 flex min-h-[66.67vh] flex-col rounded-t-3xl bg-background px-5 py-6 sm:bottom-8 sm:mx-auto sm:max-w-md sm:rounded-3xl sm:px-8 sm:py-8">
				<div className="flex flex-col gap-6">
					<FieldSet className="gap-6">
						<div className="space-y-2">
							<FieldTitle className="font-semibold text-3xl tracking-tight sm:text-4xl">
								{type === "sign-up"
									? "Create Your Account"
									: "Verify Your Email"}
							</FieldTitle>
							<FieldDescription className="text-base text-muted-foreground sm:text-lg">
								{codeSent
									? `Enter the ${OTP_LENGTH}-digit code we sent to your email.`
									: `Enter your email address and we’ll send you a ${OTP_LENGTH}-digit code.`}
							</FieldDescription>
						</div>
						<FieldGroup className="gap-5 sm:gap-6">
							<form
								className="w-full"
								onSubmit={(e) => {
									e.preventDefault();
									form.handleSubmit();
								}}
							>
								<FieldGroup className="gap-5">
									{type === "sign-up" && (
										<FieldGroup className="grid gap-4 sm:grid-cols-2 sm:gap-3">
											<form.Field name="firstName">
												{(field) => {
													const isInvalid =
														field.state.meta.isTouched &&
														!field.state.meta.isValid;
													return (
														<Field className="gap-2" data-invalid={isInvalid}>
															<FieldLabel
																className="font-semibold text-sm"
																htmlFor={field.name}
															>
																First name
															</FieldLabel>
															<Input
																aria-invalid={isInvalid}
																autoComplete="given-name"
																className="h-12 text-base"
																id={field.name}
																name={field.name}
																onBlur={field.handleBlur}
																onChange={(e) =>
																	field.handleChange(e.target.value)
																}
																placeholder="Your first name…"
																required
																value={field.state.value}
															/>
															{isInvalid ? (
																<FieldError errors={field.state.meta.errors} />
															) : null}
														</Field>
													);
												}}
											</form.Field>
											<form.Field name="lastName">
												{(field) => {
													const isInvalid =
														field.state.meta.isTouched &&
														!field.state.meta.isValid;
													return (
														<Field className="gap-2" data-invalid={isInvalid}>
															<FieldLabel
																className="font-semibold text-sm"
																htmlFor={field.name}
															>
																Surname
															</FieldLabel>
															<Input
																aria-invalid={isInvalid}
																autoComplete="family-name"
																className="h-12 text-base"
																id={field.name}
																name={field.name}
																onBlur={field.handleBlur}
																onChange={(e) =>
																	field.handleChange(e.target.value)
																}
																placeholder="Your surname…"
																required
																value={field.state.value}
															/>
															{isInvalid ? (
																<FieldError errors={field.state.meta.errors} />
															) : null}
														</Field>
													);
												}}
											</form.Field>
										</FieldGroup>
									)}
									{codeSent ? (
										<form.Subscribe selector={(s) => s.values.email}>
											{(currentEmail) => (
												<Field className="gap-2">
													<FieldTitle>Code sent to</FieldTitle>
													<div className="flex min-h-12 items-center break-all rounded-2xl border bg-input/30 px-4 text-base">
														{currentEmail}
													</div>
												</Field>
											)}
										</form.Subscribe>
									) : (
										<form.Field name="email">
											{(field) => {
												const isInvalid =
													field.state.meta.isTouched &&
													!field.state.meta.isValid;
												return (
													<Field className="gap-2" data-invalid={isInvalid}>
														<FieldLabel
															className="font-semibold text-sm"
															htmlFor={field.name}
														>
															Email address
														</FieldLabel>
														<Input
															aria-invalid={isInvalid}
															autoComplete="email"
															className="h-12 text-base"
															id={field.name}
															name={field.name}
															onBlur={field.handleBlur}
															onChange={(e) =>
																field.handleChange(e.target.value)
															}
															placeholder="you@example.com…"
															required
															type="email"
															value={field.state.value}
														/>
														{isInvalid ? (
															<FieldError errors={field.state.meta.errors} />
														) : null}
													</Field>
												);
											}}
										</form.Field>
									)}
									<form.Field name="otp">
										{(field) => {
											const isInvalid =
												verificationError !== null ||
												(field.state.meta.isTouched &&
													!field.state.meta.isValid);
											const errors = verificationError
												? [{ message: verificationError }]
												: field.state.meta.errors;
											return (
												<Field className="gap-2" data-invalid={isInvalid}>
													<FieldLabel
														className="font-semibold text-sm"
														htmlFor={field.name}
													>
														Verification code
													</FieldLabel>
													<InputOTP
														aria-invalid={isInvalid}
														className="w-full justify-center"
														disabled={!codeSent}
														id={field.name}
														maxLength={OTP_LENGTH}
														name={field.name}
														onBlur={field.handleBlur}
														onChange={(value) => {
															field.handleChange(value);
															if (verificationError) {
																setVerificationError(null);
															}
														}}
														value={field.state.value}
													>
														<InputOTPGroup className="w-full justify-center">
															{Array.from({ length: OTP_LENGTH }).map(
																(_, index) => (
																	<InputOTPSlot
																		className="size-10 text-base sm:size-11"
																		index={index}
																		key={`otp-slot-${index}`}
																	/>
																)
															)}
														</InputOTPGroup>
													</InputOTP>
													{isInvalid ? <FieldError errors={errors} /> : null}
													{codeSent ? null : (
														<FieldDescription className="text-xs">
															Send a code first, then enter it here.
														</FieldDescription>
													)}
												</Field>
											);
										}}
									</form.Field>
									<form.Subscribe selector={(s) => s.isSubmitting}>
										{(isSubmitting) => (
											<Button
												className="h-12 w-full font-semibold text-base"
												disabled={isSubmitting}
											>
												{getButtonLabel(codeSent, isSubmitting, type)}
											</Button>
										)}
									</form.Subscribe>
								</FieldGroup>
							</form>
							{codeSent ? (
								<div className="flex flex-wrap items-center justify-between gap-2 text-sm">
									<Button
										className="h-auto p-0 font-medium"
										disabled={resendCooldown > 0}
										onClick={handleResend}
										type="button"
										variant="link"
									>
										{resendCooldown > 0
											? `Resend code in ${resendCooldown}s`
											: "Resend code"}
									</Button>
									<Link
										className="font-medium text-primary"
										search={{ next }}
										to={type === "sign-up" ? "/signup" : "/login"}
									>
										Use a different email
									</Link>
								</div>
							) : null}
						</FieldGroup>
					</FieldSet>
				</div>
			</div>
			<BottomSheet
				description={`Sign in next time with ${biometricLabel.toLowerCase()} instead of an emailed code.`}
				onOpenChange={(open) => {
					if (!open) {
						handleOfferDismiss();
					}
				}}
				open={passkeyOffer !== null}
				title={`Turn on ${biometricLabel} sign-in?`}
			>
				<div className="grid gap-3 p-4">
					<Button
						className="h-12"
						disabled={enablingPasskey}
						onClick={handleEnablePasskey}
						type="button"
					>
						{enablingPasskey ? "Setting Up…" : `Use ${biometricLabel}`}
					</Button>
					<Button
						className="h-12"
						disabled={enablingPasskey}
						onClick={handleOfferDismiss}
						type="button"
						variant="ghost"
					>
						Not Now
					</Button>
				</div>
			</BottomSheet>
		</>
	);
}
