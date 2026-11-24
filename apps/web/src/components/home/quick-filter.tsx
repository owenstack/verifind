import type { PropertyType } from "@verifind/shared";
import { Button } from "@verifind/ui/components/button";
import { type MouseEvent, useCallback, useRef, useState } from "react";
import { useStore } from "zustand";
import { filterStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Link } from "@/platform/transition-link";

interface QuickFilter {
	bedrooms?: number;
	label: string;
	maxPrice?: number;
	propType?: PropertyType;
	verified?: boolean;
}

const quickFilters: QuickFilter[] = [
	{ label: "Verified", verified: true },
	{ label: "Apartments", propType: "apartment" },
	{ label: "Duplexes", propType: "duplex" },
	{ label: "2+ Beds", bedrooms: 2 },
	{ label: "Under ₦2M", maxPrice: 2_000_000 },
];

export function QuickFilter() {
	const [active, setActive] = useState<number | null>(null);
	const activeRef = useRef<number | null>(null);
	const setFilter = useStore(filterStore, (state) => state.setFilter);
	const handleFilterClick = useCallback(
		(event: MouseEvent<HTMLButtonElement>) => {
			const index = Number(event.currentTarget.dataset.index);
			const nextActive = activeRef.current === index ? null : index;
			const { label: _label, ...filter } = quickFilters[index];

			activeRef.current = nextActive;
			setActive(nextActive);
			setFilter(nextActive === null ? {} : filter);
		},
		[setFilter]
	);

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between gap-2">
				<h2 className="font-medium text-base">Quick Filters</h2>
				<Button
					className={"text-secondary"}
					render={<Link to="/explore" />}
					variant={"ghost"}
				>
					See All
				</Button>
			</div>
			<div className="scrollbar-none @container flex w-full snap-x snap-proximity items-center gap-2 overflow-x-auto overscroll-x-contain px-4 [&::-webkit-scrollbar]:hidden">
				{quickFilters.map((filter, index) => (
					<Button
						className={cn("snap-start", active === index && "border-primary")}
						data-index={index}
						key={filter.label}
						onClick={handleFilterClick}
						size="sm"
						variant="outline"
					>
						{filter.label}
					</Button>
				))}
			</div>
		</div>
	);
}
