// biome-ignore-all lint/performance/noJsxPropsBind: filter chips bind inline setters

import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Badge } from "@verifind/ui/components/badge";
import { Button } from "@verifind/ui/components/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@verifind/ui/components/card";
import { Skeleton } from "@verifind/ui/components/skeleton";
import { toast } from "@verifind/ui/components/toast";
import { Heart, ShieldCheck } from "lucide-react";
import { formatPropertyType } from "@/lib/format";
import { orpc, queryClient } from "@/utils/orpc";

interface PropertyPreview {
	city: string;
	id: string;
	images?: string[] | null;
	price: number;
	pricePeriod?: string;
	propertyType: string;
	state: string;
	title: string;
	verificationStatus: string;
}

export function PropertyCard({ property }: { property: PropertyPreview }) {
	const { data: saved } = useQuery(
		orpc.tenant.properties.saved.ids.queryOptions({
			staleTime: 30_000,
		})
	);
	const add = useMutation(orpc.tenant.properties.saved.add.mutationOptions());
	const remove = useMutation(
		orpc.tenant.properties.saved.remove.mutationOptions()
	);
	const isSaved = saved?.ids.includes(property.id) ?? false;
	const isVerified = property.verificationStatus === "verified";

	const toggle = () => {
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
						orpc.tenant.properties.saved.ids.queryKey(),
						orpc.tenant.properties.saved.list.queryKey(),
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

	return (
		<Card className="relative mx-auto w-full max-w-sm pt-0">
			{isVerified && (
				<Badge className="absolute top-2 left-2 z-20">
					<ShieldCheck /> Verified
				</Badge>
			)}
			<Button
				className="absolute top-2 right-2 z-20"
				onClick={toggle}
				size="icon"
				variant="ghost"
			>
				<Heart fill={isSaved ? "currentColor" : "none"} />
			</Button>
			<Link className="block" params={{ id: property.id }} to="/explore/$id">
				<img
					alt={property.title}
					className="relative z-10 aspect-video w-full object-cover"
					height={675}
					loading="lazy"
					src={property.images?.[0] ?? "/prop-placeholder.png"}
					width={900}
				/>
			</Link>
			<Link className="block" params={{ id: property.id }} to="/explore/$id">
				<CardHeader>
					<CardTitle>{property.title}</CardTitle>
					<CardDescription>
						{formatPropertyType(property.propertyType)} in {property.city},{" "}
						{property.state}
					</CardDescription>
				</CardHeader>
			</Link>
		</Card>
	);
}

export function PropertyCardSkeleton() {
	return (
		<Card className="relative mx-auto w-full max-w-sm pt-0">
			<Skeleton className="absolute top-2 left-2 h-5 w-20 rounded-2xl" />
			<Skeleton className="absolute top-2 right-2 size-8 rounded-2xl" />
			<Skeleton className="aspect-video w-full" />
			<CardHeader>
				<CardTitle>
					<Skeleton className="h-4 w-3/4 rounded-full" />
				</CardTitle>
				<CardDescription>
					<Skeleton className="h-3.5 w-2/3 rounded-full" />
				</CardDescription>
			</CardHeader>
		</Card>
	);
}
