// biome-ignore-all lint/performance/noJsxPropsBind: filter chips bind inline setters

import { useForm } from "@tanstack/react-form";
import { propertyTypeSchema } from "@verifind/shared";
import { Button } from "@verifind/ui/components/button";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@verifind/ui/components/drawer";
import {
	Field,
	FieldContent,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldTitle,
} from "@verifind/ui/components/field";
import { Input } from "@verifind/ui/components/input";
import { InputGroupButton } from "@verifind/ui/components/input-group";
import {
	RadioGroup,
	RadioGroupItem,
} from "@verifind/ui/components/radio-group";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { useStore } from "zustand";
import { formatPropertyType } from "@/lib/format";
import { filterSchema, filterStore } from "@/lib/store";

export function FilterDrawer() {
	const [open, setOpen] = useState(false);
	const clearFilter = useStore(filterStore, (state) => state.clearFilter);
	const setFilter = useStore(filterStore, (state) => state.setFilter);
	const filter = useStore(filterStore, (state) => state.filter);
	const count = Object.values(filter).filter(
		(value) => value !== undefined
	).length;
	const form = useForm({
		defaultValues: filter,
		validators: {
			onSubmit: filterSchema,
		},
		onSubmit: ({ value }) => {
			setFilter(value);
			setOpen(false);
		},
	});

	return (
		<Drawer onOpenChange={setOpen} open={open}>
			<DrawerTrigger
				render={
					<InputGroupButton className="text-primary">
						<SlidersHorizontal />
					</InputGroupButton>
				}
			/>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Filter</DrawerTitle>
					<DrawerDescription>
						Filter your search results by various criteria.
					</DrawerDescription>
				</DrawerHeader>
				<form
					className="w-full p-4"
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<FieldGroup>
						<FieldTitle>{count} active filter(s)</FieldTitle>
						<form.Field name="q">
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Search</FieldLabel>
										<FieldContent>
											<Input
												aria-invalid={isInvalid}
												id={field.name}
												name={field.name}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												value={field.state.value}
											/>
											{isInvalid ? (
												<FieldError errors={field.state.meta.errors} />
											) : null}
										</FieldContent>
									</Field>
								);
							}}
						</form.Field>
						<FieldGroup>
							<form.Field name="bedrooms">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>
												Bedrooms (minimum)
											</FieldLabel>
											<FieldContent>
												<RadioGroup
													className="grid grid-cols-4 gap-2"
													id={field.name}
													name={field.name}
													onValueChange={(value) =>
														field.handleChange(Number(value))
													}
													value={
														field.state.value === undefined
															? undefined
															: String(field.state.value)
													}
												>
													{[1, 2, 3, 4].map((option) => (
														<FieldLabel
															htmlFor={`${field.name}-${option}`}
															key={option}
														>
															<Field orientation="horizontal">
																<FieldContent className="items-center">
																	<FieldTitle>
																		{option === 4 ? "4+" : String(option)}
																	</FieldTitle>
																</FieldContent>
																<RadioGroupItem
																	className="sr-only"
																	id={`${field.name}-${option}`}
																	value={String(option)}
																/>
															</Field>
														</FieldLabel>
													))}
												</RadioGroup>
												{isInvalid ? (
													<FieldError errors={field.state.meta.errors} />
												) : null}
											</FieldContent>
										</Field>
									);
								}}
							</form.Field>
							<form.Field name="bathrooms">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>
												Bathrooms (minimum)
											</FieldLabel>
											<FieldContent>
												<RadioGroup
													className="grid grid-cols-4 gap-2"
													id={field.name}
													name={field.name}
													onValueChange={(value) =>
														field.handleChange(Number(value))
													}
													value={
														field.state.value === undefined
															? undefined
															: String(field.state.value)
													}
												>
													{[1, 2, 3, 4].map((option) => (
														<FieldLabel
															htmlFor={`${field.name}-${option}`}
															key={option}
														>
															<Field orientation="horizontal">
																<FieldContent className="items-center">
																	<FieldTitle>
																		{option === 4 ? "4+" : String(option)}
																	</FieldTitle>
																</FieldContent>
																<RadioGroupItem
																	className="sr-only"
																	id={`${field.name}-${option}`}
																	value={String(option)}
																/>
															</Field>
														</FieldLabel>
													))}
												</RadioGroup>
												{isInvalid ? (
													<FieldError errors={field.state.meta.errors} />
												) : null}
											</FieldContent>
										</Field>
									);
								}}
							</form.Field>
						</FieldGroup>
						<form.Field name="propType">
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Property Type</FieldLabel>
										<FieldContent>
											<RadioGroup
												className="flex flex-row flex-wrap items-center gap-2"
												name={field.name}
												onValueChange={(value) =>
													field.handleChange(propertyTypeSchema.parse(value))
												}
												value={field.state.value}
											>
												{propertyTypeSchema.options.map((type) => (
													<FieldLabel
														className="has-[>[data-slot=field]]:w-fit has-[>[data-slot=field]]:flex-row"
														htmlFor={`${field.name}-${type}`}
														key={type}
													>
														<Field orientation="horizontal">
															<RadioGroupItem
																className="sr-only"
																id={`${field.name}-${type}`}
																value={type}
															/>
															<FieldContent>
																<FieldTitle>
																	{formatPropertyType(type)}
																</FieldTitle>
															</FieldContent>
														</Field>
													</FieldLabel>
												))}
											</RadioGroup>
										</FieldContent>
									</Field>
								);
							}}
						</form.Field>
						<FieldGroup className="grid grid-cols-2 gap-2">
							<Button className="w-full" type="submit">
								Apply
							</Button>
							<Button
								className="w-full"
								onClick={() => {
									clearFilter();
									setOpen(false);
								}}
								variant="outline"
							>
								Clear filters
							</Button>
						</FieldGroup>
					</FieldGroup>
				</form>
			</DrawerContent>
		</Drawer>
	);
}
