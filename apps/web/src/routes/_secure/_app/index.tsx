import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@verifind/ui/components/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@verifind/ui/components/input-group";
import { Bell, Mic, Search, Settings2 } from "lucide-react";
import { AgentInfo } from "@/components/others/agent-info";
import { LocationFilter } from "@/components/others/location";

export const Route = createFileRoute("/_secure/_app/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { session } = Route.useRouteContext();
	return (
		<main className="grid gap-4 px-4 py-2">
			<div className="flex items-center justify-between gap-4">
				<LocationFilter />
				<Button aria-label="Notifications" variant={"ghost"}>
					<Bell />
				</Button>
			</div>
			<div className="flex flex-col items-start gap-2">
				<h1 className="font-semibold text-2xl">
					Hi, {session.data?.user.name.split(" ")[0]}
				</h1>
				<p className="text-lg text-muted-foreground">
					Find a Home That Fits Your Needs
				</p>
			</div>
			<div className="flex items-center gap-2">
				<InputGroup>
					<InputGroupAddon>
						<Search />
					</InputGroupAddon>
					<InputGroupInput
						aria-label="Search homes"
						placeholder="Search homes…"
					/>
					<InputGroupAddon align={"inline-end"}>
						<InputGroupButton
							aria-label="Search filters"
							className={"text-primary"}
						>
							<Settings2 />
						</InputGroupButton>
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
			<AgentInfo />
			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between gap-2">
					<h2>Quick Filters</h2>
					<Button className={"text-secondary"} variant={"ghost"}>
						See All
					</Button>
				</div>
			</div>
		</main>
	);
}
