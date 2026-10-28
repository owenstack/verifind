import { createStore } from "zustand";

interface OnboardStepState {
	setStep: (step: number) => void;
	step: number;
}

export const stepStore = createStore<OnboardStepState>((set) => ({
	step: 0,
	setStep: (step) => set({ step }),
}));
