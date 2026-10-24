import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { Progress } from "@verifind/ui/components/progress";
import { ArrowLeft } from "lucide-react";
import z from "zod";
import { stepStore } from "@/lib/store";

export const Route = createFileRoute("/_secure/onboard")({
	component: RouteComponent,
});

const formSchema = z.object({
	propType: z
		.array(z.string())
		.min(1, { error: "Choose at least one property type." }),
	bedroom: z.enum(["1", "2", "3", "4+"]),
	paymentType: z.enum(["standard", "financing"]),
	budget: z.number(),
	location: z.object({ lat: z.number(), long: z.number() }),
});

function RouteComponent() {
	const { step } = stepStore.getState();
	const form = useForm({
		defaultValues: {
			propType: [] as string[],
			bedroom: "1",
			paymentType: "standard",
			budget: 20_000_000,
			location: { lat: 0, long: 0 },
		} as z.infer<typeof formSchema>,
		validators: {
			onChange: formSchema,
		},
	});

	return (
		<div className="flex flex-col gap-4 p-4">
			<div className="grid gap-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						{step > 0 && <ArrowLeft />}{" "}
						<h2 className="font-semibold text-2xl leading-tight">VeriFind</h2>
					</div>
					<span className="text-muted-foreground">Step {step + 1} of 4</span>
				</div>
				<Progress max={4} value={step + 1} />
			</div>
		</div>
	);
}
