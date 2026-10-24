import type { AnyFieldApi } from "@tanstack/react-form";
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
import { Building2, DoorClosed, HousePlus } from "lucide-react";
import { stepStore } from "@/lib/store";

// biome-ignore lint/suspicious/noExplicitAny: <@tanstack/react-form>
export function FirstStep({ form }: { form: any }) {
	const { setStep } = stepStore.getState();

	return (
		<FieldGroup>
			<FieldTitle className="text-4xl">
				What Type of Home Are You Looking for?
			</FieldTitle>
			<FieldDescription className="text-xl">
				Choose one or more property types. You can change this later.
			</FieldDescription>
			<form.Field name="propType">
				{(field: AnyFieldApi) => {
					const isInvalid =
						field.state.meta.isTouched && !field.state.meta.isValid;
					return (
						<Field data-invalid={isInvalid}>
							<FieldGroup>
								<FieldLabel>
									<Field orientation={"horizontal"}>
										<Checkbox
											aria-invalid={isInvalid}
											className={"sr-only"}
											id="single"
											name="single"
										/>
										<DoorClosed className="size-8 text-primary" />
										<FieldContent>
											<FieldTitle>Single Room</FieldTitle>
											<FieldDescription>
												A single room or self-contained unit
											</FieldDescription>
										</FieldContent>
									</Field>
								</FieldLabel>
								<FieldLabel>
									<Field orientation={"horizontal"}>
										<Checkbox
											aria-invalid={isInvalid}
											className={"sr-only"}
											id="apartment"
											name="apartment"
										/>
										<HousePlus className="size-8 text-primary" />
										<FieldContent>
											<FieldTitle>Apartment</FieldTitle>
											<FieldDescription>
												A mini-flat or an apartment with 1–3 bedrooms
											</FieldDescription>
										</FieldContent>
									</Field>
								</FieldLabel>
								<FieldLabel>
									<Field orientation={"horizontal"}>
										<Checkbox
											aria-invalid={isInvalid}
											className={"sr-only"}
											id="single"
											name="single"
										/>
										<Building2 className="size-8 text-primary" />
										<FieldContent>
									<FieldTitle>Whole House or Bungalow</FieldTitle>
											<FieldDescription>Duplex or bungalow</FieldDescription>
										</FieldContent>
									</Field>
								</FieldLabel>
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
					return <Field data-invalid={isInvalid} />;
				}}
			</form.Field>
		</FieldGroup>
	);
}
