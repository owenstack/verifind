import {
	getProperties,
	getPropertyById,
	listSavedProperties,
	listSavedPropertyIds,
	saveProperty,
	unsaveProperty,
} from "@verifind/db/queries/property";
import { propertyListSchema } from "@verifind/shared";
import z from "zod";
import { protectedProcedure, publicProcedure } from "../../index";

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
