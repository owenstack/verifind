import type { PropertyList } from "@verifind/shared";
import { and, asc, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import type { Database } from "../index";
import { property, savedProperty } from "../schema";

type GetPropertiesInput = PropertyList;

export async function getProperties(db: Database, input: GetPropertiesInput) {
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
	if (input.propType) {
		filters.push(eq(property.propertyType, input.propType));
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
	if (input.bathrooms !== undefined) {
		filters.push(gte(property.bathrooms, input.bathrooms));
	}
	if (input.verified) {
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
		db
			.select({
				id: property.id,
				images: property.images,
				propertyType: property.propertyType,
				title: property.title,
				city: property.city,
				state: property.state,
				price: property.price,
				pricePeriod: property.pricePeriod,
				verificationStatus: property.verificationStatus,
			})
			.from(property)
			.where(where)
			.orderBy(orderBy)
			.limit(input.limit)
			.offset(input.offset),
		db.select({ total: sql<number>`count(*)` }).from(property).where(where),
	]);

	return {
		items,
		total: Number(totals[0]?.total ?? 0),
		limit: input.limit,
		offset: input.offset,
	};
}

export async function getPropertyById(db: Database, input: { id: string }) {
	const [row] = await db
		.select()
		.from(property)
		.where(eq(property.id, input.id))
		.limit(1);
	if (!row) {
		throw new Error("Property not found");
	}
	return row;
}

export async function listSavedProperties(
	db: Database,
	input: { userId: string }
) {
	const items = await db
		.select({
			property: {
				id: property.id,
				images: property.images,
				propertyType: property.propertyType,
				title: property.title,
				city: property.city,
				state: property.state,
				price: property.price,
				pricePeriod: property.pricePeriod,
				verificationStatus: property.verificationStatus,
			},
			savedAt: savedProperty.createdAt,
		})
		.from(savedProperty)
		.innerJoin(property, eq(savedProperty.propertyId, property.id))
		.where(eq(savedProperty.userId, input.userId))
		.orderBy(desc(savedProperty.createdAt));
	return { items };
}

export async function listSavedPropertyIds(
	db: Database,
	input: { userId: string }
) {
	const rows = await db
		.select({ propertyId: savedProperty.propertyId })
		.from(savedProperty)
		.where(eq(savedProperty.userId, input.userId));
	return { ids: rows.map((row) => row.propertyId) };
}

export async function saveProperty(
	db: Database,
	input: { userId: string; propertyId: string }
) {
	const [exists] = await db
		.select({ id: property.id })
		.from(property)
		.where(eq(property.id, input.propertyId))
		.limit(1);
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
