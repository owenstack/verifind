import type { AnyFieldApi } from "@tanstack/react-form";
import { Button, buttonVariants } from "@verifind/ui/components/button";
import { Checkbox } from "@verifind/ui/components/checkbox";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldTitle,
} from "@verifind/ui/components/field";
import {
	RadioGroup,
	RadioGroupItem,
} from "@verifind/ui/components/radio-group";
import { useCallback } from "react";
import { onboarding } from "@/lib/constants";
import { stepStore } from "@/lib/store";
import { TransitionLink } from "@/platform/transition-link";

// biome-ignore lint/suspicious/noExplicitAny: <@tanstack/react-form>
export function FirstStep({ form }: { form: any }) {
	const { setStep } = stepStore.getState();
	const goToNextStep = useCallback(() => {
		setStep(1);
	}, [setStep]);

	return (
		<FieldGroup className="gap-8">
			<div className="space-y-2">
				<FieldTitle className="font-semibold text-2xl tracking-tight sm:text-3xl">
					What Type of Home Are You Looking For?
				</FieldTitle>
				<FieldDescription className="text-base leading-6">
					Select all the home types you’d consider. You can update this later.
				</FieldDescription>
			</div>
			<form.Field name="propType">
				{(field: AnyFieldApi) => {
					const selected = Array.isArray(field.state.value)
						? field.state.value
						: [];
					const isInvalid = !field.state.meta.isValid;
					return (
						<Field data-invalid={isInvalid}>
							<FieldGroup className="grid gap-2 sm:grid-cols-2">
								{onboarding.propType.map((option) => {
									const isChecked = selected.includes(option.value);
									return (
										<FieldLabel htmlFor={option.value} key={option.value}>
											<Field data-invalid={isInvalid} orientation="horizontal">
												<Checkbox
													aria-invalid={isInvalid}
													checked={isChecked}
													className="sr-only"
													id={option.value}
													name={option.value}
													onCheckedChange={(checked) => {
														field.handleChange(
															checked
																? [...selected, option.value]
																: selected.filter(
																		(value: string) => value !== option.value
																	)
														);
													}}
												/>
												{option.icon && (
													<option.icon className="size-8 shrink-0 self-center text-primary" />
												)}
												<FieldContent>
													<FieldTitle>{option.title}</FieldTitle>
													<FieldDescription>
														{option.description}
													</FieldDescription>
												</FieldContent>
											</Field>
										</FieldLabel>
									);
								})}
							</FieldGroup>
							{isInvalid && <FieldError errors={field.state.meta.errors} />}
						</Field>
					);
				}}
			</form.Field>
			<form.Field name="bedroom">
				{(field: AnyFieldApi) => {
					const isInvalid =
						field.state.meta.isTouched && !field.state.meta.isValid;
					return (
						<Field className="gap-2" data-invalid={isInvalid}>
							<FieldLabel htmlFor={field.name}>How Many Bedrooms?</FieldLabel>
							<RadioGroup
								className="grid grid-cols-4 gap-2"
								id={field.name}
								name={field.name}
								onValueChange={field.handleChange}
								value={field.state.value}
							>
								{onboarding.bedroom.map((option) => (
									<FieldLabel
										htmlFor={`${field.name}-${option.value}`}
										key={option.value}
									>
										<Field orientation="horizontal">
											<RadioGroupItem
												className="sr-only"
												id={`${field.name}-${option.value}`}
												value={option.value}
											/>
											<FieldContent>{option.value}</FieldContent>
										</Field>
									</FieldLabel>
								))}
							</RadioGroup>
							{isInvalid ? (
								<FieldError errors={field.state.meta.errors} />
							) : null}
						</Field>
					);
				}}
			</form.Field>
			<div className="flex items-center justify-between">
				<TransitionLink className={buttonVariants({ variant: "link" })} to="/">
					Skip For Now
				</TransitionLink>
				<Button onClick={goToNextStep} size="lg" type="button">
					Continue
				</Button>
			</div>
		</FieldGroup>
	);
}
