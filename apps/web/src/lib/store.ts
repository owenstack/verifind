import z from "zod";
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

export const filterSchema = z.object({
	propType: z.array(z.string()).optional(),
	bedroom: z.enum(["1", "2", "3", "4+"]).optional(),
	paymentType: z.enum(["standard", "financing"]).optional(),
	budget: z.number().optional(),
	location: z.object({ lat: z.number(), long: z.number() }).optional(),
});

type Filters = z.infer<typeof filterSchema>;

interface FilterStore {
	clearFilter: () => void;
	filter: Filters;
	setFilter: (value: Filters) => void;
}

export const filterStore = createStore<FilterStore>()(
	persist(
		(set) => ({
			filter: {},
			setFilter: (filter) => set({ filter }),
			clearFilter: () => set({ filter: {} }),
		}),
		{ name: "filters" }
	)
);
