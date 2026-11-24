import type { PropertyList } from "@verifind/shared";
import { and, eq, gte, like, lte, or, type SQL, sql } from "drizzle-orm";
import type { Database } from "../index";
import { property, savedProperty } from "../schema";

type GetPropertiesInput = PropertyList;

/** Columns shared by the property cards and the property detail view. */
const propertyCardColumns = {
	id: true,
	images: true,
	propertyType: true,
	title: true,
	city: true,
	state: true,
	price: true,
	pricePeriod: true,
	verificationStatus: true,
} as const;

interface PropertyFilter {
	bathrooms?: { gte: number };
	bedrooms?: { gte: number };
	city?: { like: string };
	OR?: {
		title?: { like: string };
		city?: { like: string };
		address?: { like: string };
		description?: { like: string };
	}[];
	price?: { gte?: number; lte?: number };
	propertyType?: string;
	status: string;
	verificationStatus?: string;
}

function getOrderBy(sort: GetPropertiesInput["sort"]) {
	if (sort === "price_asc") {
		return { price: "asc" } as const;
	}
	if (sort === "price_desc") {
		return { price: "desc" } as const;
	}
	return { createdAt: "desc" } as const;
}

export async function getProperties(db: Database, input: GetPropertiesInput) {
	const status = input.status ?? "available";
	const where: PropertyFilter = { status };
	// `$count` only accepts SQL filters, so keep an equivalent SQL predicate in
	// sync with the relational filter above for the total count.
	const sqlFilters: SQL[] = [eq(property.status, status)];

	if (input.q) {
		const pattern = `%${input.q}%`;
		const search = or(
			like(property.title, pattern),
			like(property.city, pattern),
			like(property.address, pattern),
			like(property.description, pattern)
		);
		if (search) {
			sqlFilters.push(search);
		}
		where.OR = [
			{ title: { like: pattern } },
			{ city: { like: pattern } },
			{ address: { like: pattern } },
			{ description: { like: pattern } },
		];
	}
	if (input.city) {
		const cityPattern = `%${input.city}%`;
		sqlFilters.push(like(property.city, cityPattern));
		where.city = { like: cityPattern };
	}
	if (input.propType) {
		sqlFilters.push(eq(property.propertyType, input.propType));
		where.propertyType = input.propType;
	}
	const priceFilter: { gte?: number; lte?: number } = {};
	if (input.minPrice !== undefined) {
		sqlFilters.push(gte(property.price, input.minPrice));
		priceFilter.gte = input.minPrice;
	}
	if (input.maxPrice !== undefined) {
		sqlFilters.push(lte(property.price, input.maxPrice));
		priceFilter.lte = input.maxPrice;
	}
	if (Object.keys(priceFilter).length > 0) {
		where.price = priceFilter;
	}
	if (input.bedrooms !== undefined) {
		sqlFilters.push(gte(property.bedrooms, input.bedrooms));
		where.bedrooms = { gte: input.bedrooms };
	}
	if (input.bathrooms !== undefined) {
		sqlFilters.push(gte(property.bathrooms, input.bathrooms));
		where.bathrooms = { gte: input.bathrooms };
	}
	if (input.verified) {
		sqlFilters.push(eq(property.verificationStatus, "verified"));
		where.verificationStatus = "verified";
	}

	const sqlWhere = and(...sqlFilters) ?? sql`1 = 1`;
	const orderBy = getOrderBy(input.sort);

	const [items, total] = await Promise.all([
		db.query.property.findMany({
			where,
			columns: propertyCardColumns,
			orderBy,
			limit: input.limit,
			offset: input.offset,
		}),
		db.$count(property, sqlWhere),
	]);

	return {
		items,
		total,
		limit: input.limit,
		offset: input.offset,
	};
}

export async function getPropertyById(db: Database, input: { id: string }) {
	const row = await db.query.property.findFirst({
		where: { id: input.id },
		columns: propertyCardColumns,
	});
	if (!row) {
		throw new Error("Property not found");
	}
	return row;
}

export async function listSavedProperties(
	db: Database,
	input: { userId: string }
) {
	const items = await db.query.savedProperty.findMany({
		where: { userId: input.userId },
		orderBy: (table, { desc }) => desc(table.createdAt),
		with: {
			property: { columns: propertyCardColumns },
		},
		extras: {
			savedAt: (table) =>
				sql<number>`${table.createdAt}`.mapWith(
					(value: number) => new Date(value)
				),
		},
	});
	return { items };
}

export async function listSavedPropertyIds(
	db: Database,
	input: { userId: string }
) {
	const rows = await db.query.savedProperty.findMany({
		where: { userId: input.userId },
		columns: { propertyId: true },
	});
	return { ids: rows.map((row) => row.propertyId) };
}

export async function saveProperty(
	db: Database,
	input: { userId: string; propertyId: string }
) {
	const exists = await db.query.property.findFirst({
		where: { id: input.propertyId },
		columns: { id: true },
	});
	if (!exists) {
		throw new Error("Property not found");
	}
	return await db
		.insert(savedProperty)
		.values({
			id: crypto.randomUUID(),
			userId: input.userId,
			propertyId: input.propertyId,
		})
		.onConflictDoNothing();
}

export async function unsaveProperty(
	db: Database,
	input: { userId: string; propertyId: string }
) {
	return await db
		.delete(savedProperty)
		.where(
			and(
				eq(savedProperty.userId, input.userId),
				eq(savedProperty.propertyId, input.propertyId)
			)
		);
}
