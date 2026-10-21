import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import { toast } from "@verifind/ui/components/toast";
import z from "zod";
import { emailOtp } from "@/lib/auth-client";

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
					loading: "Sending verification email...",
					success: () => {
						navigate({
							to: "/verify",
							search: {
								email,
								next,
							},
						});
						return "Verification email sent successfully";
					},
					error: "Failed to send verification email",
				}
			);
		},
	});
	return (
		<div className="absolute inset-x-0 bottom-0 z-10 h-fit rounded-t-xl bg-background p-4">
			<div className="grid gap-4">
				<FieldSet>
					<FieldTitle className="text-3xl">Welcome back</FieldTitle>
					<FieldDescription className="text-muted-foreground text-xl">
						Sign in to continue
					</FieldDescription>
					<FieldGroup>
						<form
							className="w-full"
							onSubmit={(e) => {
								e.preventDefault();
								form.handleSubmit();
							}}
						>
							<form.Field name="email">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>
												Email address
											</FieldLabel>
											<Input
												aria-invalid={isInvalid}
												id={field.name}
												name={field.name}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="email@example.com"
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
						</form>
					</FieldGroup>
				</FieldSet>
			</div>
		</div>
	);
}
