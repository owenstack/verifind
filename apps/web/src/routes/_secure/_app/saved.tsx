// biome-ignore-all lint/performance/noJsxPropsBind: tab buttons bind inline setters
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { AppRouterClient } from "@verifind/api/routers/index";
import { Button } from "@verifind/ui/components/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@verifind/ui/components/empty";
import { ArrowRight, Heart, House } from "lucide-react";
import { useState } from "react";

import {
	ListingResults,
	PropertyCard,
	PropertyGrid,
	toListingResultsState,
} from "@/components/others/property-card";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_secure/_app/saved")({
	component: RouteComponent,
});

type SavedTab = "saved" | "shared";

function RouteComponent() {
	const [tab, setTab] = useState<SavedTab>("saved");

	const savedQuery = useQuery(
		orpc.properties.saved.list.queryOptions({ input: undefined })
	);

	const items = (savedQuery.data?.items ?? []).filter((row) =>
		tab === "shared" ? row.property.propertyType === "shared_apartment" : true
	);

	const resultsBody = computeSavedBody(savedQuery, items, tab === "shared");

	return (
		<main className="mx-auto grid w-full max-w-3xl gap-4 px-4 pt-2 pb-24">
			<div className="flex items-center gap-2">
				<Button
					aria-label="Go back"
					onClick={() => window.history.back()}
					size="icon"
					variant="ghost"
				>
					<ArrowRight className="rotate-180" />
				</Button>
			</div>
			<div aria-label="Saved collections" className="flex gap-2" role="tablist">
				<Button
					aria-selected={tab === "saved"}
					className={cn(
						"rounded-full",
						tab === "saved"
							? "bg-primary text-primary-foreground"
							: "bg-muted text-foreground"
					)}
					onClick={() => setTab("saved")}
					role="tab"
					size="sm"
					variant="ghost"
				>
					Saved Homes ({savedQuery.data?.items.length ?? 0})
				</Button>
				<Button
					aria-selected={tab === "shared"}
					className={cn(
						"rounded-full",
						tab === "shared"
							? "bg-primary text-primary-foreground"
							: "bg-muted text-foreground"
					)}
					onClick={() => setTab("shared")}
					role="tab"
					size="sm"
					variant="ghost"
				>
					Shared apartments
				</Button>
			</div>

			{resultsBody}
		</main>
	);
}

type SavedListResult = Awaited<
	ReturnType<AppRouterClient["properties"]["saved"]["list"]>
>;
type SavedItem = SavedListResult["items"][number];
interface SavedListQuery {
	data?: SavedListResult;
	isError: boolean;
	isPending: boolean;
}

function computeSavedBody(
	query: SavedListQuery,
	items: SavedItem[],
	sharedOnly: boolean
): React.ReactNode {
	if (query.isPending || query.isError || !query.data) {
		return (
			<ListingResults
				className="sm:grid-cols-2"
				state={toListingResultsState(
					{
						isError: query.isError,
						isPending: query.isPending,
						data: query.data
							? { items: items.map((row) => row.property) }
							: undefined,
					},
					{
						empty: "",
						error: "Could not load your saved homes. Please try again.",
					}
				)}
			/>
		);
	}
	if (items.length === 0) {
		return (
			<Empty className="rounded-2xl border">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Heart aria-hidden="true" />
					</EmptyMedia>
					<EmptyTitle>
						{sharedOnly ? "No shared apartments saved" : "No saved homes yet"}
					</EmptyTitle>
					<EmptyDescription>
						Tap the heart on any listing to keep it here for easy access later.
					</EmptyDescription>
				</EmptyHeader>
				<Button render={<Link to="/search" />}>
					<House aria-hidden="true" />
					Explore listings
				</Button>
			</Empty>
		);
	}
	return (
		<PropertyGrid className="sm:grid-cols-2">
			{items.map(({ property }) => (
				<PropertyCard key={property.id} property={property} />
			))}
		</PropertyGrid>
	);
}
