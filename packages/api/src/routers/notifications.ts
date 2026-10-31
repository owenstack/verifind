import { ORPCError } from "@orpc/server";
import {
	notification,
	pushSubscription,
} from "@verifind/db/schema/notification";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import z from "zod";
import { protectedProcedure, publicProcedure } from "../index";
import { notifyAndPush } from "../lib/notifications";

const subscriptionInputSchema = z.object({
	endpoint: z.string().url().max(2048),
	keys: z.object({
		p256dh: z.string().min(1).max(255),
		auth: z.string().min(1).max(255),
	}),
	expirationTime: z.number().int().positive().optional(),
	userAgent: z.string().max(512).optional(),
});

export const notificationsRouter = {
	list: protectedProcedure
		.input(
			z
				.object({
					limit: z.number().int().min(1).max(50).optional(),
					unreadOnly: z.boolean().optional(),
				})
				.optional()
		)
		.handler(async ({ context, input }) => {
			const limit = input?.limit ?? 20;
			const unreadOnly = input?.unreadOnly ?? false;
			const filters = [eq(notification.userId, context.session.user.id)];
			if (unreadOnly) {
				filters.push(isNull(notification.readAt));
			}
			const [items, totals] = await Promise.all([
				context.db
					.select()
					.from(notification)
					.where(and(...filters))
					.orderBy(desc(notification.createdAt))
					.limit(limit),
				context.db
					.select({ total: sql<number>`count(*)` })
					.from(notification)
					.where(
						and(
							eq(notification.userId, context.session.user.id),
							isNull(notification.readAt)
						)
					),
			]);
			return {
				items,
				unreadCount: Number(totals[0]?.total ?? 0),
			};
		}),

	unreadCount: protectedProcedure.handler(async ({ context }) => {
		const [row] = await context.db
			.select({ total: sql<number>`count(*)` })
			.from(notification)
			.where(
				and(
					eq(notification.userId, context.session.user.id),
					isNull(notification.readAt)
				)
			);
		return { count: Number(row?.total ?? 0) };
	}),

	markRead: protectedProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ context, input }) => {
			await context.db
				.update(notification)
				.set({ readAt: new Date() })
				.where(
					and(
						eq(notification.id, input.id),
						eq(notification.userId, context.session.user.id)
					)
				);
			return { ok: true };
		}),

	markAllRead: protectedProcedure.handler(async ({ context }) => {
		await context.db
			.update(notification)
			.set({ readAt: new Date() })
			.where(
				and(
					eq(notification.userId, context.session.user.id),
					isNull(notification.readAt)
				)
			);
		return { ok: true };
	}),

	push: {
		/** VAPID public key for PushManager.subscribe; null disables the UI. */
		config: publicProcedure.handler(({ context }) => ({
			publicKey: context.config.vapid?.publicKey ?? null,
		})),

		subscribe: protectedProcedure
			.input(subscriptionInputSchema)
			.handler(async ({ context, input }) => {
				const { endpoint } = input;
				const values = {
					id: crypto.randomUUID(),
					userId: context.session.user.id,
					endpoint,
					p256dh: input.keys.p256dh,
					auth: input.keys.auth,
					expirationTime: input.expirationTime
						? new Date(input.expirationTime)
						: null,
					userAgent: input.userAgent ?? null,
				};
				await context.db
					.insert(pushSubscription)
					.values(values)
					.onConflictDoUpdate({
						set: {
							p256dh: values.p256dh,
							auth: values.auth,
							expirationTime: values.expirationTime,
							userId: values.userId,
						},
						target: pushSubscription.endpoint,
					});

				// Confirm the subscription end-to-end with a real push.
				const { push } = await notifyAndPush(context, {
					userId: context.session.user.id,
					type: "system",
					title: "Push notifications enabled",
					body: "You will now get alerts about verified homes and saved searches.",
					url: "/",
					payload: { tag: "push-enabled" },
				});
				return { ok: true, push };
			}),

		unsubscribe: protectedProcedure
			.input(z.object({ endpoint: z.string().url().max(2048) }))
			.handler(async ({ context, input }) => {
				await context.db
					.delete(pushSubscription)
					.where(
						and(
							eq(pushSubscription.userId, context.session.user.id),
							eq(pushSubscription.endpoint, input.endpoint)
						)
					);
				return { ok: true };
			}),

		/** Sends a real push message to all of the user's devices. */
		test: protectedProcedure.handler(async ({ context }) => {
			if (!context.config.vapid) {
				throw new ORPCError("PRECONDITION_FAILED", {
					message:
						"Push is not configured on this server (missing VAPID keys).",
				});
			}
			const { push } = await notifyAndPush(context, {
				userId: context.session.user.id,
				type: "system",
				title: "Test notification",
				body: "If you can read this, web push works end to end.",
				url: "/",
				payload: { tag: "test" },
			});
			if (push.delivered === 0) {
				throw new ORPCError("PRECONDITION_FAILED", {
					message: "No device received the push. Enable notifications first.",
				});
			}
			return push;
		}),
	},
};
