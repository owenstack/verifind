import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AppRouterClient } from "@verifind/api/routers/index";
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
import { Spinner } from "@verifind/ui/components/spinner";
import { toast } from "@verifind/ui/components/toast";
import {
	ArrowUpRight,
	Bell,
	BellOff,
	House,
	Info,
	type LucideIcon,
	ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
	disablePushNotifications,
	enablePushNotifications,
	getPushSubscriptionState,
} from "@/lib/push";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

type NotificationItem = Awaited<
	ReturnType<AppRouterClient["notifications"]["list"]>
>["items"][number];

// const typeIcons: Record<string, LucideIcon> = {
// 	property: House,
// 	security: ShieldCheck,
// 	support: ArrowUpRight,
// 	system: Info,
// };

// function listState(query: NotificationListQuery): NotificationListState {
// 	if (query.isPending) {
// 		return { status: "loading" };
// 	}
// 	if (query.isError) {
// 		return { status: "error" };
// 	}
// 	return {
// 		groups: groupNotificationsByDay(query.data.items),
// 		status: "ready",
// 		unreadCount: query.data.unreadCount,
// 	};
// }

// interface NotificationListState {
// 	groups?: NotificationGroup[];
// 	status: "error" | "loading" | "ready";
// 	unreadCount?: number;
// }

// interface NotificationListBodyProps {
// 	onItemClick: (item: NotificationItem) => void;
// 	state: NotificationListState;
// }

// function NotificationListBody({
// 	onItemClick,
// 	state,
// }: NotificationListBodyProps) {
// 	if (state.status === "loading") {
// 		return (
// 			<p className="text-muted-foreground text-sm">Loading notifications…</p>
// 		);
// 	}
// 	if (state.status === "error") {
// 		return (
// 			<p className="text-muted-foreground text-sm">
// 				Could not load notifications. Please try again.
// 			</p>
// 		);
// 	}
// 	if (!state.groups || state.groups.length === 0) {
// 		return (
// 			<p className="text-muted-foreground text-sm">
// 				You are all caught up. Notifications about verified homes and your saved
// 				searches will appear here.
// 			</p>
// 		);
// 	}
// 	return (
// 		<>
// 			{state.groups.map((group) => (
// 				<section
// 					aria-label={group.date}
// 					className="grid gap-3"
// 					key={group.date}
// 				>
// 					<h3 className="font-medium text-muted-foreground">{group.date}</h3>
// 					<div className="grid gap-2">
// 						{group.items.map((item) => (
// 							<NotificationRow
// 								item={item}
// 								key={item.id}
// 								onItemClick={onItemClick}
// 							/>
// 						))}
// 					</div>
// 				</section>
// 			))}
// 		</>
// 	);
// }

// function NotificationRow({
// 	item,
// 	onItemClick,
// }: {
// 	item: NotificationItem;
// 	onItemClick: (item: NotificationItem) => void;
// }) {
// 	const Icon = iconForType(item.type);
// 	const unread = !item.readAt;
// 	return (
// 		<Item
// 			className={cn("items-start gap-2 p-2", unread && "bg-primary/5")}
// 			key={item.id}
// 			render={<button onClick={() => onItemClick(item)} type="button" />}
// 		>
// 			<ItemMedia variant="icon">
// 				<Icon aria-hidden="true" />
// 			</ItemMedia>
// 			<ItemContent>
// 				<ItemHeader>
// 					<ItemTitle>{item.title}</ItemTitle>
// 					<span className="shrink-0 text-muted-foreground text-xs">
// 						{timeLabel(item.createdAt)}
// 					</span>
// 				</ItemHeader>
// 				<ItemDescription>{item.body}</ItemDescription>
// 			</ItemContent>
// 			{unread ? (
// 				<span
// 					aria-hidden="true"
// 					className="mt-2 size-2 shrink-0 rounded-full bg-primary"
// 				/>
// 			) : null}
// 		</Item>
// 	);
// }

function describePushFailure(
	reason:
		| "denied"
		| "register-failed"
		| "subscribe-failed"
		| "unconfigured"
		| "unsupported"
		| undefined
): string {
	switch (reason) {
		case "denied":
			return "Notification permission was denied. Enable it in your browser settings.";
		case "unconfigured":
			return "Push is not set up on this server yet.";
		case "unsupported":
			return "This browser does not support push notifications.";
		default:
			return "Could not enable push notifications.";
	}
}

// interface NotificationGroup {
// 	date: string;
// 	items: NotificationItem[];
// }

