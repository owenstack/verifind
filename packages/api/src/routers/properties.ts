import { ORPCError } from "@orpc/server";
import { property, savedProperty } from "@verifind/db/schema/property";
import { and, asc, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import z from "zod";

import { protectedProcedure, publicProcedure } from "../index";

const propertyTypeSchema = z.enum([
	"apartment",
	"duplex",
	"bungalow",
	"self_contained",
	"shared_apartment",
	"studio",
]);

const statusSchema = z.enum(["available", "rented", "unavailable"]);

const verificationStatusSchema = z.enum(["unverified", "pending", "verified"]);

const propertyCreateSchema = z.object({
	title: z.string().min(4).max(120),
	description: z.string().max(4000).default(""),
	propertyType: propertyTypeSchema.default("apartment"),
	price: z.number().int().positive(),
	pricePeriod: z.enum(["month", "year"]).default("year"),
	bedrooms: z.number().int().min(0).max(20).default(1),
	bathrooms: z.number().int().min(0).max(20).default(1),
	areaSqm: z.number().int().positive().optional(),
	address: z.string().max(255).optional(),
	city: z.string().min(2).max(80),
	state: z.string().max(80).default("Lagos"),
	latitude: z.number().optional(),
	longitude: z.number().optional(),
	amenities: z.array(z.string().max(60)).max(30).default([]),
	images: z.array(z.string().max(2048)).max(20).default([]),
	status: statusSchema.default("available"),
});

const propertyUpdateSchema = propertyCreateSchema.partial().extend({
	verificationStatus: verificationStatusSchema.optional(),
});

const propertyListSchema = z.object({
	q: z.string().max(120).optional(),
	city: z.string().max(80).optional(),
	propertyType: propertyTypeSchema.optional(),
	minPrice: z.number().int().nonnegative().optional(),
	maxPrice: z.number().int().positive().optional(),
	bedrooms: z.number().int().min(0).max(20).optional(),
	verifiedOnly: z.boolean().default(false),
	status: statusSchema.optional(),
	sort: z.enum(["newest", "price_asc", "price_desc"]).default("newest"),
	limit: z.number().int().min(1).max(48).default(12),
	offset: z.number().int().min(0).default(0),
});

export const propertiesRouter = {
	list: publicProcedure
		.input(propertyListSchema)
		.handler(async ({ context, input }) => {
			const filters = [eq(property.status, input.status ?? "available")];
			if (input.q) {
				const pattern = `%${input.q}%`;
				const search = or(
					ilike(property.title, pattern),
					ilike(property.city, pattern),
					ilike(property.address, pattern),
					ilike(property.description, pattern)
				);
				if (search) {
					filters.push(search);
				}
			}
			if (input.city) {
				filters.push(ilike(property.city, `%${input.city}%`));
			}
			if (input.propertyType) {
				filters.push(eq(property.propertyType, input.propertyType));
			}
			if (input.minPrice !== undefined) {
				filters.push(gte(property.price, input.minPrice));
			}
			if (input.maxPrice !== undefined) {
				filters.push(lte(property.price, input.maxPrice));
			}
			if (input.bedrooms !== undefined) {
				filters.push(gte(property.bedrooms, input.bedrooms));
			}
			if (input.verifiedOnly) {
				filters.push(eq(property.verificationStatus, "verified"));
			}

			const where = and(...filters);
			let orderBy = desc(property.createdAt);
			if (input.sort === "price_asc") {
				orderBy = asc(property.price);
			} else if (input.sort === "price_desc") {
				orderBy = desc(property.price);
			}

			const [items, totals] = await Promise.all([
				context.db
					.select()
					.from(property)
					.where(where)
					.orderBy(orderBy)
					.limit(input.limit)
					.offset(input.offset),
				context.db
					.select({ total: sql<number>`count(*)` })
					.from(property)
					.where(where),
			]);

			return {
				items,
				total: Number(totals[0]?.total ?? 0),
				limit: input.limit,
				offset: input.offset,
			};
		}),

	get: publicProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ context, input }) => {
			const [row] = await context.db
				.select()
				.from(property)
				.where(eq(property.id, input.id))
				.limit(1);
			if (!row) {
				throw new ORPCError("NOT_FOUND", {
					message: "Property not found",
				});
			}
			return row;
		}),

	create: protectedProcedure
		.input(propertyCreateSchema)
		.handler(async ({ context, input }) => {
			const [row] = await context.db
				.insert(property)
				.values({
					id: crypto.randomUUID(),
					ownerId: context.session.user.id,
					...input,
				})
				.returning();
			return row;
		}),

	update: protectedProcedure
		.input(
			propertyUpdateSchema.extend({
				id: z.string(),
			})
		)
		.handler(async ({ context, input }) => {
			const { id, ...values } = input;
			const [existing] = await context.db
				.select({ ownerId: property.ownerId })
				.from(property)
				.where(eq(property.id, id))
				.limit(1);
			if (!existing) {
				throw new ORPCError("NOT_FOUND", {
					message: "Property not found",
				});
			}
			if (existing.ownerId !== context.session.user.id) {
				throw new ORPCError("FORBIDDEN", {
					message: "You can only update your own listings",
				});
			}
			const [row] = await context.db
				.update(property)
				.set(values)
				.where(eq(property.id, id))
				.returning();
			return row;
		}),

	remove: protectedProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ context, input }) => {
			const [existing] = await context.db
				.select({ ownerId: property.ownerId })
				.from(property)
				.where(eq(property.id, input.id))
				.limit(1);
			if (!existing) {
				throw new ORPCError("NOT_FOUND", {
					message: "Property not found",
				});
			}
			if (existing.ownerId !== context.session.user.id) {
				throw new ORPCError("FORBIDDEN", {
					message: "You can only delete your own listings",
				});
			}
			await context.db.delete(property).where(eq(property.id, input.id));
			return { ok: true };
		}),

	saved: {
		list: protectedProcedure.handler(async ({ context }) => {
			const rows = await context.db
				.select({ property, savedAt: savedProperty.createdAt })
				.from(savedProperty)
				.innerJoin(property, eq(savedProperty.propertyId, property.id))
				.where(eq(savedProperty.userId, context.session.user.id))
				.orderBy(desc(savedProperty.createdAt));
			return { items: rows };
		}),

		ids: protectedProcedure.handler(async ({ context }) => {
			const rows = await context.db
				.select({ propertyId: savedProperty.propertyId })
				.from(savedProperty)
				.where(eq(savedProperty.userId, context.session.user.id));
			return { ids: rows.map((row) => row.propertyId) };
		}),

		add: protectedProcedure
			.input(z.object({ propertyId: z.string() }))
			.handler(async ({ context, input }) => {
				const [exists] = await context.db
					.select({ id: property.id })
					.from(property)
					.where(eq(property.id, input.propertyId))
					.limit(1);
				if (!exists) {
					throw new ORPCError("NOT_FOUND", {
						message: "Property not found",
					});
				}
				await context.db
					.insert(savedProperty)
					.values({
						id: crypto.randomUUID(),
						userId: context.session.user.id,
						propertyId: input.propertyId,
					})
					.onConflictDoNothing();
				return { ok: true };
			}),

		remove: protectedProcedure
			.input(z.object({ propertyId: z.string() }))
			.handler(async ({ context, input }) => {
				await context.db
					.delete(savedProperty)
					.where(
						and(
							eq(savedProperty.userId, context.session.user.id),
							eq(savedProperty.propertyId, input.propertyId)
						)
					);
				return { ok: true };
			}),
	},
};
