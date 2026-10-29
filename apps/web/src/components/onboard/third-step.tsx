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
import { getLgaLabel, type LGA, nearestLGA } from "@/lib/constants";
import { TransitionLink } from "@/platform/transition-link";

// biome-ignore lint/suspicious/noExplicitAny: <@tanstack/react-form>
export function ThirdStep({ form }: { form: any }) {
	const [locationError, setLocationError] = useState<string | null>(null);
	const goToNextStep = useCallback(() => {
		form.handleSubmit();
	}, [form.handleSubmit]);
	const getLocation = (field: AnyFieldApi) => {
		setLocationError(null);
		if (!navigator.geolocation) {
			setLocationError("Your browser doesn’t support location access.");
			return;
		}

		navigator.geolocation.getCurrentPosition(
			({ coords }) => {
				const nearestLga = nearestLGA(coords);
				field.setValue({
					lat: nearestLga.latitude,
					long: nearestLga.longitude,
				});
			},
			() =>
				setLocationError(
					"We couldn’t access your location. Check your browser permission or search for an area."
				),
			{ enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 }
		);
	};

	return (
		<FieldGroup className="gap-8">
			<div className="space-y-2">
				<FieldTitle className="font-semibold text-2xl tracking-tight sm:text-3xl">
					Where Do You Want to Live?
				</FieldTitle>
				<FieldDescription className="text-base leading-6">
					Choose where you want to search for homes.
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
											<FieldTitle>Use My Current Location</FieldTitle>
											<FieldDescription>
												{locationError ??
													"Allow location access to find nearby areas."}
											</FieldDescription>
										</FieldContent>
									</Field>
								</FieldLabel>
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Search Manually</FieldLabel>
									<Combobox
										items={lgas}
										itemToStringLabel={getLgaLabel}
										onValueChange={handleLgaChange}
										value={selectedLga}
									>
										<ComboboxInput
											aria-invalid={isInvalid}
											placeholder="Search a city or neighborhood…"
										>
											<InputGroupAddon>
												<Search />
											</InputGroupAddon>
										</ComboboxInput>
										<ComboboxContent>
											<ComboboxEmpty>
												No areas found. Try another search.
											</ComboboxEmpty>
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
									<FieldLabel>Suggested Areas</FieldLabel>
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
					Skip For Now
				</TransitionLink>
				<Button onClick={goToNextStep} size="lg" type="submit">
					Finish Setup
				</Button>
			</div>
		</FieldGroup>
	);
}
