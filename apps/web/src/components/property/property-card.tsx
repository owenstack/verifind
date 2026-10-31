// biome-ignore-all lint/performance/noJsxPropsBind: card callbacks bind to per-property handlers
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { Property } from "@verifind/db/schema/property";
import { Skeleton } from "@verifind/ui/components/skeleton";
import { toast } from "@verifind/ui/components/toast";
import { Heart, MapPin, ShieldCheck } from "lucide-react";
import { formatPriceLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

export function useSavedToggle() {
	const queryClient = useQueryClient();
	const savedQuery = useQuery(
		orpc.properties.saved.ids.queryOptions({
			input: undefined,
			staleTime: 30_000,
		})
	);

	const add = useMutation(orpc.properties.saved.add.mutationOptions());
	const remove = useMutation(orpc.properties.saved.remove.mutationOptions());

	const toggle = (property: Pick<Property, "id">) => {
		const isSaved = savedQuery.data?.ids.includes(property.id) ?? false;
		const mutation = isSaved ? remove : add;
		mutation.mutate(
			{ propertyId: property.id },
			{
				onError: () => {
					toast.add({
						title: isSaved
							? "Could not remove from saved homes"
							: "Could not save this home",
						type: "error",
					});
				},
				onSuccess: () => {
					for (const key of [
						orpc.properties.saved.ids.queryOptions({ input: undefined })
							.queryKey,
						orpc.properties.saved.list.queryOptions({ input: undefined })
							.queryKey,
					]) {
						queryClient.invalidateQueries({ queryKey: key });
					}
					if (!isSaved) {
						toast.add({
							title: "Saved to your collection",
							type: "success",
						});
					}
				},
			}
		);
	};

	return {
		isSaved: (propertyId: string) =>
			savedQuery.data?.ids.includes(propertyId) ?? false,
		toggle,
	};
}

interface PropertyCardProps {
	className?: string;
	property: Property;
}

/**
 * Listing card used on the landing feed, search results and saved
 * homes — cover photo with the VeriFind trust badge, a save heart and
 * price/title/location summary underneath.
 */
export function PropertyCard({ className, property }: PropertyCardProps) {
	const savedToggle = useSavedToggle();
	const isSaved = savedToggle.isSaved(property.id);
	const cover = property.images?.[0];
	const verified = property.verificationStatus === "verified";
	const linkLabel = `${property.title}, ${property.city}`;

	return (
		<article
			className={cn(
				"group grid min-w-0 gap-2 overflow-hidden rounded-2xl bg-card text-card-foreground shadow-xs",
				className
			)}
		>
			<div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
				<Link
					aria-label={linkLabel}
					className="block size-full"
					params={{ propertyId: property.id }}
					to="/house/$propertyId"
				>
					{cover ? (
						<img
							alt=""
							className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
							height={675}
							loading="lazy"
							src={cover}
							width={900}
						/>
					) : (
						<div className="grid size-full place-items-center bg-muted text-muted-foreground text-sm">
							No photo
						</div>
					)}
				</Link>
				{verified ? (
					<span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-background/95 px-2 py-1 font-semibold text-[11px] text-primary shadow-sm">
						<ShieldCheck aria-hidden="true" className="size-3" />
						VeriFind
					</span>
				) : null}
				<button
					aria-label={isSaved ? "Remove from saved" : "Save home"}
					aria-pressed={isSaved}
					className={cn(
						"absolute top-2 right-2 grid size-8 place-items-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background",
						isSaved && "text-red-500"
					)}
					onClick={() => savedToggle.toggle(property)}
					type="button"
				>
					<Heart
						aria-hidden="true"
						className="size-4"
						fill={isSaved ? "currentColor" : "none"}
					/>
				</button>
			</div>
			<div className="grid gap-0.5 px-2 pb-2">
				<p className="font-semibold text-[15px] tracking-tight">
					{formatPriceLabel(property.price, property.pricePeriod)}
				</p>
				<Link
					className="truncate font-medium text-sm hover:text-primary"
					params={{ propertyId: property.id }}
					to="/house/$propertyId"
				>
					{property.title}
				</Link>
				<p className="flex items-center gap-1 text-muted-foreground text-xs">
					<MapPin aria-hidden="true" className="size-3 shrink-0" />
					<span className="truncate">
						{property.city}, {property.state}
					</span>
				</p>
			</div>
		</article>
	);
}

export function PropertyCardSkeleton() {
	return (
		<div className="grid gap-2">
			<Skeleton className="aspect-[4/3] rounded-2xl" />
			<Skeleton className="h-4 w-3/4 rounded-full" />
			<Skeleton className="h-3 w-1/2 rounded-full" />
		</div>
	);
}

export function PropertyGrid({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-4",
				className
			)}
		>
			{children}
		</div>
	);
}

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f", "g", "h"];

export type ListingResultsState =
	| { message: string; status: "empty" | "error" }
	| { status: "loading" }
	| { items: Property[]; status: "ready" };

/** Map a list query result into a render-ready state (early returns keep this flat). */
export function toListingResultsState(
	query: { data?: { items: Property[] }; isError: boolean; isPending: boolean },
	messages: { empty: string; error: string }
): ListingResultsState {
	if (query.isPending) {
		return { status: "loading" };
	}
	if (query.isError || !query.data) {
		return { message: messages.error, status: "error" };
	}
	if (query.data.items.length === 0) {
		return { message: messages.empty, status: "empty" };
	}
	return { items: query.data.items, status: "ready" };
}

interface ListingResultsProps {
	className?: string;
	emptyClassName?: string;
	state: ListingResultsState;
}

/** Skeleton / error / empty / grid renderer shared by listing pages. */
export function ListingResults({
	className,
	emptyClassName,
	state,
}: ListingResultsProps) {
	if (state.status === "loading") {
		return (
			<PropertyGrid className={className}>
				{SKELETON_KEYS.map((key) => (
					<PropertyCardSkeleton key={key} />
				))}
			</PropertyGrid>
		);
	}
	if (state.status === "error") {
		return <p className="text-muted-foreground text-sm">{state.message}</p>;
	}
	if (state.status === "empty") {
		return (
			<p
				className={cn(
					"rounded-2xl border border-dashed p-6 text-center text-muted-foreground text-sm",
					emptyClassName
				)}
			>
				{state.message}
			</p>
		);
	}
	return (
		<PropertyGrid className={className}>
			{state.status === "ready" &&
				state.items.map((item) => (
					<PropertyCard key={item.id} property={item} />
				))}
		</PropertyGrid>
	);
}