/** Group notifications into consecutive day buckets (Today, Yesterday, …). */
// function groupNotificationsByDay(
// 	items: NotificationItem[]
// ): NotificationGroup[] {
// 	const groups: NotificationGroup[] = [];
// 	for (const item of items) {
// 		const label = dayLabel(item.createdAt);
// 		const last = groups.at(-1);
// 		if (last && last.date === label) {
// 			last.items.push(item);
// 		} else {
// 			groups.push({ date: label, items: [item] });
// 		}
// 	} 
// 	return groups;
// }

// function pushToggleIcon(busy: boolean, enabled: boolean | null) {
// 	if (busy) {
// 		return Spinner;
// 	}
// 	return enabled ? Bell : BellOff;
// }

// async function togglePushOff(
// 	setEnabled: (value: boolean | null) => void
// ): Promise<void> {
// 	const result = await disablePushNotifications();
// 	setEnabled(result.ok ? false : null);
// 	toast.add({
// 		title: result.ok
// 			? "Push notifications turned off"
// 			: "Could not turn off push notifications",
// 		type: result.ok ? "success" : "error",
// 	});
// }

// async function togglePushOn(
// 	setEnabled: (value: boolean | null) => void
// ): Promise<void> {
// 	const result = await enablePushNotifications();
// 	setEnabled(result.ok ? true : null);
// 	toast.add({
// 		description: result.ok ? undefined : describePushFailure(result.reason),
// 		title: result.ok ? "Push notifications enabled" : "Push not enabled",
// 		type: result.ok ? "success" : "error",
// 	});
// }

// function PushToggle() {
// 	const [enabled, setEnabled] = useState<boolean | null>(null);
// 	const [busy, setBusy] = useState(false);

// 	useEffect(() => {
// 		getPushSubscriptionState().then(setEnabled);
// 	}, []);

// 	const toggle = async () => {
// 		setBusy(true);
// 		try {
// 			if (enabled) {
// 				await togglePushOff(setEnabled);
// 			} else {
// 				await togglePushOn(setEnabled);
// 			}
// 		} finally {
// 			setBusy(false);
// 		}
// 	};

// 	const Icon = pushToggleIcon(busy, enabled);
// 	return (
// 		<Button
// 			aria-pressed={enabled === true}
// 			className={cn("text-secondary", enabled && "text-primary")}
// 			disabled={enabled === null || busy}
// 			onClick={toggle}
// 			size="sm"
// 			variant="ghost"
// 		>
// 			<Icon aria-hidden="true" />
// 			{enabled ? "Push on" : "Enable push"}
// 		</Button>
// 	);
// }

export function Notifications() {
	const queryClient = useQueryClient();
	const listQuery = useNotificationList();
	const markAllRead = useMutation(
		orpc.notifications.markAllRead.mutationOptions({
			onSettled: () => {
				queryClient.invalidateQueries({
					queryKey: orpc.notifications.list.queryOptions({
						input: { limit: 30 },
					}).queryKey,
				});
			},
		})
	);
	const markRead = useMutation(orpc.notifications.markRead.mutationOptions());

	const unreadCount = listQuery.data?.unreadCount ?? 0;

	const handleItemClick = (item: NotificationItem) => {
		if (!item.readAt) {
			markRead.mutate(
				{ id: item.id },
				{
					onSettled: () => {
						queryClient.invalidateQueries({
							queryKey: orpc.notifications.list.queryOptions({
								input: { limit: 30 },
							}).queryKey,
						});
					},
				}
			);
		}
	};

	return (
		<Drawer>
			<DrawerTrigger
				render={
					<Button
						aria-label={
							unreadCount > 0
								? `Notifications, ${unreadCount} unread`
								: "Notifications"
						}
						variant="ghost"
					>
						<Bell aria-hidden="true" />
						{unreadCount > 0 ? <AvatarBadge>{unreadCount}</AvatarBadge> : null}
					</Button>
				}
			/>
			<DrawerContent className="min-h-75">
				<DrawerHeader className="my-4">
					<div className="flex items-center justify-between gap-2 border-b pb-4">
						<DrawerTitle>All Notifications</DrawerTitle>
						<PushToggle />
						<Button
							className="text-secondary"
							disabled={unreadCount === 0 || markAllRead.isPending}
							onClick={() => markAllRead.mutate()}
							variant="ghost"
						>
							Mark all read
						</Button>
					</div>
				</DrawerHeader>
				<NotificationListBody
					onItemClick={handleItemClick}
					state={listState(listQuery)}
				/>
			</DrawerContent>
		</Drawer>
	);
}
