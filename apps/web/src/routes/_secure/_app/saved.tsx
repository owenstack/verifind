// biome-ignore-all lint/performance/noJsxPropsBind: filter chips bind inline setters

import { useQuery } from "@tanstack/react-query";
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
import { cn } from "@verifind/ui/lib/utils";
import { HeartCrack, House, RefreshCcw } from "lucide-react";
import type { ReactNode } from "react";
import {
	PropertyCard,
	PropertyCardSkeleton,
} from "@/components/others/property-card";
import { TitleQuery } from "@/components/others/title-input";
import { generateKeys } from "@/lib/constants";
import { Link } from "@/platform/transition-link";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_secure/_app/saved")({
	component: RouteComponent,
	loader: async ({ context }) => {
		await context.queryClient.query(
			orpc.tenant.properties.saved.list.queryOptions()
		);
	},
});

function RouteComponent() {
	const { data, refetch, isRefetching } = useQuery(
		orpc.tenant.properties.saved.list.queryOptions()
	);
	let propertyList: ReactNode;
	if (data === undefined) {
		propertyList = (
			<div className="grid grid-cols-2 gap-2">
				{generateKeys(8).map((slot) => (
					<PropertyCardSkeleton key={slot} />
				))}
			</div>
		);
	} else if (data.items.length > 0) {
		propertyList = (
			<div className="grid grid-cols-2 gap-2">
				{data.items.map((item) => (
					<PropertyCard key={item.property.id} property={item.property} />
				))}
			</div>
		);
	} else {
		propertyList = <SavedEmpty isRefetching={isRefetching} refetch={refetch} />;
	}

	return (
		<main className="grid gap-4 px-4 py-6 sm:px-6 lg:px-8">
			<TitleQuery />
			<h2 className="flex items-center gap-2 font-semibold text-2xl tracking-tight">
				Saved homes
				<span className="font-normal text-muted-foreground">
					({data?.items.length ?? 0})
				</span>
			</h2>
			{propertyList}
		</main>
	);
}

function SavedEmpty({
	refetch,
	isRefetching,
}: {
	refetch: () => void;
	isRefetching: boolean;
}) {
	return (
		<Empty>
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<HeartCrack />
				</EmptyMedia>
				<EmptyTitle>No saved homes yet</EmptyTitle>
				<EmptyDescription>
					Tap the heart on any listing to keep it here for easy access later.
				</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button render={<Link to="/explore" />}>
					<House />
					Explore listings
				</Button>
				<Button onClick={() => refetch()} variant="outline">
					<RefreshCcw
						className={cn(isRefetching && "animate-spin")}
						data-icon="inline-start"
					/>{" "}
					Refresh
				</Button>
			</EmptyContent>
		</Empty>
	);
}
