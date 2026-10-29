import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@verifind/ui/components/button";
import { Progress } from "@verifind/ui/components/progress";
import { ArrowLeft } from "lucide-react";
import { useCallback } from "react";
import z from "zod";
import { useStore } from "zustand";
import { FinalStep } from "@/components/onboard/final-step";
import { FirstStep } from "@/components/onboard/first-step";
import { SecondStep } from "@/components/onboard/second-step";
import { ThirdStep } from "@/components/onboard/third-step";
import { filterStore, stepStore } from "@/lib/store";

export const Route = createFileRoute("/_secure/onboard")({
	component: RouteComponent,
});

const formSchema = z.object({
	propType: z
		.array(z.string())
		.min(1, { error: "Choose at least one property type." }),
	bedroom: z.enum(["1", "2", "3", "4+"]),
	paymentType: z.enum(["standard", "financing"], {
		error: "Choose a payment option to continue.",
	}),
	budget: z.number(),
	location: z.object(
		{ lat: z.number(), long: z.number() },
		{ error: "Choose an area to continue." }
	),
});

function RouteComponent() {
	const { setFilter } = filterStore.getState();
	const step = useStore(stepStore, (state) => state.step);
	const setStep = useStore(stepStore, (state) => state.setStep);
	const form = useForm({
		defaultValues: {
			propType: [] as string[],
			bedroom: "1",
			paymentType: "standard",
			budget: 100_000_000,
			location: { lat: 6.6, long: 3.5 },
		} as z.infer<typeof formSchema>,
		validators: {
			onChange: formSchema,
		},
		onSubmit: ({ value }) => {
			setFilter(value);
			setStep(3);
		},
	});
	const goToPrevious = useCallback(() => {
		setStep(step - 1);
	}, [setStep, step]);

	return (
		<div className="flex flex-col gap-4 p-4">
			{step < 3 && (
				<div className="grid gap-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							{step > 0 && (
								<Button
									onClick={goToPrevious}
									size={"icon-lg"}
									variant={"ghost"}
								>
									<ArrowLeft />
								</Button>
							)}
							<h2 className="font-semibold text-2xl leading-tight">VeriFind</h2>
						</div>
						<span className="text-muted-foreground">Step {step + 1} of 3</span>
					</div>
					<Progress max={3} value={step + 1} />
				</div>
			)}
			<div className="w-full">
				{step === 0 && <FirstStep form={form} />}
				{step === 1 && <SecondStep form={form} />}
				{step === 2 && <ThirdStep form={form} />}
				{step === 3 && <FinalStep />}
			</div>
		</div>
	);
}
