import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@verifind/ui/components/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldTitle,
} from "@verifind/ui/components/field";
import { Input } from "@verifind/ui/components/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "@verifind/ui/components/input-otp";
import { toast } from "@verifind/ui/components/toast";
import { Fragment } from "react";
import z from "zod";
import { signIn } from "@/lib/auth-client";

const searchSchema = z.object({
	email: z.email().optional(),
	next: z.string().optional(),
	type: z.enum(["sign-in", "sign-up"]).default("sign-in"),
});

export const Route = createFileRoute("/_auth/verify")({
	component: RouteComponent,
	validateSearch: searchSchema,
});

const formSchema = z.object({
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	email: z.email(),
	otp: z.string().length(6),
});

function RouteComponent() {
	const { next, email, type } = Route.useSearch();
	const navigate = useNavigate();
	const form = useForm({
		defaultValues: {
			firstName: "",
			lastName: "",
			email,
			otp: "",
		} as z.infer<typeof formSchema>,
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: ({ value }) => {
			const name = `${value.firstName} ${value.lastName}`;
			toast.promise(signIn.emailOtp({ ...value, name }), {
				loading: "Verifying Code…",
				success: () => {
					if (next) {
						navigate({ to: next });
					}
					return type === "sign-up"
						? "Your account is ready."
						: "You’re signed in.";
				},
				error: "That code didn’t work. Check it and try again.",
			});
		},
	});
	return (
		<div className="absolute inset-x-0 bottom-0 z-10 flex min-h-[66.67vh] flex-col rounded-t-3xl bg-background px-5 py-6 sm:bottom-8 sm:mx-auto sm:max-w-md sm:rounded-3xl sm:px-8 sm:py-8">
			<div className="flex flex-col gap-6">
				<div className="space-y-2">
					<FieldTitle>
						{type === "sign-up" ? "Create Your Account" : "Verify Your Email"}
					</FieldTitle>
					<FieldDescription>
						{email
							? `Enter the 6-digit code sent to ${email}.`
							: "Enter the 6-digit code sent to your email."}
					</FieldDescription>
				</div>
				<form
					className="w-full"
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<FieldGroup className="gap-5 sm:gap-6">
						{type === "sign-up" && (
							<FieldGroup className="grid gap-4 sm:grid-cols-2 sm:gap-3">
								<form.Field name="firstName">
									{(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
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
													onChange={(e) => field.handleChange(e.target.value)}
													placeholder="Enter your first name…"
													required
													value={field.state.value}
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								</form.Field>
								<form.Field name="lastName">
									{(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
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
													onChange={(e) => field.handleChange(e.target.value)}
													placeholder="Enter your surname…"
													required
													value={field.state.value}
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								</form.Field>
							</FieldGroup>
						)}
						<form.Field name="email">
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
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
											className="h-12 text-base"
											defaultValue={field.state.value}
											id={field.name}
											name={field.name}
											placeholder="name@example.com…"
											required
											type="email"
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						</form.Field>
						<form.Field name="otp">
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field className="gap-2" data-invalid={isInvalid}>
										<FieldLabel
											className="font-semibold text-sm"
											htmlFor={field.name}
										>
											Verification code
										</FieldLabel>
										<InputOTP
											className="w-full justify-center"
											id={field.name}
											maxLength={6}
											name={field.name}
											onBlur={field.handleBlur}
											onChange={field.handleChange}
											value={field.state.value}
										>
											<InputOTPGroup>
												{Array.from({ length: 6 }).map((_, index) => (
													<Fragment key={index}>
														<InputOTPSlot index={index} />
														{index < 5 && <InputOTPSeparator />}
													</Fragment>
												))}
											</InputOTPGroup>
										</InputOTP>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
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
									{isSubmitting
										? "Verifying Code…"
										: type === "sign-up"
											? "Create Account"
											: "Sign In"}
								</Button>
							)}
						</form.Subscribe>
					</FieldGroup>
				</form>
			</div>
		</div>
	);
}
