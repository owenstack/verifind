// biome-ignore lint/performance/noBarrelFile: intentional re-export for app-wide imports
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

const WORD_SPLIT_PATTERN = /\s+/;
const WORD_CHAR_PATTERN = /[\p{L}\p{N}]/u;

export function getInitials(name: string): string {
	const words =
		name
			.normalize("NFC")
			.split(WORD_SPLIT_PATTERN)
			.filter((word) => WORD_CHAR_PATTERN.test(word)) ?? [];
	if (words.length === 0) {
		return "?";
	}
	const firstLetter = (word: string) => {
		const match = word.match(WORD_CHAR_PATTERN);
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

export function formatDistanceToNow(date: Date): string {
	const now = new Date();
	const diffMs = date.getTime() - now.getTime();
	const isFuture = diffMs > 0;
	const abs = Math.abs(diffMs);

	const seconds = Math.floor(abs / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	const weeks = Math.floor(days / 7);

	const nowYear = now.getFullYear();
	const nowMonth = now.getMonth();
	const dateYear = date.getFullYear();
	const dateMonth = date.getMonth();

	const yearsDiff = Math.abs(dateYear - nowYear);
	const monthsDiff = Math.abs(dateMonth - nowMonth + (dateYear - nowYear) * 12);

	const fmt = (value: number, unit: string) =>
		`${value} ${unit}${value === 1 ? "" : "s"}`;

	const label = (() => {
		if (seconds <= 5) {
			return null;
		}
		if (yearsDiff > 0) {
			return fmt(yearsDiff, "year");
		}
		if (monthsDiff > 0) {
			return fmt(monthsDiff, "month");
		}
		if (weeks > 0) {
			return fmt(weeks, "week");
		}
		if (days > 0) {
			return fmt(days, "day");
		}
		if (hours > 0) {
			return fmt(hours, "hour");
		}
		if (minutes > 0) {
			return fmt(minutes, "minute");
		}
		return fmt(seconds, "second");
	})();

	if (!label) {
		return "just now";
	}
	return isFuture ? `in ${label}` : `${label} ago`;
}
