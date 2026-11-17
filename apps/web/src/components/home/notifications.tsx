// biome-ignore-all lint/performance/noJsxPropsBind: filter chips bind inline setters

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@verifind/ui/components/empty";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemMedia,
	ItemTitle,
} from "@verifind/ui/components/item";
import { Skeleton } from "@verifind/ui/components/skeleton";
import { cn, formatDistanceToNow } from "@verifind/ui/lib/utils";
import {
	ArrowUpRight,
	Bell,
	BellOff,
	House,
	Info,
	type LucideIcon,
	RefreshCcw,
	ShieldCheck,
} from "lucide-react";
import { orpc } from "@/utils/orpc";

const typeIcons: Record<string, LucideIcon> = {
	property: House,
	security: ShieldCheck,
	support: ArrowUpRight,
	system: Info,
};

export function Notifications() {
	const queryClient = useQueryClient();
	const { data, isPending, refetch, isRefetching } = useQuery(
		orpc.notifications.list.queryOptions()
	);
	const { mutate: markAllRead, isPending: isMarkAllReadPending } = useMutation(
		orpc.notifications.markAllRead.mutationOptions({
			onSettled: () => {
				queryClient.invalidateQueries({
					queryKey: orpc.notifications.list.queryKey(),
				});
			},
		})
	);
	const { mutate: markRead } = useMutation(
		orpc.notifications.markRead.mutationOptions({
			onSettled: () => {
				queryClient.invalidateQueries({
					queryKey: orpc.notifications.list.queryKey(),
				});
			},
		})
	);
	const unreadCount = data?.unreadCount ?? 0;
	type NotificationItem = NonNullable<typeof data>["items"][number];
	const groups: { date: string; items: NotificationItem[] }[] = [];
	for (const item of data?.items ?? []) {
		const label = formatDistanceToNow(item.createdAt);
		const last = groups.at(-1);
		if (last && last.date === label) {
			last.items.push(item);
		} else {
			groups.push({ date: label, items: [item] });
		}
	}
	let notificationContent = (
		<NotifEmpty isRefetching={isRefetching} refetch={refetch} />
	);
	if (!data || isPending) {
		notificationContent = <NotifSkeleton />;
	} else if (data?.items && data.items.length > 0) {
		notificationContent = (
			<div className="grid gap-2">
				{groups.map((group) => (
					<div key={group.date}>
						<h3 className="font-medium text-muted-foreground">{group.date}</h3>
						<ItemGroup>
							{group.items.map((item) => {
								const Icon = typeIcons[item.type] ?? Info;

								return (
									<Item
										key={item.id}
										onClick={() => markRead({ id: item.id })}
										size="xs"
										variant={item.readAt ? "outline" : "muted"}
									>
										<ItemMedia variant="icon">
											<Icon />
										</ItemMedia>
										<ItemContent>
											<ItemTitle className="flex items-center justify-between">
												{item.title}
												<span className="shrink-0 text-muted-foreground text-xs">
													{item.createdAt.toLocaleTimeString()}
												</span>
											</ItemTitle>
											<ItemDescription>{item.body}</ItemDescription>
										</ItemContent>
									</Item>
								);
							})}
						</ItemGroup>
					</div>
				))}
			</div>
		);
	}

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
						<Button
							className="text-secondary"
							disabled={unreadCount === 0 || isMarkAllReadPending}
							onClick={() => markAllRead()}
							variant="ghost"
						>
							Mark all read
						</Button>
					</div>
				</DrawerHeader>
				<section className="flex w-full flex-col gap-2 px-4">
					{notificationContent}
				</section>
			</DrawerContent>
		</Drawer>
	);
}

const skeletonGroups = [
	{
		id: "group-1",
		heading: "w-20",
		items: [
			{ id: "item-1", title: "w-28", body: "w-44", variant: "muted" },
			{ id: "item-2", title: "w-36", body: "w-40", variant: "muted" },
			{ id: "item-3", title: "w-32", body: "w-48", variant: "outline" },
			{ id: "item-4", title: "w-24", body: "w-36", variant: "outline" },
		],
	},
	{
		id: "group-2",
		heading: "w-16",
		items: [
			{ id: "item-5", title: "w-32", body: "w-44", variant: "muted" },
			{ id: "item-6", title: "w-36", body: "w-40", variant: "outline" },
			{ id: "item-7", title: "w-28", body: "w-48", variant: "outline" },
		],
	},
] as const;

function NotifSkeleton() {
	return (
		<div className="grid gap-2">
			{skeletonGroups.map((group) => (
				<div key={group.id}>
					<Skeleton className={cn("h-3.5 rounded-full", group.heading)} />
					<ItemGroup className="mt-2">
						{group.items.map((item) => (
							<Item key={item.id} size="xs" variant={item.variant}>
								<ItemMedia variant="icon">
									<Skeleton className="size-4 rounded-full" />
								</ItemMedia>
								<ItemContent>
									<ItemTitle className="flex items-center justify-between">
										<Skeleton className={cn("h-4 rounded-full", item.title)} />
										<Skeleton className="h-2.5 w-14 rounded-full" />
									</ItemTitle>
									<ItemDescription>
										<Skeleton className={cn("h-3.5 rounded-full", item.body)} />
									</ItemDescription>
								</ItemContent>
							</Item>
						))}
					</ItemGroup>
				</div>
			))}
		</div>
	);
}

function NotifEmpty({
	refetch,
	isRefetching,
}: {
	refetch: () => void;
	isRefetching: boolean;
}) {
	return (
		<Empty>
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<BellOff />
				</EmptyMedia>
				<EmptyTitle>No notifications</EmptyTitle>
				<EmptyDescription className="max-w-xs text-pretty">
					No new notifications. You're all caught up
				</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button onClick={() => refetch()}>
					<RefreshCcw
						className={cn(isRefetching && "animate-spin")}
						data-icon="inline-start"
					/>{" "}
					Refresh
				</Button>
			</EmptyContent>
		</Empty>
	);
}
