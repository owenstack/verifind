import { createStore } from "zustand";

interface OnboardSteps {
	setStep: (step: number) => void;
	step: number;
}

export const stepStore = createStore<OnboardSteps>((set) => ({
	step: 0,
	setStep: (step) => set({ step }),
}));
