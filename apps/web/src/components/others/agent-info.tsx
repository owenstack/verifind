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
							<ItemTitle>Property Details Checked</ItemTitle>
							<ItemDescription>
								Review listings and contact representatives directly
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
					<DrawerTitle>How We Check Listings</DrawerTitle>
					<DrawerDescription>
						Review listings and contact representatives directly
					</DrawerDescription>
				</DrawerHeader>
				<div className="space-y-4 px-4 pb-6 text-muted-foreground text-sm leading-6">
					<p>
						Verifind helps you compare rental listings and contact the listed
						representatives directly. Review the details to decide whether a
						home fits your needs.
					</p>
					<p>
						Verifind checks property details for consistency and compares
						contact and ownership information with available verification data.
						These checks can help flag duplicate posts, misleading prices, or
						listings that may no longer be available.
					</p>
					<p>
						Review the listed price and ask the representative about any
						additional costs before you commit. Confirm all charges and terms
						directly with them.
					</p>
					<p>
						Contact the listed representative to ask questions or arrange a
						viewing. Compare homes at your own pace.
					</p>
					<p>
						Before you proceed, confirm the representative’s identity and
						authority. Choose a suitable place for viewings and keep agreements
						in writing. Check all details before making a property decision.
					</p>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
