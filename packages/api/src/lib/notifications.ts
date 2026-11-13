import {
	createNotification,
	deleteSubscription,
	getSubscriptions,
} from "@verifind/db/queries/notification";
import type { Context } from "../context";
import { type PushPayload, sendPushNotification } from "./web-push";

export interface CreateNotificationInput {
	body?: string;
	data?: Record<string, unknown>;
	title: string;
	type?: string;
	url?: string;
	userId: string;
}

/**
 * Push a message to every device the user has subscribed, pruning
 * stale subscriptions the push service reports as gone.
 */
export async function pushToUser(
	ctx: Pick<Context, "db" | "config">,
	userId: string,
	payload: PushPayload
): Promise<{ delivered: number; pruned: number }> {
	const {
		config: { vapid },
	} = ctx;
	if (!vapid) {
		return { delivered: 0, pruned: 0 };
	}
	const subscriptions = await getSubscriptions(ctx.db, { userId });

	const delivered = 0;
	const pruned = await Promise.all(
		subscriptions.map(async (subscription) => {
			try {
				const ok = await sendPushNotification(
					subscription.endpoint,
					{ auth: subscription.auth, p256dh: subscription.p256dh },
					vapid,
					payload
				);
				if (ok) {
					return null;
				}
			} catch (error) {
				// Fan-out must not abort on a single bad endpoint, but
				// surface the failure so misconfiguration is observable.
				console.error(
					`[web-push] delivery failed for endpoint ${subscription.endpoint}:`,
					error
				);
				return null;
			}
			// The push service reported the subscription as gone (404/410).
			await deleteSubscription(ctx.db, {
				userId,
				endpoint: subscription.endpoint,
			});
			return subscription.endpoint;
		})
	);
	return { delivered, pruned: pruned.filter(Boolean).length };
}

/** Create the in-app notification and fan it out as a push message. */
export async function notifyAndPush(
	ctx: Pick<Context, "db" | "config">,
	input: CreateNotificationInput & { payload?: Partial<PushPayload> }
) {
	const row = await createNotification(ctx.db, input);
	const result = await pushToUser(ctx, input.userId, {
		body: row.body,
		title: row.title,
		url: row.url ?? undefined,
		...input.payload,
	});
	return { notification: row, push: result };
}
