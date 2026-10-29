import { type AnyFieldApi, useField } from "@tanstack/react-form";
import { Button, buttonVariants } from "@verifind/ui/components/button";
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
import { Slider } from "@verifind/ui/components/slider";
import { formatCurrency } from "@verifind/ui/lib/utils";
import { useCallback } from "react";
import { budgetLimits, onboarding } from "@/lib/constants";
import { stepStore } from "@/lib/store";
import { TransitionLink } from "@/platform/transition-link";

// biome-ignore lint/suspicious/noExplicitAny: <@tanstack/react-form>
export function SecondStep({ form }: { form: any }) {
	const { setStep } = stepStore.getState();
	const paymentField = useField({ form, name: "paymentType" });
	const budgetField = useField({ form, name: "budget" });

	const isFinancingSelected = paymentField.state.value === "financing";
	const budgetPlan = isFinancingSelected
		? budgetLimits.financing
		: budgetLimits.standard;

	const handlePaymentTypeChange = useCallback(
		(value: string) => {
			paymentField.handleChange(value);
			// The budget is denominated monthly when financing and yearly for the
			// standard plan, so re-express it whenever the user switches plans.
			budgetField.setValue(
				value === "financing"
					? budgetLimits.financing.default
					: budgetLimits.standard.default
			);
		},
		[paymentField, budgetField]
	);

	const goToNextStep = useCallback(() => {
		setStep(2);
	}, [setStep]);

	return (
		<FieldGroup className="gap-8">
			<div className="space-y-2">
				<FieldTitle className="font-semibold text-2xl tracking-tight sm:text-3xl">
					What’s Your Budget?
				</FieldTitle>
				<FieldDescription className="text-base leading-6">
					Choose a payment option and set your rent budget.
				</FieldDescription>
			</div>
			<form.Field name="paymentType">
				{(field: AnyFieldApi) => {
					const isInvalid =
						field.state.meta.isTouched && !field.state.meta.isValid;
					return (
						<Field data-invalid={isInvalid}>
							<FieldLabel htmlFor={field.name}>Payment Option</FieldLabel>
							<RadioGroup
								id={field.name}
								name={field.name}
								onValueChange={handlePaymentTypeChange}
								value={field.state.value}
							>
								{onboarding.paymentType.map((option) => (
									<FieldLabel
										htmlFor={`${field.name}-${option.value}`}
										key={option.value}
									>
										<Field orientation={"horizontal"}>
											<RadioGroupItem
												className={"sr-only"}
												id={`${field.name}-${option.value}`}
												value={option.value}
											/>
											<FieldContent>
												<FieldTitle>{option.title}</FieldTitle>
												<FieldDescription>
													{option.description}
												</FieldDescription>
											</FieldContent>
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
			<form.Field name="budget">
				{(field: AnyFieldApi) => {
					const isInvalid =
						field.state.meta.isTouched && !field.state.meta.isValid;
					const budgetValue = Math.min(
						Math.max(field.state.value, budgetPlan.min),
						budgetPlan.max
					);
					return (
						<Field data-invalid={isInvalid}>
							<FieldLabel
								className="font-semibold text-primary"
								htmlFor={field.name}
							>
								<span className="text-xl">{formatCurrency(budgetValue)}</span>
								<span className="font-normal">/{budgetPlan.period}</span>
							</FieldLabel>
							<Slider
								max={budgetPlan.max}
								min={budgetPlan.min}
								onValueChange={field.handleChange}
								step={10_000}
								value={budgetValue}
							/>
							<FieldDescription className="flex items-center justify-between gap-4">
								<span>{formatCurrency(budgetPlan.min, true)}</span>
								<span>{formatCurrency(budgetPlan.max, true)}</span>
							</FieldDescription>
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
