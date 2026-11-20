import z from "zod";

export const propertyTypeSchema = z.enum([
	"apartment",
	"duplex",
	"bungalow",
	"self_contained",
	"shared_apartment",
	"studio",
]);

export const propertyStatusSchema = z.enum([
	"available",
	"rented",
	"unavailable",
]);

export const propertySortSchema = z.enum(["newest", "price_asc", "price_desc"]);

/**
 * The single source of truth for property list filters.
 *
 * The API validates client input with this schema, the DB query derives its
 * input type from it, and the web store reuses it for the filter form. Changing
 * a field here updates all three layers together.
 */
export const propertyListSchema = z.object({
	q: z.string().max(120).optional(),
	city: z.string().max(80).optional(),
	propType: propertyTypeSchema.optional(),
	minPrice: z.number().int().nonnegative().optional(),
	maxPrice: z.number().int().positive().optional(),
	bedrooms: z.number().int().min(0).max(20).optional(),
	bathrooms: z.number().int().min(0).max(20).optional(),
	verified: z.boolean().default(false),
	status: propertyStatusSchema.optional(),
	sort: propertySortSchema.default("newest"),
	limit: z.number().int().min(1).max(48).default(12),
	offset: z.number().int().min(0).default(0),
});

export type PropertyType = z.infer<typeof propertyTypeSchema>;
export type PropertyStatus = z.infer<typeof propertyStatusSchema>;
export type PropertySort = z.infer<typeof propertySortSchema>;

/** Shape accepted from clients. */
export type PropertyListInput = z.input<typeof propertyListSchema>;

/** Filter fields only — pagination is supplied per query, not stored as a filter. */
export type PropertyFiltersInput = Omit<PropertyListInput, "limit" | "offset">;

/** Shape after validation, with defaults applied, passed to DB queries. */
export type PropertyList = z.output<typeof propertyListSchema>;
