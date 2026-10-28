export { cn } from "cn";

const COMPACT_THRESHOLDS = [
	{ threshold: 100_000_000_000, suffix: "B", divisor: 100_000_000_000 },
	{ threshold: 100_000_000, suffix: "M", divisor: 100_000_000 },
	{ threshold: 100_000, suffix: "K", divisor: 100_000 },
] as const;

export function formatCurrency(amount: number, compact = false): string {
	const formatter = (value: number, fractionDigits = 2) =>
		Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: fractionDigits,
			maximumFractionDigits: fractionDigits,
		}).format(value);

	if (compact) {
		for (const { threshold, suffix, divisor } of COMPACT_THRESHOLDS) {
			if (Math.abs(amount) >= threshold) {
				const compacted = amount / divisor;
				const fractionDigits = Number.isInteger(compacted) ? 0 : 1;
				return formatter(compacted, fractionDigits) + suffix;
			}
		}
	}

	return formatter(amount / 100);
}

export function getInitials(name: string): string {
	const words =
		name
			.normalize("NFC")
			.split(/\s+/)
			.filter((word) => /[\p{L}\p{N}]/u.test(word)) ?? [];
	if (words.length === 0) {
		return "?";
	}
	const firstLetter = (word: string) => {
		const match = word.match(/[\p{L}\p{N}]/u);
		return match ? match[0] : "";
	};
	const first = firstLetter(words[0] ?? "");
	const last = words.length > 1 ? firstLetter(words.at(-1) ?? "") : "";
	return (first + last).toLocaleUpperCase();
}

interface SlugifyOptions {
	maxLength?: number;
	separator?: string;
}

export function slugify(
	text: string,
	{ separator = "-", maxLength }: SlugifyOptions = {}
): string {
	const sep = separator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

	let slug = text
		.normalize("NFKD")
		.replace(/\p{M}/gu, "") // strip diacritics: é → e, ọ → o, ẹ → e
		.replace(/&/g, " and ")
		.replace(/['’`]/g, "") // "don't" → "dont", not "don-t"
		.toLowerCase()
		.replace(/[^\p{L}\p{N}]+/gu, separator) // runs of anything else → one separator
		.replace(new RegExp(`^(?:${sep})+|(?:${sep})+$`, "g"), ""); // trim edges

	if (maxLength !== undefined && slug.length > maxLength) {
		slug = slug.slice(0, maxLength).replace(new RegExp(`(?:${sep})+$`), ""); // don't end on a dangling separator
	}

	return slug;
}
