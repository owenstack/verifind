// biome-ignore-all lint/performance/noJsxPropsBind: chips bind inline setters
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@verifind/ui/components/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@verifind/ui/components/input-group";
import { Mic, Search, Settings2 } from "lucide-react";
import { useState } from "react";

import { AgentInfo } from "@/components/home/agent-info";
import { LocationFilter } from "@/components/home/location";
import { Notifications } from "@/components/home/notifications";
import {
	ListingResults,
	toListingResultsState,
} from "@/components/property/property-card";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_secure/_app/")({
	component: RouteComponent,
});

interface QuickFilter {
	bedrooms?: number;
	label: string;
	maxPrice?: number;
	propertyType?: "apartment" | "duplex";
	verifiedOnly?: boolean;
}

const quickFilters: QuickFilter[] = [
	{ label: "Verified", verifiedOnly: true },
	{ label: "Apartments", propertyType: "apartment" },
	{ label: "Duplexes", propertyType: "duplex" },
	{ label: "2+ Beds", bedrooms: 2 },
	{ label: "Under ₦2M", maxPrice: 2_000_000 },
];

function RouteComponent() {
	const { session } = Route.useRouteContext();
	const [activeQuickFilter, setActiveQuickFilter] = useState<number | null>(
		null
	);
	const active =
		activeQuickFilter === null ? undefined : quickFilters[activeQuickFilter];

	const listQuery = useQuery(
		orpc.properties.list.queryOptions({
			input: {
				bedrooms: active?.bedrooms,
				limit: 8,
				maxPrice: active?.maxPrice,
				propertyType: active?.propertyType,
				verifiedOnly: active?.verifiedOnly ?? false,
			},
		})
	);

	return (
		<main className="grid gap-4 px-4 pt-2 pb-24">
			<div className="flex items-center justify-between gap-4">
				<LocationFilter />
				<Notifications />
			</div>
			<div className="flex flex-col items-start gap-2">
				<h1 className="font-semibold text-2xl">
					Hi, {session.data?.user.name.split(" ")[0]}
				</h1>
				<p className="text-lg text-muted-foreground">
					Find a Home That Fits Your Needs
				</p>
			</div>
			<div className="flex items-center gap-2">
				<InputGroup>
					<InputGroupAddon>
						<Search />
					</InputGroupAddon>
					<InputGroupInput
						aria-label="Search homes"
						placeholder="Search homes…"
						readOnly
					/>
					<InputGroupAddon align={"inline-end"}>
						<InputGroupButton
							aria-label="Search filters"
							className={"text-primary"}
							render={<Link to="/search" />}
						>
							<Settings2 />
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
			</div>
			<AgentInfo />
			<div className="flex flex-col gap-3">
				<div className="flex items-center justify-between gap-2">
					<h2 className="font-medium text-lg">Quick Filters</h2>
					<Button
						className={"text-secondary"}
						render={<Link to="/search" />}
						variant={"ghost"}
					>
						See All
					</Button>
				</div>
				<div className="flex gap-2 overflow-x-auto pb-1">
					{quickFilters.map((filter, index) => (
						<Button
							aria-pressed={activeQuickFilter === index}
							className={cn(
								"shrink-0 rounded-full",
								activeQuickFilter === index
									? "bg-primary text-primary-foreground"
									: "bg-muted text-foreground"
							)}
							key={filter.label}
							onClick={() =>
								setActiveQuickFilter(activeQuickFilter === index ? null : index)
							}
							size="sm"
							variant="ghost"
						>
							{filter.label}
						</Button>
					))}
				</div>
			</div>
			<section aria-label="Featured homes" className="grid gap-3">
				<h2 className="font-medium text-lg">Verified Homes For You</h2>
				<ListingResults
					state={toListingResultsState(listQuery, {
						empty:
							"No homes match this filter yet. Check back soon — new verified listings are added regularly.",
						error: "Could not load listings. Please try again.",
					})}
				/>
			</section>
		</main>
	);
}
