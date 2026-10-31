/**
 * Minimal class-name combiner (clsx-like) so app components can
 * conditionally merge Tailwind classes without extra dependencies.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
	return parts.filter(Boolean).join(" ");
}
