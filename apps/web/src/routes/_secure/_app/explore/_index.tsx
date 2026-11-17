// biome-ignore-all lint/performance/noJsxPropsBind: filter chips bind inline setters

import { createFileRoute } from "@tanstack/react-router";
import { TitleQuery } from "@/components/others/title-input";

export const Route = createFileRoute("/_secure/_app/explore/_index")({
	component: RouteComponent,
});

function RouteComponent() {
	// const [query, setQuery] = useState("");
	// const [filters, setFilters] = useState<SearchFilters>({
	// 	verifiedOnly: false,
	// });
	// const [filtersOpen, setFiltersOpen] = useState(false);

	// const listQuery = useQuery(
	// 	orpc.tenant.properties.list.queryOptions({
	// 		input: {
	// 			bedrooms: filters.bedrooms,
	// 			limit: 24,
	// 			maxPrice: filters.maxPrice,
	// 			minPrice: filters.minPrice,
	// 			propertyType: filters.propertyType as ListPropertyType | undefined,
	// 			q: query.trim() || undefined,
	// 			verifiedOnly: filters.verifiedOnly,
	// 		},
	// 	})
	// );

	// const activeFilterCount = [
	// 	filters.bedrooms !== undefined,
	// 	filters.maxPrice !== undefined,
	// 	filters.minPrice !== undefined,
	// 	filters.propertyType !== undefined,
	// 	filters.verifiedOnly,
	// ].filter(Boolean).length;

	// const resultsBody = computeResultsBody(listQuery);

	return (
		<main className="mx-auto grid w-full max-w-3xl gap-4 px-4 pt-2 pb-24">
			<div className="grid gap-2">
				<h1 className="font-semibold text-2xl">Search Homes</h1>
				<p className="text-muted-foreground text-sm">
					Search by area or apartment type across verified listings.
				</p>
			</div>
			<TitleQuery />
			{/* <div className="flex items-center gap-2">
				<InputGroup>
					<InputGroupAddon>
						<Search />
					</InputGroupAddon>
					<InputGroupInput
						aria-label="Search by area or apartment type"
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Search by area or apartment type"
						value={query}
					/>
					<InputGroupAddon align={"inline-end"}>
						<InputGroupButton
							aria-label="Search filters"
							className={"relative text-primary"}
							onClick={() => setFiltersOpen((open) => !open)}
						>
							<SlidersHorizontal />
							{activeFilterCount > 0 ? (
								<span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">
									{activeFilterCount}
								</span>
							) : null}
						</InputGroupButton>
					</InputGroupAddon>
				</InputGroup>
				<Button
					aria-label="Search by voice"
					className={"text-primary"}
					variant={"ghost"}
				>
					<Mic />
				</Button>
			</div> */}

			{/* {filtersOpen ? (
				<section
					aria-label="Search filters"
					className="grid gap-4 rounded-2xl border bg-card p-4 shadow-xs"
				>
					<div className="grid gap-2">
						<h3 className="font-medium text-sm">Property type</h3>
						<div className="flex flex-wrap gap-2">
							<Button
								aria-pressed={filters.propertyType === undefined}
								className={cn(
									"rounded-full",
									filters.propertyType === undefined
										? "bg-primary text-primary-foreground"
										: "bg-muted text-foreground"
								)}
								onClick={() =>
									setFilters((current) => ({
										...current,
										propertyType: undefined,
									}))
								}
								size="sm"
								variant="ghost"
							>
								Any
							</Button>
							{propertyTypes.map((type) => (
								<Button
									aria-pressed={filters.propertyType === type.value}
									className={cn(
										"rounded-full",
										filters.propertyType === type.value
											? "bg-primary text-primary-foreground"
											: "bg-muted text-foreground"
									)}
									key={type.value}
									onClick={() =>
										setFilters((current) => ({
											...current,
											propertyType: type.value,
										}))
									}
									size="sm"
									variant="ghost"
								>
									{type.label}
								</Button>
							))}
						</div>
					</div>
					<div className="grid gap-2">
						<h3 className="font-medium text-sm">Bedrooms</h3>
						<div className="flex flex-wrap gap-2">
							{[1, 2, 3, 4].map((count) => (
								<Button
									aria-pressed={filters.bedrooms === count}
									className={cn(
										"rounded-full",
										filters.bedrooms === count
											? "bg-primary text-primary-foreground"
											: "bg-muted text-foreground"
									)}
									key={count}
									onClick={() =>
										setFilters((current) => ({
											...current,
											bedrooms: current.bedrooms === count ? undefined : count,
										}))
									}
									size="sm"
									variant="ghost"
								>
									{count}
									{count === 4 ? "+" : ""} Beds
								</Button>
							))}
						</div>
					</div>
					<div className="grid gap-2">
						<h3 className="font-medium text-sm">Max budget</h3>
						<div className="flex flex-wrap gap-2">
							{[500_000, 1_000_000, 2_000_000, 5_000_000].map((budget) => (
								<Button
									aria-pressed={filters.maxPrice === budget}
									className={cn(
										"rounded-full",
										filters.maxPrice === budget
											? "bg-primary text-primary-foreground"
											: "bg-muted text-foreground"
									)}
									key={budget}
									onClick={() =>
										setFilters((current) => ({
											...current,
											maxPrice:
												current.maxPrice === budget ? undefined : budget,
										}))
									}
									size="sm"
									variant="ghost"
								>
									Under {formatNaira(budget)}
								</Button>
							))}
						</div>
					</div>
					<label className="flex items-center gap-2 font-medium text-sm">
						<input
							checked={filters.verifiedOnly}
							className="size-4 accent-primary"
							onChange={(event) =>
								setFilters((current) => ({
									...current,
									verifiedOnly: event.target.checked,
								}))
							}
							type="checkbox"
						/>
						Verified listings only
					</label>
					<Button
						className="justify-self-start"
						onClick={() => {
							setFilters({ verifiedOnly: false });
							setQuery("");
						}}
						variant="outline"
					>
						Clear all filters
					</Button>
				</section>
			) : null}

			{resultsBody} */}
		</main>
	);
}

// function computeResultsBody(query: ListQueryLike): React.ReactNode {
// 	if (query.isPending || query.isError || !query.data) {
// 		return (
// 			<ListingResults
// 				className="sm:grid-cols-2"
// 				state={toListingResultsState(query, {
// 					empty: "",
// 					error: "Could not load listings. Please try again.",
// 				})}
// 			/>
// 		);
// 	}
// 	if (query.data.items.length === 0) {
// 		return (
// 			<Empty className="rounded-2xl border">
// 				<EmptyHeader>
// 					<EmptyMedia variant="icon">
// 						<SearchX aria-hidden="true" />
// 					</EmptyMedia>
// 					<EmptyTitle>No homes found</EmptyTitle>
// 					<EmptyDescription>
// 						Try a different area, type or budget — or clear your filters to see
// 						everything.
// 					</EmptyDescription>
// 				</EmptyHeader>
// 			</Empty>
// 		);
// 	}
// 	return (
// 		<>
// 			<p aria-live="polite" className="text-muted-foreground text-xs">
// 				{query.data.total} {query.data.total === 1 ? "home" : "homes"} found
// 			</p>
// 			<PropertyGrid className="sm:grid-cols-2">
// 				{query.data.items.map((item) => (
// 					<PropertyCard key={item.id} property={item} />
// 				))}
// 			</PropertyGrid>
// 		</>
// 	);
// }
