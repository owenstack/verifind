const nairaFormatter = new Intl.NumberFormat("en-NG", {
	currency: "NGN",
	maximumFractionDigits: 0,
	style: "currency",
});

/** Format a Naira amount for display, e.g. 1200000 -> "₦1,200,000". */
export function formatNaira(amount: number): string {
	return nairaFormatter.format(amount).replace("NGN", "₦").trim();
}

/** "₦1,200,000 / year" style price label used across listings. */
export function formatPriceLabel(price: number, period: string): string {
	return `${formatNaira(price)} / ${period}`;
}

/** Render a number followed by a pluralised unit: 2 -> "2 Bathrooms". */
export function formatCount(count: number, unit: string): string {
	return `${count} ${unit}${count === 1 ? "" : "s"}`;
}

/** Amenity keys use snake_case; split for display fallback. */
const AMENITY_KEY_SEPARATOR = /[_-]+/;

const amenityLabels: Record<string, string> = {
	air_conditioning: "Air Conditioning",
	balcony: "Balcony",
	borehole: "Borehole Water",
	fitted_kitchen: "Fitted Kitchen",
	parking_space: "Parking Space",
	pets_allowed: "Pets Allowed",
	prepaid_meter: "Prepaid Meter",
	security_guard: "Security Guard",
	smart_tv: "Smart TV",
	solar_power: "Solar Backup",
	tiled_floor: "Tiled Floor",
	water_heater: "Water Heater",
};

/** Human label for an amenity key, falling back to a title-cased key. */
export function formatAmenity(key: string): string {
	const known = amenityLabels[key];
	if (known) {
		return known;
	}
	return key
		.split(AMENITY_KEY_SEPARATOR)
		.map((part) =>
			part.length > 0 ? `${part[0].toUpperCase()}${part.slice(1)}` : part
		)
		.join(" ");
}

const propertyTypeLabels: Record<string, string> = {
	apartment: "Apartment",
	bungalow: "Bungalow",
	duplex: "Duplex",
	self_contained: "Self Contained",
	shared_apartment: "Shared Apartment",
	studio: "Studio",
};

export function formatPropertyType(type: string): string {
	return propertyTypeLabels[type] ?? type;
}
