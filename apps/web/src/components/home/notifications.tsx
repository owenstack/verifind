import { Link } from "@tanstack/react-router";
import { AvatarBadge } from "@verifind/ui/components/avatar";
import { Button } from "@verifind/ui/components/button";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@verifind/ui/components/drawer";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemHeader,
	ItemMedia,
	ItemTitle,
} from "@verifind/ui/components/item";
import {
	ArrowUpRight,
	Bell,
	Diamond,
	House,
	Info,
	ShieldCheck,
} from "lucide-react";

const notificationGroups = [
	{
		date: "Today",
		items: [
			{
				description:
					"VeriFind has new features to help you rent with confidence.",
				icon: Info,
				title: "New Updates Available!",
			},
			{
				description: "Keep your account details secure and up to date.",
				icon: ShieldCheck,
				title: "Protect your account",
			},
			{
				description: "Review property details before arranging a viewing.",
				icon: House,
				title: "Rental safety reminder",
			},
		],
	},
	{
		date: "Yesterday",
		items: [
			{
				description: "For your safety, use a strong and unique password.",
				icon: Diamond,
				title: "Password Security",
			},
			{
				description: "Your latest support request has a new update.",
				icon: ArrowUpRight,
				title: "Support update",
			},
		],
	},
] as const;

export function Notifications() {
	return (
		<Drawer>
			<DrawerTrigger
				render={
					<Button aria-label="Notifications, 5 unread" variant="ghost">
						<Bell aria-hidden="true" />
						<AvatarBadge>5</AvatarBadge>
					</Button>
				}
			/>
			<DrawerContent className="min-h-75">
				<DrawerHeader className="my-4">
					<div className="flex items-center justify-between gap-4 border-b pb-4">
						<DrawerTitle>All Notifications</DrawerTitle>

						<Button className="text-secondary" variant="ghost">
							Mark all read
						</Button>
					</div>
				</DrawerHeader>
				<div className="grid gap-6 overflow-y-auto px-4 pb-4">
					{notificationGroups.map(({ date, items }) => (
						<section aria-label={date} className="grid gap-3" key={date}>
							<h3 className="font-medium text-muted-foreground">{date}</h3>
							<div className="grid gap-2">
								{items.map(({ description, icon: Icon, title }) => (
									<Item
										className="items-start gap-2 p-2"
										key={title}
										render={
											<Link aria-label={`${title}: ${description}`} to="/" />
										}
									>
										<ItemMedia variant="icon">
											<Icon aria-hidden="true" />
										</ItemMedia>
										<ItemContent>
											<ItemHeader>
												<ItemTitle>{title}</ItemTitle>
												<span className="shrink-0 text-muted-foreground text-xs">
													12:10 pm
												</span>
											</ItemHeader>
											<ItemDescription>{description}</ItemDescription>
										</ItemContent>
									</Item>
								))}
							</div>
						</section>
					))}
				</div>
			</DrawerContent>
		</Drawer>
	);
}
