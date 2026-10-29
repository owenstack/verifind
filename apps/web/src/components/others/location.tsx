import { type AnyFieldApi, useForm } from "@tanstack/react-form";
import { Button } from "@verifind/ui/components/button";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "@verifind/ui/components/combobox";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@verifind/ui/components/drawer";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldTitle,
} from "@verifind/ui/components/field";
import { InputGroupAddon } from "@verifind/ui/components/input-group";
import { Locate, MapPin, Search } from "lucide-react";
import { useState } from "react";
import z from "zod";
import { useStore } from "zustand";
import lgas from "@/assets/lga.json";
import { getLgaLabel, type LGA, nearestLGA } from "@/lib/constants";
import { filterStore } from "@/lib/store";

export function LocationFilter() {
	const coords = useStore(filterStore, (state) => state.filter.location);
	const setFilter = useStore(filterStore, (state) => state.setFilter);
	const lga = coords
		? nearestLGA({ latitude: coords.lat, longitude: coords.long })
		: lgas[0];
	const address = getLgaLabel(lga);
	const [open, setOpen] = useState(false);
	const [locationError, setLocationError] = useState<string | null>(null);
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
	const form = useForm({
		defaultValues: {
			location: {
				lat: lga.latitude,
				long: lga.longitude,
			},
		},
		validators: {
			onSubmit: z.object({
				location: z.object({
					lat: z.number(),
					long: z.number(),
				}),
			}),
		},
		onSubmit: ({ value }) => {
			const { location } = value;
			setFilter({ location });
			setOpen(false);
		},
	});

	return (
		<Drawer onOpenChange={setOpen} open={open}>
			<DrawerTrigger
				render={
					<Button variant={"ghost"}>
						<MapPin /> {address}
					</Button>
				}
			/>
			<DrawerContent className={"grid gap-4 px-4"}>
				<DrawerHeader className="">
					<DrawerTitle>Choose an area</DrawerTitle>
				</DrawerHeader>
				<form
					className="mt-4 w-full"
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<FieldGroup>
						<form.Field name="location">
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								const selectedLga = lgas.find(
									(lga) =>
										lga.latitude === field.state.value?.lat &&
										lga.longitude === field.state.value?.long
								);
								const handleLgaChange = (lga: LGA | null) => {
									if (lga) {
										field.handleChange({
											lat: lga.latitude,
											long: lga.longitude,
										});
									}
								};
								return (
									<Field data-invalid={isInvalid}>
										<FieldGroup className="space-y-4">
											<FieldLabel
												htmlFor={field.name}
												onClick={() => getLocation(field)}
											>
												<Field
													data-invalid={isInvalid}
													orientation={"horizontal"}
												>
													<Locate className="size-8 shrink-0 self-center text-primary" />
													<FieldContent>
														<FieldTitle>Use Current Location</FieldTitle>
														<FieldDescription>
															{locationError ??
																"Allow location access to find nearby areas."}
														</FieldDescription>
													</FieldContent>
												</Field>
											</FieldLabel>
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>
													Search Manually
												</FieldLabel>
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
															field.setValue({
																lat: 6.416_667,
																long: 2.883_333,
															})
														}
														variant={"outline"}
													>
														Ibeju-Lekki, Lagos
													</Button>
													<Button
														onClick={() =>
															field.setValue({ lat: 6.5, long: 3.35 })
														}
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
													<form.Subscribe selector={(s) => s.isSubmitting}>
														{(isSubmitting) => (
															<Button
																className={"mb-8 w-full"}
																disabled={isSubmitting}
																type="submit"
															>
																{isSubmitting
																	? "Setting location…"
																	: "Use this location"}
															</Button>
														)}
													</form.Subscribe>
												</FieldGroup>
											</Field>
										</FieldGroup>
									</Field>
								);
							}}
						</form.Field>
					</FieldGroup>
				</form>
			</DrawerContent>
		</Drawer>
	);
}
