import {
	getProperties,
	getPropertyById,
	listSavedProperties,
	listSavedPropertyIds,
	saveProperty,
	unsaveProperty,
} from "@verifind/db/queries/property";
import z from "zod";
import { protectedProcedure, publicProcedure } from "../../index";

const propertyTypeSchema = z.enum([
	"apartment",
	"duplex",
	"bungalow",
	"self_contained",
	"shared_apartment",
	"studio",
]);

const statusSchema = z.enum(["available", "rented", "unavailable"]);

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
		.handler(
			async ({ context, input }) => await getProperties(context.db, input)
		),

	get: publicProcedure
		.input(z.object({ id: z.string() }))
		.handler(
			async ({ context, input }) => await getPropertyById(context.db, input)
		),

	saved: {
		list: protectedProcedure.handler(async ({ context }) => {
			const userId = context.session.user.id;
			return await listSavedProperties(context.db, { userId });
		}),

		ids: protectedProcedure.handler(async ({ context }) => {
			const userId = context.session.user.id;
			return await listSavedPropertyIds(context.db, { userId });
		}),

		add: protectedProcedure
			.input(z.object({ propertyId: z.string() }))
			.handler(async ({ context, input }) => {
				const userId = context.session.user.id;
				await saveProperty(context.db, {
					userId,
					propertyId: input.propertyId,
				});
				return { ok: true };
			}),

		remove: protectedProcedure
			.input(z.object({ propertyId: z.string() }))
			.handler(async ({ context, input }) => {
				const userId = context.session.user.id;
				await unsaveProperty(context.db, {
					userId,
					propertyId: input.propertyId,
				});
				return { ok: true };
			}),
	},
};
