import { defineRelationsPart, sql } from "drizzle-orm";
import {
	index,
	integer,
	real,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { user } from "./auth";

/**
 * A listing on VeriFind. Prices are stored in whole Naira (no kobo
 * precision is needed for rentals) and the billing period is kept
 * separately so the UI can render "1,200,000 / year".
 */
export const property = sqliteTable(
	"property",
	{
		id: text("id").primaryKey(),
		ownerId: text("owner_id").references(() => user.id, {
			onDelete: "cascade",
		}),
		title: text("title").notNull(),
		description: text("description").notNull().default(""),
		/** apartment | duplex | bungalow | self_contained | shared_apartment | studio */
		propertyType: text("property_type").notNull().default("apartment"),
		/** Amount in Naira, e.g. 1200000 */
		price: integer("price").notNull(),
		/** month | year */
		pricePeriod: text("price_period").notNull().default("year"),
		bedrooms: integer("bedrooms").notNull().default(1),
		bathrooms: integer("bathrooms").notNull().default(1),
		areaSqm: integer("area_sqm"),
		address: text("address"),
		/** LGA / area name, e.g. "Yaba" */
		city: text("city").notNull(),
		state: text("state").notNull().default("Lagos"),
		latitude: real("latitude"),
		longitude: real("longitude"),
		/** JSON string[] of amenity keys, e.g. ["parking_space","security_guard"] */
		amenities: text("amenities", { mode: "json" }).$type<string[]>(),
		/** JSON string[] of image URLs, first entry is the cover photo */
		images: text("images", { mode: "json" }).$type<string[]>(),
		/** available | rented | unavailable */
		status: text("status").notNull().default("available"),
		/** unverified | pending | verified */
		verificationStatus: text("verification_status")
			.notNull()
			.default("unverified"),
		verifiedAt: integer("verified_at", { mode: "timestamp_ms" }),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		index("property_ownerId_idx").on(table.ownerId),
		index("property_city_idx").on(table.city),
		index("property_price_idx").on(table.price),
		index("property_verificationStatus_idx").on(table.verificationStatus),
		index("property_bedrooms_idx").on(table.bedrooms),
	]
);

/** A bookmark a user adds to their "Saved homes" collection. */
export const savedProperty = sqliteTable(
	"saved_property",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		propertyId: text("property_id")
			.notNull()
			.references(() => property.id, { onDelete: "cascade" }),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
	},
	(table) => [
		uniqueIndex("saved_property_user_property_uq").on(
			table.userId,
			table.propertyId
		),
		index("saved_property_userId_idx").on(table.userId),
	]
);

export const propertyRelations = defineRelationsPart(
	{ user, property, savedProperty },
	(r) => ({
		property: {
			owner: r.one.user({
				from: r.property.ownerId,
				to: r.user.id,
			}),
		},
		savedProperty: {
			user: r.one.user({
				from: r.savedProperty.userId,
				to: r.user.id,
			}),
			property: r.one.property({
				from: r.savedProperty.propertyId,
				to: r.property.id,
			}),
		},
	})
);

/** Fully selected property row as returned by queries. */
export type Property = typeof property.$inferSelect;
