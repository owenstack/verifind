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
import { toast } from "@verifind/ui/components/toast";
import { HousePlus, RefreshCcw } from "lucide-react";
import type { ReactNode } from "react";
import { useStore } from "zustand";
import { AgentInfo } from "@/components/home/agent-info";
import { LocationFilter } from "@/components/home/location";
import { Notifications } from "@/components/home/notifications";
import { QuickFilter } from "@/components/home/quick-filter";
import {
	PropertyCard,
	PropertyCardSkeleton,
} from "@/components/others/property-card";
import { TitleQuery } from "@/components/others/title-input";
import { generateKeys } from "@/lib/constants";
import {
	describePushFailure,
	enablePushNotifications,
	getPushSubscriptionState,
} from "@/lib/push";
import { type Filters, filterStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

const HAS_PROMPTED_PUSH_KEY = "hasPromptedPush";
const PROPERTY_LIST_LIMIT = 4;
const PROPERTY_LIST_STALE_TIME_MS = 30_000;

// Loader and component must build identical query options so the prefetched
// data lands in the same cache entry the component reads.
function propertiesQueryOptions(filter: Filters) {
	return orpc.tenant.properties.list.queryOptions({
		input: { ...filter, limit: PROPERTY_LIST_LIMIT },
		staleTime: PROPERTY_LIST_STALE_TIME_MS,
	});
}

export const Route = createFileRoute("/_secure/_app/")({
	beforeLoad: () => {
		// Push APIs and localStorage only exist in the browser.
		if (
			typeof window === "undefined" ||
			localStorage.getItem(HAS_PROMPTED_PUSH_KEY)
		) {
			return;
		}

		setTimeout(() => {
			getPushSubscriptionState().then((subscribed) => {
				// Don't nag users who already have push enabled, or who denied
				// notifications — re-prompting them would only show a dead button.
				const permission =
					"Notification" in window ? Notification.permission : "denied";

				if (subscribed || permission === "denied") {
					// They already made a choice; stop checking on future visits.
					localStorage.setItem(HAS_PROMPTED_PUSH_KEY, "true");
					return;
				}

				toast.add({
					id: "enable-push-notifications",
					title: "Enable push notifications",
					description:
						"Enable push notifications to receive updates on account changes and new verified listings.",
					type: "info",
					// The toast never auto-dismisses: it only closes once the user
					// enables, dismisses, or swipes it away. An unread toast must
					// not burn the one-shot prompt (see onClose).
					timeout: 0,
					onClose: () => {
						localStorage.setItem(HAS_PROMPTED_PUSH_KEY, "true");
					},
					actionProps: {
						children: "Enable",
						onClick: () => {
							toast.close("enable-push-notifications");
							toast.promise(enablePushNotifications(), {
								loading: "Enabling push notifications…",
								success: (res) => {
									if (!res.ok) {
										return {
											title: "Couldn't enable push notifications",
											description: `Failed to enable push notifications. ${describePushFailure(res.reason)}`,
											type: "error",
										};
									}
									return {
										title: "Push notifications enabled successfully!",
										type: "success",
									};
								},
								error: "Failed to enable push notifications.",
							});
						},
					},
				});
			});
		}, 5000);
	},
	loader: async ({ context }) => {
		// The filter store rehydrates from localStorage synchronously, so this
		// matches what the component is about to request. Prefill the query
		// cache so the page renders with data instead of flashing skeletons.
		const { filter } = filterStore.getState();
		await context.queryClient.query(propertiesQueryOptions(filter));
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { session } = Route.useRouteContext();
	const filter = useStore(filterStore, (state) => state.filter);
	const { data, refetch, isRefetching } = useQuery(
		propertiesQueryOptions(filter)
	);

	let propertyList: ReactNode;
	if (data === undefined) {
		// Still loading — skeletons stay up until the request resolves.
		propertyList = (
			<div className="grid grid-cols-2 gap-2">
				{generateKeys(4).map((slot) => (
					<PropertyCardSkeleton key={slot} />
				))}
			</div>
		);
	} else if (data.items.length === 0) {
		// Loading finished with an empty result — only now is the empty state real.
		propertyList = (
			<PropertyEmpty isRefetching={isRefetching} refetch={refetch} />
		);
	} else {
		propertyList = (
			<div className="grid grid-cols-2 gap-2">
				{data.items.map((item) => (
					<PropertyCard key={item.id} property={item} />
				))}
			</div>
		);
	}

	return (
		<main className="grid gap-4 px-4 py-6 sm:px-6 lg:px-8">
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
			<TitleQuery />
			<AgentInfo />
			<QuickFilter />
			<section className="grid gap-2">
				<h2 className="my-4 font-medium text-base">Available near you</h2>
				{propertyList}
			</section>
		</main>
	);
}

function PropertyEmpty({
	refetch,
	isRefetching,
}: {
	refetch: () => void;
	isRefetching: boolean;
}) {
	const clearFilter = useStore(filterStore, (state) => state.clearFilter);
	return (
		<Empty>
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<HousePlus />
				</EmptyMedia>
				<EmptyTitle>No properties found</EmptyTitle>
				<EmptyDescription>
					No properties match your current filters. Try adjusting your filters
					to see more results.
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
				<Button onClick={() => clearFilter()} variant="outline">
					Clear Filters
				</Button>
			</EmptyContent>
		</Empty>
	);
}
