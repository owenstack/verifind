import { describe, expect, it } from "bun:test";
import { readToken, tokenComment } from "./tokens.ts";

describe("theme token conversion", () => {
	it("matches documented sRGB colors within one channel step", () => {
		for (const mode of ["light", "dark"]) {
			for (const name of ["background", "primary"]) {
				const actual = readToken(name, mode);
				const expected = tokenComment(name, mode);
				expect(expected).toBeDefined();
				const actualChannels =
					actual
						.match(/[\da-f]{2}/gi)
						?.map((part) => Number.parseInt(part, 16)) ?? [];
				const expectedChannels =
					expected
						?.match(/[\da-f]{2}/gi)
						?.map((part) => Number.parseInt(part, 16)) ?? [];
				for (const [index, channel] of actualChannels.entries()) {
					expect(
						Math.abs(channel - expectedChannels[index])
					).toBeLessThanOrEqual(1);
				}
			}
		}
	});
});
