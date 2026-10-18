import { readFileSync } from "node:fs";

const css = readFileSync(
	new URL("../../../packages/ui/src/styles/globals.css", import.meta.url),
	"utf8"
);
const blocks = {
	light: css.split(":root {")[1]?.split("}")[0],
	dark: css.split(".dark {")[1]?.split("}")[0],
};
const OKLCH_VALUE = /oklch\(([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\)/;

function channel(value: number): number {
	const linear =
		value <= 0.003_130_8 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055;
	return Math.max(0, Math.min(255, Math.round(linear * 255)));
}

function convertOklch(value: string): string {
	const match = OKLCH_VALUE.exec(value);
	if (!match) {
		throw new Error(`Unable to parse color token value: ${value}`);
	}
	const L = Number(match[1]);
	const C = Number(match[2]);
	const angle = (Number(match[3]) * Math.PI) / 180;
	const a = C * Math.cos(angle);
	const b = C * Math.sin(angle);
	const l = (L + 0.396_337_777_4 * a + 0.215_803_757_3 * b) ** 3;
	const m = (L - 0.105_561_345_8 * a - 0.063_854_172_8 * b) ** 3;
	const s = (L - 0.089_484_177_5 * a - 1.291_485_548 * b) ** 3;
	const rgb = [
		4.076_741_662_1 * l - 3.307_711_591_3 * m + 0.230_969_929_2 * s,
		-1.268_438_004_6 * l + 2.609_757_401_1 * m - 0.341_319_396_5 * s,
		-0.004_196_086_3 * l - 0.703_418_614_7 * m + 1.707_614_701 * s,
	];
	return `#${rgb
		.map(channel)
		.map((part) => part.toString(16).padStart(2, "0"))
		.join("")}`;
}

export function readToken(name: string, mode: "light" | "dark"): string {
	const block = blocks[mode];
	const value =
		block && new RegExp(`--${name}:\\s*([^;]+);`).exec(block)?.[1]?.trim();
	if (!value) {
		throw new Error(`Missing --${name} in the ${mode} globals.css block`);
	}
	return convertOklch(value);
}

export const DARK_BACKGROUND = readToken("background", "dark");
export const LIGHT_BACKGROUND = readToken("background", "light");
export const BRAND_GREEN = readToken("primary", "light");
export const SPLASH_SHIELD_SIZE = 0.33;

export function tokenComment(
	name: string,
	mode: "light" | "dark"
): string | undefined {
	const block = blocks[mode];
	return block
		? new RegExp(`--${name}:\\s*[^;]+;\\s*/\\*\\s*(#[\\da-f]{6})`, "i").exec(
				block
			)?.[1]
		: undefined;
}
