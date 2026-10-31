import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@verifind/ui/components/drawer";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from "@verifind/ui/components/item";
import { ChevronRight, ShieldCheck } from "lucide-react";

export function AgentInfo() {
	return (
		<Drawer>
			<DrawerTrigger
				nativeButton={false}
				render={
					<Item className="bg-accent/40">
						<ItemMedia>
							<ShieldCheck className="text-primary" />
						</ItemMedia>
						<ItemContent>
							<ItemTitle>Listing Verification</ItemTitle>
							<ItemDescription>
								See how listing details are reviewed
							</ItemDescription>
						</ItemContent>
						<ItemActions>
							<ChevronRight className="text-primary" />
						</ItemActions>
					</Item>
				}
			/>
			<DrawerContent>
				<DrawerHeader className="my-4">
					<DrawerTitle>How Listing Checks Work</DrawerTitle>
					<DrawerDescription>
						What checks can tell you, and what to confirm yourself
					</DrawerDescription>
				</DrawerHeader>
				<div className="space-y-4 px-4 pb-6 text-muted-foreground text-sm leading-6">
					<p>
						Compare rental listings and contact their representatives directly.
						Review each listing to decide whether a home fits your needs.
					</p>
					<p>
						Verifind checks property details for consistency and compares
						contact and ownership information with available verification data.
						These checks can flag duplicate posts, inaccurate prices, or
						listings that may no longer be available.
					</p>
					<p>
						Ask the representative about additional costs before you commit.
						Confirm all charges and terms directly with them.
					</p>
					<p>
						Before a viewing, confirm the representative’s identity and
						authority. Keep agreements in writing and check all details before
						you commit.
					</p>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
