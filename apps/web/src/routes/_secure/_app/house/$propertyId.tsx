// biome-ignore-all lint/performance/noJsxPropsBind: handlers bind to local state setters for the gallery

import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { Property } from "@verifind/db/schema/property";
import { Button } from "@verifind/ui/components/button";
import { Skeleton } from "@verifind/ui/components/skeleton";
import { toast } from "@verifind/ui/components/toast";
import {
	ArrowLeft,
	ArrowRight,
	Bath,
	BedDouble,
	Building2,
	Heart,
	MapPin,
	Maximize,
	ShieldCheck,
} from "lucide-react";
import { useState } from "react";

import { useSavedToggle } from "@/components/property/property-card";
import {
	formatAmenity,
	formatCount,
	formatPriceLabel,
	formatPropertyType,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_secure/_app/house/$propertyId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { propertyId } = Route.useParams();
	const propertyQuery = useQuery(
		orpc.properties.get.queryOptions({ input: { id: propertyId } })
	);

	// orpc types this query as always-defined, but it is pending at runtime.
	// biome-ignore lint/suspicious/noUnnecessaryConditions: runtime loading state
	if (propertyQuery.isPending) {
		return <HouseViewSkeleton />;
	}
	if (propertyQuery.isError) {
		return <UnavailableView />;
	}
	const { data: property } = propertyQuery;
	if (!property) {
		return <UnavailableView />;
	}
	return <HouseView property={property} />;
}

function HouseViewSkeleton() {
	return (
		<main className="mx-auto grid w-full max-w-3xl gap-4 px-4 pt-2 pb-24">
			<Skeleton className="aspect-[4/3] rounded-2xl" />
			<Skeleton className="h-6 w-1/2 rounded-full" />
			<Skeleton className="h-4 w-1/3 rounded-full" />
			<Skeleton className="h-24 rounded-2xl" />
		</main>
	);
}

function UnavailableView() {
	return (
		<main className="mx-auto grid w-full max-w-3xl gap-4 px-4 pt-2 pb-24">
			<Button
				className="justify-self-start"
				onClick={() => window.history.back()}
				variant="ghost"
			>
				<ArrowLeft aria-hidden="true" />
				Go back
			</Button>
			<p className="text-muted-foreground">
				This listing is unavailable. It may have been removed.
			</p>
		</main>
	);
}

function HouseView({ property }: { property: Property }) {
	const savedToggle = useSavedToggle();
	const isSaved = savedToggle.isSaved(property.id);
	const verified = property.verificationStatus === "verified";

	return (
		<main className="mx-auto grid w-full max-w-3xl gap-4 px-0 pt-0 pb-24">
			<HouseGallery
				onToggleSave={() => savedToggle.toggle(property)}
				property={property}
				saved={isSaved}
			/>
			<div className="grid gap-4 px-4">
				<header className="grid gap-1">
					{verified ? (
						<span className="inline-flex w-fit items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary text-xs">
							<ShieldCheck aria-hidden="true" className="size-3.5" />
							Verified
						</span>
					) : null}
					<h1 className="font-bold text-2xl tracking-tight">
						{formatPriceLabel(property.price, property.pricePeriod)}
					</h1>
					<p className="font-medium text-foreground/90">{property.title}</p>
					<p className="flex items-center gap-1 text-muted-foreground text-sm">
						<MapPin aria-hidden="true" className="size-4 shrink-0" />
						{[property.address, property.city, property.state]
							.filter(Boolean)
							.join(", ")}
					</p>
				</header>

				<KeyDetails property={property} />

				{(property.amenities ?? []).length > 0 ? (
					<section aria-label="Amenities" className="grid gap-2">
						<h2 className="font-medium text-lg">Amenities</h2>
						<ul className="flex flex-wrap gap-2">
							{(property.amenities ?? []).map((amenity) => (
								<li
									className="rounded-full bg-muted px-3 py-1.5 text-foreground/90 text-xs"
									key={amenity}
								>
									{formatAmenity(amenity)}
								</li>
							))}
						</ul>
					</section>
				) : null}

				{property.description ? (
					<HouseDescription text={property.description} />
				) : null}

				<Button
					className="mt-2 w-full rounded-full"
					onClick={() =>
						toast.add({
							title:
								"Tour booking is coming soon — you'll be able to pick a date and time here.",
							type: "info",
						})
					}
					size="lg"
				>
					Book a tour
					<ArrowRight aria-hidden="true" />
				</Button>
			</div>
		</main>
	);
}

