// biome-ignore-all lint/performance/noJsxPropsBind: filter chips bind inline setters

import { Button } from "@verifind/ui/components/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@verifind/ui/components/input-group";
import { Mic, Search } from "lucide-react";
import { useDebounceCallback } from "usehooks-ts";
import { useStore } from "zustand";
import { filterStore } from "@/lib/store";
import { FilterDrawer } from "./filter-drawer";

export function TitleQuery() {
	const setFilter = useStore(filterStore, (state) => state.setFilter);
	const handleChange = useDebounceCallback((value: string) => {
		setFilter({ q: value });
	}, 500);

	return (
		<div className="flex items-center gap-2">
			<InputGroup>
				<InputGroupAddon>
					<Search />
				</InputGroupAddon>
				<InputGroupInput
					aria-label="Search homes"
					onChange={(e) => handleChange(e.target.value)}
					placeholder="Search homes…"
				/>
				<InputGroupAddon align={"inline-end"}>
					<FilterDrawer />
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
	);
}
