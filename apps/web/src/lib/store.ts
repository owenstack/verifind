import {
	type PropertyFiltersInput,
	propertyListSchema,
} from "@verifind/shared";
import { createStore } from "zustand";
import { persist } from "zustand/middleware";

interface OnboardStepState {
	setStep: (step: number) => void;
	step: number;
}

export const stepStore = createStore<OnboardStepState>((set) => ({
	step: 0,
	setStep: (step) => set({ step }),
}));

// The web store uses the same schema the API validates and the DB query types
// against, so a field can only drift if it is changed in @verifind/shared.
export const filterSchema = propertyListSchema;
export type Filters = PropertyFiltersInput;

interface FilterStore {
	clearFilter: () => void;
	filter: Filters;
	setFilter: (value: Filters) => void;
}

export const filterStore = createStore<FilterStore>()(
	persist(
		(set) => ({
			filter: {},
			setFilter: (filter) =>
				set((state) => ({ filter: { ...state.filter, ...filter } })),
			clearFilter: () => set({ filter: {} }),
		}),
		{
			name: "filters",
			version: 1,
			// Filters saved by the old UI-shaped schema would fail API validation
			// (e.g. propType was an array), so discard them on upgrade.
			migrate: () => ({ filter: {} }),
		}
	)
);
