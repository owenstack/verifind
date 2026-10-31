import { defineRelationsPart, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth";

/**
 * An in-app notification. `type` is a free-form discriminator the UI
 * uses to pick an icon (e.g. "system", "property", "tour", "push").
 * `url` is an in-app route the notification deep-links to.
 */
export const notification = sqliteTable(
	"notification",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		type: text("type").notNull().default("system"),
		title: text("title").notNull(),
		body: text("body").notNull().default(""),
		url: text("url"),
		/** Arbitrary JSON payload (property id, tour id, ...) */
		data: text("data", { mode: "json" }).$type<Record<string, unknown>>(),
		readAt: integer("read_at", { mode: "timestamp_ms" }),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
	},
	(table) => [
		index("notification_userId_createdAt_idx").on(
			table.userId,
			table.createdAt
		),
		index("notification_userId_readAt_idx").on(table.userId, table.readAt),
	]
);

/**
 * A Web Push subscription (RFC 8030) registered by the browser service
 * worker. One user can have many devices, so endpoint is unique per
 * subscription, not per user.
 */
export const pushSubscription = sqliteTable(
	"push_subscription",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		endpoint: text("endpoint").notNull().unique(),
		/** Keys.p256dh from PushSubscription.toJSON() */
		p256dh: text("p256dh").notNull(),
		/** Keys.auth from PushSubscription.toJSON() */
		auth: text("auth").notNull(),
		expirationTime: integer("expiration_time", { mode: "timestamp_ms" }),
		userAgent: text("user_agent"),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
	},
	(table) => [index("push_subscription_userId_idx").on(table.userId)]
);

export const notificationRelations = defineRelationsPart(
	{ user, notification, pushSubscription },
	(r) => ({
		notification: {
			user: r.one.user({
				from: r.notification.userId,
				to: r.user.id,
			}),
		},
		pushSubscription: {
			user: r.one.user({
				from: r.pushSubscription.userId,
				to: r.user.id,
			}),
		},
	})
);
