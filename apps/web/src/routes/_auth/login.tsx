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
import z from "zod";
import { GoogleSignIn } from "@/components/google";
import { emailOtp } from "@/lib/auth-client";
import { TransitionLink } from "@/platform/transition-link";

export const Route = createFileRoute("/_auth/login")({
	component: RouteComponent,
	validateSearch: z.object({
		next: z.string().optional(),
	}),
});

function RouteComponent() {
	const navigate = useNavigate();
	const { next } = Route.useSearch();
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
					success: () => {
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
													className="h-11"
													id={field.name}
													name={field.name}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													placeholder="you@example.com…"
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
						<TransitionLink className="font-medium text-primary" to="/signup">
							Create Account
						</TransitionLink>
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