function HouseGallery({
	property,
	onToggleSave,
	saved,
}: {
	onToggleSave: () => void;
	property: Property;
	saved: boolean;
}) {
	const images = property.images ?? [];
	const [activeImage, setActiveImage] = useState(0);
	const active = Math.min(activeImage, Math.max(images.length - 1, 0));

	return (
		<div className="relative aspect-[4/3] overflow-hidden bg-muted sm:rounded-b-3xl">
			{images.length > 0 ? (
				<img
					alt={`${property.title} (view ${active + 1})`}
					className="size-full object-cover"
					height={675}
					src={images[active]}
					width={900}
				/>
			) : (
				<div className="grid size-full place-items-center text-muted-foreground text-sm">
					No photos
				</div>
			)}
			<Button
				aria-label="Go back"
				className="absolute top-3 left-3 rounded-full bg-background/80 backdrop-blur"
				onClick={() => window.history.back()}
				size="icon"
				variant="ghost"
			>
				<ArrowLeft aria-hidden="true" />
			</Button>
			<button
				aria-label={saved ? "Remove from saved" : "Save home"}
				aria-pressed={saved}
				className={cn(
					"absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background",
					saved && "text-red-500"
				)}
				onClick={onToggleSave}
				type="button"
			>
				<Heart
					aria-hidden="true"
					className="size-5"
					fill={saved ? "currentColor" : "none"}
				/>
			</button>
			{images.length > 1 ? (
				<div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
					{images.map((src, index) => (
						<button
							aria-label={`Show view ${index + 1}`}
							className={cn(
								"h-1.5 rounded-full transition-all",
								index === active
									? "w-4 bg-background"
									: "w-1.5 bg-background/60"
							)}
							key={src}
							onClick={() => setActiveImage(index)}
							type="button"
						/>
					))}
				</div>
			) : null}
		</div>
	);
}

function KeyDetails({ property }: { property: Property }) {
	return (
		<section aria-label="Key details">
			<div className="grid grid-cols-3 gap-2">
				<div className="grid place-items-center gap-1 rounded-2xl bg-muted p-3 text-center">
					<BedDouble aria-hidden="true" className="size-5 text-primary" />
					<span className="font-medium text-sm">
						{formatCount(property.bedrooms, "Bedroom")}
					</span>
				</div>
				<div className="grid place-items-center gap-1 rounded-2xl bg-muted p-3 text-center">
					<Bath aria-hidden="true" className="size-5 text-primary" />
					<span className="font-medium text-sm">
						{formatCount(property.bathrooms, "Bathroom")}
					</span>
				</div>
				<div className="grid place-items-center gap-1 rounded-2xl bg-muted p-3 text-center">
					<Maximize aria-hidden="true" className="size-5 text-primary" />
					<span className="font-medium text-sm">
						{property.areaSqm ? `${property.areaSqm}㎡` : "—"}
					</span>
				</div>
			</div>
			<p className="mt-2 flex items-center gap-1.5 text-muted-foreground text-sm">
				<Building2 aria-hidden="true" className="size-4" />
				{formatPropertyType(property.propertyType)} ·{" "}
				{availabilityLabel(property.status)}
			</p>
		</section>
	);
}

function availabilityLabel(status: string): string {
	if (status === "rented") {
		return "Already rented";
	}
	if (status === "unavailable") {
		return "Currently unavailable";
	}
	return "Available now";
}

function HouseDescription({ text }: { text: string }) {
	const [expanded, setExpanded] = useState(false);
	const descriptionLong = text.length > 320;
	const shown = expanded ? text : text.slice(0, 320);

	return (
		<section aria-label="Description" className="grid gap-2">
			<h2 className="font-medium text-lg">Description</h2>
			<p className="text-foreground/80 text-sm leading-relaxed">
				{shown}
				{descriptionLong && !expanded ? "…" : ""}
			</p>
			{descriptionLong ? (
				<Button
					className="w-fit text-primary"
					onClick={() => setExpanded((value) => !value)}
					size="sm"
					variant="ghost"
				>
					{expanded ? "Show less" : "Read more"}
				</Button>
			) : null}
		</section>
	);
}
