import type { AnyFieldApi } from "@tanstack/react-form";
import { Button, buttonVariants } from "@verifind/ui/components/button";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "@verifind/ui/components/combobox";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldTitle,
} from "@verifind/ui/components/field";
import { InputGroupAddon } from "@verifind/ui/components/input-group";
import { Locate, Search } from "lucide-react";
import { useCallback, useState } from "react";
import lgas from "@/assets/lga.json";
import type { LGA } from "@/lib/constants";
import { stepStore } from "@/lib/store";
import { TransitionLink } from "@/platform/transition-link";

const getLgaLabel = (lga: LGA) => `${lga.name}, ${lga.state_name}`;

// biome-ignore lint/suspicious/noExplicitAny: <@tanstack/react-form>
export function ThirdStep({ form }: { form: any }) {
	const { setStep } = stepStore.getState();
	const [locationError, setLocationError] = useState<string | null>(null);
	const goToNextStep = useCallback(() => {
		setStep(3);
		form.handleSubmit();
	}, [setStep, form.handleSubmit]);
	const getLocation = (field: AnyFieldApi) => {
		setLocationError(null);
		if (!navigator.geolocation) {
			setLocationError("Location is not available in this browser.");
			return;
		}

		navigator.geolocation.getCurrentPosition(
			({ coords }) => {
				const nearestLga = lgas.reduce((nearest, lga) => {
					const latitudeDifference = lga.latitude - coords.latitude;
					const longitudeDifference = lga.longitude - coords.longitude;
					const nearestLatitudeDifference = nearest.latitude - coords.latitude;
					const nearestLongitudeDifference =
						nearest.longitude - coords.longitude;
					const distance = latitudeDifference ** 2 + longitudeDifference ** 2;
					const nearestDistance =
						nearestLatitudeDifference ** 2 + nearestLongitudeDifference ** 2;

					return distance < nearestDistance ? lga : nearest;
				});

				field.setValue({
					lat: nearestLga.latitude,
					long: nearestLga.longitude,
				});
			},
			() =>
				setLocationError(
					"Could not get your location. Check your permission and try again."
				),
			{ enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 }
		);
	};

	return (
		<FieldGroup className="gap-8">
			<div className="space-y-2">
				<FieldTitle className="font-semibold text-2xl tracking-tight sm:text-3xl">
					Where do you want to live?
				</FieldTitle>
				<FieldDescription className="text-base leading-6">
					Choose an area to help us find nearby properties
				</FieldDescription>
			</div>
			<form.Field name="location">
				{(field: AnyFieldApi) => {
					const isInvalid =
						field.state.meta.isTouched && !field.state.meta.isValid;
					const selectedLga = lgas.find(
						(lga) =>
							lga.latitude === field.state.value?.lat &&
							lga.longitude === field.state.value?.long
					);
					const handleLgaChange = (lga: LGA | null) => {
						field.handleChange(
							lga ? { lat: lga.latitude, long: lga.longitude } : undefined
						);
					};
					return (
						<Field data-invalid={isInvalid}>
							<FieldGroup className="space-y-4">
								<FieldLabel
									htmlFor={field.name}
									onClick={() => getLocation(field)}
								>
									<Field data-invalid={isInvalid} orientation={"horizontal"}>
										<Locate className="size-8 shrink-0 self-center text-primary" />
										<FieldContent>
											<FieldTitle>Use my current location</FieldTitle>
											<FieldDescription>
												{locationError ??
													"We will ask permission to access location"}
											</FieldDescription>
										</FieldContent>
									</Field>
								</FieldLabel>
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>
										Or search manually
									</FieldLabel>
									<Combobox
										items={lgas}
										itemToStringLabel={getLgaLabel}
										onValueChange={handleLgaChange}
										value={selectedLga}
									>
										<ComboboxInput
											aria-invalid={isInvalid}
											placeholder="Search city or neighborhood"
										>
											<InputGroupAddon>
												<Search />
											</InputGroupAddon>
										</ComboboxInput>
										<ComboboxContent>
											<ComboboxEmpty>No LGAs found</ComboboxEmpty>
											<ComboboxList>
												{(lga: LGA) => (
													<ComboboxItem key={lga.id} value={lga}>
														{lga.name}, {lga.state_name}
													</ComboboxItem>
												)}
											</ComboboxList>
										</ComboboxContent>
									</Combobox>
								</Field>
								<Field>
									<FieldLabel>Popular searches</FieldLabel>
									<FieldGroup>
										<Button
											onClick={() =>
												field.setValue({ lat: 6.416_667, long: 2.883_333 })
											}
											variant={"outline"}
										>
											Ibeju-Lekki, Lagos
										</Button>
										<Button
											onClick={() => field.setValue({ lat: 6.5, long: 3.35 })}
											variant={"outline"}
										>
											Surulere, Lagos
										</Button>
										<Button
											onClick={() =>
												field.setValue({
													lat: 4.824_166_67,
													long: 7.033_611_11,
												})
											}
											variant={"outline"}
										>
											Port Harcourt, Rivers
										</Button>
									</FieldGroup>
								</Field>
							</FieldGroup>
						</Field>
					);
				}}
			</form.Field>
			<div className="flex items-center justify-between">
				<TransitionLink className={buttonVariants({ variant: "link" })} to="/">
					Skip
				</TransitionLink>
				<Button onClick={goToNextStep} size="lg" type="submit">
					Complete &rarr;
				</Button>
			</div>
		</FieldGroup>
	);
}
