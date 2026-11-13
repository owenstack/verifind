import { and, desc, eq, isNull, sql } from "drizzle-orm";
import type { Database } from "../index";
import { notification, pushSubscription } from "../schema";

export interface CreateNotificationInput {
	body?: string;
	data?: Record<string, unknown>;
	title: string;
	type?: string;
	url?: string;
	userId: string;
}

export async function createNotification(
	db: Database,
	input: CreateNotificationInput
) {
	const [row] = await db
		.insert(notification)
		.values({
			id: crypto.randomUUID(),
			userId: input.userId,
			type: input.type ?? "system",
			title: input.title,
			body: input.body ?? "",
			url: input.url,
			data: input.data,
		})
		.returning();
	if (!row) {
		throw new Error("Failed to create notification");
	}
	return row;
}

export async function getNotifications(
	db: Database,
	input: { userId: string; unreadOnly?: boolean; limit?: number }
) {
	const limit = input.limit ?? 20;
	const filters = [eq(notification.userId, input.userId)];
	if (input.unreadOnly) {
		filters.push(isNull(notification.readAt));
	}
	const [items, totals] = await Promise.all([
		db
			.select()
			.from(notification)
			.where(and(...filters))
			.orderBy(desc(notification.createdAt))
			.limit(limit),
		db
			.select({ total: sql<number>`count(*)` })
			.from(notification)
			.where(
				and(eq(notification.userId, input.userId), isNull(notification.readAt))
			),
	]);
	return {
		items,
		unreadCount: Number(totals[0]?.total ?? 0),
	};
}

export async function createSubscription(
	db: Database,
	input: {
		userId: string;
		endpoint: string;
		p256dh: string;
		auth: string;
		expirationTime: Date | null;
		userAgent: string | null;
	}
) {
	return await db
		.insert(pushSubscription)
		.values({ ...input, id: crypto.randomUUID() })
		.onConflictDoUpdate({
			set: {
				p256dh: input.p256dh,
				auth: input.auth,
				expirationTime: input.expirationTime,
				userId: input.userId,
			},
			target: pushSubscription.endpoint,
		});
}

export async function getSubscriptions(
	db: Database,
	input: { userId: string }
) {
	return await db
		.select()
		.from(pushSubscription)
		.where(eq(pushSubscription.userId, input.userId));
}

export async function deleteSubscription(
	db: Database,
	input: { userId: string; endpoint: string }
) {
	return await db
		.delete(pushSubscription)
		.where(
			and(
				eq(pushSubscription.userId, input.userId),
				eq(pushSubscription.endpoint, input.endpoint)
			)
		);
}

export async function getUnreadCount(db: Database, userId: string) {
	const [row] = await db
		.select({ total: sql<number>`count(*)` })
		.from(notification)
		.where(and(eq(notification.userId, userId), isNull(notification.readAt)));
	return { count: Number(row?.total ?? 0) };
}

export async function markNotificationRead(
	db: Database,
	input: { userId: string; id?: string }
) {
	if (input.id) {
		return await db
			.update(notification)
			.set({ readAt: new Date() })
			.where(
				and(
					eq(notification.id, input.id),
					eq(notification.userId, input.userId)
				)
			);
	}
	return await db
		.update(notification)
		.set({ readAt: new Date() })
		.where(
			and(eq(notification.userId, input.userId), isNull(notification.readAt))
		);
}
