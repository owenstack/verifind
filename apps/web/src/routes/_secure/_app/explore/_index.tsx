// biome-ignore-all lint/performance/noJsxPropsBind: filter chips bind inline setters

import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@verifind/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@verifind/ui/components/empty";
import { ScrollArea } from "@verifind/ui/components/scroll-area";
import { Spinner } from "@verifind/ui/components/spinner";
import { HousePlus, RefreshCcw } from "lucide-react";
import { type ReactNode, useCallback, useEffect } from "react";
import { useIntersectionObserver } from "usehooks-ts";
import { useStore } from "zustand";
import {
	PropertyCard,
	PropertyCardSkeleton,
} from "@/components/others/property-card";
import { TitleQuery } from "@/components/others/title-input";
import { generateKeys } from "@/lib/constants";
import { type Filters, filterStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

const PAGE_SIZE = 12;

function propertiesInfiniteQueryOptions(filter: Filters) {
	return orpc.tenant.properties.list.infiniteOptions({
		input: (offset: number) => ({ ...filter, limit: PAGE_SIZE, offset }),
		getNextPageParam: (lastPage) => {
			const nextOffset = lastPage.offset + lastPage.limit;
			return nextOffset < lastPage.total ? nextOffset : undefined;
		},
		initialPageParam: 0,
		staleTime: 30_000,
	});
}

export const Route = createFileRoute("/_secure/_app/explore/_index")({
	component: RouteComponent,
	loader: async ({ context }) => {
		const { filter } = filterStore.getState();
		await context.queryClient.infiniteQuery(
			propertiesInfiniteQueryOptions(filter)
		);
	},
});

function RouteComponent() {
	const { isIntersecting, ref } = useIntersectionObserver({
		threshold: 0.5,
	});
	const filter = useStore(filterStore, (state) => state.filter);
	const {
		data,
		status,
		hasNextPage,
		isFetchingNextPage,
		isFetchNextPageError,
		isRefetching,
		fetchNextPage,
		refetch,
	} = useInfiniteQuery(propertiesInfiniteQueryOptions(filter));

	const loadMore = useCallback(() => {
		fetchNextPage().catch(() => {
			// The query surfaces failures through isFetchNextPageError.
		});
	}, [fetchNextPage]);

	// A single sentinel sits below the list. Whenever it comes into view and
	// there is more data to load, request the next page. The error guard stops
	// a failed next-page request from retrying in a loop while the sentinel
	// stays visible.
	useEffect(() => {
		if (
			isIntersecting &&
			hasNextPage &&
			!isFetchingNextPage &&
			!isFetchNextPageError
		) {
			loadMore();
		}
	}, [
		isIntersecting,
		hasNextPage,
		isFetchingNextPage,
		isFetchNextPageError,
		loadMore,
	]);

	let propertyList: ReactNode;
	if (status === "pending") {
		propertyList = (
			<div className="grid grid-cols-2 gap-2">
				{generateKeys(8).map((slot) => (
					<PropertyCardSkeleton key={slot} />
				))}
			</div>
		);
	} else if (!data) {
		propertyList = (
			<PropertyEmpty isError isRefetching={isRefetching} refetch={refetch} />
		);
	} else if (data.pages[0]?.items.length === 0) {
		propertyList = (
			<PropertyEmpty isRefetching={isRefetching} refetch={refetch} />
		);
	} else {
		let loadStatus: ReactNode = null;
		if (isFetchNextPageError) {
			loadStatus = (
				<div className="flex flex-col items-center gap-2 py-4 text-center text-sm">
					<p className="text-muted-foreground">
						Couldn't load more properties.
					</p>
					<Button onClick={loadMore} size="sm" variant="outline">
						Try again
					</Button>
				</div>
			);
		} else if (isFetchingNextPage) {
			loadStatus = (
				<div className="flex items-center justify-center gap-2 py-4 text-center text-muted-foreground text-sm">
					<Spinner />
					Loading more properties...
				</div>
			);
		} else if (!hasNextPage) {
			loadStatus = (
				<div className="py-4 text-center text-muted-foreground text-sm">
					You've reached the end
				</div>
			);
		}

		propertyList = (
			<ScrollArea className="h-[calc(100vh-200px)]">
				<div>
					{data.pages.map((page) => (
						<div className="grid grid-cols-2 gap-2" key={page.offset}>
							{page.items.map((item) => (
								<PropertyCard key={item.id} property={item} />
							))}
						</div>
					))}
					<div aria-hidden="true" className="h-4" ref={ref} />
					{loadStatus}
				</div>
			</ScrollArea>
		);
	}

	return (
		<main className="mx-auto grid w-full max-w-3xl gap-4 px-4 pt-2 pb-24">
			<div className="grid gap-2">
				<h1 className="font-semibold text-2xl">Search Homes</h1>
				<p className="text-muted-foreground text-sm">
					Search by area or apartment type across verified listings.
				</p>
			</div>
			<TitleQuery />
			{propertyList}
		</main>
	);
}

function PropertyEmpty({
	refetch,
	isRefetching,
	isError = false,
}: {
	refetch: () => void;
	isRefetching: boolean;
	isError?: boolean;
}) {
	const clearFilter = useStore(filterStore, (state) => state.clearFilter);
	return (
		<Empty>
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<HousePlus />
				</EmptyMedia>
				<EmptyTitle>
					{isError ? "Couldn't load properties" : "No properties found"}
				</EmptyTitle>
				<EmptyDescription>
					{isError
						? "Something went wrong while loading properties. Please try again."
						: "No properties match your current filters. Try adjusting your filters to see more results."}
				</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button onClick={() => refetch()}>
					<RefreshCcw
						className={cn(isRefetching && "animate-spin")}
						data-icon="inline-start"
					/>{" "}
					Refresh
				</Button>
				{!isError && (
					<Button onClick={() => clearFilter()} variant="outline">
						Clear Filters
					</Button>
				)}
			</EmptyContent>
		</Empty>
	);
}
